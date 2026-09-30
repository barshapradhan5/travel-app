"""Bookings blueprint — create hotel/ticket/guide bookings, view my bookings."""

from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError

from app.extensions import db, limiter
from app.models.booking import Booking, HotelBooking, TicketBooking, GuideBooking
from app.models.hotel import Hotel
from app.models.hotel_room import HotelRoom
from app.models.ticket import Ticket
from app.models.guide import Guide
from app.schemas import (
    BookingSchema, CreateHotelBookingSchema,
    CreateTicketBookingSchema, CreateGuideBookingSchema,
)

bookings_bp = Blueprint('bookings', __name__, url_prefix='/api/bookings')

booking_schema = BookingSchema()
bookings_schema = BookingSchema(many=True)


@bookings_bp.route('/hotel', methods=['POST'])
@jwt_required()
@limiter.limit("30 per hour")
def create_hotel_booking():
    """Book a hotel room."""
    try:
        data = CreateHotelBookingSchema().load(request.get_json())
    except ValidationError as err:
        return jsonify({'error': {'code': 'VALIDATION_ERROR', 'message': err.messages}}), 400

    hotel = Hotel.query.get(data['hotel_id'])
    if not hotel:
        return jsonify({'error': {'code': 'NOT_FOUND', 'message': 'Hotel not found'}}), 404

    room = HotelRoom.query.get(data['room_id'])
    if not room or room.hotel_id != hotel.id:
        return jsonify({'error': {'code': 'NOT_FOUND', 'message': 'Room not found'}}), 404

    if room.available_count <= 0:
        return jsonify({'error': {'code': 'UNAVAILABLE', 'message': 'Room not available'}}), 409

    if data['check_in'] >= data['check_out']:
        return jsonify({'error': {'code': 'INVALID_DATES', 'message': 'Check-out must be after check-in'}}), 400

    nights = (data['check_out'] - data['check_in']).days
    total = room.price * nights

    booking = Booking(
        user_id=int(get_jwt_identity()),
        booking_type='hotel',
        total_price=total,
        status='confirmed',
    )
    db.session.add(booking)
    db.session.flush()

    hotel_booking = HotelBooking(
        booking_id=booking.id,
        hotel_id=hotel.id,
        hotel_room_id=room.id,
        check_in=data['check_in'],
        check_out=data['check_out'],
        guests=data['guests'],
    )
    db.session.add(hotel_booking)

    room.available_count -= 1
    db.session.commit()

    result = booking_schema.dump(booking)
    result['hotel_booking']['hotel_name'] = hotel.name
    result['hotel_booking']['room_type'] = room.room_type

    return jsonify({'booking': result}), 201


@bookings_bp.route('/ticket', methods=['POST'])
@jwt_required()
@limiter.limit("30 per hour")
def create_ticket_booking():
    """Book ticket(s)."""
    try:
        data = CreateTicketBookingSchema().load(request.get_json())
    except ValidationError as err:
        return jsonify({'error': {'code': 'VALIDATION_ERROR', 'message': err.messages}}), 400

    ticket = Ticket.query.get(data['ticket_id'])
    if not ticket:
        return jsonify({'error': {'code': 'NOT_FOUND', 'message': 'Ticket not found'}}), 404

    if ticket.available_count < data['quantity']:
        return jsonify({'error': {'code': 'UNAVAILABLE', 'message': 'Not enough tickets available'}}), 409

    total = ticket.price * data['quantity']

    booking = Booking(
        user_id=int(get_jwt_identity()),
        booking_type='ticket',
        total_price=total,
        status='confirmed',
    )
    db.session.add(booking)
    db.session.flush()

    ticket_booking = TicketBooking(
        booking_id=booking.id,
        ticket_id=ticket.id,
        quantity=data['quantity'],
        travel_date=data['travel_date'],
    )
    db.session.add(ticket_booking)

    ticket.available_count -= data['quantity']
    db.session.commit()

    result = booking_schema.dump(booking)
    result['ticket_booking']['ticket_title'] = ticket.title

    return jsonify({'booking': result}), 201


@bookings_bp.route('/guide', methods=['POST'])
@jwt_required()
@limiter.limit("30 per hour")
def create_guide_booking():
    """Book a travel guide."""
    try:
        data = CreateGuideBookingSchema().load(request.get_json())
    except ValidationError as err:
        return jsonify({'error': {'code': 'VALIDATION_ERROR', 'message': err.messages}}), 400

    guide = Guide.query.get(data['guide_id'])
    if not guide:
        return jsonify({'error': {'code': 'NOT_FOUND', 'message': 'Guide not found'}}), 404

    total = guide.price_per_day

    booking = Booking(
        user_id=int(get_jwt_identity()),
        booking_type='guide',
        total_price=total,
        status='confirmed',
    )
    db.session.add(booking)
    db.session.flush()

    guide_booking = GuideBooking(
        booking_id=booking.id,
        guide_id=guide.id,
        date=data['date'],
        time_slot=data.get('time_slot', 'full-day'),
    )
    db.session.add(guide_booking)
    db.session.commit()

    result = booking_schema.dump(booking)
    result['guide_booking']['guide_name'] = guide.name

    return jsonify({'booking': result}), 201


@bookings_bp.route('/me', methods=['GET'])
@jwt_required()
def my_bookings():
    """List current user's bookings."""
    user_id = int(get_jwt_identity())
    bookings = Booking.query.filter_by(user_id=user_id).order_by(Booking.created_at.desc()).all()

    results = []
    for b in bookings:
        data = booking_schema.dump(b)
        if b.hotel_booking:
            data['hotel_booking']['hotel_name'] = b.hotel_booking.hotel.name if b.hotel_booking.hotel else ''
            data['hotel_booking']['room_type'] = b.hotel_booking.room.room_type if b.hotel_booking.room else ''
        if b.ticket_booking:
            data['ticket_booking']['ticket_title'] = b.ticket_booking.ticket.title if b.ticket_booking.ticket else ''
        if b.guide_booking:
            data['guide_booking']['guide_name'] = b.guide_booking.guide.name if b.guide_booking.guide else ''
        results.append(data)

    return jsonify({'bookings': results}), 200

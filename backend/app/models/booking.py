"""Booking models — unified booking + type-specific detail tables."""

from datetime import datetime, timezone
from app.extensions import db


class Booking(db.Model):
    __tablename__ = 'bookings'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    booking_type = db.Column(db.String(20), nullable=False)  # "hotel", "ticket", "guide"
    status = db.Column(db.String(20), nullable=False, default='confirmed')
    total_price = db.Column(db.Float, nullable=False, default=0.0)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships to detail tables
    hotel_booking = db.relationship('HotelBooking', backref='booking', uselist=False, cascade='all, delete-orphan')
    ticket_booking = db.relationship('TicketBooking', backref='booking', uselist=False, cascade='all, delete-orphan')
    guide_booking = db.relationship('GuideBooking', backref='booking', uselist=False, cascade='all, delete-orphan')

    def __repr__(self):
        return f'<Booking #{self.id} {self.booking_type}>'


class HotelBooking(db.Model):
    __tablename__ = 'hotel_bookings'

    id = db.Column(db.Integer, primary_key=True)
    booking_id = db.Column(db.Integer, db.ForeignKey('bookings.id'), nullable=False, unique=True)
    hotel_room_id = db.Column(db.Integer, db.ForeignKey('hotel_rooms.id'), nullable=False)
    hotel_id = db.Column(db.Integer, db.ForeignKey('hotels.id'), nullable=False)
    check_in = db.Column(db.Date, nullable=False)
    check_out = db.Column(db.Date, nullable=False)
    guests = db.Column(db.Integer, nullable=False, default=1)

    hotel = db.relationship('Hotel')
    room = db.relationship('HotelRoom')


class TicketBooking(db.Model):
    __tablename__ = 'ticket_bookings'

    id = db.Column(db.Integer, primary_key=True)
    booking_id = db.Column(db.Integer, db.ForeignKey('bookings.id'), nullable=False, unique=True)
    ticket_id = db.Column(db.Integer, db.ForeignKey('tickets.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False, default=1)
    travel_date = db.Column(db.Date, nullable=False)

    ticket = db.relationship('Ticket')


class GuideBooking(db.Model):
    __tablename__ = 'guide_bookings'

    id = db.Column(db.Integer, primary_key=True)
    booking_id = db.Column(db.Integer, db.ForeignKey('bookings.id'), nullable=False, unique=True)
    guide_id = db.Column(db.Integer, db.ForeignKey('guides.id'), nullable=False)
    date = db.Column(db.Date, nullable=False)
    time_slot = db.Column(db.String(50), nullable=True)  # e.g. "morning", "full-day"

    guide = db.relationship('Guide')

"""Chatbot API routes for chat, intent, and conversational bookings."""

from flask import Blueprint, request, jsonify
from app.extensions import db, limiter
from app.models.chatbot import ChatMessage, ChatBooking
from app.blueprints.chatbot.chatbot_service import generate_chat_response, detect_user_intent

chatbot_bp = Blueprint('chatbot', __name__)


@chatbot_bp.route('/api/chat', methods=['POST'])
@chatbot_bp.route('/chat', methods=['POST'])
@limiter.limit("60 per minute")
def chat():
    """Handle conversational chat requests with TravelMate AI."""
    data = request.get_json(silent=True) or {}
    message = (data.get('message') or '').strip()
    conversation_id = data.get('conversation_id') or 'guest_default'

    if not message:
        return jsonify({'error': {'code': 'EMPTY_MESSAGE', 'message': 'Message cannot be empty.'}}), 400

    history = []
    # 1. Fetch recent conversation history (fault-tolerant)
    try:
        past_msgs = ChatMessage.query.filter_by(conversation_id=conversation_id)\
            .order_by(ChatMessage.timestamp.asc())\
            .limit(20).all()
        history = [{'role': m.role, 'message': m.message} for m in past_msgs]
    except Exception as dbe:
        print(f"[Chatbot DB Warning - Read History] {dbe}")
        db.session.rollback()

    # 2. Record user message (fault-tolerant)
    try:
        user_msg = ChatMessage(conversation_id=conversation_id, role='user', message=message)
        db.session.add(user_msg)
        db.session.commit()
    except Exception as dbe:
        print(f"[Chatbot DB Warning - Save User Msg] {dbe}")
        db.session.rollback()

    # 3. Detect intent & generate AI reply
    intent = detect_user_intent(message)
    reply = generate_chat_response(message, history)

    # 4. Record assistant message (fault-tolerant)
    try:
        bot_msg = ChatMessage(conversation_id=conversation_id, role='assistant', message=reply)
        db.session.add(bot_msg)
        db.session.commit()
    except Exception as dbe:
        print(f"[Chatbot DB Warning - Save Bot Msg] {dbe}")
        db.session.rollback()

    return jsonify({
        'reply': reply,
        'intent': intent,
        'conversation_id': conversation_id
    }), 200


@chatbot_bp.route('/api/chat/history/<conversation_id>', methods=['GET'])
def get_chat_history(conversation_id):
    """Retrieve chat history for a session."""
    messages = ChatMessage.query.filter_by(conversation_id=conversation_id)\
        .order_by(ChatMessage.timestamp.asc()).all()
    return jsonify({
        'conversation_id': conversation_id,
        'messages': [m.to_dict() for m in messages]
    }), 200


@chatbot_bp.route('/api/booking', methods=['POST'])
@chatbot_bp.route('/booking', methods=['POST'])
def create_demo_booking():
    """Create a travel booking request via chatbot."""
    data = request.get_json(silent=True) or {}
    destination = data.get('destination') or 'Unknown Destination'
    travelers = int(data.get('travelers') or 1)
    travel_date = data.get('travel_date')
    return_date = data.get('return_date')
    budget = data.get('budget')
    booking_type = data.get('booking_type', 'trip')
    conversation_id = data.get('conversation_id')

    booking = ChatBooking(
        destination=destination,
        travelers=travelers,
        travel_date=travel_date,
        return_date=return_date,
        budget=budget,
        booking_type=booking_type,
        conversation_id=conversation_id,
        status='pending'
    )
    db.session.add(booking)
    db.session.commit()

    return jsonify({
        'message': 'Booking request submitted successfully!',
        'booking': booking.to_dict()
    }), 201


@chatbot_bp.route('/api/booking/<int:booking_id>', methods=['GET'])
def get_demo_booking(booking_id):
    """Get a demo booking request."""
    booking = ChatBooking.query.get(booking_id)
    if not booking:
        return jsonify({'error': {'code': 'NOT_FOUND', 'message': 'Booking request not found.'}}), 404
    return jsonify({'booking': booking.to_dict()}), 200


@chatbot_bp.route('/api/booking/<int:booking_id>', methods=['DELETE'])
def delete_demo_booking(booking_id):
    """Cancel / Delete a demo booking request."""
    booking = ChatBooking.query.get(booking_id)
    if not booking:
        return jsonify({'error': {'code': 'NOT_FOUND', 'message': 'Booking request not found.'}}), 404
    db.session.delete(booking)
    db.session.commit()
    return jsonify({'message': 'Booking request deleted successfully.'}), 200

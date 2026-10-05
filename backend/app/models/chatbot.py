"""Chatbot and booking request models."""

from datetime import datetime, timezone
from app.extensions import db


class ChatMessage(db.Model):
    __tablename__ = 'chat_messages'

    id = db.Column(db.Integer, primary_key=True)
    conversation_id = db.Column(db.String(100), nullable=False, index=True)
    role = db.Column(db.String(20), nullable=False)  # 'user' or 'assistant'
    message = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'id': self.id,
            'conversation_id': self.conversation_id,
            'role': self.role,
            'message': self.message,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None,
        }


class ChatBooking(db.Model):
    __tablename__ = 'chat_bookings'

    id = db.Column(db.Integer, primary_key=True)
    conversation_id = db.Column(db.String(100), nullable=True)
    destination = db.Column(db.String(150), nullable=False)
    travel_date = db.Column(db.String(50), nullable=True)
    return_date = db.Column(db.String(50), nullable=True)
    travelers = db.Column(db.Integer, nullable=False, default=1)
    budget = db.Column(db.String(50), nullable=True)
    booking_type = db.Column(db.String(50), nullable=False, default='trip')
    status = db.Column(db.String(20), nullable=False, default='pending')
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'booking_id': self.id,
            'conversation_id': self.conversation_id,
            'destination': self.destination,
            'travel_date': self.travel_date,
            'return_date': self.return_date,
            'travelers': self.travelers,
            'budget': self.budget,
            'booking_type': self.booking_type,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }

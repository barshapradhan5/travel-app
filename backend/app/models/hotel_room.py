"""HotelRoom model."""

from app.extensions import db


class HotelRoom(db.Model):
    __tablename__ = 'hotel_rooms'

    id = db.Column(db.Integer, primary_key=True)
    hotel_id = db.Column(db.Integer, db.ForeignKey('hotels.id'), nullable=False, index=True)
    room_type = db.Column(db.String(100), nullable=False)  # e.g. "Deluxe", "Suite"
    price = db.Column(db.Float, nullable=False)
    capacity = db.Column(db.Integer, nullable=False, default=2)
    available_count = db.Column(db.Integer, nullable=False, default=5)

    def __repr__(self):
        return f'<HotelRoom {self.room_type} @ Hotel#{self.hotel_id}>'

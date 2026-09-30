"""Hotel and HotelRoom models."""

from app.extensions import db


class Hotel(db.Model):
    __tablename__ = 'hotels'

    id = db.Column(db.Integer, primary_key=True)
    destination_id = db.Column(db.Integer, db.ForeignKey('destinations.id'), nullable=False, index=True)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    price_per_night = db.Column(db.Float, nullable=False)
    amenities = db.Column(db.JSON, nullable=True)  # e.g. ["wifi", "pool", "gym"]
    image_url = db.Column(db.String(500), nullable=True)
    rating = db.Column(db.Float, nullable=True, default=0.0)
    lat = db.Column(db.Float, nullable=True)
    lng = db.Column(db.Float, nullable=True)

    # Relationships
    rooms = db.relationship('HotelRoom', backref='hotel', lazy='dynamic')

    def __repr__(self):
        return f'<Hotel {self.name}>'

"""Destination model."""

from app.extensions import db


class Destination(db.Model):
    __tablename__ = 'destinations'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    country = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    image_url = db.Column(db.String(500), nullable=True)
    lat = db.Column(db.Float, nullable=True)
    lng = db.Column(db.Float, nullable=True)

    # Relationships
    hotels = db.relationship('Hotel', backref='destination', lazy='dynamic')
    tickets = db.relationship('Ticket', backref='destination', lazy='dynamic')
    guides = db.relationship('Guide', backref='destination', lazy='dynamic')

    def __repr__(self):
        return f'<Destination {self.name}>'

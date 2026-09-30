"""Ticket model."""

from app.extensions import db


class Ticket(db.Model):
    __tablename__ = 'tickets'

    id = db.Column(db.Integer, primary_key=True)
    destination_id = db.Column(db.Integer, db.ForeignKey('destinations.id'), nullable=False, index=True)
    title = db.Column(db.String(200), nullable=False)
    type = db.Column(db.String(50), nullable=False)  # "transport", "attraction"
    description = db.Column(db.Text, nullable=True)
    price = db.Column(db.Float, nullable=False)
    date = db.Column(db.Date, nullable=True)
    available_count = db.Column(db.Integer, nullable=False, default=50)
    image_url = db.Column(db.String(500), nullable=True)

    def __repr__(self):
        return f'<Ticket {self.title}>'

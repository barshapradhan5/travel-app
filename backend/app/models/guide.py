"""Guide model."""

from app.extensions import db


class Guide(db.Model):
    __tablename__ = 'guides'

    id = db.Column(db.Integer, primary_key=True)
    destination_id = db.Column(db.Integer, db.ForeignKey('destinations.id'), nullable=False, index=True)
    name = db.Column(db.String(120), nullable=False)
    bio = db.Column(db.Text, nullable=True)
    languages = db.Column(db.JSON, nullable=True)  # e.g. ["English", "Spanish"]
    rating = db.Column(db.Float, nullable=True, default=4.0)
    price_per_day = db.Column(db.Float, nullable=False)
    image_url = db.Column(db.String(500), nullable=True)

    def __repr__(self):
        return f'<Guide {self.name}>'

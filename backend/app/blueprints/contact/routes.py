"""Contact blueprint — submit contact form."""

from flask import Blueprint, request, jsonify
from marshmallow import ValidationError

from app.extensions import db, limiter
from app.models.contact_message import ContactMessage
from app.schemas import CreateContactSchema

contact_bp = Blueprint('contact', __name__, url_prefix='/api/contact')


@contact_bp.route('', methods=['POST'])
@limiter.limit("5 per minute")
def submit_contact():
    """Store a contact-form submission."""
    try:
        data = CreateContactSchema().load(request.get_json())
    except ValidationError as err:
        return jsonify({'error': {'code': 'VALIDATION_ERROR', 'message': err.messages}}), 400

    msg = ContactMessage(
        name=data['name'],
        email=data['email'],
        message=data['message'],
    )
    db.session.add(msg)
    db.session.commit()

    return jsonify({'message': 'Your message has been sent. We will get back to you soon!'}), 200

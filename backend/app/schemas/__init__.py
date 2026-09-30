"""Marshmallow schemas for request/response validation and serialization."""

from marshmallow import fields, validate, validates, ValidationError
from app.extensions import ma
from app.models import (
    User, Destination, Hotel, HotelRoom,
    Ticket, Guide, Booking, HotelBooking,
    TicketBooking, GuideBooking, ContactMessage,
)


# ── Auth Schemas ──

class RegisterSchema(ma.Schema):
    name = fields.String(required=True, validate=validate.Length(min=1, max=120))
    email = fields.Email(required=True)
    password = fields.String(required=True, validate=validate.Length(min=6, max=128))


class LoginSchema(ma.Schema):
    email = fields.Email(required=True)
    password = fields.String(required=True)


# ── User ──

class UserSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = User
        exclude = ('password_hash',)
        load_instance = True


# ── Destination ──

class DestinationSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Destination
        load_instance = True


# ── Hotel ──

class HotelRoomSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = HotelRoom
        load_instance = True


class HotelSchema(ma.SQLAlchemyAutoSchema):
    rooms = ma.Nested(HotelRoomSchema, many=True, dump_only=True)
    destination_name = fields.String(dump_only=True)

    class Meta:
        model = Hotel
        load_instance = True
        include_fk = True


# ── Ticket ──

class TicketSchema(ma.SQLAlchemyAutoSchema):
    destination_name = fields.String(dump_only=True)

    class Meta:
        model = Ticket
        load_instance = True
        include_fk = True


# ── Guide ──

class GuideSchema(ma.SQLAlchemyAutoSchema):
    destination_name = fields.String(dump_only=True)

    class Meta:
        model = Guide
        load_instance = True
        include_fk = True


# ── Booking ──

class HotelBookingDetailSchema(ma.SQLAlchemyAutoSchema):
    hotel_name = fields.String(dump_only=True)
    room_type = fields.String(dump_only=True)

    class Meta:
        model = HotelBooking
        load_instance = True
        include_fk = True


class TicketBookingDetailSchema(ma.SQLAlchemyAutoSchema):
    ticket_title = fields.String(dump_only=True)

    class Meta:
        model = TicketBooking
        load_instance = True
        include_fk = True


class GuideBookingDetailSchema(ma.SQLAlchemyAutoSchema):
    guide_name = fields.String(dump_only=True)

    class Meta:
        model = GuideBooking
        load_instance = True
        include_fk = True


class BookingSchema(ma.SQLAlchemyAutoSchema):
    hotel_booking = ma.Nested(HotelBookingDetailSchema, dump_only=True)
    ticket_booking = ma.Nested(TicketBookingDetailSchema, dump_only=True)
    guide_booking = ma.Nested(GuideBookingDetailSchema, dump_only=True)

    class Meta:
        model = Booking
        load_instance = True
        include_fk = True


# ── Booking creation request schemas ──

class CreateHotelBookingSchema(ma.Schema):
    hotel_id = fields.Integer(required=True)
    room_id = fields.Integer(required=True)
    check_in = fields.Date(required=True)
    check_out = fields.Date(required=True)
    guests = fields.Integer(required=True, validate=validate.Range(min=1, max=10))

    @validates('check_out')
    def validate_checkout(self, value, **kwargs):
        # Will be validated against check_in in the route
        pass


class CreateTicketBookingSchema(ma.Schema):
    ticket_id = fields.Integer(required=True)
    quantity = fields.Integer(required=True, validate=validate.Range(min=1, max=20))
    travel_date = fields.Date(required=True)


class CreateGuideBookingSchema(ma.Schema):
    guide_id = fields.Integer(required=True)
    date = fields.Date(required=True)
    time_slot = fields.String(validate=validate.OneOf(['morning', 'afternoon', 'full-day']))


# ── Contact ──

class ContactMessageSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = ContactMessage
        load_instance = True


class CreateContactSchema(ma.Schema):
    name = fields.String(required=True, validate=validate.Length(min=1, max=120))
    email = fields.Email(required=True)
    message = fields.String(required=True, validate=validate.Length(min=1, max=5000))


# ── Map ──

class MapPointSchema(ma.Schema):
    id = fields.Integer()
    name = fields.String()
    type = fields.String()  # "destination", "hotel", "attraction"
    lat = fields.Float()
    lng = fields.Float()
    summary = fields.String()
    link = fields.String()

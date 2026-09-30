"""Hotels blueprint — list by destination, detail with rooms."""

from flask import Blueprint, request, jsonify
from app.models.hotel import Hotel
from app.models.hotel_room import HotelRoom
from app.schemas import HotelSchema, HotelRoomSchema

hotels_bp = Blueprint('hotels', __name__, url_prefix='/api/hotels')

hotel_schema = HotelSchema()
hotels_schema = HotelSchema(many=True)


@hotels_bp.route('', methods=['GET'])
def list_hotels():
    """List hotels, optionally filtered by destination, price range."""
    destination_id = request.args.get('destination_id', type=int)
    price_min = request.args.get('price_min', type=float)
    price_max = request.args.get('price_max', type=float)
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 12, type=int)

    q = Hotel.query
    if destination_id:
        q = q.filter(Hotel.destination_id == destination_id)
    if price_min is not None:
        q = q.filter(Hotel.price_per_night >= price_min)
    if price_max is not None:
        q = q.filter(Hotel.price_per_night <= price_max)

    paginated = q.order_by(Hotel.rating.desc()).paginate(page=page, per_page=per_page, error_out=False)

    results = []
    for hotel in paginated.items:
        data = hotel_schema.dump(hotel)
        data['destination_name'] = hotel.destination.name if hotel.destination else ''
        results.append(data)

    return jsonify({
        'hotels': results,
        'total': paginated.total,
        'page': paginated.page,
        'pages': paginated.pages,
    }), 200


@hotels_bp.route('/<int:hotel_id>', methods=['GET'])
def get_hotel(hotel_id):
    """Get hotel detail with rooms."""
    hotel = Hotel.query.get_or_404(hotel_id)
    data = hotel_schema.dump(hotel)
    data['destination_name'] = hotel.destination.name if hotel.destination else ''
    data['rooms'] = HotelRoomSchema(many=True).dump(hotel.rooms.all())
    return jsonify({'hotel': data}), 200

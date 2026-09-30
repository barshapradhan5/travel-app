"""Map blueprint — return geo-points within bounds for map markers."""

from flask import Blueprint, request, jsonify
from app.models.destination import Destination
from app.models.hotel import Hotel

map_bp = Blueprint('map', __name__, url_prefix='/api/map')


@map_bp.route('/points', methods=['GET'])
def get_points():
    """Return destinations and hotels with lat/lng for map rendering."""
    # Optional bounding box filter
    south = request.args.get('south', type=float)
    north = request.args.get('north', type=float)
    west = request.args.get('west', type=float)
    east = request.args.get('east', type=float)

    points = []

    # Destinations
    dq = Destination.query.filter(Destination.lat.isnot(None), Destination.lng.isnot(None))
    if all(v is not None for v in [south, north, west, east]):
        dq = dq.filter(
            Destination.lat.between(south, north),
            Destination.lng.between(west, east),
        )
    for d in dq.all():
        points.append({
            'id': d.id,
            'name': d.name,
            'type': 'destination',
            'lat': d.lat,
            'lng': d.lng,
            'summary': (d.description or '')[:120],
            'link': f'/destinations/{d.id}',
        })

    # Hotels
    hq = Hotel.query.filter(Hotel.lat.isnot(None), Hotel.lng.isnot(None))
    if all(v is not None for v in [south, north, west, east]):
        hq = hq.filter(
            Hotel.lat.between(south, north),
            Hotel.lng.between(west, east),
        )
    for h in hq.all():
        points.append({
            'id': h.id,
            'name': h.name,
            'type': 'hotel',
            'lat': h.lat,
            'lng': h.lng,
            'summary': f'From ${h.price_per_night}/night — {h.rating}★',
            'link': f'/hotels/{h.id}',
        })

    return jsonify({'points': points}), 200

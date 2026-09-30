"""Destinations blueprint — search, list, detail."""

from flask import Blueprint, request, jsonify
from app.models.destination import Destination
from app.schemas import DestinationSchema

destinations_bp = Blueprint('destinations', __name__, url_prefix='/api/destinations')

destination_schema = DestinationSchema()
destinations_schema = DestinationSchema(many=True)


@destinations_bp.route('', methods=['GET'])
def list_destinations():
    """Search/list destinations with optional query, pagination."""
    query = request.args.get('query', '')
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 12, type=int)

    q = Destination.query
    if query:
        q = q.filter(
            Destination.name.ilike(f'%{query}%') |
            Destination.country.ilike(f'%{query}%') |
            Destination.description.ilike(f'%{query}%')
        )

    paginated = q.order_by(Destination.name).paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        'destinations': destinations_schema.dump(paginated.items),
        'total': paginated.total,
        'page': paginated.page,
        'pages': paginated.pages,
    }), 200


@destinations_bp.route('/<int:destination_id>', methods=['GET'])
def get_destination(destination_id):
    """Get single destination by ID."""
    dest = Destination.query.get_or_404(destination_id)
    return jsonify({'destination': destination_schema.dump(dest)}), 200

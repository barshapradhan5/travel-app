"""Guides blueprint — list by destination, detail."""

from flask import Blueprint, request, jsonify
from app.models.guide import Guide
from app.schemas import GuideSchema

guides_bp = Blueprint('guides', __name__, url_prefix='/api/guides')

guide_schema = GuideSchema()
guides_schema = GuideSchema(many=True)


@guides_bp.route('', methods=['GET'])
def list_guides():
    """List guides, optionally filtered by destination."""
    destination_id = request.args.get('destination_id', type=int)
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 12, type=int)

    q = Guide.query
    if destination_id:
        q = q.filter(Guide.destination_id == destination_id)

    paginated = q.order_by(Guide.rating.desc()).paginate(page=page, per_page=per_page, error_out=False)

    results = []
    for guide in paginated.items:
        data = guide_schema.dump(guide)
        data['destination_name'] = guide.destination.name if guide.destination else ''
        results.append(data)

    return jsonify({
        'guides': results,
        'total': paginated.total,
        'page': paginated.page,
        'pages': paginated.pages,
    }), 200


@guides_bp.route('/<int:guide_id>', methods=['GET'])
def get_guide(guide_id):
    """Get single guide profile."""
    guide = Guide.query.get_or_404(guide_id)
    data = guide_schema.dump(guide)
    data['destination_name'] = guide.destination.name if guide.destination else ''
    return jsonify({'guide': data}), 200

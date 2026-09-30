"""Tickets blueprint — list by destination."""

from flask import Blueprint, request, jsonify
from app.models.ticket import Ticket
from app.schemas import TicketSchema

tickets_bp = Blueprint('tickets', __name__, url_prefix='/api/tickets')

ticket_schema = TicketSchema()
tickets_schema = TicketSchema(many=True)


@tickets_bp.route('', methods=['GET'])
def list_tickets():
    """List tickets, optionally filtered by destination."""
    destination_id = request.args.get('destination_id', type=int)
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 12, type=int)

    q = Ticket.query
    if destination_id:
        q = q.filter(Ticket.destination_id == destination_id)

    paginated = q.order_by(Ticket.title).paginate(page=page, per_page=per_page, error_out=False)

    results = []
    for ticket in paginated.items:
        data = ticket_schema.dump(ticket)
        data['destination_name'] = ticket.destination.name if ticket.destination else ''
        results.append(data)

    return jsonify({
        'tickets': results,
        'total': paginated.total,
        'page': paginated.page,
        'pages': paginated.pages,
    }), 200


@tickets_bp.route('/<int:ticket_id>', methods=['GET'])
def get_ticket(ticket_id):
    """Get single ticket detail."""
    ticket = Ticket.query.get_or_404(ticket_id)
    data = ticket_schema.dump(ticket)
    data['destination_name'] = ticket.destination.name if ticket.destination else ''
    return jsonify({'ticket': data}), 200

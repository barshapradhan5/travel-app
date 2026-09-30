"""Flask application factory."""

import os
from flask import Flask, jsonify

from app.config import config_by_name
from app.extensions import db, migrate, jwt, cors, limiter, ma


def create_app(config_name=None):
    """Create and configure the Flask application."""
    if config_name is None:
        config_name = os.getenv('FLASK_ENV', 'development')

    app = Flask(__name__)
    app.config.from_object(config_by_name[config_name])

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    cors.init_app(app, resources={r"/api/*": {"origins": "*"}})
    limiter.init_app(app)
    ma.init_app(app)

    # Import models so they are registered with SQLAlchemy
    from app import models  # noqa: F401

    # Register blueprints
    from app.blueprints.auth import auth_bp
    from app.blueprints.destinations import destinations_bp
    from app.blueprints.hotels import hotels_bp
    from app.blueprints.tickets import tickets_bp
    from app.blueprints.guides import guides_bp
    from app.blueprints.bookings import bookings_bp
    from app.blueprints.map import map_bp
    from app.blueprints.contact import contact_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(destinations_bp)
    app.register_blueprint(hotels_bp)
    app.register_blueprint(tickets_bp)
    app.register_blueprint(guides_bp)
    app.register_blueprint(bookings_bp)
    app.register_blueprint(map_bp)
    app.register_blueprint(contact_bp)

    # Health-check endpoint
    @app.route('/api/health')
    def health():
        return jsonify({'status': 'ok'}), 200

    # Global error handlers
    @app.errorhandler(404)
    def not_found(e):
        return jsonify({'error': {'code': 'NOT_FOUND', 'message': 'Resource not found'}}), 404

    @app.errorhandler(500)
    def internal_error(e):
        return jsonify({'error': {'code': 'INTERNAL_ERROR', 'message': 'An internal error occurred'}}), 500

    # CLI command: seed database
    @app.cli.command('seed')
    def seed_command():
        """Seed the database with sample data."""
        from app.seed import seed_all
        seed_all()
        print('Database seeded!')

    # CLI command: init database
    @app.cli.command('init-db')
    def init_db_command():
        """Create all tables and seed."""
        db.create_all()
        from app.seed import seed_all
        seed_all()
        print('Database initialized and seeded!')

    return app

"""Auth blueprint — register, login, refresh, logout."""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token, create_refresh_token,
    jwt_required, get_jwt_identity,
)
from marshmallow import ValidationError
import bcrypt

from app.extensions import db, limiter
from app.models.user import User
from app.schemas import RegisterSchema, LoginSchema, UserSchema

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

register_schema = RegisterSchema()
login_schema = LoginSchema()
user_schema = UserSchema()


@auth_bp.route('/register', methods=['POST'])
@limiter.limit("10 per minute")
def register():
    """Create a new user account."""
    try:
        data = register_schema.load(request.get_json())
    except ValidationError as err:
        return jsonify({'error': {'code': 'VALIDATION_ERROR', 'message': err.messages}}), 400

    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': {'code': 'EMAIL_EXISTS', 'message': 'Email already registered'}}), 409

    password_hash = bcrypt.hashpw(
        data['password'].encode('utf-8'),
        bcrypt.gensalt()
    ).decode('utf-8')

    user = User(
        name=data['name'],
        email=data['email'],
        password_hash=password_hash,
    )
    db.session.add(user)
    db.session.commit()

    return jsonify({'message': 'Account created', 'user': user_schema.dump(user)}), 201


@auth_bp.route('/login', methods=['POST'])
@limiter.limit("20 per minute")
def login():
    """Authenticate user, return JWT tokens."""
    try:
        data = login_schema.load(request.get_json())
    except ValidationError as err:
        return jsonify({'error': {'code': 'VALIDATION_ERROR', 'message': err.messages}}), 400

    user = User.query.filter_by(email=data['email']).first()
    if not user or not bcrypt.checkpw(data['password'].encode('utf-8'), user.password_hash.encode('utf-8')):
        return jsonify({'error': {'code': 'INVALID_CREDENTIALS', 'message': 'Invalid email or password'}}), 401

    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))

    return jsonify({
        'access_token': access_token,
        'refresh_token': refresh_token,
        'user': user_schema.dump(user),
    }), 200


@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """Issue a new access token using refresh token."""
    identity = get_jwt_identity()
    access_token = create_access_token(identity=identity)
    return jsonify({'access_token': access_token}), 200


@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """Logout (client should discard tokens)."""
    return jsonify({'message': 'Logged out'}), 200


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    """Get current user profile."""
    user = User.query.get(int(get_jwt_identity()))
    if not user:
        return jsonify({'error': {'code': 'NOT_FOUND', 'message': 'User not found'}}), 404
    return jsonify({'user': user_schema.dump(user)}), 200

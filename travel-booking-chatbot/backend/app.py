import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Load env variables before importing modules that need them
load_dotenv()

from database import init_db, get_db_connection
from chatbot import generate_response, detect_intent
from booking import create_booking_request, get_booking, delete_booking

app = Flask(__name__)
CORS(app)

# Initialize database
init_db()

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    if not data or 'message' not in data:
        return jsonify({"error": "Message is required"}), 400
        
    message = data['message']
    conversation_id = data.get('conversation_id', 'default')
    
    try:
        # Get conversation history from DB
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('''
            SELECT role, message FROM messages 
            WHERE conversation_id = ? 
            ORDER BY timestamp ASC LIMIT 20
        ''', (conversation_id,))
        history = [{"role": row["role"], "message": row["message"]} for row in cursor.fetchall()]
        
        # Save user message
        cursor.execute('''
            INSERT INTO messages (conversation_id, role, message)
            VALUES (?, ?, ?)
        ''', (conversation_id, 'user', message))
        conn.commit()
        
        # Detect Intent (Optional, can be used for UI or routing logic)
        intent = detect_intent(message)
        
        # Generate Response
        reply = generate_response(message, history)
        
        # Save assistant message
        cursor.execute('''
            INSERT INTO messages (conversation_id, role, message)
            VALUES (?, ?, ?)
        ''', (conversation_id, 'assistant', reply))
        conn.commit()
        conn.close()
        
        return jsonify({
            "reply": reply,
            "intent": intent
        })
        
    except Exception as e:
        print(f"Error in chat endpoint: {e}")
        return jsonify({"error": "An internal error occurred"}), 500

@app.route('/api/booking', methods=['POST'])
def create_booking():
    data = request.json
    result = create_booking_request(data)
    if result["success"]:
        return jsonify({"message": "Booking request created successfully", "booking_id": result["booking_id"]}), 201
    else:
        return jsonify({"error": result.get("error", "Failed to create booking")}), 500

@app.route('/api/booking/<int:booking_id>', methods=['GET'])
def fetch_booking(booking_id):
    booking = get_booking(booking_id)
    if booking:
        return jsonify(booking)
    return jsonify({"error": "Booking not found"}), 404

@app.route('/api/booking/<int:booking_id>', methods=['DELETE'])
def remove_booking(booking_id):
    success = delete_booking(booking_id)
    if success:
        return jsonify({"message": "Booking deleted successfully"})
    return jsonify({"error": "Booking not found"}), 404

if __name__ == '__main__':
    app.run(debug=True, port=5000)

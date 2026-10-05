from database import get_db_connection

def create_booking_request(data):
    """
    Inserts a new booking request into the database.
    Expected data dictionary: destination, travel_date, return_date, travelers, budget, booking_type
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute('''
            INSERT INTO bookings (destination, travel_date, return_date, travelers, budget, booking_type)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            data.get('destination', 'Unknown'),
            data.get('travel_date', ''),
            data.get('return_date', ''),
            data.get('travelers', 1),
            data.get('budget', ''),
            data.get('booking_type', 'general')
        ))
        conn.commit()
        booking_id = cursor.lastrowid
        return {"success": True, "booking_id": booking_id}
    except Exception as e:
        conn.rollback()
        return {"success": False, "error": str(e)}
    finally:
        conn.close()

def get_booking(booking_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM bookings WHERE booking_id = ?', (booking_id,))
    booking = cursor.fetchone()
    conn.close()
    
    if booking:
        return dict(booking)
    return None

def delete_booking(booking_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('DELETE FROM bookings WHERE booking_id = ?', (booking_id,))
    deleted = cursor.rowcount > 0
    conn.commit()
    conn.close()
    
    return deleted

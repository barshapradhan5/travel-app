# AI Travel Booking Chatbot

## 1. Project Overview
TravelMate AI is a complete AI-powered Travel Booking Chatbot. It helps users search and plan trips, find destinations, and assists with travel bookings through a simple conversational interface using the Groq API. 

**Note:** This is a demonstration system. Real booking confirmations require integrating with real APIs like Amadeus, Skyscanner, or hotel booking engines. The current application saves a "booking request" into a local SQLite database for demonstration purposes.

## 2. Features
- **Conversational UI**: A sleek, modern chat interface where users can plan their trips naturally.
- **AI-Powered**: Integrates with Groq's fast LLM models to provide intelligent travel recommendations.
- **Intent Detection**: Automatically detects user intents (trip planning, hotel search, booking).
- **Database Integration**: Saves chat history and booking requests locally using SQLite.

## 3. Technologies
- **Frontend**: HTML, CSS, JavaScript (Vanilla, no framework needed for simplicity)
- **Backend**: Python, Flask, Flask-CORS
- **AI**: Groq Python SDK (using LLaMA 3 8B model by default)
- **Database**: SQLite (Easily convertible to MySQL/PostgreSQL using SQLAlchemy or changing drivers)

## 4. Folder Structure
```
travel-booking-chatbot/
│
├── backend/
│   ├── app.py             # Flask application & routing
│   ├── chatbot.py         # Groq API connection and intent detection
│   ├── prompts.py         # System prompt for TravelMate AI
│   ├── booking.py         # Logic to create bookings
│   ├── database.py        # SQLite schema and initialization
│   └── requirements.txt   # Python dependencies
│
├── frontend/
│   ├── index.html         # User interface
│   ├── style.css          # Styling (responsive & modern)
│   └── script.js          # Client-side logic for API requests
│
├── .env                   # Private environment variables (API Key)
├── .env.example           # Template for environment variables
├── .gitignore             # Files to hide from Git
└── README.md              # Project documentation
```

## 5. Installation

Ensure you have Python 3.8+ installed.

### Clone and Setup
1. Open terminal and navigate to the project root.
2. It's recommended to create a virtual environment in the `backend` folder:
   ```bash
   cd backend
   python -m venv venv
   ```
3. Activate the virtual environment:
   - **Windows:** `venv\Scripts\activate`
   - **Mac/Linux:** `source venv/bin/activate`

### 8. How to install dependencies
Run the following command inside the `backend` directory (with venv activated):
```bash
pip install -r requirements.txt
```

### 6. How to create `.env` & 7. How to add the Groq API key
In the root `travel-booking-chatbot` directory (where this README is), create a file named `.env`. (You can copy `.env.example`).
Add your Groq API key:
```env
GROQ_API_KEY="your_real_api_key_here"
GROQ_MODEL="llama3-8b-8192"
```
*Do not push the `.env` file to GitHub.*

## 9. How to run the backend
Inside the `backend` directory, run:
```bash
python app.py
```
This will start the Flask API server at `http://localhost:5000` and automatically initialize the SQLite database (`travel_bot.db`).

## 10. How to open the frontend
No build step is required! Simply open the `frontend/index.html` file in any modern web browser (e.g., Chrome, Edge, Safari).
If you have VS Code, you can use the "Live Server" extension to open the file.

## 11. Example chatbot queries
Try typing these into the chatbot:
- "I want to visit Goa."
- "Plan a 5-day trip to Kerala."
- "What are the best destinations for couples?"
- "Give me a budget trip to Goa."
- "Can you help me book a trip for 2 people to Rajasthan for next week?"

## 12. Future improvements
- Connect to live APIs (e.g., Google Maps API, Skyscanner API) for real-time prices.
- Migrate SQLite to PostgreSQL for production deployments.
- Add user authentication (login/signup) for managing multiple bookings.
- Expand intent detection logic using a dedicated NLP classification model.

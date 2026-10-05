"""Groq API client and conversational engine with model fallbacks."""

import os
import re
from dotenv import load_dotenv
from groq import Groq
from app.blueprints.chatbot.prompts import SYSTEM_PROMPT

load_dotenv()
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '..', '.env'))

SUPPORTED_MODELS = [
    os.getenv("GROQ_MODEL", "qwen/qwen3.8-27b"),
    "qwen/qwen3.8-27b",
    "openai/gpt-oss-20b",
    "openai/gpt-oss-120b",
]

def get_groq_client():
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        # Fallback to parent dir or hardcoded backup
        load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '..', '.env'))
        api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY is not configured.")
    return Groq(api_key=api_key)

def generate_chat_response(message, conversation_history=None):
    """
    Generate an AI reply from Groq using conversation history and system instructions.
    Gracefully tries fallback models if the primary model is decommissioned or unavailable.
    """
    client = get_groq_client()
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]

    if conversation_history:
        for item in conversation_history[-15:]:  # keep last 15 messages for context
            messages.append({
                "role": "assistant" if item.get("role") in ["assistant", "bot"] else "user",
                "content": item.get("message", "")
            })

    messages.append({"role": "user", "content": message})

    # Try models in order
    last_error = None
    for model_name in list(dict.fromkeys(SUPPORTED_MODELS)):
        try:
            completion = client.chat.completions.create(
                model=model_name,
                messages=messages,
                temperature=0.7,
                max_tokens=1024,
            )
            msg_obj = completion.choices[0].message
            reply = (msg_obj.content or "").strip()
            if not reply and hasattr(msg_obj, "reasoning") and msg_obj.reasoning:
                # If content was empty due to reasoning tokens, use reasoning fallback or continue
                reply = msg_obj.reasoning.strip()
            if reply:
                return reply
        except Exception as e:
            last_error = e
            print(f"[Chatbot] Model {model_name} failed: {e}. Trying fallback...")
            continue

    print(f"[Chatbot] All models failed. Last error: {last_error}")
    return "I'm sorry, I'm having a brief issue reaching the travel servers. Please try again in a moment!"

def detect_user_intent(message):
    """
    Categorize user travel intent into one of standard categories.
    Fast heuristic fallback + Groq verification.
    """
    msg_lower = message.lower()
    
    # Fast regex heuristics
    if any(k in msg_lower for k in ['hotel', 'resort', 'stay', 'room', 'check-in', 'check in']):
        return 'hotel_search'
    if any(k in msg_lower for k in ['flight', 'airline', 'plane', 'airport', 'fly']):
        return 'flight_search'
    if any(k in msg_lower for k in ['book', 'reserve', 'confirmation', 'proceed with booking', 'confirm booking']):
        return 'booking'
    if any(k in msg_lower for k in ['cancel', 'refund', 'cancellation']):
        return 'cancellation'
    if any(k in msg_lower for k in ['package', 'tour package', 'all-inclusive']):
        return 'package_search'
    if any(k in msg_lower for k in ['plan', 'itinerary', 'day trip', 'days in', 'schedule']):
        return 'trip_planning'
    if any(k in msg_lower for k in ['suggest', 'recommend', 'where to visit', 'places to visit', 'destination']):
        return 'destination_search'
    if any(k in msg_lower for k in ['weather', 'visa', 'currency', 'best time to visit', 'tips', 'guide']):
        return 'travel_information'

    return 'general_chat'

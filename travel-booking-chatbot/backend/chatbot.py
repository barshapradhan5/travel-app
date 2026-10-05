import os
import json
from groq import Groq
from prompts import SYSTEM_PROMPT

def get_groq_client():
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY environment variable not set.")
    return Groq(api_key=api_key)

def generate_response(message, conversation_history):
    """
    Sends the message and history to Groq and returns the response.
    """
    client = get_groq_client()
    configured_model = os.getenv("GROQ_MODEL", "qwen/qwen3.8-27b")
    candidate_models = list(dict.fromkeys([configured_model, "qwen/qwen3.8-27b", "openai/gpt-oss-20b", "openai/gpt-oss-120b"]))
    
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    
    # Append conversation history
    for msg in conversation_history:
        messages.append({
            "role": msg["role"],
            "content": msg["message"]
        })
    
    # Append current message
    messages.append({"role": "user", "content": message})
    
    for model_name in candidate_models:
        try:
            chat_completion = client.chat.completions.create(
                messages=messages,
                model=model_name,
                temperature=0.7,
                max_tokens=1024,
            )
            msg_obj = chat_completion.choices[0].message
            reply = (msg_obj.content or "").strip()
            if not reply and hasattr(msg_obj, "reasoning") and msg_obj.reasoning:
                reply = msg_obj.reasoning.strip()
            if reply:
                return reply
        except Exception as e:
            print(f"Error from Groq API with model {model_name}: {e}")
            continue

    return "I'm sorry, I encountered an error connecting to my brain. Please try again later."

def detect_intent(message):
    """
    A simple intent detection using Groq.
    In a real app, this could be a separate smaller model call or a prompt engineered response.
    Here we do a quick one-off classification.
    """
    client = get_groq_client()
    configured_model = os.getenv("GROQ_MODEL", "qwen/qwen3.8-27b")
    candidate_models = list(dict.fromkeys([configured_model, "qwen/qwen3.8-27b", "openai/gpt-oss-20b"]))
    
    intent_prompt = f"""
    Classify the following user message into one of these intents:
    - destination_search
    - trip_planning
    - hotel_search
    - flight_search
    - package_search
    - booking
    - booking_status
    - cancellation
    - travel_information
    - general_chat
    
    User message: "{message}"
    
    Respond ONLY with the intent name.
    """
    
    # Fast heuristic intent matching for common travel queries
    msg_lower = message.lower()
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

    valid_intents = ["destination_search", "trip_planning", "hotel_search", "flight_search", "package_search", "booking", "booking_status", "cancellation", "travel_information", "general_chat"]
    for model_name in candidate_models:
        try:
            completion = client.chat.completions.create(
                messages=[{"role": "user", "content": intent_prompt}],
                model=model_name,
                temperature=0.0,
                max_tokens=20,
            )
            intent = completion.choices[0].message.content.strip().lower()
            for valid in valid_intents:
                if valid in intent:
                    return valid
            return "general_chat"
        except Exception as e:
            print(f"Intent detection error with model {model_name}: {e}")
            continue
    return "general_chat"



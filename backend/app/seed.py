"""Seed script — populates the database with sample destinations, hotels, rooms, tickets, and guides."""

from datetime import date, timedelta
from app.extensions import db
from app.models import Destination, Hotel, HotelRoom, Ticket, Guide


def seed_all():
    """Insert seed data if the destinations table is empty."""
    if Destination.query.first() is not None:
        print('Data already exists — skipping seed.')
        return

    # ── Destinations ──
    destinations = [
        Destination(name='Paris', country='France',
                    description='The City of Light dazzles with iconic landmarks like the Eiffel Tower, world-class museums, and charming café-lined boulevards.',
                    image_url='https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800',
                    lat=48.8566, lng=2.3522),
        Destination(name='Tokyo', country='Japan',
                    description='A fascinating blend of ultra-modern technology and ancient traditions, with stunning temples, vibrant street life, and exquisite cuisine.',
                    image_url='https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
                    lat=35.6762, lng=139.6503),
        Destination(name='Bali', country='Indonesia',
                    description='A tropical paradise known for its lush rice terraces, sacred temples, pristine beaches, and world-renowned wellness retreats.',
                    image_url='https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800',
                    lat=-8.3405, lng=115.0920),
        Destination(name='New York', country='USA',
                    description='The city that never sleeps offers Broadway shows, iconic skyline views, Central Park, and the best pizza on Earth.',
                    image_url='https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800',
                    lat=40.7128, lng=-74.0060),
        Destination(name='Santorini', country='Greece',
                    description='Breathtaking sunsets, whitewashed buildings with blue domes, crystal-clear Aegean waters, and unforgettable Mediterranean cuisine.',
                    image_url='https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=800',
                    lat=36.3932, lng=25.4615),
        Destination(name='Dubai', country='UAE',
                    description='A futuristic metropolis of record-breaking skyscrapers, luxury shopping, desert adventures, and stunning man-made islands.',
                    image_url='https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800',
                    lat=25.2048, lng=55.2708),
        Destination(name='Cape Town', country='South Africa',
                    description='Where Table Mountain meets the ocean — stunning coastal drives, world-class vineyards, and vibrant culture.',
                    image_url='https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800',
                    lat=-33.9249, lng=18.4241),
        Destination(name='Kyoto', country='Japan',
                    description='The cultural heart of Japan with over 2,000 temples, traditional geisha districts, and enchanting bamboo forests.',
                    image_url='https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800',
                    lat=35.0116, lng=135.7681),
        Destination(name='Machu Picchu', country='Peru',
                    description='The legendary Lost City of the Incas perched high in the Andes — a wonder of ancient engineering and breathtaking mountain scenery.',
                    image_url='https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=800',
                    lat=-13.1631, lng=-72.5450),
        Destination(name='Maldives', country='Maldives',
                    description='Crystal-clear turquoise waters, overwater bungalows, pristine white-sand beaches, and some of the best diving in the world.',
                    image_url='https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800',
                    lat=3.2028, lng=73.2207),
    ]
    db.session.add_all(destinations)
    db.session.flush()

    # ── Hotels (3–4 per destination) ──
    hotel_data = [
        # Paris
        ('Le Grand Parisien', 0, 'Elegant 5-star hotel steps from the Champs-Élysées with panoramic city views.', 320, ['wifi', 'pool', 'spa', 'restaurant', 'gym'], 4.8, 48.8698, 2.3076),
        ('Hôtel Lumière', 0, 'Boutique hotel in the Marais with art-deco interiors and a rooftop terrace.', 195, ['wifi', 'restaurant', 'bar'], 4.5, 48.8566, 2.3622),
        ('Seine View Suites', 0, 'Modern suites overlooking the River Seine, walking distance to Notre-Dame.', 275, ['wifi', 'gym', 'restaurant', 'concierge'], 4.7, 48.8530, 2.3499),
        # Tokyo
        ('Tokyo Sky Hotel', 1, 'Ultra-modern tower hotel in Shinjuku with observation deck and robotic concierge.', 280, ['wifi', 'gym', 'restaurant', 'onsen'], 4.6, 35.6895, 139.6917),
        ('Sakura Inn', 1, 'Traditional ryokan experience with tatami rooms and private hot springs.', 180, ['wifi', 'onsen', 'garden'], 4.4, 35.6620, 139.7004),
        ('Shibuya Grand', 1, 'Trendy hotel in the heart of Shibuya with rooftop bar and city views.', 220, ['wifi', 'bar', 'gym', 'restaurant'], 4.5, 35.6580, 139.7016),
        # Bali
        ('Ubud Paradise Resort', 2, 'Luxury jungle resort with infinity pool overlooking rice terraces.', 210, ['wifi', 'pool', 'spa', 'restaurant', 'yoga'], 4.9, -8.5069, 115.2625),
        ('Seminyak Beach Hotel', 2, 'Beachfront hotel with direct sand access, sunset lounge, and surf lessons.', 170, ['wifi', 'pool', 'beach', 'restaurant', 'bar'], 4.6, -8.6913, 115.1680),
        ('Bali Zen Villas', 2, 'Private villa compound with personal pool and butler service.', 350, ['wifi', 'pool', 'spa', 'butler', 'restaurant'], 4.8, -8.5100, 115.2700),
        # New York
        ('Manhattan Grand Hotel', 3, 'Iconic luxury hotel on 5th Avenue with Central Park views.', 450, ['wifi', 'gym', 'restaurant', 'spa', 'concierge'], 4.7, 40.7641, -73.9731),
        ('Brooklyn Bridge Inn', 3, 'Boutique inn in DUMBO with exposed brick and rooftop lounge.', 220, ['wifi', 'bar', 'restaurant'], 4.4, 40.7033, -73.9903),
        ('Times Square Suites', 3, 'Modern suites in the heart of Times Square with Broadway ticket concierge.', 310, ['wifi', 'gym', 'concierge', 'restaurant'], 4.3, 40.7580, -73.9855),
        # Santorini
        ('Oia Sunset Resort', 4, 'Cave-style suites carved into the caldera with private plunge pools.', 380, ['wifi', 'pool', 'restaurant', 'spa'], 4.9, 36.4618, 25.3753),
        ('Fira Blue Hotel', 4, 'Whitewashed hotel with blue-dome views and Mediterranean garden.', 240, ['wifi', 'pool', 'restaurant', 'bar'], 4.6, 36.4168, 25.4321),
        # Dubai
        ('Burj Vista Hotel', 5, 'Ultra-luxury hotel with views of Burj Khalifa and private beach.', 520, ['wifi', 'pool', 'spa', 'beach', 'restaurant', 'gym'], 4.8, 25.1972, 55.2744),
        ('Desert Rose Resort', 5, 'Desert resort with luxury tents, camel rides, and stargazing.', 350, ['wifi', 'pool', 'spa', 'restaurant', 'desert-tours'], 4.7, 25.1124, 55.3783),
        ('Marina Bay Suites', 5, 'Modern waterfront suites in Dubai Marina with yacht club access.', 290, ['wifi', 'pool', 'gym', 'yacht-club', 'restaurant'], 4.5, 25.0804, 55.1403),
        # Cape Town
        ('Table Mountain Lodge', 6, 'Eco-lodge at the foot of Table Mountain with hiking trails.', 180, ['wifi', 'restaurant', 'hiking', 'pool'], 4.6, -33.9628, 18.4098),
        ('V&A Waterfront Hotel', 6, 'Waterfront luxury with ocean views and direct mall access.', 260, ['wifi', 'pool', 'spa', 'restaurant', 'gym'], 4.7, -33.9036, 18.4207),
        # Kyoto
        ('Bamboo Garden Ryokan', 7, 'Traditional Japanese inn with bamboo garden and tea ceremony.', 200, ['wifi', 'garden', 'tea-room', 'onsen'], 4.8, 35.0094, 135.6710),
        ('Kyoto Imperial Hotel', 7, 'Grand hotel near the Imperial Palace with zen gardens.', 280, ['wifi', 'restaurant', 'garden', 'spa', 'gym'], 4.6, 35.0251, 135.7628),
        # Machu Picchu
        ('Inca Trail Lodge', 8, 'Mountain lodge at the gateway to Machu Picchu with guided treks.', 160, ['wifi', 'restaurant', 'trekking', 'bar'], 4.5, -13.1547, -72.5259),
        ('Sacred Valley Resort', 8, 'Luxury resort in the Sacred Valley with panoramic Andes views.', 290, ['wifi', 'pool', 'spa', 'restaurant', 'trekking'], 4.7, -13.3370, -72.1280),
        # Maldives
        ('Coral Reef Overwater', 9, 'Overwater bungalows with glass floors and private reef access.', 600, ['wifi', 'pool', 'spa', 'diving', 'restaurant', 'butler'], 4.9, 3.2028, 73.2207),
        ('Sunset Atoll Resort', 9, 'Private island resort with all-inclusive dining and water sports.', 480, ['wifi', 'pool', 'beach', 'diving', 'restaurant', 'spa'], 4.8, 3.2200, 73.2450),
    ]

    hotels = []
    for name, dest_idx, desc, price, amenities, rating, lat, lng in hotel_data:
        hotel = Hotel(
            destination_id=destinations[dest_idx].id,
            name=name, description=desc, price_per_night=price,
            amenities=amenities, rating=rating, lat=lat, lng=lng,
            image_url=f'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600',
        )
        hotels.append(hotel)
    db.session.add_all(hotels)
    db.session.flush()

    # ── Rooms for each hotel ──
    room_types = [
        ('Standard', 0.8, 2, 10),
        ('Deluxe', 1.0, 2, 8),
        ('Suite', 1.5, 4, 4),
        ('Family', 1.3, 6, 5),
    ]
    for hotel in hotels:
        for rtype, multiplier, capacity, count in room_types:
            room = HotelRoom(
                hotel_id=hotel.id,
                room_type=rtype,
                price=round(hotel.price_per_night * multiplier, 2),
                capacity=capacity,
                available_count=count,
            )
            db.session.add(room)

    # ── Tickets ──
    today = date.today()
    ticket_data = []
    for i, dest in enumerate(destinations):
        ticket_data.extend([
            Ticket(destination_id=dest.id, title=f'{dest.name} City Tour Bus', type='transport',
                   description=f'Hop-on hop-off bus tour covering all major {dest.name} landmarks.',
                   price=35 + i * 5, date=today + timedelta(days=30), available_count=100,
                   image_url='https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400'),
            Ticket(destination_id=dest.id, title=f'{dest.name} Museum Pass', type='attraction',
                   description=f'Skip-the-line access to top museums and galleries in {dest.name}.',
                   price=25 + i * 3, date=today + timedelta(days=60), available_count=200,
                   image_url='https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=400'),
            Ticket(destination_id=dest.id, title=f'{dest.name} Sunset Cruise', type='attraction',
                   description=f'Romantic sunset cruise with dinner and drinks in {dest.name}.',
                   price=85 + i * 10, date=today + timedelta(days=45), available_count=50,
                   image_url='https://images.unsplash.com/photo-1548574505-5e239809ee19?w=400'),
            Ticket(destination_id=dest.id, title=f'{dest.name} Food Walking Tour', type='attraction',
                   description=f'Taste the best local cuisine on this guided food tour through {dest.name}.',
                   price=45 + i * 4, date=today + timedelta(days=20), available_count=30,
                   image_url='https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400'),
            Ticket(destination_id=dest.id, title=f'{dest.name} Airport Transfer', type='transport',
                   description=f'Private airport transfer to/from your {dest.name} hotel.',
                   price=55 + i * 5, date=today + timedelta(days=15), available_count=150,
                   image_url='https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400'),
        ])
    db.session.add_all(ticket_data)

    # ── Guides ──
    guide_names = [
        ('Marie Laurent', ['English', 'French'], 'Certified Paris guide with 10 years of experience. Art history specialist.'),
        ('Yuki Tanaka', ['English', 'Japanese'], 'Tokyo native and cultural ambassador. Specializes in hidden gems.'),
        ('Wayan Surya', ['English', 'Indonesian', 'Dutch'], 'Bali-born guide with deep knowledge of temples and traditions.'),
        ('Marcus Johnson', ['English', 'Spanish'], 'NYC local who knows every borough. Street art and food expert.'),
        ('Elena Papadopoulos', ['English', 'Greek'], 'Santorini historian specializing in ancient Greek civilization.'),
        ('Ahmed Al-Rashid', ['English', 'Arabic', 'Hindi'], 'Dubai adventurer offering desert and city tours.'),
        ('Zara Ndlovu', ['English', 'Zulu', 'Afrikaans'], 'Cape Town guide specializing in nature and wine tours.'),
        ('Hiroshi Matsuda', ['English', 'Japanese'], 'Kyoto temple guide with tea ceremony certification.'),
        ('Carlos Rivera', ['English', 'Spanish', 'Quechua'], 'Inca heritage guide with 15 years on the trail.'),
        ('Aminath Shafia', ['English', 'Dhivehi'], 'Marine biologist turned guide — reef and snorkeling specialist.'),
    ]
    for i, dest in enumerate(destinations):
        name, langs, bio = guide_names[i]
        guides = [
            Guide(destination_id=dest.id, name=name, bio=bio,
                  languages=langs, rating=4.5 + (i % 5) * 0.1,
                  price_per_day=80 + i * 15,
                  image_url=f'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300'),
            Guide(destination_id=dest.id, name=f'Local Expert - {dest.name}',
                  bio=f'Passionate local guide offering personalized {dest.name} experiences.',
                  languages=['English'], rating=4.3 + (i % 3) * 0.1,
                  price_per_day=60 + i * 10,
                  image_url=f'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300'),
            Guide(destination_id=dest.id, name=f'{dest.name} Adventures Guide',
                  bio=f'Adventure specialist in {dest.name} — hiking, water sports, and outdoor activities.',
                  languages=['English', 'French'], rating=4.4 + (i % 4) * 0.1,
                  price_per_day=90 + i * 12,
                  image_url=f'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300'),
        ]
        db.session.add_all(guides)

    db.session.commit()
    print(f'Seeded {len(destinations)} destinations, {len(hotels)} hotels, '
          f'{len(ticket_data)} tickets, and 30 guides.')

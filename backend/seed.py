import sys
import os
import datetime
from datetime import timedelta
import pymysql
from dotenv import load_dotenv
from sqlalchemy.orm import Session
from backend.database import engine, Base, SessionLocal
from backend import models
from backend.auth.utils import hash_password

load_dotenv()

def seed_db():
    print("Ensuring database exists...")
    try:
        db_user = os.getenv("DB_USER", "root")
        db_pass = os.getenv("DB_PASSWORD", "admin")
        db_host = os.getenv("DB_HOST", "127.0.0.1")
        db_port = int(os.getenv("DB_PORT", "3306"))
        db_name = os.getenv("DB_NAME", "food_redistribution")

        conn = pymysql.connect(
            host=db_host,
            user=db_user,
            password=db_pass,
            port=db_port
        )
        cursor = conn.cursor()
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {db_name}")
        cursor.close()
        conn.close()
        print(f"Database '{db_name}' ensured.")
    except Exception as e:
        print(f"Error checking/creating database: {e}")
        print("Continuing database seeding (assuming SQLite mode or pre-existing database)...")

    print("Connecting to the database and dropping tables to ensure fresh seed...")
    try:
        # Drop all tables first for a clean state
        Base.metadata.drop_all(bind=engine)
        # Create all tables
        Base.metadata.create_all(bind=engine)
        print("Database schema successfully established.")
    except Exception as e:
        print(f"Error initializing schema: {e}")
        print("Please verify that your MySQL server is running and database configuration is correct.")
        sys.exit(1)

    db: Session = SessionLocal()
    try:
        print("Seeding users, profiles, and initial records...")

        # 1. Admin User
        admin_user = models.User(
            email="admin@platform.org",
            password_hash=hash_password("Admin@2026"),
            role="admin",
            name="System Admin (Simulated)",
            phone="+1-555-0100"
        )
        db.add(admin_user)

        # 2. Donor 1: GreenFields Supermarket (Approved)
        donor1_user = models.User(
            email="greenfields@donor.org",
            password_hash=hash_password("donor123"),
            role="donor",
            name="Sarah Jenkins (Simulated Donor Owner)",
            phone="+1-555-0111"
        )
        db.add(donor1_user)
        db.commit()
        db.refresh(donor1_user)

        donor1_profile = models.Donor(
            user_id=donor1_user.id,
            company_name="GreenFields Supermarket [Simulated]",
            donor_type="supermarket",
            address="123 Eco Ave, Green City",
            latitude=12.97160000,
            longitude=77.59460000,
            approval_status="approved"
        )
        db.add(donor1_profile)

        # 3. Donor 2: Metro Plaza Hotel (Approved)
        donor2_user = models.User(
            email="metrofoods@donor.org",
            password_hash=hash_password("donor123"),
            role="donor",
            name="David Miller (Simulated Donor Chef)",
            phone="+1-555-0122"
        )
        db.add(donor2_user)
        db.commit()
        db.refresh(donor2_user)

        donor2_profile = models.Donor(
            user_id=donor2_user.id,
            company_name="Metro Plaza Hotel [Simulated]",
            donor_type="hotel",
            address="456 Urban Blvd, Green City",
            latitude=12.93450000,
            longitude=77.61010000,
            approval_status="approved"
        )
        db.add(donor2_profile)

        # 4. Donor 3: Pending Restaurant Donor
        donor3_user = models.User(
            email="cornerbistro@donor.org",
            password_hash=hash_password("donor123"),
            role="donor",
            name="Elena Rostova (Simulated)",
            phone="+1-555-0133"
        )
        db.add(donor3_user)
        db.commit()
        db.refresh(donor3_user)

        donor3_profile = models.Donor(
            user_id=donor3_user.id,
            company_name="Corner Bistro [Simulated - Pending]",
            donor_type="restaurant",
            address="789 Local St, Green City",
            latitude=12.98010000,
            longitude=77.60010000,
            approval_status="pending"
        )
        db.add(donor3_profile)

        # 5. NGO 1: Food For All NGO (Approved)
        ngo1_user = models.User(
            email="foodforall@ngo.org",
            password_hash=hash_password("ngo123"),
            role="ngo",
            name="Maria Gomez (Simulated NGO Director)",
            phone="+1-555-0211"
        )
        db.add(ngo1_user)
        db.commit()
        db.refresh(ngo1_user)

        ngo1_profile = models.NGO(
            user_id=ngo1_user.id,
            organization_name="Food For All Foundation [Simulated]",
            registration_number="NGO-123456",
            address="789 Charity Rd, Green City",
            latitude=12.95620000,
            longitude=77.62340000,
            approval_status="approved"
        )
        db.add(ngo1_profile)

        # 6. NGO 2: Hope Community Kitchen (Approved)
        ngo2_user = models.User(
            email="hopekitchen@ngo.org",
            password_hash=hash_password("ngo123"),
            role="ngo",
            name="John Harrison (Simulated Kitchen Lead)",
            phone="+1-555-0222"
        )
        db.add(ngo2_user)
        db.commit()
        db.refresh(ngo2_user)

        ngo2_profile = models.NGO(
            user_id=ngo2_user.id,
            organization_name="Hope Kitchen International [Simulated]",
            registration_number="NGO-789012",
            address="101 Hope Lane, Green City",
            latitude=12.91230000,
            longitude=77.63210000,
            approval_status="approved"
        )
        db.add(ngo2_profile)

        # Commit profiles to ensure IDs are generated
        db.commit()
        db.refresh(donor1_profile)
        db.refresh(donor2_profile)
        db.refresh(ngo1_profile)
        db.refresh(ngo2_profile)

        # 7. Add Simulated Predictions (Surplus Prediction Module)
        prediction1 = models.Prediction(
            donor_id=donor1_profile.id,
            predicted_quantity=145.50,
            features={"day_of_week": 4, "historical_average": 130.0, "is_holiday": False, "food_category": "fresh_produce"}
        )
        prediction2 = models.Prediction(
            donor_id=donor2_profile.id,
            predicted_quantity=82.20,
            features={"day_of_week": 4, "historical_average": 90.5, "is_holiday": False, "food_category": "cooked_meals"}
        )
        db.add_all([prediction1, prediction2])
        db.commit() # Commit predictions to get their generated IDs
        db.refresh(prediction1)
        db.refresh(prediction2)

        # 8. Add Simulated Donations
        donation1 = models.Donation(
            donor_id=donor1_profile.id,
            prediction_id=prediction1.id,
            food_item="Fresh Organic Vegetables [Simulated]",
            quantity=50.00,
            unit="kg",
            expiry_time=datetime.datetime.utcnow() + timedelta(hours=18),
            status="REQUEST CREATED",
            ngo_id=ngo1_profile.id
        )
        donation2 = models.Donation(
            donor_id=donor2_profile.id,
            prediction_id=prediction2.id,
            food_item="Prepared Buffet Trays (Rice & Chicken) [Simulated]",
            quantity=35.50,
            unit="kg",
            expiry_time=datetime.datetime.utcnow() + timedelta(hours=6),
            status="NGO ACCEPTED",
            ngo_id=ngo1_profile.id
        )
        donation3 = models.Donation(
            donor_id=donor1_profile.id,
            prediction_id=prediction1.id,
            food_item="Bakery Excess Items [Simulated - Completed]",
            quantity=25.00,
            unit="kg",
            expiry_time=datetime.datetime.utcnow() - timedelta(hours=2),
            status="DISTRIBUTION COMPLETED",
            ngo_id=ngo2_profile.id
        )
        db.add_all([donation1, donation2, donation3])
        db.commit()
        db.refresh(donation2)
        db.refresh(donation3)

        # 9. Add Simulated NGO Requirement
        requirement1 = models.NGORequirement(
            ngo_id=ngo1_profile.id,
            food_type_needed="cooked_meals,bakery,other",
            quantity_needed=100.00,
            capacity=200.00,
            urgency_level="high",
            status="active"
        )
        requirement2 = models.NGORequirement(
            ngo_id=ngo2_profile.id,
            food_type_needed="fresh_produce,dairy,bakery",
            quantity_needed=120.00,
            capacity=150.00,
            urgency_level="medium",
            status="active"
        )
        db.add_all([requirement1, requirement2])

        # 10. Add Simulated Delivery (Distribution & Impact Tracking Module)
        delivery1 = models.DeliveryTracking(
            donation_id=donation2.id,
            ngo_id=ngo1_profile.id,
            driver_name="Alex Carter (Simulated Driver)",
            driver_phone="+1-555-9001",
            status="assigned",
            route_details={"origin": [12.9345, 77.6101], "destination": [12.9562, 77.6234], "distance_km": 3.4},
            estimated_delivery_time=datetime.datetime.utcnow() + timedelta(hours=1)
        )
        db.add(delivery1)

        db.commit()
        print("Database seeded with simulated data successfully.")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from backend.database import SessionLocal
from backend import models
from backend.auth.utils import hash_password

def create_admin():
    db: Session = SessionLocal()
    try:
        email = "admin@platform.org"
        password = "admin123"
        
        # Check if user already exists
        existing_admin = db.query(models.User).filter(models.User.email == email).first()
        if existing_admin:
            print(f"Admin user {email} already exists. Updating password...")
            existing_admin.password_hash = hash_password(password)
            existing_admin.role = "admin"
            existing_admin.name = "Platform Administrator"
            db.commit()
            print("Admin password updated successfully.")
            return

        new_admin = models.User(
            email=email,
            password_hash=hash_password(password),
            role="admin",
            name="Platform Administrator",
            phone="+1-555-0100"
        )
        db.add(new_admin)
        db.commit()
        print(f"Admin user created successfully!\nEmail: {email}\nPassword: {password}\nRole: admin")
    except Exception as e:
        db.rollback()
        print(f"Error creating admin: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    create_admin()

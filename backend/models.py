import datetime
from sqlalchemy import Column, Integer, String, Enum, DateTime, ForeignKey, Numeric, JSON
from sqlalchemy.orm import relationship
from backend.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum("donor", "ngo", "admin", name="user_roles"), nullable=False)
    name = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    donor_profile = relationship("Donor", uselist=False, back_populates="user", cascade="all, delete-orphan")
    ngo_profile = relationship("NGO", uselist=False, back_populates="user", cascade="all, delete-orphan")


class Donor(Base):
    __tablename__ = "donors"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    company_name = Column(String(255), nullable=False)
    donor_type = Column(Enum("restaurant", "supermarket", "hotel", "caterer", "other", name="donor_types"), nullable=False)
    address = Column(String(500), nullable=True)
    latitude = Column(Numeric(10, 8), nullable=True)
    longitude = Column(Numeric(11, 8), nullable=True)
    approval_status = Column(Enum("pending", "approved", "rejected", name="donor_approval"), default="pending")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="donor_profile")
    predictions = relationship("Prediction", back_populates="donor", cascade="all, delete-orphan")
    donations = relationship("Donation", back_populates="donor", cascade="all, delete-orphan")


class NGO(Base):
    __tablename__ = "ngos"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    organization_name = Column(String(255), nullable=False)
    registration_number = Column(String(100), nullable=True)
    address = Column(String(500), nullable=True)
    latitude = Column(Numeric(10, 8), nullable=True)
    longitude = Column(Numeric(11, 8), nullable=True)
    approval_status = Column(Enum("pending", "approved", "rejected", name="ngo_approval"), default="pending")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="ngo_profile")
    requirements = relationship("NGORequirement", back_populates="ngo", cascade="all, delete-orphan")
    deliveries = relationship("DeliveryTracking", back_populates="ngo", cascade="all, delete-orphan")


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    donor_id = Column(Integer, ForeignKey("donors.id", ondelete="CASCADE"), nullable=False)
    predicted_quantity = Column(Numeric(10, 2), nullable=False)  # Regression output
    predicted_at = Column(DateTime, default=datetime.datetime.utcnow)
    features = Column(JSON, nullable=True)  # Store JSON representation of prediction features
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    donor = relationship("Donor", back_populates="predictions")


class Donation(Base):
    __tablename__ = "donations"

    id = Column(Integer, primary_key=True, index=True)
    donor_id = Column(Integer, ForeignKey("donors.id", ondelete="CASCADE"), nullable=False)
    ngo_id = Column(Integer, ForeignKey("ngos.id", ondelete="SET NULL"), nullable=True)
    prediction_id = Column(Integer, ForeignKey("predictions.id", ondelete="SET NULL"), nullable=True)
    food_item = Column(String(255), nullable=False)
    quantity = Column(Numeric(10, 2), nullable=False)
    unit = Column(String(20), default="kg")
    expiry_time = Column(DateTime, nullable=False)
    status = Column(Enum("available", "claimed", "picked_up", "delivered", "DELIVERED", "cancelled", "REQUEST CREATED", "NGO ACCEPTED", "PICKUP ASSIGNED", "FOOD COLLECTED", "DISTRIBUTION COMPLETED", name="donation_status"), default="available")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    donor = relationship("Donor", back_populates="donations")
    ngo = relationship("NGO")
    prediction = relationship("Prediction")
    deliveries = relationship("DeliveryTracking", back_populates="donation", cascade="all, delete-orphan")


class NGORequirement(Base):
    __tablename__ = "ngo_requirements"

    id = Column(Integer, primary_key=True, index=True)
    ngo_id = Column(Integer, ForeignKey("ngos.id", ondelete="CASCADE"), nullable=False)
    food_type_needed = Column(String(255), nullable=False) # Store comma-separated accepted types
    quantity_needed = Column(Numeric(10, 2), nullable=False)
    capacity = Column(Numeric(10, 2), nullable=True) # Max storage capacity
    urgency_level = Column(Enum("low", "medium", "high", name="urgency_levels"), nullable=False)
    status = Column(Enum("active", "fulfilled", "cancelled", name="requirement_status"), default="active")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    ngo = relationship("NGO", back_populates="requirements")


class DeliveryTracking(Base):
    __tablename__ = "delivery_tracking"

    id = Column(Integer, primary_key=True, index=True)
    donation_id = Column(Integer, ForeignKey("donations.id", ondelete="CASCADE"), nullable=False)
    ngo_id = Column(Integer, ForeignKey("ngos.id", ondelete="CASCADE"), nullable=True)
    driver_name = Column(String(255), nullable=True)
    driver_phone = Column(String(50), nullable=True)
    status = Column(String(100), nullable=False) # Audit log status (e.g. REQUEST CREATED, NGO ACCEPTED...)
    updated_by = Column(String(255), nullable=True) # E.g. donor email, NGO org name, Admin
    remarks = Column(String(500), nullable=True) # Transition details
    route_details = Column(JSON, nullable=True)  # OSM path coords
    estimated_delivery_time = Column(DateTime, nullable=True)
    actual_delivery_time = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    donation = relationship("Donation", back_populates="deliveries")
    ngo = relationship("NGO", back_populates="deliveries")

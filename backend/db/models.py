from sqlalchemy import (
    Column, Integer, String, Text, Float, DateTime, ForeignKey, UniqueConstraint
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    name = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    tags = relationship("UserTag", back_populates="user", cascade="all, delete-orphan")
    owned_rooms = relationship("Room", back_populates="owner")
    memberships = relationship("RoomMember", back_populates="user", cascade="all, delete-orphan")
    recommendations = relationship("Recommendation", back_populates="user", cascade="all, delete-orphan")


class UserTag(Base):
    __tablename__ = "user_tags"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    tag = Column(String, nullable=False)

    user = relationship("User", back_populates="tags")

    __table_args__ = (UniqueConstraint("user_id", "tag", name="uq_user_tag"),)


class Room(Base):
    __tablename__ = "rooms"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    owner = relationship("User", back_populates="owned_rooms")
    tags = relationship("RoomTag", back_populates="room", cascade="all, delete-orphan")
    members = relationship("RoomMember", back_populates="room", cascade="all, delete-orphan")
    activities = relationship("Activity", back_populates="room", cascade="all, delete-orphan")
    recommendations = relationship("Recommendation", back_populates="room", cascade="all, delete-orphan")


class RoomTag(Base):
    __tablename__ = "room_tags"

    id = Column(Integer, primary_key=True, index=True)
    room_id = Column(Integer, ForeignKey("rooms.id"), nullable=False)
    tag = Column(String, nullable=False)

    room = relationship("Room", back_populates="tags")

    __table_args__ = (UniqueConstraint("room_id", "tag", name="uq_room_tag"),)


class RoomMember(Base):
    __tablename__ = "room_members"

    id = Column(Integer, primary_key=True, index=True)
    room_id = Column(Integer, ForeignKey("rooms.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    joined_at = Column(DateTime(timezone=True), server_default=func.now())

    room = relationship("Room", back_populates="members")
    user = relationship("User", back_populates="memberships")

    __table_args__ = (UniqueConstraint("room_id", "user_id", name="uq_room_member"),)


class Activity(Base):
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True, index=True)
    room_id = Column(Integer, ForeignKey("rooms.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    room = relationship("Room", back_populates="activities")
    tags = relationship("ActivityTag", back_populates="activity", cascade="all, delete-orphan")
    recommendations = relationship("Recommendation", back_populates="activity", cascade="all, delete-orphan")


class ActivityTag(Base):
    __tablename__ = "activity_tags"

    id = Column(Integer, primary_key=True, index=True)
    activity_id = Column(Integer, ForeignKey("activities.id"), nullable=False)
    tag = Column(String, nullable=False)

    activity = relationship("Activity", back_populates="tags")

    __table_args__ = (UniqueConstraint("activity_id", "tag", name="uq_activity_tag"),)


class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    room_id = Column(Integer, ForeignKey("rooms.id"), nullable=False)
    activity_id = Column(Integer, ForeignKey("activities.id"), nullable=True)
    score = Column(Float, nullable=False, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="recommendations")
    room = relationship("Room", back_populates="recommendations")
    activity = relationship("Activity", back_populates="recommendations")

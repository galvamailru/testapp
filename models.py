from sqlalchemy import Column, Integer, String, Date, Time, Boolean
from database import Base

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String, nullable=True)
    date = Column(Date, index=True)
    time = Column(Time, nullable=True)
    completed = Column(Boolean, default=False)
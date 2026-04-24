from sqlalchemy import Column, Integer, String, Date, Time, Text
from database import Base

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    date = Column(Date, nullable=False)
    time = Column(Time, nullable=True)
    status = Column(String(50), default="pending")

    def __repr__(self):
        return f"<Task(id={self.id}, title={self.title}, date={self.date})>"
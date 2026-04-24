from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from app.routes import router
from app.database import engine, Base

app = FastAPI()

Base.metadata.create_all(bind=engine)

app.include_router(router)
app.mount("/static", StaticFiles(directory="static"), name="static")
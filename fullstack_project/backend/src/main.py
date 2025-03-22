from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def read_root():
    return {"message": "Welcome to the API"}

@app.get("/api/items")
async def get_items():
    return {"items": [
        {"id": 1, "name": "Item 1"},
        {"id": 2, "name": "Item 2"},
    ]}

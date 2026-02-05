from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, date
from bson import ObjectId
from pymongo import UpdateOne

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Helper function to convert ObjectId to string
def affirmation_helper(affirmation) -> dict:
    return {
        "id": str(affirmation["_id"]),
        "text": affirmation["text"],
        "order": affirmation["order"],
        "is_example": affirmation.get("is_example", False),
        "created_at": affirmation["created_at"]
    }

def progress_helper(progress) -> dict:
    return {
        "id": str(progress["_id"]),
        "date": progress["date"],
        "completed_affirmations": progress["completed_affirmations"],
        "total_affirmations": progress["total_affirmations"],
        "completion_percentage": progress["completion_percentage"],
        "practice_count": progress["practice_count"]
    }

def settings_helper(settings) -> dict:
    return {
        "id": str(settings["_id"]),
        "morning_time": settings.get("morning_time", "08:00"),
        "night_time": settings.get("night_time", "20:00"),
        "notification_times": settings.get("notification_times", []),
        "notifications_enabled": settings.get("notifications_enabled", True),
        "current_streak": settings.get("current_streak", 0),
        "longest_streak": settings.get("longest_streak", 0),
        "last_practice_date": settings.get("last_practice_date", None)
    }

# Define Models
class AffirmationCreate(BaseModel):
    text: str
    order: Optional[int] = None

class AffirmationUpdate(BaseModel):
    text: Optional[str] = None
    order: Optional[int] = None

class AffirmationResponse(BaseModel):
    id: str
    text: str
    order: int
    is_example: bool
    created_at: str

class DailyProgressCreate(BaseModel):
    date: str
    affirmation_id: str

class DailyProgressResponse(BaseModel):
    id: str
    date: str
    completed_affirmations: List[str]
    total_affirmations: int
    completion_percentage: float
    practice_count: int

class SettingsUpdate(BaseModel):
    morning_time: Optional[str] = None
    night_time: Optional[str] = None
    notifications_enabled: Optional[bool] = None
    notification_times: Optional[List[dict]] = None

class SettingsResponse(BaseModel):
    id: str
    morning_time: str
    night_time: str
    notifications_enabled: bool
    notification_times: List[dict]
    current_streak: int
    longest_streak: int
    last_practice_date: Optional[str] = None

class NotificationTime(BaseModel):
    id: str
    time: str
    label: str
    enabled: bool

class ReorderRequest(BaseModel):
    affirmation_ids: List[str]

# Routes
@api_router.get("/")
async def root():
    return {"message": "Manifestation & Affirmation API"}

# Affirmation endpoints
@api_router.get("/affirmations", response_model=List[AffirmationResponse])
async def get_affirmations():
    affirmations = await db.affirmations.find().sort("order", 1).to_list(1000)
    return [affirmation_helper(aff) for aff in affirmations]

@api_router.post("/affirmations", response_model=AffirmationResponse)
async def create_affirmation(affirmation: AffirmationCreate):
    # Get the highest order number
    last_affirmation = await db.affirmations.find_one(sort=[("order", -1)])
    order = (last_affirmation["order"] + 1) if last_affirmation else 0
    
    affirmation_dict = {
        "text": affirmation.text,
        "order": affirmation.order if affirmation.order is not None else order,
        "is_example": False,
        "created_at": datetime.utcnow().isoformat()
    }
    
    result = await db.affirmations.insert_one(affirmation_dict)
    affirmation_dict["_id"] = result.inserted_id
    return affirmation_helper(affirmation_dict)

@api_router.put("/affirmations/{affirmation_id}", response_model=AffirmationResponse)
async def update_affirmation(affirmation_id: str, affirmation: AffirmationUpdate):
    update_data = {k: v for k, v in affirmation.dict().items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    result = await db.affirmations.find_one_and_update(
        {"_id": ObjectId(affirmation_id)},
        {"$set": update_data},
        return_document=True
    )
    
    if not result:
        raise HTTPException(status_code=404, detail="Affirmation not found")
    
    return affirmation_helper(result)

@api_router.delete("/affirmations/{affirmation_id}")
async def delete_affirmation(affirmation_id: str):
    result = await db.affirmations.delete_one({"_id": ObjectId(affirmation_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Affirmation not found")
    
    return {"message": "Affirmation deleted successfully"}

@api_router.post("/affirmations/reorder")
async def reorder_affirmations(request: ReorderRequest):
    # Use bulk write to avoid N+1 query problem
    operations = [
        UpdateOne(
            {"_id": ObjectId(affirmation_id)},
            {"$set": {"order": index}}
        )
        for index, affirmation_id in enumerate(request.affirmation_ids)
    ]
    
    if operations:
        await db.affirmations.bulk_write(operations)
    
    return {"message": "Affirmations reordered successfully"}

@api_router.post("/affirmations/seed")
async def seed_example_affirmations():
    # Check if examples already exist
    existing = await db.affirmations.count_documents({"is_example": True})
    if existing > 0:
        return {"message": "Example affirmations already exist"}
    
    examples = [
        "I am worthy of love, success, and happiness.",
        "I trust the journey and embrace each moment with grace.",
        "My potential is limitless, and I grow stronger every day.",
        "I attract positive energy and opportunities into my life.",
        "I am grateful for all the blessings in my life.",
        "I choose peace, joy, and abundance in all that I do.",
        "I release what no longer serves me and welcome new beginnings.",
        "I am confident, capable, and worthy of my dreams."
    ]
    
    affirmations = [
        {
            "text": text,
            "order": index,
            "is_example": True,
            "created_at": datetime.utcnow().isoformat()
        }
        for index, text in enumerate(examples)
    ]
    
    await db.affirmations.insert_many(affirmations)
    return {"message": f"Seeded {len(examples)} example affirmations"}

# Daily Progress endpoints
@api_router.get("/progress/today", response_model=DailyProgressResponse)
async def get_today_progress():
    today = date.today().isoformat()
    progress = await db.daily_progress.find_one({"date": today})
    
    if not progress:
        # Create new progress for today
        total_affirmations = await db.affirmations.count_documents({})
        progress = {
            "date": today,
            "completed_affirmations": [],
            "total_affirmations": total_affirmations,
            "completion_percentage": 0.0,
            "practice_count": 0
        }
        result = await db.daily_progress.insert_one(progress)
        progress["_id"] = result.inserted_id
    
    return progress_helper(progress)

@api_router.post("/progress/mark-complete")
async def mark_affirmation_complete(data: DailyProgressCreate):
    today = data.date
    affirmation_id = data.affirmation_id
    
    # Get or create today's progress
    progress = await db.daily_progress.find_one({"date": today})
    
    if not progress:
        total_affirmations = await db.affirmations.count_documents({})
        progress = {
            "date": today,
            "completed_affirmations": [],
            "total_affirmations": total_affirmations,
            "completion_percentage": 0.0,
            "practice_count": 0
        }
        result = await db.daily_progress.insert_one(progress)
        progress["_id"] = result.inserted_id
    
    # Add affirmation to completed list if not already there
    if affirmation_id not in progress["completed_affirmations"]:
        progress["completed_affirmations"].append(affirmation_id)
    
    # Update practice count
    progress["practice_count"] += 1
    
    # Calculate completion percentage
    total = await db.affirmations.count_documents({})
    completed_unique = len(progress["completed_affirmations"])
    completion_percentage = (completed_unique / total * 100) if total > 0 else 0
    
    # Update in database
    await db.daily_progress.update_one(
        {"_id": progress["_id"]},
        {
            "$set": {
                "completed_affirmations": progress["completed_affirmations"],
                "total_affirmations": total,
                "completion_percentage": completion_percentage,
                "practice_count": progress["practice_count"]
            }
        }
    )
    
    # Update streak if all affirmations completed
    if completed_unique == total and total > 0:
        await update_streak(today)
    
    progress["completion_percentage"] = completion_percentage
    progress["total_affirmations"] = total
    
    return progress_helper(progress)

async def update_streak(today: str):
    settings = await db.settings.find_one()
    
    if not settings:
        settings = {
            "morning_time": "08:00",
            "night_time": "20:00",
            "notifications_enabled": True,
            "current_streak": 0,
            "longest_streak": 0,
            "last_practice_date": None
        }
        result = await db.settings.insert_one(settings)
        settings["_id"] = result.inserted_id
    
    last_practice = settings.get("last_practice_date")
    current_streak = settings.get("current_streak", 0)
    longest_streak = settings.get("longest_streak", 0)
    
    if last_practice:
        last_date = datetime.fromisoformat(last_practice).date()
        today_date = datetime.fromisoformat(today).date()
        days_diff = (today_date - last_date).days
        
        if days_diff == 1:
            # Consecutive day
            current_streak += 1
        elif days_diff > 1:
            # Streak broken
            current_streak = 1
        # If same day (days_diff == 0), don't change streak
    else:
        current_streak = 1
    
    longest_streak = max(current_streak, longest_streak)
    
    await db.settings.update_one(
        {"_id": settings["_id"]},
        {
            "$set": {
                "current_streak": current_streak,
                "longest_streak": longest_streak,
                "last_practice_date": today
            }
        }
    )

@api_router.get("/progress/history")
async def get_progress_history(days: int = 7):
    progress_list = await db.daily_progress.find().sort("date", -1).limit(days).to_list(days)
    return [progress_helper(p) for p in progress_list]

# Settings endpoints
@api_router.get("/settings", response_model=SettingsResponse)
async def get_settings():
    settings = await db.settings.find_one()
    
    if not settings:
        # Create default settings with default notification times
        settings = {
            "morning_time": "08:00",
            "night_time": "20:00",
            "notifications_enabled": True,
            "notification_times": [
                {"id": "morning", "time": "08:00", "label": "Morning", "enabled": True},
                {"id": "night", "time": "20:00", "label": "Night", "enabled": True}
            ],
            "current_streak": 0,
            "longest_streak": 0,
            "last_practice_date": None
        }
        result = await db.settings.insert_one(settings)
        settings["_id"] = result.inserted_id
    
    return settings_helper(settings)

@api_router.put("/settings", response_model=SettingsResponse)
async def update_settings(settings_update: SettingsUpdate):
    settings = await db.settings.find_one()
    
    if not settings:
        # Create if doesn't exist
        settings = {
            "morning_time": "08:00",
            "night_time": "20:00",
            "notifications_enabled": True,
            "current_streak": 0,
            "longest_streak": 0,
            "last_practice_date": None
        }
        result = await db.settings.insert_one(settings)
        settings["_id"] = result.inserted_id
    
    update_data = {k: v for k, v in settings_update.dict().items() if v is not None}
    
    if update_data:
        await db.settings.update_one(
            {"_id": settings["_id"]},
            {"$set": update_data}
        )
        settings.update(update_data)
    
    return settings_helper(settings)

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

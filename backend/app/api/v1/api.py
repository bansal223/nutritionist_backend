from fastapi import APIRouter
from app.api.v1.endpoints import auth, users, patients, nutritionists, meal_plans, progress, subscriptions, admin, assignments

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(patients.router, prefix="/patients", tags=["patients"])
api_router.include_router(nutritionists.router, prefix="/nutritionists", tags=["nutritionists"])
api_router.include_router(meal_plans.router, prefix="/meal-plans", tags=["meal_plans"])
api_router.include_router(progress.router, prefix="/progress", tags=["progress"])
api_router.include_router(subscriptions.router, prefix="/subscriptions", tags=["subscriptions"])
api_router.include_router(assignments.router, prefix="/assignments", tags=["assignments"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"]) 
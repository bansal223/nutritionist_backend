from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
from app.core.database import get_collection
from app.core.security import verify_password, get_password_hash, create_access_token, create_refresh_token, verify_token
from app.models.user import UserCreate, UserLogin, Token, UserResponse, UserRole, RefreshTokenRequest
from app.api.deps import get_current_user
from bson import ObjectId
from datetime import datetime

router = APIRouter()

@router.post("/signup", response_model=Token)
async def signup(user_data: UserCreate):
    """Register a new user."""
    users_collection = get_collection("users")
    
    # Check if user already exists
    existing_user = await users_collection.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create user document
    user_doc = {
        "email": user_data.email,
        "phone": user_data.phone,
        "role": user_data.role,
        "password_hash": get_password_hash(user_data.password),
        "status": "active",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = await users_collection.insert_one(user_doc)
    user_doc["_id"] = result.inserted_id
    
    # Create tokens
    access_token = create_access_token(
        data={"sub": str(result.inserted_id), "email": user_data.email, "role": user_data.role}
    )
    refresh_token = create_refresh_token(
        data={"sub": str(result.inserted_id), "email": user_data.email, "role": user_data.role}
    )
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """Login user and return tokens."""
    users_collection = get_collection("users")
    
    # Find user by email
    user = await users_collection.find_one({"email": form_data.username})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verify password
    if not verify_password(form_data.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if user is active
    if user["status"] != "active":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account is suspended",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create tokens
    access_token = create_access_token(
        data={"sub": str(user["_id"]), "email": user["email"], "role": user["role"]}
    )
    refresh_token = create_refresh_token(
        data={"sub": str(user["_id"]), "email": user["email"], "role": user["role"]}
    )
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@router.post("/refresh", response_model=Token)
async def refresh_token(request: RefreshTokenRequest):
    """Refresh access token using refresh token."""
    # Verify refresh token
    payload = verify_token(request.refresh_token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create new access token
    access_token = create_access_token(
        data={"sub": payload["sub"], "email": payload["email"], "role": payload["role"]}
    )
    
    return {
        "access_token": access_token,
        "refresh_token": request.refresh_token,
        "token_type": "bearer"
    }

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user = Depends(get_current_user)):
    """Get current user information."""
    return {
        "id": str(current_user["_id"]),
        "email": current_user["email"],
        "phone": current_user["phone"],
        "role": current_user["role"],
        "status": current_user["status"],
        "created_at": current_user["created_at"],
        "updated_at": current_user["updated_at"]
    } 
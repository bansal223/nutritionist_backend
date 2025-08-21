from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    # Database
    MONGODB_URL: str = "mongodb://localhost:27017/nutritionist_db"
    
    # JWT Settings
    SECRET_KEY: str = "your-super-secret-key-change-this-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # AWS S3 Settings
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    AWS_BUCKET_NAME: str = ""
    AWS_REGION: str = "us-east-1"
    
    # Payment Gateway (Razorpay)
    RAZORPAY_KEY_ID: str = ""
    RAZORPAY_KEY_SECRET: str = ""
    
    # App Settings
    APP_NAME: str = "Nutritionist Platform"
    DEBUG: bool = True
    ALLOWED_HOSTS: str = "localhost,127.0.0.1"
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:3001,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:3001"
    
    @property
    def allowed_hosts_list(self) -> List[str]:
        return [host.strip() for host in self.ALLOWED_HOSTS.split(",")]
    
    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings() 
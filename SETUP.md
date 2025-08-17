# Nutritionist Platform Setup Guide

This guide will help you set up and run the Nutritionist Platform with FastAPI backend and React frontend.

## Prerequisites

Before starting, make sure you have the following installed:

- **Python 3.8+** - [Download Python](https://www.python.org/downloads/)
- **Node.js 16+** - [Download Node.js](https://nodejs.org/)
- **MongoDB** - [Download MongoDB](https://www.mongodb.com/try/download/community) or use MongoDB Atlas
- **Git** - [Download Git](https://git-scm.com/)

## Quick Start

### Option 1: Automated Setup (Recommended)

1. Make the startup script executable:
   ```bash
   chmod +x start.sh
   ```

2. Run the startup script:
   ```bash
   ./start.sh
   ```

This script will automatically:
- Create Python virtual environment
- Install all dependencies
- Start both backend and frontend servers

### Option 2: Manual Setup

#### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python3 -m venv venv
   ```

3. Activate the virtual environment:
   ```bash
   # On macOS/Linux:
   source venv/bin/activate
   
   # On Windows:
   venv\Scripts\activate
   ```

4. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

5. Set up environment variables:
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

6. Start the backend server:
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

#### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

3. Start the frontend development server:
   ```bash
   npm run dev
   ```

## Configuration

### Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
# Database
MONGODB_URL=mongodb://localhost:27017/nutritionist_db

# JWT Settings
SECRET_KEY=your-super-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# AWS S3 Settings (optional)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_BUCKET_NAME=your-s3-bucket-name
AWS_REGION=us-east-1

# Payment Gateway (optional)
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-secret-key

# App Settings
APP_NAME=Nutritionist Platform
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

### MongoDB Setup

#### Local MongoDB

1. Install MongoDB Community Edition
2. Start MongoDB service:
   ```bash
   # On macOS with Homebrew:
   brew services start mongodb-community
   
   # On Ubuntu:
   sudo systemctl start mongod
   
   # On Windows:
   net start MongoDB
   ```

#### MongoDB Atlas (Cloud)

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get your connection string
4. Update `MONGODB_URL` in your `.env` file

## Accessing the Application

Once both servers are running:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **ReDoc Documentation**: http://localhost:8000/redoc

## Features

### Authentication
- JWT-based authentication
- Role-based access control (Patient, Nutritionist, Admin)
- Secure password hashing

### Patient Features
- Profile management
- Progress tracking
- Meal plan viewing
- Subscription management

### Nutritionist Features
- Patient management
- Meal plan creation
- Progress monitoring
- Payment tracking

### Admin Features
- User management
- Nutritionist verification
- Analytics and metrics

## API Endpoints

### Authentication
- `POST /api/v1/auth/signup` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/refresh` - Refresh access token
- `GET /api/v1/auth/me` - Get current user

### Patients
- `GET /api/v1/patients/profile` - Get patient profile
- `PUT /api/v1/patients/profile` - Update patient profile
- `GET /api/v1/patients/current-plan` - Get current meal plan
- `POST /api/v1/patients/progress` - Create progress report
- `GET /api/v1/patients/progress` - Get progress reports

### Nutritionists
- `GET /api/v1/nutritionists/profile` - Get nutritionist profile
- `GET /api/v1/nutritionists/patients` - Get assigned patients
- `GET /api/v1/nutritionists/patients/{id}/progress` - Get patient progress

### Meal Plans
- `POST /api/v1/meal-plans` - Create meal plan
- `PUT /api/v1/meal-plans/{id}` - Update meal plan
- `GET /api/v1/meal-plans` - Get meal plans
- `GET /api/v1/meal-plans/{id}` - Get specific meal plan

### Admin
- `GET /api/v1/admin/users` - Get all users
- `PUT /api/v1/admin/users/{id}` - Update user
- `POST /api/v1/admin/nutritionists/{id}/verify` - Verify nutritionist
- `GET /api/v1/admin/metrics` - Get platform metrics

## Development

### Project Structure

```
Nutritionist_backend/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── api/            # API routes
│   │   ├── core/           # Core configurations
│   │   ├── models/         # Pydantic models
│   │   ├── services/       # Business logic
│   │   └── utils/          # Utilities
│   ├── requirements.txt
│   └── main.py
├── frontend/               # ReactJS frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── utils/          # Utilities
│   ├── package.json
│   └── vite.config.js
└── README.md
```

### Adding New Features

1. **Backend**: Add new endpoints in `backend/app/api/v1/endpoints/`
2. **Frontend**: Add new components in `frontend/src/components/` and pages in `frontend/src/pages/`
3. **Models**: Update Pydantic models in `backend/app/models/`
4. **Database**: Add new collections as needed

## Troubleshooting

### Common Issues

1. **Port already in use**:
   - Backend: Change port in `uvicorn` command
   - Frontend: Change port in `vite.config.ts`

2. **MongoDB connection failed**:
   - Check if MongoDB is running
   - Verify connection string in `.env`
   - Check network connectivity

3. **Dependencies not found**:
   - Reinstall dependencies: `pip install -r requirements.txt` (backend) or `npm install` (frontend)

4. **CORS errors**:
   - Update `CORS_ORIGINS` in `.env` to include your frontend URL

### Getting Help

- Check the API documentation at http://localhost:8000/docs
- Review the logs in the terminal
- Check the browser console for frontend errors

## Deployment

### Backend Deployment

1. Set `DEBUG=False` in production
2. Use a production ASGI server like Gunicorn
3. Set up proper environment variables
4. Configure MongoDB Atlas for production

### Frontend Deployment

1. Build the production version: `npm run build`
2. Deploy the `dist` folder to your hosting service
3. Update API base URL for production

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License 
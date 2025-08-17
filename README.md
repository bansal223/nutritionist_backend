# Nutritionist Platform

A comprehensive nutritionist platform built with FastAPI, ReactJS, and MongoDB.

## Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **MongoDB** - NoSQL database with Motor for async operations
- **Pydantic** - Data validation and serialization
- **JWT** - Authentication and authorization
- **Motor** - Async MongoDB driver
- **Uvicorn** - ASGI server

### Frontend
- **ReactJS** - Frontend framework
- **Vite** - Build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **Axios** - HTTP client
- **React Router** - Client-side routing

### External Services
- **MongoDB Atlas** - Cloud database hosting
- **AWS S3** - File storage for images
- **Razorpay/Stripe** - Payment processing

## Project Structure

```
Nutritionist_backend/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── api/            # API routes
│   │   ├── core/           # Core configurations
│   │   ├── models/         # Pydantic models
│   │   ├── schemas/        # Database schemas
│   │   ├── services/       # Business logic
│   │   └── utils/          # Utilities
│   ├── requirements.txt
│   └── main.py
├── frontend/               # ReactJS frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── hooks/          # Custom hooks
│   │   └── utils/          # Utilities
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## Features

### Authentication & Authorization
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

## Quick Start

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your MongoDB and other credentials
```

5. Run the server:
```bash
uvicorn main:app --reload
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

## API Documentation

Once the backend is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Environment Variables

### Backend (.env)
```
MONGODB_URL=mongodb://localhost:27017/nutritionist_db
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_BUCKET_NAME=your-s3-bucket
RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_KEY_SECRET=your-razorpay-secret
```

## Database Collections

- `users` - User accounts and authentication
- `patient_profiles` - Patient-specific information
- `nutritionist_profiles` - Nutritionist credentials and details
- `assignments` - Patient-nutritionist relationships
- `subscriptions` - Payment and subscription data
- `meal_plans` - Weekly meal plans
- `progress_reports` - Patient progress tracking

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License 
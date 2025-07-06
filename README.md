# Rent Management System

A full-stack rent management system built with React (TypeScript) frontend and Node.js (Express) backend with MongoDB database.

## Features

- **User Authentication**: JWT-based authentication with role-based access
- **Property Management**: Add, edit, delete properties with images
- **Tenant Management**: Track tenant information, leases, and status
- **Payment Tracking**: Record and manage rent payments
- **Maintenance Management**: Track maintenance requests and costs
- **Complaint System**: Handle tenant complaints and responses
- **Notifications**: Real-time notifications for important events
- **Dashboard**: Comprehensive overview with statistics and charts
- **Responsive Design**: Modern UI that works on all devices

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Zustand for state management
- Lucide React for icons
- React Router for navigation

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT for authentication
- bcrypt for password hashing
- express-validator for input validation
- CORS and Helmet for security

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Rent-Management-System
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Environment Setup**

   Create `.env` file in the Backend directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/rent-management
   JWT_SECRET=your-super-secret-jwt-key
   PORT=4000
   ```

   Create `.env` file in the Frontend directory:
   ```env
   VITE_API_URL=http://localhost:4000/api
   ```

4. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   ```

5. **Run the application**
   ```bash
   # Run both frontend and backend
   npm run dev
   
   # Or run separately:
   npm run dev:backend  # Backend on http://localhost:4000
   npm run dev:frontend # Frontend on http://localhost:5173
   ```

## API Endpoints

### Authentication
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user

### Properties
- `GET /api/properties` - Get all properties
- `POST /api/properties` - Create property
- `PUT /api/properties/:id` - Update property
- `DELETE /api/properties/:id` - Delete property

### Tenants
- `GET /api/tenants` - Get all tenants
- `POST /api/tenants` - Create tenant
- `PUT /api/tenants/:id` - Update tenant
- `DELETE /api/tenants/:id` - Delete tenant

### Payments
- `GET /api/payments` - Get all payments
- `POST /api/payments` - Create payment
- `PUT /api/payments/:id` - Update payment
- `DELETE /api/payments/:id` - Delete payment

### Maintenance
- `GET /api/maintenance` - Get all maintenance records
- `POST /api/maintenance` - Create maintenance record
- `PUT /api/maintenance/:id` - Update maintenance record
- `DELETE /api/maintenance/:id` - Delete maintenance record

### Complaints
- `GET /api/complaints` - Get all complaints
- `POST /api/complaints` - Create complaint
- `PUT /api/complaints/:id` - Update complaint
- `DELETE /api/complaints/:id` - Delete complaint

### Notifications
- `GET /api/notifications` - Get all notifications
- `POST /api/notifications` - Create notification
- `PUT /api/notifications/:id` - Update notification
- `DELETE /api/notifications` - Clear all notifications

## Usage

1. **Register/Login**: Create an account or login with existing credentials
2. **Add Properties**: Start by adding your rental properties
3. **Add Tenants**: Register tenants and assign them to properties
4. **Track Payments**: Record rent payments and track income
5. **Manage Maintenance**: Handle maintenance requests and track costs
6. **Handle Complaints**: Respond to tenant complaints
7. **Monitor Dashboard**: View statistics and recent activity

## Development

### Project Structure
```
Rent-Management-System/
├── Backend/
│   ├── controllers/     # API controllers
│   ├── models/         # MongoDB schemas
│   ├── routes/         # API routes
│   └── server.js       # Express server
├── Frontend/
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── pages/      # Page components
│   │   ├── store/      # Zustand store
│   │   └── types/      # TypeScript types
│   └── package.json
└── package.json        # Root package.json
```

### Adding New Features

1. **Backend**: Add controller, model, and route files
2. **Frontend**: Add store actions and page components
3. **Integration**: Update API calls and state management

## Security Features

- JWT authentication for all protected routes
- Password hashing with bcrypt
- Input validation with express-validator
- CORS configuration
- Security headers with Helmet
- Environment variable protection

## Deployment

### Backend Deployment
1. Set up MongoDB Atlas or local MongoDB
2. Configure environment variables
3. Deploy to Heroku, Vercel, or similar

### Frontend Deployment
1. Update API URL in environment variables
2. Build the project: `npm run build`
3. Deploy to Vercel, Netlify, or similar

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details 
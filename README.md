# e-Barter 2.0 🔄

**An improved peer-to-peer bartering platform that enables users to exchange items without monetary transactions.**

e-Barter 2.0 is a modern web application that facilitates item exchanges between users, promoting sustainable consumption and community engagement. Users can post items they want to trade, browse available items, and communicate with other users to arrange swaps.

## ✨ Features

### Core Functionality
- **Item Management**: Post, edit, and manage items for bartering
- **Smart Matching**: Browse and search for items you want to trade
- **Swap Requests**: Send and receive swap proposals with detailed messaging
- **Real-time Chat**: Built-in messaging system for seamless communication
- **User Feedback**: Rating and review system to build trust in the community

### User Experience
- **Google OAuth Integration**: Secure and convenient authentication
- **Real-time Notifications**: Instant updates for chat messages and swap requests
- **Responsive Design**: Optimized for desktop and mobile devices
- **Image Upload**: Cloudinary integration for high-quality item photos
- **User Profiles**: Comprehensive user management and profile system

## 🛠️ Technology Stack

### Backend
- **Node.js** with **Express.js** - RESTful API server
- **MongoDB** - Database for storing users, items, and transactions
- **Socket.io** - Real-time bidirectional communication
- **Cloudinary** - Image storage and optimization
- **Google OAuth 2.0** - Authentication service
- **JWT** - Secure token-based authentication

### Frontend
- **React.js** - Modern component-based UI library
- **CSS3** - Custom styling and responsive design
- **Socket.io Client** - Real-time features implementation

## 📋 Prerequisites

Before running this application, make sure you have:

- **Node.js** (v14 or higher)
- **npm** or **yarn** package manager
- **MongoDB** database (local or MongoDB Atlas)
- **Cloudinary** account for image uploads
- **Google OAuth** credentials

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/bibhu8/e-Barter_2.git
cd e-Barter_2
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
```env
# Database
MONGODB_URI=your_mongodb_connection_string

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# JWT
JWT_SECRET=your_jwt_secret_key

# Server
PORT=5000
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

Create a `.env` file in the frontend directory:
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
```

### 4. Start the Application
```bash
# Start backend server (from backend directory)
npm start

# Start frontend development server (from frontend directory)
npm start
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## 📱 Usage

### Getting Started
1. **Sign Up/Login** using your Google account
2. **Complete your profile** with basic information
3. **Post items** you want to barter with photos and descriptions
4. **Browse items** posted by other users
5. **Send swap requests** for items you're interested in
6. **Chat with users** to negotiate and arrange exchanges
7. **Complete swaps** and leave feedback for other users

### Key Features Guide

#### Posting Items
- Upload high-quality photos of your items
- Provide detailed descriptions and condition information
- Set categories and tags for better discoverability
- Specify what you're looking for in return

#### Making Swap Requests
- Browse items by category or search
- Send personalized swap requests with your offered items
- Negotiate terms through the built-in chat system
- Track request status and responses

#### Communication
- Real-time messaging with other users
- Notification system for new messages and requests
- Chat history and conversation management

## 🏗️ Project Structure

```
e-Barter_2/
├── backend/                 # Server-side application
│   ├── config/             # Database and service configurations
│   ├── controllers/        # Business logic and API endpoints
│   ├── middleware/         # Authentication and upload middleware
│   ├── models/            # Database models and schemas
│   ├── routes/            # API route definitions
│   ├── server.js          # Main server file
│   └── socket.js          # Socket.io configuration
├── frontend/              # Client-side React application
│   ├── public/           # Static assets
│   ├── src/
│   │   ├── components/   # Reusable React components
│   │   ├── pages/        # Application pages/views
│   │   └── styles/       # CSS styling files
│   └── package.json      # Frontend dependencies
└── README.md             # This file
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/google` - Google OAuth login

### Items
- `GET /api/items` - Get all items
- `POST /api/items` - Create new item
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item

### Swaps
- `GET /api/swaps` - Get user's swap requests
- `POST /api/swaps` - Create swap request
- `PUT /api/swaps/:id` - Update swap status

### Chat
- `GET /api/chats` - Get user's chats
- `POST /api/chats` - Send message
- `GET /api/chats/:id` - Get specific chat history

## 🧪 Testing

```bash
# Run backend tests
cd backend
npm test

# Run frontend tests
cd frontend
npm test
```

## 🚀 Deployment

### Backend Deployment
1. Set up environment variables on your hosting platform
2. Deploy to platforms like Heroku, DigitalOcean, or AWS
3. Ensure MongoDB Atlas is configured for production

### Frontend Deployment
1. Build the React application: `npm run build`
2. Deploy to platforms like Netlify, Vercel, or AWS S3
3. Update API URLs for production environment

## 🤝 Contributing

We welcome contributions to e-Barter 2.0! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines
- Follow existing code style and conventions
- Write clear commit messages
- Add tests for new features
- Update documentation as needed

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Issues & Support

If you encounter any issues or have questions:

1. Check existing [Issues](https://github.com/bibhu8/e-Barter_2/issues)
2. Create a new issue with detailed description
3. Include steps to reproduce the problem
4. Provide system information and error messages

## 🎯 Roadmap

### Upcoming Features
- [ ] Mobile app development (React Native)
- [ ] Advanced search and filtering options
- [ ] Geolocation-based item discovery
- [ ] Integration with social media platforms
- [ ] Multi-language support
- [ ] Enhanced security features

### Version History
- **v2.0** - Current version with improved UI and real-time features
- **v1.0** - Initial release with basic bartering functionality

## 👥 Authors

- **[@bibhu8](https://github.com/bibhu8)** - Lead Developer & Project Maintainer

## 🙏 Acknowledgments

- Thanks to all contributors who have helped improve this project
- Google OAuth for secure authentication
- Cloudinary for reliable image hosting
- MongoDB for robust data storage
- The open-source community for inspiration and support

---

**Happy Bartering! 🔄✨**

*Built with ❤️ for sustainable consumption and community building*

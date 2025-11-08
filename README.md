# LegalBuddy - AI-Powered Legal Assistant

A comprehensive legal assistant application built with React, Node.js, and Google Gemini AI. Features include legal document generation, chat assistance, text simplification, translation, and chat history.

## 📁 Project Structure

```
legalbuddy/
├── backend/                    # Node.js Backend Server
│   ├── index.js               # Main server entry point
│   ├── package.json           # Backend dependencies
│   ├── .env                   # Backend environment variables (create this)
│   ├── routes/                # API Routes
│   │   ├── chat.js           # Chat endpoint
│   │   ├── transform.js      # Text transformation (simplify/translate)
│   │   └── generateDoc.js   # Document generation
│   ├── utils/                 # Utility functions
│   │   ├── geminiHelper.js   # Gemini AI helper
│   │   └── pdfLoader.js     # PDF processing
│   ├── rag_service/          # Python RAG Service (Optional)
│   │   ├── app.py           # Flask RAG service
│   │   ├── rag_core.py      # RAG core logic
│   │   ├── ipc_sections.json # Legal sections data
│   │   └── requirements.txt # Python dependencies
│   └── uploads/              # File uploads directory
│
├── src/                       # React Frontend
│   ├── main.jsx              # React entry point
│   ├── App.jsx               # Main app component
│   ├── firebase.js           # Firebase configuration
│   ├── chatService.js        # Chat service functions
│   ├── Components/           # Reusable components
│   │   ├── Layout.jsx
│   │   └── Footer.jsx
│   └── pages/                # Page components
│       ├── Chat.jsx          # Chat interface
│       ├── Login.jsx         # Login page
│       ├── Signup.jsx        # Signup page
│       ├── History.jsx       # Chat history
│       ├── DocGenerator.jsx # Document generator
│       └── MyDocuments.jsx  # User documents
│
├── public/                    # Static assets
├── firebase.json              # Firebase configuration
├── firestore.rules           # Firestore security rules
├── package.json              # Frontend dependencies
└── vite.config.js            # Vite configuration
```

## 🚀 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Python** (v3.8 or higher) - [Download](https://www.python.org/) - *Only if using RAG service*
- **Firebase Account** - [Sign up](https://firebase.google.com/)
- **Google Gemini API Key** - [Get API Key](https://makersuite.google.com/app/apikey)

## 📦 Installation

### Step 1: Clone the Repository

```bash
git clone <your-repo-url>
cd legalbuddy
```

### Step 2: Install Frontend Dependencies

```bash
npm install
```

### Step 3: Install Backend Dependencies

```bash
cd backend
npm install
cd ..
```

### Step 4: Install Python Dependencies (Optional - for RAG service)

```bash
cd backend/rag_service
pip install -r requirements.txt
cd ../..
```

## ⚙️ Configuration

### Step 1: Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing project: `legalbuddy-1215d`
3. Enable **Authentication**:
   - Go to Authentication → Sign-in method
   - Enable Email/Password, Google, and GitHub providers
4. Enable **Firestore Database**:
   - Go to Firestore Database → Create database
   - Start in production mode
5. Get your Firebase config:
   - Go to Project Settings → General
   - Scroll to "Your apps" → Web app
   - Copy the config object

6. Update `src/firebase.js` with your Firebase config:
```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id"
};
```

7. Deploy Firestore Security Rules:
   - Go to Firestore Database → Rules tab
   - Copy the contents of `firestore.rules` file
   - Paste and click **Publish**

### Step 2: Backend Environment Variables

Create `backend/.env` file:

```bash
cd backend
```

Create a `.env` file with:

```env
GEMINI_API_KEY=your-gemini-api-key-here
PORT=5000
```

**To get your Gemini API Key:**
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the key and paste it in `backend/.env`

### Step 3: Frontend Configuration

The frontend is already configured to connect to:
- Backend: `http://localhost:5000`
- RAG Service: `http://localhost:5001` (optional)

## 🏃 Running the Application

### Option 1: Run All Services Manually

#### Terminal 1: Start Backend Server

```bash
cd backend
npm start
```

You should see:
```
Server running on port 5000
GEMINI_API_KEY configured: true
```

#### Terminal 2: Start RAG Service (Optional)

```bash
cd backend/rag_service
python app.py
```

You should see:
```
RAG Core initialized successfully.
Running on port 5001
```

#### Terminal 3: Start Frontend

```bash
npm run dev
```

You should see:
```
VITE v6.x.x ready in xxx ms
➜  Local:   http://localhost:5173/
```

### Option 2: Using npm scripts (Recommended)

Create a script to run all services. Add to root `package.json`:

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "lint": "eslint .",
  "preview": "vite preview",
  "backend": "cd backend && npm start",
  "rag": "cd backend/rag_service && python app.py"
}
```

Then run:
- Frontend: `npm run dev`
- Backend: `npm run backend` (in a separate terminal)
- RAG: `npm run rag` (in a separate terminal, optional)

## 🌐 Access the Application

1. Open your browser and go to: `http://localhost:5173`
2. Sign up or log in with your Firebase account
3. Start using LegalBuddy!

## 🔑 API Endpoints

### Backend (Port 5000)

- `POST /api/chat` - Chat with AI assistant
- `POST /api/transform` - Transform text (simplify/translate)
- `POST /api/generate-doc` - Generate legal documents
- `GET /api/health` - Health check
- `GET /api/test-models` - Test available Gemini models

### RAG Service (Port 5001) - Optional

- `POST /search` - Search legal sections

## 🛠️ Features

- ✅ **AI Chat Assistant** - Get legal advice using Gemini AI
- ✅ **Text Simplification** - Simplify complex legal text
- ✅ **Translation** - Translate legal text to multiple languages
- ✅ **Document Generation** - Generate legal affidavits
- ✅ **Chat History** - View and manage chat history
- ✅ **User Authentication** - Firebase Auth with Email, Google, GitHub
- ✅ **RAG Integration** - Enhanced context with legal sections (optional)

## 🐛 Troubleshooting

### Backend Issues

**Problem:** `500 Internal Server Error`
- **Solution:** Check `backend/.env` file exists and has `GEMINI_API_KEY`
- Check backend console for detailed error messages

**Problem:** `Model not available` errors
- **Solution:** Your API key might not have access to certain models
- The app automatically tries: `gemini-2.0-flash`, `gemini-2.0-flash-lite`, `gemini-1.5-pro`, `gemini-1.5-flash`, `gemini-pro`
- Check which models your API key has access to at [Google AI Studio](https://makersuite.google.com/app/apikey)

**Problem:** `GEMINI_API_KEY is not configured`
- **Solution:** Create `backend/.env` file with your API key

### Frontend Issues

**Problem:** `FirebaseError: Missing or insufficient permissions`
- **Solution:** Deploy Firestore security rules:
  1. Go to Firebase Console → Firestore Database → Rules
  2. Copy contents of `firestore.rules`
  3. Paste and click **Publish**

**Problem:** `Failed to load resource: 500 (Internal Server Error)`
- **Solution:** Make sure backend server is running on port 5000

### RAG Service Issues

**Problem:** RAG service not working
- **Solution:** RAG service is optional. The app works without it, just without enhanced context.

## 📝 Environment Variables

### Backend (`backend/.env`)

```env
GEMINI_API_KEY=your-gemini-api-key-here
PORT=5000
```

### Frontend

No environment variables needed. Firebase config is in `src/firebase.js`.

## 🔒 Security Notes

- **Never commit** `.env` files to git
- Keep your API keys secure
- Firestore security rules are configured to protect user data
- Each user can only access their own chats and documents

## 📚 Tech Stack

- **Frontend:** React, Vite, React Router, Firebase
- **Backend:** Node.js, Express, Google Gemini AI
- **Database:** Firebase Firestore
- **Authentication:** Firebase Auth
- **RAG Service:** Python, Flask, FAISS (optional)

## 🚀 Deployment

### Frontend (Vercel/Netlify)

```bash
npm run build
# Deploy the 'dist' folder
```

### Backend (Railway/Render/Heroku)

1. Set environment variables in your hosting platform
2. Deploy the `backend` folder
3. Make sure `PORT` environment variable is set

### Firebase

- Firestore rules are in `firestore.rules`
- Deploy using Firebase CLI: `firebase deploy --only firestore:rules`

## 📄 License

ISC

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues or questions, please open an issue on GitHub.

---

**Made with ❤️ using React, Node.js, and Google Gemini AI**

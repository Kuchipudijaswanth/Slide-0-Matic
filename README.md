# Slide-0-Matic: AI PowerPoint Generator

Slide-0-Matic is a full-stack web application that generates professional PowerPoint presentations using AI. It features a React frontend and a Node.js/Express backend powered by Google Gemini AI (with high-quality fallback).

## Features

- Generate presentations on any topic (3–20 slides)
- Real Gemini AI integration for unique, topic-specific content
- Multiple professional themes (blue, creative, dark, academic, elegant)
- Download presentations as `.pptx` files
- Regenerate presentations with custom edits
- High-quality fallback system if AI is unavailable
- Secure: `.env` files and sensitive data are ignored via `.gitignore`

## Tech Stack

- **Frontend:** React
- **Backend:** Node.js, Express, Gemini AI, pptxgenjs
- **Other:** Axios, CORS, dotenv, wikijs

## Getting Started

### Prerequisites

- Node.js (v16+ recommended)
- npm

### Backend Setup

1. Navigate to the `backend` folder:
	```powershell
	cd backend
	```
2. Install dependencies:
	```powershell
	npm install
	```
3. Create a `.env` file and add your Gemini API key:
	```
	GEMINI_API_KEY=your_google_gemini_api_key
	```
4. Start the backend server:
	```powershell
	npm run dev
	```
	The server runs on `http://localhost:5000`.

### Frontend Setup

1. Navigate to the `frontend` folder:
	```powershell
	cd frontend
	```
2. Install dependencies:
	```powershell
	npm install
	```
3. Start the frontend:
	```powershell
	npm start
	```
	The app runs on `http://localhost:3000`.

### Usage

1. Open the frontend in your browser.
2. Enter a topic, select the number of slides, and choose a theme.
3. Click "Generate Presentation" to create and download your `.pptx` file.

## API Endpoints

- `GET /api/themes` — List available themes
- `POST /api/generate-presentation` — Generate a new presentation
- `POST /api/regenerate-with-edits` — Regenerate with custom edits

## Project Structure

```
ppt-maker/
  backend/
	 server.js
	 package.json
	 .gitignore
	 assets/
	 downloads/
  frontend/
	 src/
	 package.json
	 .gitignore
	 public/
  README.md
```

## Security

- `.env` files and sensitive assets are excluded from git via `.gitignore`.

## License

MIT

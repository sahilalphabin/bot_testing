#!/bin/bash

# Start Backend Server Script
echo "Starting Chatbot Evaluation Backend..."

# Navigate to backend directory
# cd backend

# Check if virtual environment exists
if [ ! -d ".venv" ]; then
    echo "Creating virtual environment..."
    python -m venv .venv
fi

# Activate virtual environment
source .venv/bin/activate

# Install dependencies
echo "Installing Python dependencies..."
pip install -r requirements-light.txt

# Download required NLTK data (if not already downloaded)
echo "Setting up NLTK data..."
python -c "
import nltk
nltk.download('punkt', quiet=True)
nltk.download('stopwords', quiet=True)
print('NLTK data setup complete')
"

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    echo "Please edit .env file and add your GEMINI_API_KEY"
fi

# Start the server
echo "Starting FastAPI server on http://localhost:8080"
echo "API documentation available at http://localhost:8080/docs"
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8080
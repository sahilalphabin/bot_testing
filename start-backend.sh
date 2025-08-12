#!/bin/bash

# Start the backend server from repo root
cd backend || exit 1

if [ -d ".venv" ]; then
    echo "Virtual environment already exists"
else
    echo "Creating virtual environment..."
    python3 -m venv .venv
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

python3 -m uvicorn main:app --host 0.0.0.0 --port 8080


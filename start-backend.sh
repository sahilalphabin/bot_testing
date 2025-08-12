#!/bin/bash

# Start the backend server from repo root
cd backend || exit 1

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

python -m uvicorn main:app --host 0.0.0.0 --port 8080


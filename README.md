# Chatbot Evaluation System

A comprehensive web application for evaluating chatbot responses using ML/NLP techniques and AI-powered analysis. This system allows users to compare chatbot answers against ground truth responses and provides detailed scoring and analysis.

## Features

- **Dual Evaluation System**: ML/NLP and Gemini AI evaluators
- **Interactive Dashboard**: Real-time statistics and visualizations
- **Question Management**: 20+ predefined questions with dynamic generation
- **Local Storage**: Client-side data persistence
- **Modern UI**: Built with Next.js, Tailwind CSS, and Shadcn UI
- **Comprehensive Analysis**: Semantic similarity, BLEU scores, accuracy metrics

## Architecture

- **Frontend**: Next.js 15 with TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: FastAPI with Python 3.8+
- **ML/NLP**: Sentence Transformers, NLTK, scikit-learn
- **AI Evaluation**: Google Gemini API integration
- **Data Storage**: LocalStorage (no database required for rapid prototyping)

## Quick Start

### Prerequisites

- Node.js 18+
- Python 3.8+
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd bot_testing
   ```

2. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   ```

3. **Setup Backend**
   ```bash
   cd ../backend
   pip install -r requirements.txt
   ```

4. **Configure Environment Variables**
   ```bash
   cp .env.example .env
   # Add your Gemini API key to .env file
   GEMINI_API_KEY=your_api_key_here
   ```

### Running the Application

1. **Start the Backend**
   ```bash
   cd backend
   python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

2. **Start the Frontend** (in a new terminal)
   ```bash
   cd frontend
   npm run dev
   ```

3. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

## Usage

### Dashboard
- View evaluation statistics and metrics
- Interactive charts showing score distributions
- Performance comparison between ML and Gemini evaluators
- Recent evaluations overview

### Evaluation Form
1. Select a predefined question or enter a custom one
2. Generate additional questions using the "+" buttons
3. Enter the chatbot's answer
4. Provide the ground truth answer
5. Choose evaluation method (ML/NLP, Gemini, or both)
6. Submit for analysis

### Results Analysis
- Overall scores from each evaluator
- Detailed breakdown: similarity, completeness, accuracy, relevance
- Natural language explanations from both evaluators
- Processing time metrics

## ML/NLP Evaluation Techniques

The system uses multiple techniques for comprehensive evaluation:

- **Semantic Similarity**: Sentence transformers with cosine similarity
- **BLEU Score**: N-gram overlap analysis
- **Lexical Similarity**: Word overlap calculations
- **Named Entity Recognition**: Entity extraction and comparison
- **Readability Metrics**: Flesch-Kincaid scoring
- **Relevance Analysis**: Question-answer alignment

## API Endpoints

### Questions
- `GET /api/questions` - Get predefined questions
- `POST /api/questions/generate` - Generate dynamic questions

### Evaluation
- `POST /api/evaluate` - Full evaluation (both evaluators)
- `POST /api/evaluate/ml` - ML/NLP evaluation only
- `POST /api/evaluate/gemini` - Gemini evaluation only

### Health
- `GET /api/health` - System health check

## Development

### Project Structure

```
├── frontend/                 # Next.js application
│   ├── src/
│   │   ├── app/             # Pages and routing
│   │   ├── components/      # React components
│   │   ├── context/         # React context providers
│   │   ├── lib/             # Utilities and helpers
│   │   └── types/           # TypeScript type definitions
├── backend/                 # FastAPI application
│   ├── routers/             # API route handlers
│   ├── services/            # Business logic
│   ├── models/              # Data models and schemas
│   └── utils/               # Utility functions
```

### Key Components

- **DataProvider**: React context for state management
- **LocalStorageManager**: Client-side data persistence
- **MLEvaluator**: ML/NLP evaluation pipeline
- **GeminiEvaluator**: AI-powered evaluation
- **Charts**: Interactive data visualizations

## Gemini API Setup

1. Get an API key from [Google AI Studio](https://aistudio.google.com/)
2. Add it to your `.env` file:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```
3. The system will fall back to mock responses if no API key is provided

## Customization

### Adding New Question Categories
1. Update the `question_templates` in `backend/services/question_generator.py`
2. Add new category options to the frontend form

### Modifying Evaluation Criteria
1. Adjust weights in `backend/services/ml_evaluator.py`
2. Customize prompts in `backend/services/gemini_evaluator.py`

### Extending ML Models
1. Add new models to `MLEvaluator.__init__()`
2. Implement new evaluation methods
3. Update the scoring algorithm

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure backend CORS configuration includes your frontend URL
2. **Missing Dependencies**: Run `pip install -r requirements.txt` and `npm install`
3. **Port Conflicts**: Change ports in the startup commands
4. **Gemini API Errors**: Check your API key and quota

### Performance Optimization

1. **Large Datasets**: Implement pagination in LocalStorageManager
2. **Slow Evaluations**: Consider caching or background processing
3. **Memory Issues**: Limit stored evaluations count

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
- Check the troubleshooting section
- Review API documentation at `/docs`
- Open an issue on GitHub
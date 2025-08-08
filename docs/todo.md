# Simple Todo List for Chatbot Evaluation System

## Phase 1: UI Implementation (Next.js + Shadcn UI)

### 1.1 Project Setup
- [ ] Initialize Next.js project with TypeScript
- [ ] Install and configure Shadcn UI components
- [ ] Set up Tailwind CSS configuration
- [ ] Create basic project structure with folders

### 1.2 Dashboard UI Components
- [ ] Create dashboard layout with navigation
- [ ] Build summary statistics cards component
- [ ] Implement placeholder charts (using Recharts)
- [ ] Add filter controls for date range and categories
- [ ] Create evaluation results table component
- [ ] Build responsive grid layout for dashboard

### 1.3 Form Site UI Components
- [ ] Create evaluation form layout
- [ ] Build question selector dropdown with 20 predefined questions
- [ ] Implement "plus" button for dynamic question generation
- [ ] Create three input fields: question, chatbot answer, manual answer
- [ ] Add form validation with real-time feedback
- [ ] Build submission button with loading states
- [ ] Create results display component

### 1.4 Shared UI Components
- [ ] Navigation header with routing between dashboard and form
- [ ] Loading spinner and skeleton components
- [ ] Error message display components
- [ ] Success notification components
- [ ] Modal components for detailed views

### 1.5 Routing and Pages
- [ ] Set up Next.js app router structure
- [ ] Create dashboard page (`/`)
- [ ] Create evaluation form page (`/evaluate`)
- [ ] Create individual result page (`/results/[id]`)
- [ ] Add 404 and error pages

## Phase 2: API Implementation (FastAPI)

### 2.1 FastAPI Project Setup
- [ ] Initialize FastAPI project structure
- [ ] Set up Pydantic models for request/response schemas
- [ ] Configure CORS for Next.js frontend integration
- [ ] Create basic error handling middleware
- [ ] Set up environment configuration

### 2.2 Data Models and Storage
- [ ] Create evaluation data model (Question, Answer, Results)
- [ ] Implement in-memory storage using Python dictionaries
- [ ] Create JSON file persistence for data backup
- [ ] Build data access layer with CRUD operations

### 2.3 Question Management Endpoints
- [ ] `GET /api/questions` - Return list of 20 predefined questions
- [ ] `POST /api/questions/generate` - Generate dynamic questions (mock implementation)
- [ ] Create question categories and tagging system
- [ ] Add question difficulty levels

### 2.4 Evaluation Management Endpoints
- [ ] `POST /api/evaluate` - Submit evaluation request (without ML processing)
- [ ] `GET /api/evaluations` - Retrieve all evaluations with pagination
- [ ] `GET /api/evaluations/{id}` - Get specific evaluation details
- [ ] `PUT /api/evaluations/{id}` - Update evaluation (if needed)
- [ ] `DELETE /api/evaluations/{id}` - Delete evaluation

### 2.5 Dashboard Data Endpoints
- [ ] `GET /api/dashboard/stats` - Summary statistics (count, averages, etc.)
- [ ] `GET /api/dashboard/charts` - Mock chart data for visualizations
- [ ] `GET /api/dashboard/recent` - Recent evaluations for dashboard
- [ ] Add filtering and search query parameters

### 2.6 Basic Evaluation Logic (Pre-ML/NLP)
- [ ] Implement simple text similarity using basic string matching
- [ ] Add character/word count comparisons
- [ ] Create basic scoring framework (0-100 scale)
- [ ] Generate mock evaluation results with random scores
- [ ] Add timestamp and metadata tracking

### 2.7 API Documentation and Testing
- [ ] Set up automatic OpenAPI documentation
- [ ] Create API testing endpoints for development
- [ ] Add request validation and error responses
- [ ] Implement basic logging for API requests

## Implementation Priority Order

### Week 1: Core UI Framework
1. Next.js project setup with Shadcn UI
2. Basic dashboard layout and navigation
3. Evaluation form with input fields
4. Routing between pages

### Week 2: API Foundation
1. FastAPI project setup
2. Basic data models and storage
3. Question management endpoints
4. Simple evaluation endpoints

### Week 3: Integration and Polish
1. Connect frontend to backend APIs
2. Add loading states and error handling
3. Implement basic evaluation scoring
4. Dashboard data visualization

### Week 4: Testing and Refinement
1. Test all user workflows
2. Add form validation and feedback
3. Polish UI components and styling
4. Prepare for ML/NLP integration phase

This todo list focuses on creating a working prototype with all the essential functionality before adding the complex ML/NLP evaluation features. The system will be fully functional for basic operations, making it easier to integrate advanced evaluation techniques later.
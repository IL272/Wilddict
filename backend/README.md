# WildDict Backend API

FastAPI backend for WildDict - AI-powered visual dictionary.

## Quick Start

### Local Development

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Seed database with sample data:
```bash
python seed_data.py
```

3. Run development server:
```bash
python main.py
```

API will be available at: http://localhost:8000
API docs (Swagger): http://localhost:8000/docs

### Docker

Build and run:
```bash
docker build -t wilddict-backend .
docker run -p 8000:8000 wilddict-backend
```

## API Endpoints

- `GET /api/words` - Get all words
- `GET /api/words/{id}` - Get specific word
- `POST /api/words` - Create new word
- `PUT /api/words/{id}` - Update word
- `DELETE /api/words/{id}` - Delete word
- `GET /api/stats` - Get statistics

## Environment Variables

See `.env.example` for configuration options.

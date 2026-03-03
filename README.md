# OverseasJob.in - AI Powered Overseas Career Platform

A comprehensive SaaS platform that combines Resume Builder + Job Portal + AI Optimization + Overseas Niche focus. Built with modern technologies and containerized with Docker.

## Features

### Core Features
- **User Authentication** - JWT-based authentication with role-based access (Job Seeker, Recruiter, Admin)
- **Resume Builder** - 7-step resume creation with drag & drop reorder
- **Template System** - 9+ professional templates (Free, Pro, Premium tiers)
- **PDF Export** - Server-side PDF generation with Puppeteer
- **Job Portal** - Full job posting and application system
- **Subscription System** - Free/Pro/Premium plans with Razorpay/Stripe integration

### AI Features
- **Resume Parser** - Extract structured data from PDF/DOCX files
- **ATS Scoring** - Calculate ATS compatibility with improvement suggestions
- **JD Extractor** - Extract skills, tools, experience from job descriptions
- **Semantic Matching** - Multi-layer matching using sentence-transformers embeddings
- **Skill Gap Detection** - Identify missing skills with semantic similarity
- **Auto Optimization** - Premium feature for AI-powered resume enhancement
- **Overseas Readiness Score** - Calculate readiness for overseas jobs

## Tech Stack

### Frontend
- Next.js 14 (App Router)
- React 18 + TypeScript
- Tailwind CSS
- Zustand (State Management)
- TanStack Query (Data Fetching)
- React Hook Form

### Backend
- Laravel 11 (PHP 8.2)
- MySQL 8.0
- Redis 7
- JWT Authentication
- AWS S3 (File Storage)

### AI Service
- FastAPI (Python)
- Sentence-Transformers (MiniLM)
- PyTorch
- pdfplumber + python-docx

### Infrastructure
- Docker + Docker Compose
- Nginx (Reverse Proxy)
- Redis (Cache + Sessions)

## Project Structure

```
overseasjob-project/
├── docker-compose.yml          # Main orchestration file
├── README.md                   # This file
├── .env.example               # Environment variables template
│
├── frontend/                  # Next.js Frontend
│   ├── Dockerfile
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── app/                   # Next.js app directory
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/            # React components
│   ├── hooks/                 # Custom hooks
│   ├── lib/                   # Utilities & API
│   └── store/                 # Zustand stores
│
├── backend/                   # Laravel Backend
│   ├── Dockerfile
│   ├── composer.json
│   ├── app/
│   │   ├── Http/
│   │   │   └── Controllers/
│   │   │       └── Api/       # API Controllers
│   │   ├── Models/            # Eloquent Models
│   │   └── Services/          # Business Logic
│   ├── routes/
│   │   └── api.php            # API Routes
│   └── config/
│
├── ai-service/               # Python AI Microservice
│   ├── Dockerfile
│   ├── Dockerfile.train
│   ├── requirements.txt
│   ├── main.py               # FastAPI app
│   ├── parsers.py            # Resume parser & JD extractor
│   ├── scoring.py            # ATS & Match scoring
│   ├── optimizer.py          # Resume optimizer
│   └── train.py              # Model training script
│
├── nginx/                    # Nginx Configuration
│   ├── Dockerfile
│   └── nginx.conf
│
├── mysql/                    # Database
│   └── init/
│       └── 01-schema.sql     # Initial schema
│
└── redis/                    # Redis Config
    └── redis.conf
```

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Git

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd overseasjob-project
```

2. Create environment files:
```bash
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

3. Update environment variables in `.env` files with your credentials.

4. Build and start the services:
```bash
docker-compose up -d --build
```

5. Run database migrations:
```bash
docker-compose exec backend php artisan migrate
```

6. Seed the database (optional):
```bash
docker-compose exec backend php artisan db:seed
```

7. Access the application:
- Frontend: http://localhost
- Backend API: http://localhost/api
- AI Service: http://localhost/ai

### Services

| Service | Port | Description |
|---------|------|-------------|
| Nginx | 80 | Reverse proxy & API gateway |
| Frontend | 3000 | Next.js application |
| Backend | 8000 | Laravel API |
| AI Service | 5000 | Python FastAPI |
| MySQL | 3306 | Database |
| Redis | 6379 | Cache & sessions |

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Resumes
- `GET /api/resumes` - List user resumes
- `POST /api/resumes` - Create resume
- `GET /api/resumes/:id` - Get resume details
- `PUT /api/resumes/:id` - Update resume
- `DELETE /api/resumes/:id` - Delete resume
- `GET /api/resumes/:id/pdf` - Download PDF

### Jobs
- `GET /api/jobs` - List jobs
- `POST /api/jobs` - Create job (recruiter)
- `GET /api/jobs/:slug` - Get job details
- `POST /api/jobs/:id/apply` - Apply for job

### AI Services
- `POST /api/ai/parse-resume` - Parse resume file
- `POST /api/ai/calculate-match` - Calculate match score
- `POST /api/ai/calculate-ats` - Calculate ATS score
- `POST /api/ai/optimize-resume` - Optimize resume

## AI Model Training

To train the custom resume-job matching model:

```bash
# Run training container
docker-compose --profile training run ai-training

# Or manually
cd ai-service
python train.py
```

## Database Schema

### Core Tables
- `users` - User accounts
- `recruiters` - Recruiter profiles
- `resumes` - Resume data
- `jobs` - Job postings
- `applications` - Job applications
- `templates` - Resume templates
- `subscriptions` - User subscriptions
- `payments` - Payment records

### AI Tables
- `resume_embeddings` - Vector embeddings for resumes
- `job_embeddings` - Vector embeddings for jobs
- `semantic_match_logs` - Match calculation logs
- `ai_logs` - AI service request logs

## Deployment

### Production Checklist
- [ ] Update all environment variables
- [ ] Configure SSL certificates
- [ ] Set up AWS S3 for file storage
- [ ] Configure payment gateway webhooks
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy

### Scaling
```bash
# Scale backend horizontally
docker-compose up -d --scale backend=3

# Or use Docker Swarm/Kubernetes for production
```

## Monitoring

### Health Checks
- Nginx: `GET /health`
- Backend: `GET /api/health`
- AI Service: `GET /ai/health`

### Logs
```bash
# View all logs
docker-compose logs -f

# View specific service
docker-compose logs -f backend
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, email support@overseasjob.in or join our Slack channel.

---

Built with ❤️ for overseas job seekers worldwide.

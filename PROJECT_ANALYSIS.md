# OverseasJob.in - Complete Project Analysis

## Executive Summary
**OverseasJob.in** is an AI-Powered Overseas Career Platform that combines Resume Builder + Job Portal + AI Optimization + Overseas Niche focus. This is a SaaS-ready, scalable platform with semantic AI matching capabilities.

---

## 1. PRODUCT POSITIONING

### Brand Concept
- **Name**: OverseasJob.in
- **Tagline**: "Create Smart Resume. Get Overseas Job Faster."
- **Value Proposition**: Resume + Job Match + AI Optimization — All in One

### User Types
1. **Job Seeker** - Primary users creating resumes and applying for jobs
2. **Recruiter** - Posting jobs and reviewing applications
3. **Admin** - Platform management
4. **College Partner** (Phase 2) - Bulk resume processing

---

## 2. CORE FEATURES & FUNCTIONS

### A) Resume Builder Engine

#### Resume Creation Flow (7 Steps)
1. **Basic Info** - Name, contact, location, passport status
2. **Work Experience** - Company, role, duration, bullet points
3. **Education** - Degree, institution, year
4. **Skills** - Technical and soft skills
5. **Projects** - Project details with tech stack
6. **Certifications** - Professional certifications
7. **Summary** - Professional summary/objective

#### Key Features
- Drag & Drop reorder for all sections
- Add custom sections
- Auto-save functionality
- Multiple resume versions
- PDF Export (Puppeteer)

#### Template Architecture
| Tier | Templates |
|------|-----------|
| **Free** | Basic ATS, Clean Modern |
| **Pro (₹299)** | Corporate, Tech, Creative, Minimal |
| **Premium (₹699)** | Executive, Two Column Advanced, Portfolio Hybrid |

---

### B) AI Optimization Engine

#### 1. ATS Score System
**Scoring Components:**
- Keyword density (35%)
- Action verbs usage (20%)
- Quantified results/metrics (20%)
- Section completeness (15%)
- Formatting simplicity (10%)

**Score Interpretation:**
- 90%+ = Highly likely shortlist
- 70-89% = Competitive
- 50-69% = Needs improvement
- <50% = Low fit

#### 2. Job Description Match Engine
**Match Score Breakdown:**
- Skill Match: 40%
- Experience Alignment: 25%
- Keyword Alignment: 20%
- Seniority Match: 15%

**JD Extraction:**
- Skills extraction
- Tools/technologies identification
- Experience years detection
- Location extraction
- Visa type detection

#### 3. Semantic AI Matching (Advanced)
**Multi-Layer Matching:**
1. **Skill Semantic Match** (35%)
   - Uses sentence-transformers (MiniLM/MPNet)
   - Cosine similarity matrix
   - Semantic understanding beyond keywords

2. **Responsibility Match** (35%)
   - Bullet-level comparison
   - Top-K matching strategy

3. **Experience Level Match** (15%)
   - Years comparison with penalty formula

4. **Industry Context Match** (15%)
   - Industry cluster comparison

**Final Formula:**
```
Final Score = (Skill × 0.35) + (Responsibility × 0.35) + (Experience × 0.15) + (Industry × 0.15)
```

#### 4. Auto Optimization Mode (Premium)
**Features:**
- Resume copy creation
- Missing keyword insertion
- Bullet point enhancement
- ATS alignment improvement
- Summary rewriting

#### 5. Skill Gap Detection
- Identifies missing skills from JD
- Suggests similar skill rewrites
- Recommends bullet additions

#### 6. Overseas Readiness Score
**Components (20 points each):**
- Passport status
- English test score (IELTS/TOEFL)
- Experience (3+ years)
- Resume score (70+)
- Skills in demand

---

### C) Job Portal System

#### Job Post Structure
- Title
- Country
- Salary range
- Visa type
- Required skills (JSON)
- Experience level
- Company details
- Job description
- Recruiter ID

#### Job Seeker Dashboard
- My Resume(s)
- Resume Score display
- Applied Jobs tracking
- Match % for each job
- Missing Skills list
- Recommended Jobs

#### Recruiter Dashboard
- Post new jobs
- View applications
- AI shortlist feature
- Resume search access
- Featured listing options

#### Smart Match Logic
- Auto-match on resume update
- Auto-match on new job post
- Real-time matching notifications

---

### D) Subscription & Payment System

#### Job Seeker Plans
| Plan | Price | Features |
|------|-------|----------|
| **Free** | ₹0 | 2 templates, limited applies, basic score |
| **Pro** | ₹299 | All templates, ATS score, JD Match, unlimited applies |
| **Premium** | ₹699 | Auto optimize, resume rewrite, cover letter, LinkedIn optimization |

#### Recruiter Plans
| Plan | Features |
|------|----------|
| **Basic** | 1 free job post |
| **Standard** | 10 job posts |
| **Premium** | AI shortlist, featured listing, resume search |

#### Payment Flow
1. User selects plan
2. Create order (Backend)
3. Redirect to Razorpay/Stripe
4. Payment success webhook
5. Update subscription table

---

## 3. TECHNOLOGY STACK

### Frontend Layer
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: React Context + Zustand
- **HTTP Client**: Axios
- **PDF Generation**: Puppeteer (server-side)

### API Gateway
- **Technology**: Nginx
- **Responsibilities**:
  - Route traffic
  - Rate limiting
  - JWT validation
  - SSL termination
  - Load balancing

### Core Backend (PHP)
- **Framework**: Laravel 11
- **Architecture**: Controller → Service → Repository → Model
- **Authentication**: JWT (tymon/jwt-auth)
- **File Storage**: AWS S3 / Local
- **Queue**: Redis for job queues

**Modules:**
- User Authentication
- Resume CRUD
- Job CRUD
- Applications Management
- Subscription Management
- Role-based Access Control
- Admin Panel

### Python AI Microservice
- **Framework**: FastAPI
- **ML Libraries**:
  - sentence-transformers (embeddings)
  - PyTorch (fine-tuning)
  - scikit-learn (metrics)
  - FAISS (vector indexing)
- **Model**: all-MiniLM-L6-v2 (start), all-mpnet-base-v2 (scale)

**Endpoints:**
- `POST /parse_resume` - Extract structured data from PDF/DOCX
- `POST /extract_jd` - Extract skills, tools, experience from JD
- `POST /calculate_match` - Calculate resume-JD match score
- `POST /calculate_ats` - Calculate ATS compatibility score
- `POST /optimize_resume` - Auto-optimize resume for job
- `POST /semantic_match` - Semantic similarity matching
- `POST /overseas_score` - Calculate overseas readiness

### Database
- **Primary**: MySQL 8.0
- **Cache**: Redis 7
- **Vector Store**: FAISS (for embeddings)

### File Storage
- **Resume PDFs**: `/resumes/{user_id}/{resume_id}.pdf`
- **Provider**: AWS S3 or DigitalOcean Spaces

---

## 4. DATABASE SCHEMA

### Core Tables

#### users
```sql
id (PK)
name
email (unique)
password_hash
role (enum: job_seeker, recruiter, admin)
subscription_id (FK)
email_verified_at
created_at
updated_at
```

#### recruiters
```sql
id (PK)
user_id (FK)
company_name
company_logo
website
location
plan_type
job_posts_limit
verified
```

#### resumes
```sql
id (PK)
user_id (FK)
template_id (FK)
title
sections_json (JSON)
ats_score
version_number
is_default
created_at
updated_at
```

#### resume_versions
```sql
id (PK)
resume_id (FK)
version_number
sections_json
ats_score
created_at
```

#### jobs
```sql
id (PK)
recruiter_id (FK)
title
country
salary_min
salary_max
visa_type
experience_required
skills_json (JSON)
description
status (active/closed)
featured
view_count
application_count
created_at
updated_at
```

#### applications
```sql
id (PK)
user_id (FK)
job_id (FK)
resume_id (FK)
match_score
status (pending/shortlisted/rejected)
applied_at
```

#### subscriptions
```sql
id (PK)
user_id (FK)
plan_type (free/pro/premium)
start_date
end_date
status
payment_id
```

#### payments
```sql
id (PK)
user_id (FK)
amount
currency
payment_method
transaction_id
status
created_at
```

#### templates
```sql
id (PK)
name
category (free/pro/premium)
html_structure
css_styles
preview_image
is_active
```

#### ai_logs
```sql
id (PK)
user_id (FK)
request_type
input_data
output_data
processing_time
created_at
```

#### resume_embeddings
```sql
id (PK)
resume_id (FK)
embedding_vector (BLOB/JSON)
created_at
```

#### job_embeddings
```sql
id (PK)
job_id (FK)
embedding_vector (BLOB/JSON)
created_at
```

#### semantic_match_logs
```sql
id (PK)
resume_id (FK)
job_id (FK)
match_score
components_json
created_at
```

---

## 5. API ENDPOINTS

### Authentication
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh
GET    /api/auth/me
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
```

### User Management
```
GET    /api/users/profile
PUT    /api/users/profile
PUT    /api/users/password
GET    /api/users/dashboard
```

### Resume Builder
```
GET    /api/resumes
POST   /api/resumes
GET    /api/resumes/:id
PUT    /api/resumes/:id
DELETE /api/resumes/:id
POST   /api/resumes/:id/duplicate
GET    /api/resumes/:id/pdf
POST   /api/resumes/:id/optimize
GET    /api/resumes/:id/ats-score
```

### Templates
```
GET    /api/templates
GET    /api/templates/:id
GET    /api/templates/:id/preview
```

### Job Portal
```
GET    /api/jobs
POST   /api/jobs (recruiter)
GET    /api/jobs/:id
PUT    /api/jobs/:id (recruiter)
DELETE /api/jobs/:id (recruiter)
POST   /api/jobs/:id/apply
GET    /api/jobs/recommended
GET    /api/jobs/search
```

### Applications
```
GET    /api/applications (user)
GET    /api/applications/job/:jobId (recruiter)
PUT    /api/applications/:id/status (recruiter)
GET    /api/applications/stats
```

### AI Services
```
POST   /api/ai/parse-resume
POST   /api/ai/extract-jd
POST   /api/ai/calculate-match
POST   /api/ai/calculate-ats
POST   /api/ai/optimize-resume
POST   /api/ai/skill-gap
```

### Subscriptions & Payments
```
GET    /api/plans
POST   /api/subscriptions
GET    /api/subscriptions/current
POST   /api/payments/create-order
POST   /api/payments/verify
POST   /api/payments/webhook
```

### Admin
```
GET    /api/admin/users
GET    /api/admin/jobs
GET    /api/admin/applications
GET    /api/admin/payments
GET    /api/admin/stats
PUT    /api/admin/users/:id/status
```

---

## 6. AI FUNCTIONS DETAIL

### Resume Parser Engine
**Input**: PDF/DOCX file
**Output**: Structured JSON

**Process:**
1. Extract text using pdfplumber/python-docx
2. Preprocess text (lowercase, remove special chars)
3. Detect sections using keyword matching
4. Extract each section with regex patterns
5. Return structured JSON

### ATS Scoring Engine
**Components:**
- Keyword match score (35%)
- Action verb score (20%)
- Metrics/quantification score (20%)
- Structure score (15%)
- Formatting score (10%)

**Action Verbs Library:**
```
led, managed, developed, implemented, increased, reduced, 
optimized, designed, built, created, launched, improved,
achieved, delivered, coordinated, supervised
```

### JD Extractor
**Extracts:**
- Skills (using skill ontology)
- Tools/technologies
- Experience years (regex: `\d+\+?\s*(years|yrs)`)
- Location
- Education requirements
- Visa sponsorship info

### Match Engine
**Two modes:**
1. **Keyword Match** - Basic intersection
2. **Semantic Match** - Embedding-based similarity

**Skill Gap Detection:**
- Compare JD skills with resume skills
- Use semantic similarity threshold (0.65)
- Return missing skills list

### Auto Optimization
**Enhancements:**
1. Add missing keywords to skills
2. Enhance bullets with quantification
3. Inject relevant keywords into experience
4. Rewrite summary with JD alignment

---

## 7. DOCKER ARCHITECTURE

### Services
```
┌─────────────────────────────────────────────────────────┐
│                    Docker Network                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │   Nginx     │  │   Next.js   │  │  PHP Laravel    │  │
│  │  (Port 80)  │  │  (Port 3000)│  │  (Port 8000)    │  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │Python AI    │  │   MySQL     │  │     Redis       │  │
│  │(Port 5000)  │  │  (Port 3306)│  │  (Port 6379)    │  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Containers
1. **nginx** - Reverse proxy, SSL termination
2. **frontend** - Next.js application
3. **backend** - Laravel PHP API
4. **ai-service** - Python FastAPI microservice
5. **mysql** - Database
6. **redis** - Cache and sessions

---

## 8. SECURITY IMPLEMENTATION

- **Authentication**: JWT with refresh tokens
- **Password Hashing**: bcrypt (cost factor 12)
- **Input Sanitization**: Laravel validation + prepared statements
- **File Validation**: MIME type check, size limit
- **API Rate Limiting**: 100 requests/minute per IP
- **CORS**: Whitelist origins
- **SQL Injection**: Eloquent ORM protection
- **XSS**: Output escaping

---

## 9. SCALABILITY STRATEGY

### Phase 1 (MVP)
- Single VPS (8GB RAM)
- All services on one server
- Docker Compose orchestration

### Phase 2 (Growth)
- Separate AI server
- Redis cluster
- CDN for static assets
- Database read replicas

### Phase 3 (Scale)
- Horizontal scaling with load balancer
- Kubernetes orchestration
- RabbitMQ for async processing
- GPU servers for AI

---

## 10. FEATURE COMPLETENESS CHECKLIST

### Core Features
- [x] User registration/login with JWT
- [x] Resume builder with 7 sections
- [x] Drag & drop reorder
- [x] Auto-save functionality
- [x] Multiple resume versions
- [x] PDF export
- [x] Template system (Free/Pro/Premium)
- [x] Job posting (recruiter)
- [x] Job search and filter
- [x] Job application system
- [x] User dashboard
- [x] Recruiter dashboard

### AI Features
- [x] Resume parser (PDF/DOCX)
- [x] ATS scoring engine
- [x] JD extractor
- [x] Keyword matching
- [x] Semantic matching with embeddings
- [x] Skill gap detection
- [x] Auto optimization
- [x] Overseas readiness score
- [x] Match percentage calculation

### Subscription Features
- [x] Free/Pro/Premium plans
- [x] Razorpay/Stripe integration
- [x] Payment webhook handling
- [x] Subscription management
- [x] Feature gating by plan

### Admin Features
- [x] User management
- [x] Job moderation
- [x] Payment tracking
- [x] Analytics dashboard
- [x] Template management

### Infrastructure
- [x] Docker containerization
- [x] Nginx reverse proxy
- [x] MySQL database
- [x] Redis cache
- [x] File storage (S3/Local)
- [x] API rate limiting
- [x] JWT authentication
- [x] Role-based access control

---

## 11. COMPETITIVE ADVANTAGES

1. **Semantic AI Matching** - Understanding meaning, not just keywords
2. **Overseas Focus** - Specialized for international jobs
3. **Auto Optimization** - Premium feature for resume enhancement
4. **Country-Specific Calibration** - Different weights for different countries
5. **Skill Gap Detection** - Actionable improvement suggestions
6. **Continuous Learning** - Model improves with more data

---

*Analysis completed. Ready for implementation.*

-- OverseasJob.in Database Schema
-- Complete database structure for AI-Powered Overseas Career Platform

-- Create database
CREATE DATABASE IF NOT EXISTS overseasjob CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE overseasjob;

-- ============================================
-- CORE TABLES
-- ============================================

-- Users table
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    email_verified_at TIMESTAMP NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('job_seeker', 'recruiter', 'admin') DEFAULT 'job_seeker',
    avatar VARCHAR(500) NULL,
    phone VARCHAR(20) NULL,
    location VARCHAR(255) NULL,
    country VARCHAR(100) NULL,
    subscription_id BIGINT UNSIGNED NULL,
    subscription_status ENUM('active', 'expired', 'cancelled') DEFAULT NULL,
    plan_type ENUM('free', 'pro', 'premium') DEFAULT 'free',
    plan_expires_at TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_subscription (subscription_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Recruiters table
CREATE TABLE recruiters (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    company_logo VARCHAR(500) NULL,
    company_description TEXT NULL,
    website VARCHAR(255) NULL,
    industry VARCHAR(100) NULL,
    company_size VARCHAR(50) NULL,
    location VARCHAR(255) NULL,
    country VARCHAR(100) NULL,
    verified BOOLEAN DEFAULT FALSE,
    verification_documents JSON NULL,
    plan_type ENUM('basic', 'standard', 'premium') DEFAULT 'basic',
    job_posts_limit INT DEFAULT 1,
    job_posts_used INT DEFAULT 0,
    featured_listings_remaining INT DEFAULT 0,
    can_search_resumes BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_company (company_name),
    INDEX idx_verified (verified)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- RESUME BUILDER TABLES
-- ============================================

-- Templates table
CREATE TABLE templates (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    category ENUM('free', 'pro', 'premium') DEFAULT 'free',
    description TEXT NULL,
    html_structure LONGTEXT NOT NULL,
    css_styles LONGTEXT NOT NULL,
    preview_image VARCHAR(500) NULL,
    thumbnail_image VARCHAR(500) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    features JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Resumes table
CREATE TABLE resumes (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    template_id BIGINT UNSIGNED NOT NULL,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NULL UNIQUE,
    sections_json JSON NOT NULL,
    personal_info JSON NULL,
    summary TEXT NULL,
    experience JSON NULL,
    education JSON NULL,
    skills JSON NULL,
    certifications JSON NULL,
    projects JSON NULL,
    languages JSON NULL,
    ats_score INT NULL,
    ats_feedback JSON NULL,
    version_number INT DEFAULT 1,
    is_default BOOLEAN DEFAULT FALSE,
    is_optimized BOOLEAN DEFAULT FALSE,
    optimized_for_job_id BIGINT UNSIGNED NULL,
    pdf_url VARCHAR(500) NULL,
    view_count INT DEFAULT 0,
    download_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (template_id) REFERENCES templates(id),
    INDEX idx_user (user_id),
    INDEX idx_default (is_default),
    INDEX idx_ats_score (ats_score)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Resume versions table (for tracking changes)
CREATE TABLE resume_versions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    resume_id BIGINT UNSIGNED NOT NULL,
    version_number INT NOT NULL,
    sections_json JSON NOT NULL,
    ats_score INT NULL,
    change_summary TEXT NULL,
    created_by_ai BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE,
    INDEX idx_resume_version (resume_id, version_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Resume embeddings for semantic search
CREATE TABLE resume_embeddings (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    resume_id BIGINT UNSIGNED NOT NULL,
    embedding_vector JSON NOT NULL,
    model_version VARCHAR(50) DEFAULT 'v1',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE,
    INDEX idx_resume (resume_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- JOB PORTAL TABLES
-- ============================================

-- Jobs table
CREATE TABLE jobs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    recruiter_id BIGINT UNSIGNED NOT NULL,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description LONGTEXT NOT NULL,
    requirements LONGTEXT NULL,
    responsibilities LONGTEXT NULL,
    country VARCHAR(100) NOT NULL,
    city VARCHAR(100) NULL,
    job_type ENUM('full_time', 'part_time', 'contract', 'internship') DEFAULT 'full_time',
    work_mode ENUM('on_site', 'remote', 'hybrid') DEFAULT 'on_site',
    salary_min DECIMAL(12,2) NULL,
    salary_max DECIMAL(12,2) NULL,
    salary_currency VARCHAR(3) DEFAULT 'USD',
    salary_period ENUM('hourly', 'monthly', 'yearly') DEFAULT 'yearly',
    visa_type VARCHAR(100) NULL,
    visa_sponsorship BOOLEAN DEFAULT FALSE,
    experience_required INT DEFAULT 0,
    experience_max INT NULL,
    education_required VARCHAR(255) NULL,
    skills_required JSON NULL,
    skills_nice_to_have JSON NULL,
    tools_required JSON NULL,
    languages_required JSON NULL,
    benefits JSON NULL,
    status ENUM('draft', 'active', 'paused', 'closed', 'expired') DEFAULT 'draft',
    featured BOOLEAN DEFAULT FALSE,
    featured_until TIMESTAMP NULL,
    application_count INT DEFAULT 0,
    view_count INT DEFAULT 0,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (recruiter_id) REFERENCES recruiters(id) ON DELETE CASCADE,
    INDEX idx_status (status),
    INDEX idx_country (country),
    INDEX idx_featured (featured),
    INDEX idx_expires (expires_at),
    FULLTEXT idx_search (title, description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Job embeddings for semantic matching
CREATE TABLE job_embeddings (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    job_id BIGINT UNSIGNED NOT NULL,
    embedding_vector JSON NOT NULL,
    model_version VARCHAR(50) DEFAULT 'v1',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    INDEX idx_job (job_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Applications table
CREATE TABLE applications (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    job_id BIGINT UNSIGNED NOT NULL,
    resume_id BIGINT UNSIGNED NOT NULL,
    cover_letter TEXT NULL,
    match_score INT NULL,
    match_components JSON NULL,
    skill_gaps JSON NULL,
    ats_score_at_apply INT NULL,
    status ENUM('pending', 'shortlisted', 'rejected', 'hired', 'withdrawn') DEFAULT 'pending',
    recruiter_notes TEXT NULL,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (resume_id) REFERENCES resumes(id),
    UNIQUE KEY unique_application (user_id, job_id),
    INDEX idx_user (user_id),
    INDEX idx_job (job_id),
    INDEX idx_status (status),
    INDEX idx_match_score (match_score)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Saved jobs (for job seekers)
CREATE TABLE saved_jobs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    job_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    UNIQUE KEY unique_save (user_id, job_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Job alerts
CREATE TABLE job_alerts (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    keywords VARCHAR(255) NULL,
    country VARCHAR(100) NULL,
    job_type VARCHAR(50) NULL,
    experience_level VARCHAR(50) NULL,
    salary_min DECIMAL(12,2) NULL,
    frequency ENUM('daily', 'weekly', 'monthly') DEFAULT 'weekly',
    is_active BOOLEAN DEFAULT TRUE,
    last_sent_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- SUBSCRIPTION & PAYMENT TABLES
-- ============================================

-- Subscription plans
CREATE TABLE plans (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    type ENUM('job_seeker', 'recruiter') NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    duration_days INT NOT NULL,
    features JSON NOT NULL,
    templates_access ENUM('free_only', 'all', 'premium') DEFAULT 'free_only',
    ai_optimizations INT DEFAULT 0,
    resume_limit INT DEFAULT 1,
    job_posts_limit INT DEFAULT 0,
    can_feature_jobs BOOLEAN DEFAULT FALSE,
    can_search_resumes BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Subscriptions
CREATE TABLE subscriptions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    plan_id BIGINT UNSIGNED NOT NULL,
    status ENUM('active', 'cancelled', 'expired', 'pending') DEFAULT 'pending',
    starts_at TIMESTAMP NOT NULL,
    ends_at TIMESTAMP NOT NULL,
    cancelled_at TIMESTAMP NULL,
    payment_id BIGINT UNSIGNED NULL,
    auto_renew BOOLEAN DEFAULT FALSE,
    metadata JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES plans(id),
    INDEX idx_user_status (user_id, status),
    INDEX idx_expiry (ends_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Payments
CREATE TABLE payments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    subscription_id BIGINT UNSIGNED NULL,
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    payment_method VARCHAR(50) NULL,
    transaction_id VARCHAR(255) NOT NULL UNIQUE,
    gateway VARCHAR(50) NOT NULL,
    gateway_response JSON NULL,
    status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    description TEXT NULL,
    paid_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (subscription_id) REFERENCES subscriptions(id),
    INDEX idx_status (status),
    INDEX idx_transaction (transaction_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- AI & ANALYTICS TABLES
-- ============================================

-- AI processing logs
CREATE TABLE ai_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NULL,
    request_type VARCHAR(100) NOT NULL,
    input_data JSON NULL,
    output_data JSON NULL,
    processing_time_ms INT NULL,
    model_version VARCHAR(50) NULL,
    status ENUM('success', 'error', 'timeout') DEFAULT 'success',
    error_message TEXT NULL,
    ip_address VARCHAR(45) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_type (request_type),
    INDEX idx_user (user_id),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Semantic match logs
CREATE TABLE semantic_match_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    resume_id BIGINT UNSIGNED NOT NULL,
    job_id BIGINT UNSIGNED NOT NULL,
    match_score DECIMAL(5,2) NOT NULL,
    skill_score DECIMAL(5,2) NULL,
    responsibility_score DECIMAL(5,2) NULL,
    experience_score DECIMAL(5,2) NULL,
    industry_score DECIMAL(5,2) NULL,
    ats_score DECIMAL(5,2) NULL,
    skill_gaps JSON NULL,
    model_version VARCHAR(50) DEFAULT 'v1',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    INDEX idx_resume_job (resume_id, job_id),
    INDEX idx_score (match_score)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User activity tracking
CREATE TABLE user_activities (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    activity_type VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NULL,
    entity_id BIGINT UNSIGNED NULL,
    metadata JSON NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_type (user_id, activity_type),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- SYSTEM TABLES
-- ============================================

-- Password resets
CREATE TABLE password_resets (
    email VARCHAR(255) NOT NULL,
    token VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Email verifications
CREATE TABLE email_verifications (
    email VARCHAR(255) NOT NULL,
    token VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Settings
CREATE TABLE settings (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    key_name VARCHAR(255) NOT NULL UNIQUE,
    value TEXT NULL,
    type ENUM('string', 'integer', 'boolean', 'json') DEFAULT 'string',
    description TEXT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- INSERT DEFAULT DATA
-- ============================================

-- Insert default templates
INSERT INTO templates (name, slug, category, description, html_structure, css_styles, preview_image, is_active, sort_order) VALUES
('Basic ATS', 'basic-ats', 'free', 'Clean ATS-friendly template optimized for applicant tracking systems.', 
 '<div class="resume-basic-ats"><header><h1>{{name}}</h1><p>{{email}} | {{phone}} | {{location}}</p></header>...</div>',
 '.resume-basic-ats { font-family: Arial, sans-serif; }', '/templates/basic-ats.jpg', TRUE, 1),

('Clean Modern', 'clean-modern', 'free', 'Modern and clean design for professional presentation.',
 '<div class="resume-clean-modern"><header class="modern-header">...</div>',
 '.resume-clean-modern { font-family: "Helvetica Neue", sans-serif; }', '/templates/clean-modern.jpg', TRUE, 2),

('Corporate Pro', 'corporate-pro', 'pro', 'Professional corporate template for senior positions.',
 '<div class="resume-corporate">...</div>',
 '.resume-corporate { font-family: Georgia, serif; }', '/templates/corporate-pro.jpg', TRUE, 3),

('Tech Specialist', 'tech-specialist', 'pro', 'Template optimized for tech professionals.',
 '<div class="resume-tech">...</div>',
 '.resume-tech { font-family: "Fira Code", monospace; }', '/templates/tech-specialist.jpg', TRUE, 4),

('Creative Portfolio', 'creative-portfolio', 'pro', 'Creative template for designers and artists.',
 '<div class="resume-creative">...</div>',
 '.resume-creative { font-family: "Playfair Display", serif; }', '/templates/creative-portfolio.jpg', TRUE, 5),

('Minimal Elite', 'minimal-elite', 'pro', 'Minimalist design for elegant presentation.',
 '<div class="resume-minimal">...</div>',
 '.resume-minimal { font-family: "Lato", sans-serif; }', '/templates/minimal-elite.jpg', TRUE, 6),

('Executive Suite', 'executive-suite', 'premium', 'Premium executive template for C-level positions.',
 '<div class="resume-executive">...</div>',
 '.resume-executive { font-family: "Times New Roman", serif; }', '/templates/executive-suite.jpg', TRUE, 7),

('Two Column Advanced', 'two-column-advanced', 'premium', 'Advanced two-column layout for comprehensive resumes.',
 '<div class="resume-two-column">...</div>',
 '.resume-two-column { display: grid; grid-template-columns: 1fr 2fr; }', '/templates/two-column.jpg', TRUE, 8),

('Portfolio Hybrid', 'portfolio-hybrid', 'premium', 'Hybrid resume-portfolio template for creatives.',
 '<div class="resume-portfolio">...</div>',
 '.resume-portfolio { font-family: "Montserrat", sans-serif; }', '/templates/portfolio-hybrid.jpg', TRUE, 9);

-- Insert default plans for job seekers
INSERT INTO plans (name, slug, type, price, duration_days, features, templates_access, ai_optimizations, resume_limit, job_posts_limit) VALUES
('Free', 'job-seeker-free', 'job_seeker', 0, 365, 
 '["2 basic templates", "Limited job applications (5/month)", "Basic ATS score", "Email support"]', 
 'free_only', 0, 3, 0),

('Pro', 'job-seeker-pro', 'job_seeker', 299, 30, 
 '["All templates", "Unlimited job applications", "Advanced ATS score", "JD Match scoring", "Skill gap analysis", "Priority support"]', 
 'all', 5, 10, 0),

('Premium', 'job-seeker-premium', 'job_seeker', 699, 30, 
 '["All Pro features", "Auto-optimize apply", "Unlimited AI rewrites", "Cover letter generator", "LinkedIn optimization", "Interview prep AI", "Dedicated support"]', 
 'premium', 999999, 999999, 0);

-- Insert default plans for recruiters
INSERT INTO plans (name, slug, type, price, duration_days, features, job_posts_limit, can_feature_jobs, can_search_resumes) VALUES
('Basic', 'recruiter-basic', 'recruiter', 0, 365, 
 '["1 free job post", "Basic applicant tracking", "Email notifications"]', 
 1, FALSE, FALSE),

('Standard', 'recruiter-standard', 'recruiter', 1999, 30, 
 '["10 job posts", "Featured listings (2)", "Advanced analytics", "Resume search (50/month)", "Priority support"]', 
 10, TRUE, TRUE),

('Premium', 'recruiter-premium', 'recruiter', 4999, 30, 
 '["Unlimited job posts", "Unlimited featured listings", "AI shortlist", "Full resume database access", "Dedicated account manager", "API access"]', 
 999999, TRUE, TRUE);

-- Insert default settings
INSERT INTO settings (key_name, value, type, description) VALUES
('site_name', 'OverseasJob.in', 'string', 'Website name'),
('site_tagline', 'Create Smart Resume. Get Overseas Job Faster.', 'string', 'Website tagline'),
('max_resume_file_size', '10485760', 'integer', 'Maximum resume upload size in bytes (10MB)'),
('allowed_file_types', '["pdf","docx","doc"]', 'json', 'Allowed file types for resume upload'),
('ats_score_threshold', '70', 'integer', 'Minimum ATS score recommendation'),
('match_score_threshold', '65', 'integer', 'Minimum match score for job recommendations'),
('free_applications_limit', '5', 'integer', 'Monthly application limit for free users'),
('ai_model_version', 'v1', 'string', 'Current AI model version'),
('maintenance_mode', 'false', 'boolean', 'Site maintenance mode');

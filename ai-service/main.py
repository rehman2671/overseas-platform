"""
OverseasJob.in AI Microservice
FastAPI-based semantic matching engine for resume-job matching
"""

import os
import time
import re
from typing import List, Dict, Any, Optional
from datetime import datetime

from fastapi import FastAPI, HTTPException, UploadFile, File, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
from sentence_transformers import SentenceTransformer, util

# Import modules
from parsers import ResumeParser, JDExtractor
from scoring import ATSScorer, MatchScorer
from optimizer import ResumeOptimizer

# Initialize FastAPI app
app = FastAPI(
    title="OverseasJob AI Service",
    description="AI-powered resume parsing, matching, and optimization",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model at startup
print("Loading embedding model...")
model = SentenceTransformer('all-MiniLM-L6-v2')
print("Model loaded successfully!")

# Initialize components
resume_parser = ResumeParser()
jd_extractor = JDExtractor()
ats_scorer = ATSScorer()
match_scorer = MatchScorer(model)
resume_optimizer = ResumeOptimizer(model)

# Request/Response models
class ResumeData(BaseModel):
    id: Optional[int] = None
    skills: List[str] = []
    experience: List[Dict] = []
    summary: str = ""
    full_text: str = ""
    total_experience_years: int = 0

class JobData(BaseModel):
    id: Optional[int] = None
    title: str = ""
    skills: List[str] = []
    tools: List[str] = []
    experience_required: int = 0
    country: str = ""
    description: str = ""
    requirements: str = ""
    responsibilities: str = ""

class MatchRequest(BaseModel):
    resume: ResumeData
    job: JobData

class OptimizeRequest(BaseModel):
    resume: Dict[str, Any]
    job: JobData

class EmbeddingRequest(BaseModel):
    text: str
    type: str = "generic"
    id: Optional[int] = None

class SimilarityRequest(BaseModel):
    embedding1: List[float]
    embedding2: List[float]

class SkillGapRequest(BaseModel):
    resume_skills: List[str]
    job_skills: List[str]

# Health check
@app.get("/health")
async def health_check():
    return {"status": "healthy", "model": "all-MiniLM-L6-v2", "timestamp": datetime.now().isoformat()}

# Resume parsing endpoint
@app.post("/parse_resume")
async def parse_resume(file: UploadFile = File(...)):
    """Parse resume PDF/DOCX to structured JSON"""
    try:
        start_time = time.time()
        
        content = await file.read()
        result = resume_parser.parse(content, file.filename)
        
        processing_time = (time.time() - start_time) * 1000
        
        return {
            "success": True,
            "data": result,
            "processing_time_ms": processing_time
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Parse error: {str(e)}")

# JD extraction endpoint
@app.post("/extract_jd")
async def extract_jd(data: Dict[str, str] = Body(...)):
    """Extract structured data from job description"""
    try:
        start_time = time.time()
        
        job_description = data.get("job_description", "")
        result = jd_extractor.extract(job_description)
        
        processing_time = (time.time() - start_time) * 1000
        
        return {
            "success": True,
            "data": result,
            "processing_time_ms": processing_time
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Extraction error: {str(e)}")

# Match calculation endpoint
@app.post("/calculate_match")
async def calculate_match(request: MatchRequest):
    """Calculate detailed match score between resume and job"""
    try:
        start_time = time.time()
        
        result = match_scorer.calculate_detailed_match(
            request.resume.dict(),
            request.job.dict()
        )
        
        processing_time = (time.time() - start_time) * 1000
        
        return {
            "success": True,
            "score": result["final_score"],
            "components": result["components"],
            "skill_gaps": result["skill_gaps"],
            "processing_time_ms": processing_time
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Match calculation error: {str(e)}")

# ATS scoring endpoint
@app.post("/calculate_ats")
async def calculate_ats(data: Dict[str, Any] = Body(...)):
    """Calculate ATS score for resume"""
    try:
        start_time = time.time()
        
        resume = data.get("resume", {})
        result = ats_scorer.calculate_score(resume)
        
        processing_time = (time.time() - start_time) * 1000
        
        return {
            "success": True,
            "score": result["score"],
            "feedback": result["feedback"],
            "breakdown": result["breakdown"],
            "processing_time_ms": processing_time
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ATS calculation error: {str(e)}")

# Resume optimization endpoint
@app.post("/optimize_resume")
async def optimize_resume(request: OptimizeRequest):
    """Optimize resume for a specific job"""
    try:
        start_time = time.time()
        
        result = resume_optimizer.optimize(
            request.resume,
            request.job.dict()
        )
        
        processing_time = (time.time() - start_time) * 1000
        
        return {
            "success": True,
            "sections_json": result["sections_json"],
            "summary": result.get("summary"),
            "skills": result.get("skills"),
            "experience": result.get("experience"),
            "changes": result["changes"],
            "processing_time_ms": processing_time
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Optimization error: {str(e)}")

# Skill gap detection endpoint
@app.post("/detect_skill_gaps")
async def detect_skill_gaps(request: SkillGapRequest):
    """Detect skill gaps between resume and job"""
    try:
        skill_gaps = match_scorer.detect_skill_gaps(
            request.resume_skills,
            request.job_skills
        )
        
        return {
            "success": True,
            "skill_gaps": skill_gaps,
            "missing_count": len(skill_gaps)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Skill gap detection error: {str(e)}")

# Embedding generation endpoint
@app.post("/generate_embedding")
async def generate_embedding(request: EmbeddingRequest):
    """Generate embedding vector for text"""
    try:
        embedding = model.encode(request.text).tolist()
        
        return {
            "success": True,
            "embedding": embedding,
            "dimensions": len(embedding)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Embedding generation error: {str(e)}")

# Semantic similarity endpoint
@app.post("/semantic_similarity")
async def semantic_similarity(request: SimilarityRequest):
    """Calculate cosine similarity between two embeddings"""
    try:
        emb1 = np.array(request.embedding1)
        emb2 = np.array(request.embedding2)
        
        similarity = util.cos_sim(emb1, emb2).item()
        
        return {
            "success": True,
            "similarity": float(similarity),
            "similarity_percentage": round(float(similarity) * 100, 2)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Similarity calculation error: {str(e)}")

# Suggest improvements endpoint
@app.post("/suggest_improvements")
async def suggest_improvements(data: Dict[str, Any] = Body(...)):
    """Suggest improvements for resume"""
    try:
        resume = data.get("resume", {})
        suggestions = ats_scorer.suggest_improvements(resume)
        
        return {
            "success": True,
            "suggestions": suggestions
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Suggestion error: {str(e)}")

# Overseas readiness endpoint
@app.post("/overseas_readiness")
async def overseas_readiness(data: Dict[str, Any] = Body(...)):
    """Calculate overseas readiness score"""
    try:
        profile = data.get("profile", {})
        
        score = 0
        breakdown = {}
        
        # Passport (20 points)
        if profile.get("has_passport"):
            score += 20
            breakdown["passport"] = 20
        else:
            breakdown["passport"] = 0
            
        # English test score (20 points)
        english_score = profile.get("english_test_score", 0)
        required_score = profile.get("english_required_score", 6.0)
        if english_score >= required_score:
            score += 20
            breakdown["english"] = 20
        else:
            breakdown["english"] = max(0, int((english_score / required_score) * 20))
            score += breakdown["english"]
            
        # Experience (20 points)
        experience_years = profile.get("total_experience_years", 0)
        if experience_years >= 5:
            breakdown["experience"] = 20
            score += 20
        elif experience_years >= 3:
            breakdown["experience"] = 15
            score += 15
        elif experience_years >= 1:
            breakdown["experience"] = 10
            score += 10
        else:
            breakdown["experience"] = 0
            
        # Resume score (20 points)
        resume_score = profile.get("resume_score", 0)
        if resume_score >= 80:
            breakdown["resume"] = 20
            score += 20
        elif resume_score >= 60:
            breakdown["resume"] = 15
            score += 15
        elif resume_score >= 40:
            breakdown["resume"] = 10
            score += 10
        else:
            breakdown["resume"] = 5
            score += 5
            
        # Skills in demand (20 points)
        if profile.get("skills_in_demand"):
            score += 20
            breakdown["skills_demand"] = 20
        else:
            breakdown["skills_demand"] = 0
        
        return {
            "success": True,
            "score": score,
            "breakdown": breakdown,
            "readiness_level": "high" if score >= 80 else "medium" if score >= 60 else "low"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Readiness calculation error: {str(e)}")

# Run the application
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)

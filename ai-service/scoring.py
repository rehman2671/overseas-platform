"""
ATS Scorer and Match Scorer modules
"""

import re
from typing import Dict, List, Any
import numpy as np
from sentence_transformers import util


class ATSScorer:
    """Calculate ATS (Applicant Tracking System) score for resumes"""
    
    # Action verbs that improve ATS score
    ACTION_VERBS = [
        "led", "managed", "developed", "implemented", "designed", "created",
        "built", "launched", "improved", "increased", "reduced", "optimized",
        "achieved", "delivered", "coordinated", "supervised", "mentored",
        "trained", "analyzed", "researched", "streamlined", "enhanced",
        "generated", "produced", "executed", "oversaw", "directed"
    ]
    
    # Common resume mistakes
    MISTAKES = [
        "i", "me", "my", "we", "our", "they", "them"
    ]
    
    def calculate_score(self, resume: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate ATS score with detailed breakdown"""
        scores = {
            "keyword_score": self._score_keywords(resume),
            "action_verb_score": self._score_action_verbs(resume),
            "metrics_score": self._score_metrics(resume),
            "structure_score": self._score_structure(resume),
            "formatting_score": self._score_formatting(resume)
        }
        
        # Weighted final score
        weights = {
            "keyword_score": 0.35,
            "action_verb_score": 0.20,
            "metrics_score": 0.20,
            "structure_score": 0.15,
            "formatting_score": 0.10
        }
        
        final_score = sum(scores[key] * weights[key] for key in scores)
        
        # Generate feedback
        feedback = self._generate_feedback(scores, resume)
        
        return {
            "score": round(final_score),
            "breakdown": scores,
            "feedback": feedback
        }
    
    def _score_keywords(self, resume: Dict) -> float:
        """Score based on relevant keywords"""
        score = 50  # Base score
        
        full_text = resume.get("full_text", "").lower()
        skills = resume.get("skills", [])
        
        # Check for industry keywords
        industry_keywords = [
            "software", "development", "engineering", "management",
            "analysis", "design", "testing", "deployment"
        ]
        
        keyword_count = sum(1 for kw in industry_keywords if kw in full_text)
        score += min(25, keyword_count * 3)
        
        # Check skills count
        if len(skills) >= 10:
            score += 15
        elif len(skills) >= 5:
            score += 10
        elif len(skills) >= 3:
            score += 5
        
        # Check for technical terms
        tech_terms = ["api", "database", "framework", "cloud", "agile"]
        tech_count = sum(1 for term in tech_terms if term in full_text)
        score += min(10, tech_count * 2)
        
        return min(100, score)
    
    def _score_action_verbs(self, resume: Dict) -> float:
        """Score based on action verb usage"""
        full_text = resume.get("full_text", "").lower()
        experience = resume.get("experience", [])
        
        verb_count = sum(1 for verb in self.ACTION_VERBS if verb in full_text)
        
        # Check experience bullets for action verbs
        bullet_count = 0
        verb_bullet_count = 0
        
        for exp in experience:
            bullets = exp.get("bullets", [])
            for bullet in bullets:
                bullet_count += 1
                if any(verb in bullet.lower() for verb in self.ACTION_VERBS):
                    verb_bullet_count += 1
        
        score = 30  # Base score
        
        # Score based on total action verbs
        score += min(40, verb_count * 3)
        
        # Score based on bullet verb usage
        if bullet_count > 0:
            bullet_verb_ratio = verb_bullet_count / bullet_count
            score += bullet_verb_ratio * 30
        
        return min(100, score)
    
    def _score_metrics(self, resume: Dict) -> float:
        """Score based on quantified results/metrics"""
        full_text = resume.get("full_text", "")
        experience = resume.get("experience", [])
        
        # Find numbers with % or metrics
        metric_patterns = [
            r'\d+\s*%',  # Percentages
            r'\$\d+[kKmM]?',  # Dollar amounts
            r'\d+\s*(?:people|team members|employees)',  # Team sizes
            r'\d+\s*(?:projects|products|clients)',  # Quantities
            r'\d+\s*(?:years|months)',  # Time periods
            r'increased\s+(?:by\s+)?\d+',  # Growth metrics
            r'reduced\s+(?:by\s+)?\d+',  # Reduction metrics
            r'improved\s+(?:by\s+)?\d+'  # Improvement metrics
        ]
        
        metric_count = 0
        for pattern in metric_patterns:
            matches = re.findall(pattern, full_text, re.IGNORECASE)
            metric_count += len(matches)
        
        score = 20  # Base score
        score += min(80, metric_count * 10)
        
        return min(100, score)
    
    def _score_structure(self, resume: Dict) -> float:
        """Score based on resume structure"""
        score = 50  # Base score
        
        # Check for required sections
        sections = resume.get("sections_json", {})
        
        required_sections = ["personal_info", "experience", "education", "skills"]
        for section in required_sections:
            if section in sections and sections[section]:
                score += 10
        
        # Check experience entries
        experience = resume.get("experience", [])
        if len(experience) >= 3:
            score += 15
        elif len(experience) >= 1:
            score += 10
        
        # Check education
        education = resume.get("education", [])
        if len(education) >= 1:
            score += 10
        
        # Check skills count
        skills = resume.get("skills", [])
        if len(skills) >= 5:
            score += 5
        
        return min(100, score)
    
    def _score_formatting(self, resume: Dict) -> float:
        """Score based on formatting best practices"""
        score = 70  # Base score
        
        full_text = resume.get("full_text", "")
        
        # Check for common mistakes
        mistake_count = sum(1 for mistake in self.MISTAKES 
                          if re.search(rf'\b{mistake}\b', full_text, re.IGNORECASE))
        score -= mistake_count * 5
        
        # Check for excessive length
        word_count = len(full_text.split())
        if word_count > 1000:
            score -= 10
        elif word_count < 100:
            score -= 10
        
        # Check for special characters that might cause issues
        special_chars = len(re.findall(r'[^\w\s\.\,\-\(\)\%\$]', full_text))
        if special_chars > 20:
            score -= 10
        
        return max(0, min(100, score))
    
    def _generate_feedback(self, scores: Dict, resume: Dict) -> List[Dict]:
        """Generate improvement feedback based on scores"""
        feedback = []
        
        if scores["keyword_score"] < 70:
            feedback.append({
                "category": "keywords",
                "message": "Add more industry-relevant keywords to improve visibility",
                "priority": "high"
            })
        
        if scores["action_verb_score"] < 70:
            feedback.append({
                "category": "action_verbs",
                "message": "Start bullet points with strong action verbs like 'Led', 'Developed', 'Implemented'",
                "priority": "high"
            })
        
        if scores["metrics_score"] < 60:
            feedback.append({
                "category": "metrics",
                "message": "Add quantifiable achievements (e.g., 'Increased sales by 25%')",
                "priority": "medium"
            })
        
        if scores["structure_score"] < 70:
            feedback.append({
                "category": "structure",
                "message": "Ensure all key sections are complete: Experience, Education, Skills",
                "priority": "high"
            })
        
        if scores["formatting_score"] < 70:
            feedback.append({
                "category": "formatting",
                "message": "Avoid personal pronouns and keep formatting ATS-friendly",
                "priority": "low"
            })
        
        return feedback
    
    def suggest_improvements(self, resume: Dict) -> List[Dict]:
        """Suggest specific improvements for the resume"""
        suggestions = []
        
        # Check for missing sections
        if not resume.get("summary"):
            suggestions.append({
                "type": "add_section",
                "section": "summary",
                "message": "Add a professional summary (2-3 sentences highlighting your key strengths)"
            })
        
        # Check experience bullets
        experience = resume.get("experience", [])
        for i, exp in enumerate(experience):
            bullets = exp.get("bullets", [])
            if len(bullets) < 3:
                suggestions.append({
                    "type": "expand_experience",
                    "position": exp.get("title", f"Position {i+1}"),
                    "message": f"Add more bullet points to describe your achievements at {exp.get('company', 'this company')}"
                })
            
            # Check for metrics in bullets
            has_metrics = any(re.search(r'\d+%|\$\d+|\d+\s+people', bullet) for bullet in bullets)
            if not has_metrics:
                suggestions.append({
                    "type": "add_metrics",
                    "position": exp.get("title", f"Position {i+1}"),
                    "message": "Add quantifiable results (e.g., percentages, dollar amounts, team sizes)"
                })
        
        # Check skills
        skills = resume.get("skills", [])
        if len(skills) < 5:
            suggestions.append({
                "type": "expand_skills",
                "message": "Add more relevant skills (aim for at least 10 skills)"
            })
        
        return suggestions


class MatchScorer:
    """Calculate semantic match score between resume and job"""
    
    def __init__(self, model):
        self.model = model
        self.similarity_threshold = 0.65
    
    def calculate_detailed_match(self, resume: Dict, job: Dict) -> Dict[str, Any]:
        """Calculate detailed match score with breakdown"""
        # Calculate individual component scores
        skill_score = self._calculate_skill_match(resume, job)
        responsibility_score = self._calculate_responsibility_match(resume, job)
        experience_score = self._calculate_experience_match(resume, job)
        industry_score = self._calculate_industry_match(resume, job)
        
        # Calculate weighted final score
        weights = {
            "skill_score": 0.35,
            "responsibility_score": 0.35,
            "experience_score": 0.15,
            "industry_score": 0.15
        }
        
        final_score = (
            skill_score * weights["skill_score"] +
            responsibility_score * weights["responsibility_score"] +
            experience_score * weights["experience_score"] +
            industry_score * weights["industry_score"]
        )
        
        # Detect skill gaps
        skill_gaps = self.detect_skill_gaps(
            resume.get("skills", []),
            job.get("skills", [])
        )
        
        return {
            "final_score": round(final_score, 1),
            "components": {
                "skill_score": round(skill_score, 1),
                "responsibility_score": round(responsibility_score, 1),
                "experience_score": round(experience_score, 1),
                "industry_score": round(industry_score, 1)
            },
            "skill_gaps": skill_gaps,
            "match_level": self._get_match_level(final_score)
        }
    
    def _calculate_skill_match(self, resume: Dict, job: Dict) -> float:
        """Calculate skill match score using semantic similarity"""
        resume_skills = resume.get("skills", [])
        job_skills = job.get("skills", [])
        
        if not job_skills:
            return 100.0
        
        if not resume_skills:
            return 0.0
        
        # Encode skills
        resume_embeddings = self.model.encode(resume_skills)
        job_embeddings = self.model.encode(job_skills)
        
        # Calculate similarity matrix
        similarity_matrix = util.cos_sim(resume_embeddings, job_embeddings)
        
        # For each job skill, find best matching resume skill
        best_matches = []
        for i, job_skill in enumerate(job_skills):
            best_match_score = max(similarity_matrix[:, i]).item()
            best_matches.append(best_match_score)
        
        # Average of best matches
        avg_similarity = sum(best_matches) / len(best_matches)
        
        return avg_similarity * 100
    
    def _calculate_responsibility_match(self, resume: Dict, job: Dict) -> float:
        """Calculate responsibility/experience description match"""
        resume_text = ""
        
        # Combine experience descriptions
        for exp in resume.get("experience", []):
            resume_text += exp.get("title", "") + " "
            resume_text += " ".join(exp.get("bullets", [])) + " "
        
        resume_text += resume.get("summary", "")
        
        job_text = job.get("description", "") + " "
        job_text += job.get("responsibilities", "") + " "
        job_text += job.get("requirements", "")
        
        if not resume_text.strip() or not job_text.strip():
            return 50.0
        
        # Encode and compare
        resume_embedding = self.model.encode(resume_text)
        job_embedding = self.model.encode(job_text)
        
        similarity = util.cos_sim(resume_embedding, job_embedding).item()
        
        return similarity * 100
    
    def _calculate_experience_match(self, resume: Dict, job: Dict) -> float:
        """Calculate experience years match"""
        resume_years = resume.get("total_experience_years", 0)
        job_years = job.get("experience_required", 0)
        
        if job_years == 0:
            return 100.0
        
        if resume_years >= job_years:
            return 100.0
        
        # Penalty for missing experience
        diff = job_years - resume_years
        score = max(0, 100 - diff * 20)
        
        return score
    
    def _calculate_industry_match(self, resume: Dict, job: Dict) -> float:
        """Calculate industry context match"""
        # Extract industry keywords from job
        job_text = job.get("description", "") + " " + job.get("requirements", "")
        resume_text = resume.get("full_text", "")
        
        # Industry keywords
        industries = {
            "technology": ["software", "tech", "it", "digital", "cloud", "ai", "ml"],
            "healthcare": ["health", "medical", "hospital", "patient", "clinical"],
            "finance": ["finance", "banking", "investment", "trading", "fintech"],
            "retail": ["retail", "e-commerce", "sales", "customer", "store"],
            "manufacturing": ["manufacturing", "production", "factory", "assembly"],
            "education": ["education", "teaching", "learning", "school", "university"]
        }
        
        job_industries = []
        resume_industries = []
        
        for industry, keywords in industries.items():
            if any(kw in job_text.lower() for kw in keywords):
                job_industries.append(industry)
            if any(kw in resume_text.lower() for kw in keywords):
                resume_industries.append(industry)
        
        if not job_industries:
            return 100.0
        
        if not resume_industries:
            return 50.0
        
        # Check for overlap
        matches = len(set(job_industries) & set(resume_industries))
        total = len(set(job_industries) | set(resume_industries))
        
        if total == 0:
            return 100.0
        
        return (matches / len(job_industries)) * 100
    
    def detect_skill_gaps(self, resume_skills: List[str], job_skills: List[str]) -> List[Dict]:
        """Detect skill gaps between resume and job requirements"""
        if not job_skills:
            return []
        
        if not resume_skills:
            return [{"skill": skill, "similarity": 0} for skill in job_skills]
        
        # Encode skills
        resume_embeddings = self.model.encode(resume_skills)
        job_embeddings = self.model.encode(job_skills)
        
        # Calculate similarity matrix
        similarity_matrix = util.cos_sim(job_embeddings, resume_embeddings)
        
        gaps = []
        for i, job_skill in enumerate(job_skills):
            max_similarity = max(similarity_matrix[i]).item()
            
            if max_similarity < self.similarity_threshold:
                gaps.append({
                    "skill": job_skill,
                    "similarity": round(max_similarity, 2),
                    "suggested_alternative": self._find_similar_skill(job_skill, resume_skills) if max_similarity > 0.4 else None
                })
        
        return gaps
    
    def _find_similar_skill(self, target_skill: str, resume_skills: List[str]) -> str:
        """Find most similar skill in resume"""
        if not resume_skills:
            return None
        
        target_embedding = self.model.encode([target_skill])
        skill_embeddings = self.model.encode(resume_skills)
        
        similarities = util.cos_sim(target_embedding, skill_embeddings)[0]
        best_idx = similarities.argmax().item()
        
        return resume_skills[best_idx]
    
    def _get_match_level(self, score: float) -> str:
        """Get match level description"""
        if score >= 85:
            return "excellent"
        elif score >= 70:
            return "good"
        elif score >= 55:
            return "fair"
        elif score >= 40:
            return "poor"
        else:
            return "very_poor"

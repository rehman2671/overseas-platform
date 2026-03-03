"""
Resume Optimizer module
"""

import re
from typing import Dict, List, Any
from sentence_transformers import util


class ResumeOptimizer:
    """Optimize resume for specific job descriptions"""
    
    # Action verbs for bullet enhancement
    ACTION_VERBS = [
        "led", "managed", "developed", "implemented", "designed", "created",
        "built", "launched", "improved", "increased", "reduced", "optimized",
        "achieved", "delivered", "coordinated", "supervised", "mentored",
        "streamlined", "enhanced", "generated", "produced", "executed"
    ]
    
    # Quantifiable metrics patterns
    METRIC_PATTERNS = [
        (r'increased\s+(\w+)\s+by\s+(\d+)%', "increased {metric} by {value}%"),
        (r'reduced\s+(\w+)\s+by\s+(\d+)%', "reduced {metric} by {value}%"),
        (r'improved\s+(\w+)\s+by\s+(\d+)%', "improved {metric} by {value}%"),
    ]
    
    def __init__(self, model):
        self.model = model
    
    def optimize(self, resume: Dict, job: Dict) -> Dict[str, Any]:
        """Optimize resume for a specific job"""
        changes = []
        
        # Optimize skills section
        optimized_skills, skill_changes = self._optimize_skills(
            resume.get("skills", []),
            job.get("skills", [])
        )
        changes.extend(skill_changes)
        
        # Optimize summary
        optimized_summary, summary_changes = self._optimize_summary(
            resume.get("summary", ""),
            job
        )
        changes.extend(summary_changes)
        
        # Optimize experience bullets
        optimized_experience, exp_changes = self._optimize_experience(
            resume.get("experience", []),
            job
        )
        changes.extend(exp_changes)
        
        # Build optimized sections_json
        sections_json = resume.get("sections_json", {}).copy()
        sections_json["skills"] = optimized_skills
        sections_json["summary"] = optimized_summary
        sections_json["experience"] = optimized_experience
        
        return {
            "sections_json": sections_json,
            "skills": optimized_skills,
            "summary": optimized_summary,
            "experience": optimized_experience,
            "changes": changes
        }
    
    def _optimize_skills(self, resume_skills: List[str], job_skills: List[str]) -> tuple:
        """Optimize skills section by adding missing keywords"""
        changes = []
        optimized_skills = resume_skills.copy()
        
        if not job_skills:
            return optimized_skills, changes
        
        # Encode skills for semantic comparison
        if resume_skills:
            resume_embeddings = self.model.encode(resume_skills)
        
        job_embeddings = self.model.encode(job_skills)
        
        for job_skill in job_skills:
            # Check if skill or similar already exists
            if resume_skills:
                skill_embedding = self.model.encode([job_skill])
                similarities = util.cos_sim(skill_embedding, resume_embeddings)[0]
                max_similarity = similarities.max().item()
                
                if max_similarity < 0.65:
                    # Add missing skill
                    optimized_skills.append(job_skill)
                    changes.append({
                        "type": "skill_added",
                        "skill": job_skill,
                        "reason": "Required by job description"
                    })
            else:
                optimized_skills.append(job_skill)
                changes.append({
                    "type": "skill_added",
                    "skill": job_skill,
                    "reason": "Required by job description"
                })
        
        return list(set(optimized_skills)), changes  # Remove duplicates
    
    def _optimize_summary(self, summary: str, job: Dict) -> tuple:
        """Optimize professional summary"""
        changes = []
        
        if not summary:
            # Generate summary if missing
            job_title = job.get("title", "")
            key_skills = job.get("skills", [])[:5]
            
            optimized_summary = f"Experienced professional with expertise in {', '.join(key_skills)}. "
            optimized_summary += f"Seeking to leverage skills in {job_title} role."
            
            changes.append({
                "type": "summary_generated",
                "reason": "Professional summary was missing"
            })
            
            return optimized_summary, changes
        
        optimized_summary = summary
        job_keywords = job.get("skills", []) + [job.get("title", "")]
        
        # Check for missing keywords in summary
        summary_lower = summary.lower()
        missing_keywords = []
        
        for keyword in job_keywords:
            if keyword.lower() not in summary_lower and len(keyword) > 3:
                missing_keywords.append(keyword)
        
        if missing_keywords:
            # Add missing keywords to summary
            addition = f" Proficient in {', '.join(missing_keywords[:3])}."
            optimized_summary = summary.rstrip('.') + addition
            
            changes.append({
                "type": "summary_enhanced",
                "keywords_added": missing_keywords[:3],
                "reason": "Added relevant keywords from job description"
            })
        
        return optimized_summary, changes
    
    def _optimize_experience(self, experience: List[Dict], job: Dict) -> tuple:
        """Optimize experience bullets"""
        changes = []
        optimized_experience = []
        
        job_keywords = set(job.get("skills", []) + job.get("tools", []))
        job_keywords = [kw.lower() for kw in job_keywords]
        
        for exp in experience:
            optimized_exp = exp.copy()
            bullets = exp.get("bullets", [])
            optimized_bullets = []
            
            for bullet in bullets:
                optimized_bullet = bullet
                
                # Check if bullet needs quantification
                if not self._has_quantification(bullet):
                    optimized_bullet = self._add_quantification(optimized_bullet)
                    if optimized_bullet != bullet:
                        changes.append({
                            "type": "bullet_quantified",
                            "original": bullet,
                            "optimized": optimized_bullet,
                            "reason": "Added quantifiable metric"
                        })
                
                # Inject relevant keywords
                original_bullet = optimized_bullet
                optimized_bullet = self._inject_keywords(optimized_bullet, job_keywords)
                if optimized_bullet != original_bullet:
                    changes.append({
                        "type": "bullet_enhanced",
                        "original": original_bullet,
                        "optimized": optimized_bullet,
                        "reason": "Added relevant keywords"
                    })
                
                # Ensure bullet starts with action verb
                optimized_bullet = self._ensure_action_verb(optimized_bullet)
                
                optimized_bullets.append(optimized_bullet)
            
            optimized_exp["bullets"] = optimized_bullets
            optimized_experience.append(optimized_exp)
        
        return optimized_experience, changes
    
    def _has_quantification(self, bullet: str) -> bool:
        """Check if bullet point has quantifiable metrics"""
        patterns = [
            r'\d+\s*%',  # Percentages
            r'\$?\d+[kKmM]?',  # Numbers with optional currency
            r'\d+\s+(?:people|team members|employees|users|clients)',  # Counts
            r'\d+\s+(?:projects|products|features)',  # Items
            r'\d+\s+(?:years|months)',  # Time periods
        ]
        
        for pattern in patterns:
            if re.search(pattern, bullet, re.IGNORECASE):
                return True
        
        return False
    
    def _add_quantification(self, bullet: str) -> str:
        """Add quantifiable metric to bullet point"""
        # Common quantification patterns
        quantifications = {
            "team": "leading a team of X members",
            "project": "delivering X projects",
            "improve": "improving efficiency by X%",
            "increase": "increasing X by Y%",
            "reduce": "reducing X by Y%",
            "manage": "managing X resources",
            "develop": "developing X features"
        }
        
        bullet_lower = bullet.lower()
        
        for keyword, template in quantifications.items():
            if keyword in bullet_lower:
                # Add quantification hint
                if not bullet.endswith('.'):
                    bullet += '.'
                bullet += f" [{template}]"
                break
        
        return bullet
    
    def _inject_keywords(self, bullet: str, job_keywords: List[str]) -> str:
        """Inject relevant job keywords into bullet"""
        bullet_lower = bullet.lower()
        
        for keyword in job_keywords:
            if keyword.lower() not in bullet_lower and len(keyword) > 3:
                # Check semantic similarity to avoid forcing unrelated keywords
                bullet_embedding = self.model.encode([bullet])
                keyword_embedding = self.model.encode([keyword])
                similarity = util.cos_sim(bullet_embedding, keyword_embedding).item()
                
                # Only inject if semantically related
                if similarity > 0.3:
                    bullet += f", utilizing {keyword}"
                    break  # Only add one keyword per bullet
        
        return bullet
    
    def _ensure_action_verb(self, bullet: str) -> str:
        """Ensure bullet point starts with action verb"""
        bullet = bullet.strip()
        
        # Check if already starts with action verb
        first_word = bullet.split()[0].lower().rstrip(',;:')
        
        if first_word in self.ACTION_VERBS:
            return bullet
        
        # Capitalize first letter if adding verb
        if bullet and bullet[0].islower():
            bullet = bullet[0].upper() + bullet[1:]
        
        return bullet
    
    def _enhance_with_achievements(self, bullet: str) -> str:
        """Enhance bullet with achievement language"""
        achievement_words = ["successfully", "effectively", "efficiently", "strategically"]
        
        # Check if already has achievement language
        if any(word in bullet.lower() for word in achievement_words):
            return bullet
        
        # Add achievement word after action verb
        words = bullet.split()
        if len(words) > 1:
            words.insert(1, "successfully")
            return " ".join(words)
        
        return bullet
    
    def suggest_bullet_improvements(self, bullet: str, job: Dict) -> List[Dict]:
        """Suggest improvements for a specific bullet point"""
        suggestions = []
        
        # Check for quantification
        if not self._has_quantification(bullet):
            suggestions.append({
                "type": "add_metrics",
                "message": "Add quantifiable results (e.g., percentages, numbers)",
                "example": f"{bullet} resulting in 25% improvement"
            })
        
        # Check for action verb
        first_word = bullet.split()[0].lower() if bullet else ""
        if first_word not in self.ACTION_VERBS:
            suggestions.append({
                "type": "add_action_verb",
                "message": "Start with a strong action verb",
                "example": f"Led {bullet[0].lower() + bullet[1:]}"
            })
        
        # Check for job keyword alignment
        job_keywords = set(job.get("skills", []) + job.get("tools", []))
        bullet_lower = bullet.lower()
        
        missing_keywords = [kw for kw in job_keywords if kw.lower() not in bullet_lower]
        if missing_keywords:
            suggestions.append({
                "type": "add_keywords",
                "message": f"Consider mentioning: {', '.join(missing_keywords[:3])}",
                "keywords": missing_keywords[:3]
            })
        
        return suggestions

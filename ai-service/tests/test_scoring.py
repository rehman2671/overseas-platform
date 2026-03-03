"""
Unit tests for AI scoring modules
"""

import pytest
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from scoring import ATSScorer, MatchScorer
from sentence_transformers import SentenceTransformer

# Load model for testing
model = SentenceTransformer('all-MiniLM-L6-v2')

class TestATSScorer:
    def setup_method(self):
        self.scorer = ATSScorer()
    
    def test_calculate_score_returns_valid_structure(self):
        resume = {
            'full_text': 'Software developer with Python and JavaScript experience. Led team of 5 developers.',
            'skills': ['Python', 'JavaScript', 'React'],
            'experience': [
                {
                    'title': 'Senior Developer',
                    'bullets': ['Led team of 5 developers', 'Increased performance by 25%']
                }
            ],
            'sections_json': {
                'personal_info': {'name': 'John'},
                'experience': [],
                'education': [],
                'skills': []
            }
        }
        
        result = self.scorer.calculate_score(resume)
        
        assert 'score' in result
        assert 'breakdown' in result
        assert 'feedback' in result
        assert isinstance(result['score'], (int, float))
        assert 0 <= result['score'] <= 100
    
    def test_score_with_empty_resume(self):
        resume = {
            'full_text': '',
            'skills': [],
            'experience': [],
            'sections_json': {}
        }
        
        result = self.scorer.calculate_score(resume)
        
        assert result['score'] >= 0
        assert result['score'] <= 100

class TestMatchScorer:
    def setup_method(self):
        self.scorer = MatchScorer(model)
    
    def test_calculate_detailed_match_returns_valid_structure(self):
        resume = {
            'skills': ['Python', 'Django', 'React'],
            'experience': [
                {
                    'title': 'Full Stack Developer',
                    'bullets': ['Built web applications using Python and React']
                }
            ],
            'summary': 'Full stack developer with 5 years experience',
            'full_text': 'Full stack developer with Python, Django, and React experience',
            'total_experience_years': 5
        }
        
        job = {
            'title': 'Full Stack Developer',
            'skills': ['Python', 'Django', 'JavaScript', 'React'],
            'tools': ['Git', 'Docker'],
            'experience_required': 3,
            'country': 'USA',
            'description': 'Looking for a full stack developer with Python and React experience',
            'requirements': '3+ years of experience with Python and React',
            'responsibilities': 'Build and maintain web applications'
        }
        
        result = self.scorer.calculate_detailed_match(resume, job)
        
        assert 'final_score' in result
        assert 'components' in result
        assert 'skill_gaps' in result
        assert 'match_level' in result
        assert isinstance(result['final_score'], (int, float))
        assert 0 <= result['final_score'] <= 100
    
    def test_skill_gap_detection(self):
        resume_skills = ['Python', 'Django']
        job_skills = ['Python', 'Django', 'React', 'TypeScript']
        
        gaps = self.scorer.detect_skill_gaps(resume_skills, job_skills)
        
        assert isinstance(gaps, list)
        # Should detect React and TypeScript as gaps
        gap_names = [g['skill'] for g in gaps]
        assert 'React' in gap_names or 'TypeScript' in gap_names

if __name__ == '__main__':
    pytest.main([__file__, '-v'])

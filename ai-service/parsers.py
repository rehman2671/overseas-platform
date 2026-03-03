"""
Resume Parser and JD Extractor modules
"""

import re
import io
from typing import Dict, List, Any, Optional
import pdfplumber
from docx import Document


class ResumeParser:
    """Parse resume PDF/DOCX files to structured JSON"""
    
    # Section headings to detect
    SECTION_HEADINGS = [
        "experience", "work experience", "employment", "work history",
        "education", "academic background", "qualifications",
        "skills", "technical skills", "core competencies", "expertise",
        "certifications", "certificates", "professional certifications",
        "projects", "personal projects", "professional projects",
        "summary", "professional summary", "profile", "objective",
        "languages", "language proficiency",
        "achievements", "accomplishments", "awards"
    ]
    
    # Action verbs for experience detection
    ACTION_VERBS = [
        "led", "managed", "developed", "implemented", "designed",
        "created", "built", "launched", "improved", "increased",
        "reduced", "optimized", "achieved", "delivered", "coordinated",
        "supervised", "mentored", "trained", "analyzed", "researched"
    ]
    
    def parse(self, content: bytes, filename: str) -> Dict[str, Any]:
        """Parse resume file and return structured data"""
        # Extract text based on file type
        if filename.lower().endswith('.pdf'):
            text = self._extract_pdf_text(content)
        elif filename.lower().endswith(('.docx', '.doc')):
            text = self._extract_docx_text(content)
        else:
            raise ValueError(f"Unsupported file format: {filename}")
        
        # Clean text
        text = self._clean_text(text)
        
        # Detect sections
        sections = self._detect_sections(text)
        
        # Extract data from sections
        result = {
            "personal_info": self._extract_personal_info(text, sections),
            "summary": self._extract_summary(sections),
            "experience": self._extract_experience(sections),
            "education": self._extract_education(sections),
            "skills": self._extract_skills(sections),
            "certifications": self._extract_certifications(sections),
            "projects": self._extract_projects(sections),
            "languages": self._extract_languages(sections),
            "raw_text": text[:5000]  # First 5000 chars for reference
        }
        
        return result
    
    def _extract_pdf_text(self, content: bytes) -> str:
        """Extract text from PDF"""
        text = ""
        with pdfplumber.open(io.BytesIO(content)) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        return text
    
    def _extract_docx_text(self, content: bytes) -> str:
        """Extract text from DOCX"""
        doc = Document(io.BytesIO(content))
        text = ""
        for para in doc.paragraphs:
            text += para.text + "\n"
        return text
    
    def _clean_text(self, text: str) -> str:
        """Clean and normalize text"""
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text)
        # Normalize newlines
        text = re.sub(r'\n+', '\n', text)
        return text.strip()
    
    def _detect_sections(self, text: str) -> Dict[str, str]:
        """Detect and split sections in resume"""
        sections = {}
        lines = text.split('\n')
        current_section = "header"
        current_content = []
        
        for line in lines:
            line_lower = line.lower().strip()
            
            # Check if line is a section heading
            is_heading = False
            for heading in self.SECTION_HEADINGS:
                if re.match(rf'^{heading}[:\s]*$', line_lower) or \
                   re.match(rf'^\s*{heading}\s*$', line_lower):
                    # Save previous section
                    if current_content:
                        sections[current_section] = '\n'.join(current_content)
                    current_section = heading
                    current_content = []
                    is_heading = True
                    break
            
            if not is_heading:
                current_content.append(line)
        
        # Save last section
        if current_content:
            sections[current_section] = '\n'.join(current_content)
        
        return sections
    
    def _extract_personal_info(self, text: str, sections: Dict) -> Dict[str, str]:
        """Extract personal information"""
        header = sections.get("header", text[:1000])
        
        info = {
            "name": self._extract_name(header),
            "email": self._extract_email(header),
            "phone": self._extract_phone(header),
            "location": self._extract_location(header),
            "linkedin": self._extract_linkedin(header),
            "website": self._extract_website(header)
        }
        
        return {k: v for k, v in info.items() if v}
    
    def _extract_name(self, text: str) -> Optional[str]:
        """Extract name from header"""
        lines = text.split('\n')[:5]  # Check first 5 lines
        for line in lines:
            line = line.strip()
            # Skip if line contains common non-name patterns
            if any(x in line.lower() for x in ['@', 'http', 'phone', 'email', 'address', 'resume', 'cv']):
                continue
            # Look for 2-3 word names
            words = line.split()
            if 2 <= len(words) <= 4 and all(w.isalpha() or w in ['.', '-'] for w in line.replace(' ', '')):
                if len(line) > 5 and len(line) < 50:
                    return line
        return None
    
    def _extract_email(self, text: str) -> Optional[str]:
        """Extract email address"""
        pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        match = re.search(pattern, text)
        return match.group(0) if match else None
    
    def _extract_phone(self, text: str) -> Optional[str]:
        """Extract phone number"""
        patterns = [
            r'\+?\d{1,3}[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}',
            r'\+?\d{1,3}[-.\s]?\d{10}',
            r'\d{3}[-.\s]?\d{3}[-.\s]?\d{4}'
        ]
        for pattern in patterns:
            match = re.search(pattern, text)
            if match:
                return match.group(0)
        return None
    
    def _extract_location(self, text: str) -> Optional[str]:
        """Extract location"""
        # Look for city, state/country pattern
        pattern = r'([A-Za-z\s]+,\s*[A-Za-z\s]+)'
        matches = re.findall(pattern, text[:500])
        for match in matches:
            if len(match) < 50 and not any(x in match.lower() for x in ['@', 'http', 'www']):
                return match.strip()
        return None
    
    def _extract_linkedin(self, text: str) -> Optional[str]:
        """Extract LinkedIn URL"""
        pattern = r'linkedin\.com/in/[A-Za-z0-9_-]+'
        match = re.search(pattern, text, re.IGNORECASE)
        return f"https://www.{match.group(0)}" if match else None
    
    def _extract_website(self, text: str) -> Optional[str]:
        """Extract personal website/portfolio"""
        pattern = r'https?://(?:www\.)?[A-Za-z0-9.-]+\.[A-Za-z]{2,}'
        matches = re.findall(pattern, text)
        for match in matches:
            if 'linkedin' not in match.lower():
                return match
        return None
    
    def _extract_summary(self, sections: Dict) -> str:
        """Extract professional summary"""
        for key in ["summary", "professional summary", "profile", "objective"]:
            if key in sections:
                return sections[key].strip()[:1000]
        return ""
    
    def _extract_experience(self, sections: Dict) -> List[Dict]:
        """Extract work experience"""
        exp_text = ""
        for key in ["experience", "work experience", "employment", "work history"]:
            if key in sections:
                exp_text = sections[key]
                break
        
        if not exp_text:
            return []
        
        experiences = []
        entries = self._split_experience_entries(exp_text)
        
        for entry in entries[:10]:  # Limit to 10 entries
            exp = self._parse_experience_entry(entry)
            if exp:
                experiences.append(exp)
        
        return experiences
    
    def _split_experience_entries(self, text: str) -> List[str]:
        """Split experience section into individual entries"""
        # Split by date patterns or blank lines
        patterns = [
            r'\n(?=\d{4}|\d{1,2}/\d{1,2}|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)',
            r'\n\n+'
        ]
        
        for pattern in patterns:
            entries = re.split(pattern, text)
            if len(entries) > 1:
                return [e.strip() for e in entries if e.strip()]
        
        return [text]
    
    def _parse_experience_entry(self, entry: str) -> Optional[Dict]:
        """Parse a single experience entry"""
        lines = [l.strip() for l in entry.split('\n') if l.strip()]
        if not lines:
            return None
        
        result = {
            "title": "",
            "company": "",
            "location": "",
            "start_date": "",
            "end_date": "",
            "bullets": []
        }
        
        # First line usually contains title and company
        first_line = lines[0]
        
        # Extract date range
        date_pattern = r'(\d{1,2}/\d{1,2}/\d{2,4}|\d{4}|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[\s-]+(Present|\d{1,2}/\d{1,2}/\d{2,4}|\d{4}|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)'
        date_match = re.search(date_pattern, first_line, re.IGNORECASE)
        
        if date_match:
            result["start_date"] = date_match.group(1)
            result["end_date"] = date_match.group(2)
            first_line = first_line[:date_match.start()] + first_line[date_match.end():]
        
        # Try to split title and company
        parts = re.split(r'[|,\-–]\s*', first_line)
        if len(parts) >= 2:
            result["title"] = parts[0].strip()
            result["company"] = parts[1].strip()
        else:
            result["title"] = first_line.strip()
        
        # Extract bullets
        for line in lines[1:]:
            line = line.strip()
            if line.startswith('•') or line.startswith('-') or line.startswith('*'):
                result["bullets"].append(line[1:].strip())
            elif any(line.lower().startswith(verb) for verb in self.ACTION_VERBS):
                result["bullets"].append(line)
        
        return result
    
    def _extract_education(self, sections: Dict) -> List[Dict]:
        """Extract education details"""
        edu_text = sections.get("education", "")
        if not edu_text:
            return []
        
        education = []
        entries = self._split_experience_entries(edu_text)
        
        for entry in entries[:5]:
            edu = self._parse_education_entry(entry)
            if edu:
                education.append(edu)
        
        return education
    
    def _parse_education_entry(self, entry: str) -> Optional[Dict]:
        """Parse a single education entry"""
        lines = [l.strip() for l in entry.split('\n') if l.strip()]
        if not lines:
            return None
        
        result = {
            "degree": "",
            "institution": "",
            "field_of_study": "",
            "start_year": "",
            "end_year": "",
            "gpa": ""
        }
        
        first_line = lines[0]
        
        # Extract year
        year_pattern = r'(\d{4})\s*-\s*(\d{4}|Present)'
        year_match = re.search(year_pattern, first_line, re.IGNORECASE)
        if year_match:
            result["start_year"] = year_match.group(1)
            result["end_year"] = year_match.group(2)
            first_line = first_line[:year_match.start()] + first_line[year_match.end():]
        
        # Look for degree patterns
        degree_patterns = [
            r'(Bachelor|Master|PhD|MBA|B\.S\.|M\.S\.|B\.A\.|M\.A\.|B\.E\.|M\.E\.|B\.Tech|M\.Tech)[^,\n]*',
            r'(BSc|MSc|BA|MA|BE|ME|BTech|MTech)[^,\n]*'
        ]
        
        for pattern in degree_patterns:
            match = re.search(pattern, first_line, re.IGNORECASE)
            if match:
                result["degree"] = match.group(0).strip()
                break
        
        # Institution is usually the remaining text or second line
        if len(lines) > 1:
            result["institution"] = lines[1].strip()
        else:
            result["institution"] = first_line.replace(result["degree"], "").strip(', ')
        
        # Extract GPA
        gpa_pattern = r'GPA[:\s]+(\d+\.?\d*)'
        gpa_match = re.search(gpa_pattern, entry, re.IGNORECASE)
        if gpa_match:
            result["gpa"] = gpa_match.group(1)
        
        return result
    
    def _extract_skills(self, sections: Dict) -> List[str]:
        """Extract skills"""
        skills_text = ""
        for key in ["skills", "technical skills", "core competencies", "expertise"]:
            if key in sections:
                skills_text = sections[key]
                break
        
        if not skills_text:
            return []
        
        # Split by common delimiters
        skills = re.split(r'[,;•|\n]+', skills_text)
        skills = [s.strip() for s in skills if s.strip()]
        
        # Filter out very short or very long items
        skills = [s for s in skills if 2 <= len(s) <= 50]
        
        return list(set(skills))[:30]  # Limit to 30 unique skills
    
    def _extract_certifications(self, sections: Dict) -> List[Dict]:
        """Extract certifications"""
        cert_text = ""
        for key in ["certifications", "certificates", "professional certifications"]:
            if key in sections:
                cert_text = sections[key]
                break
        
        if not cert_text:
            return []
        
        certifications = []
        lines = [l.strip() for l in cert_text.split('\n') if l.strip()]
        
        for line in lines[:10]:
            if len(line) < 100:
                certifications.append({
                    "name": line.strip('•- '),
                    "issuing_organization": "",
                    "issue_date": "",
                    "expiry_date": ""
                })
        
        return certifications
    
    def _extract_projects(self, sections: Dict) -> List[Dict]:
        """Extract projects"""
        proj_text = sections.get("projects", sections.get("personal projects", ""))
        if not proj_text:
            return []
        
        projects = []
        entries = self._split_experience_entries(proj_text)
        
        for entry in entries[:5]:
            lines = [l.strip() for l in entry.split('\n') if l.strip()]
            if lines:
                projects.append({
                    "name": lines[0].strip('•- '),
                    "description": ' '.join(lines[1:3]),
                    "technologies": [],
                    "link": ""
                })
        
        return projects
    
    def _extract_languages(self, sections: Dict) -> List[Dict]:
        """Extract languages"""
        lang_text = sections.get("languages", "")
        if not lang_text:
            return []
        
        languages = []
        lines = [l.strip() for l in lang_text.split('\n') if l.strip()]
        
        for line in lines[:5]:
            parts = re.split(r'[:\-–]\s*', line.strip('•- '))
            languages.append({
                "language": parts[0].strip(),
                "proficiency": parts[1].strip() if len(parts) > 1 else ""
            })
        
        return languages


class JDExtractor:
    """Extract structured data from job descriptions"""
    
    # Common skills to detect
    COMMON_SKILLS = [
        "python", "java", "javascript", "typescript", "react", "angular", "vue",
        "node.js", "nodejs", "express", "django", "flask", "laravel", "php",
        "sql", "mysql", "postgresql", "mongodb", "redis", "elasticsearch",
        "aws", "azure", "gcp", "docker", "kubernetes", "jenkins", "gitlab",
        "git", "github", "bitbucket", "jira", "confluence",
        "html", "css", "sass", "less", "bootstrap", "tailwind",
        "machine learning", "deep learning", "tensorflow", "pytorch", "scikit-learn",
        "data analysis", "pandas", "numpy", "matplotlib", "tableau", "power bi",
        "project management", "agile", "scrum", "kanban",
        "communication", "leadership", "teamwork", "problem solving"
    ]
    
    # Common tools to detect
    COMMON_TOOLS = [
        "vs code", "intellij", "pycharm", "eclipse", "sublime",
        "postman", "insomnia", "swagger",
        "figma", "sketch", "adobe xd", "photoshop", "illustrator",
        "slack", "teams", "zoom", "meet",
        "excel", "word", "powerpoint", "google sheets",
        "linux", "ubuntu", "centos", "windows", "macos"
    ]
    
    def extract(self, job_description: str) -> Dict[str, Any]:
        """Extract structured data from job description"""
        text = job_description.lower()
        
        return {
            "skills": self._extract_skills(text),
            "tools": self._extract_tools(text),
            "experience_years": self._extract_experience_years(job_description),
            "education_level": self._extract_education_level(text),
            "location": self._extract_location(job_description),
            "visa_sponsorship": self._detect_visa_sponsorship(text),
            "employment_type": self._detect_employment_type(text),
            "salary_range": self._extract_salary_range(job_description)
        }
    
    def _extract_skills(self, text: str) -> List[str]:
        """Extract required skills"""
        found_skills = []
        for skill in self.COMMON_SKILLS:
            if skill.lower() in text:
                found_skills.append(skill)
        return found_skills
    
    def _extract_tools(self, text: str) -> List[str]:
        """Extract required tools"""
        found_tools = []
        for tool in self.COMMON_TOOLS:
            if tool.lower() in text:
                found_tools.append(tool)
        return found_tools
    
    def _extract_experience_years(self, text: str) -> int:
        """Extract required years of experience"""
        patterns = [
            r'(\d+)\+?\s*years?\s*(?:of\s*)?experience',
            r'(\d+)\+?\s*yrs?\s*(?:of\s*)?experience',
            r'experience[:\s]+(\d+)\+?\s*years?',
            r'minimum\s*(?:of\s*)?(\d+)\+?\s*years?'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return int(match.group(1))
        
        return 0
    
    def _extract_education_level(self, text: str) -> str:
        """Extract required education level"""
        patterns = [
            (r'bachelor[\'s]*\s*(?:degree|of|in)', "Bachelor's Degree"),
            (r'master[\'s]*\s*(?:degree|of|in)', "Master's Degree"),
            (r'phd|doctorate|doctoral', "PhD"),
            (r'associate[\'s]*\s*(?:degree|of)', "Associate's Degree"),
            (r'high\s*school|ged', "High School")
        ]
        
        for pattern, level in patterns:
            if re.search(pattern, text, re.IGNORECASE):
                return level
        
        return ""
    
    def _extract_location(self, text: str) -> str:
        """Extract job location"""
        # Look for location patterns
        patterns = [
            r'location[:\s]+([^\n]+)',
            r'(?:based\s*in|located\s*in)[:\s]+([^\n]+)',
            r'remote\s*(?:in|from)?[:\s]*([^\n]+)?',
            r'on[-\s]?site[:\s]+([^\n]+)'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                location = match.group(1) if match.group(1) else match.group(0)
                return location.strip()[:100]
        
        return ""
    
    def _detect_visa_sponsorship(self, text: str) -> bool:
        """Detect if visa sponsorship is offered"""
        positive_patterns = [
            r'visa\s*sponsorship',
            r'sponsor\s*visa',
            r'work\s*permit',
            r'h1b',
            r'work\s*authorization\s*(?:assistance|provided)',
            r'relocation\s*assistance'
        ]
        
        negative_patterns = [
            r'no\s*visa\s*sponsorship',
            r'no\s*sponsorship',
            r'authorized\s*to\s*work',
            r'work\s*authorization\s*required'
        ]
        
        for pattern in negative_patterns:
            if re.search(pattern, text, re.IGNORECASE):
                return False
        
        for pattern in positive_patterns:
            if re.search(pattern, text, re.IGNORECASE):
                return True
        
        return False
    
    def _detect_employment_type(self, text: str) -> str:
        """Detect employment type"""
        types = [
            (r'full[-\s]?time', "Full-time"),
            (r'part[-\s]?time', "Part-time"),
            (r'contract(?:or)?', "Contract"),
            (r'freelance', "Freelance"),
            (r'internship', "Internship"),
            (r'permanent', "Permanent"),
            (r'temporary', "Temporary")
        ]
        
        for pattern, emp_type in types:
            if re.search(pattern, text, re.IGNORECASE):
                return emp_type
        
        return "Full-time"
    
    def _extract_salary_range(self, text: str) -> Dict[str, Any]:
        """Extract salary range"""
        patterns = [
            r'\$?(\d{2,3}[kK])\s*[-–]\s*\$?(\d{2,3}[kK])',
            r'\$?(\d{3},?\d{3})\s*[-–]\s*\$?(\d{3},?\d{3})',
            r'salary[:\s]+\$?(\d[\d,]*)\s*[-–]?\s*\$?(\d[\d,]*)?'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                min_sal = match.group(1)
                max_sal = match.group(2) if match.group(2) else min_sal
                
                # Convert K to thousands
                if 'k' in min_sal.lower():
                    min_sal = float(min_sal.lower().replace('k', '')) * 1000
                else:
                    min_sal = float(min_sal.replace(',', ''))
                
                if 'k' in max_sal.lower():
                    max_sal = float(max_sal.lower().replace('k', '')) * 1000
                else:
                    max_sal = float(max_sal.replace(',', ''))
                
                return {
                    "min": int(min_sal),
                    "max": int(max_sal),
                    "currency": "USD"
                }
        
        return {"min": None, "max": None, "currency": "USD"}

<?php

namespace App\Services;

use App\Models\Resume;
use Barryvdh\DomPDF\Facade\Pdf;

class PdfService
{
    /**
     * Generate PDF from resume
     */
    public function generateResumePdf(Resume $resume)
    {
        $template = $resume->template;
        
        // Prepare data for template
        $data = $this->prepareResumeData($resume);
        
        // Render HTML from template
        $html = $template->render($data);
        
        // Generate PDF
        $pdf = Pdf::loadHTML($html);
        $pdf->setPaper('a4');
        
        return $pdf;
    }

    /**
     * Prepare resume data for PDF rendering
     */
    private function prepareResumeData(Resume $resume): array
    {
        $data = [];
        
        // Personal info
        $personalInfo = $resume->personal_info ?? [];
        $data['name'] = $personalInfo['name'] ?? auth()->user()->name ?? '';
        $data['email'] = $personalInfo['email'] ?? auth()->user()->email ?? '';
        $data['phone'] = $personalInfo['phone'] ?? '';
        $data['location'] = $personalInfo['location'] ?? '';
        $data['linkedin'] = $personalInfo['linkedin'] ?? '';
        $data['website'] = $personalInfo['website'] ?? '';
        $data['portfolio'] = $personalInfo['portfolio'] ?? '';
        
        // Summary
        $data['summary'] = $resume->summary ?? '';
        
        // Experience
        $data['experience'] = $this->formatExperience($resume->experience ?? []);
        
        // Education
        $data['education'] = $this->formatEducation($resume->education ?? []);
        
        // Skills
        $data['skills'] = $resume->skills ?? [];
        $data['skills_text'] = implode(', ', $resume->skills ?? []);
        
        // Certifications
        $data['certifications'] = $this->formatCertifications($resume->certifications ?? []);
        
        // Projects
        $data['projects'] = $this->formatProjects($resume->projects ?? []);
        
        // Languages
        $data['languages'] = $this->formatLanguages($resume->languages ?? []);
        
        return $data;
    }

    /**
     * Format experience data
     */
    private function formatExperience(array $experience): array
    {
        $formatted = [];
        
        foreach ($experience as $exp) {
            $formatted[] = [
                'title' => $exp['title'] ?? '',
                'company' => $exp['company'] ?? '',
                'location' => $exp['location'] ?? '',
                'start_date' => $this->formatDate($exp['start_date'] ?? null),
                'end_date' => $exp['end_date'] === 'present' ? 'Present' : $this->formatDate($exp['end_date'] ?? null),
                'duration' => $this->calculateDuration($exp['start_date'] ?? null, $exp['end_date'] ?? null),
                'bullets' => $exp['bullets'] ?? [],
                'description' => $exp['description'] ?? '',
            ];
        }
        
        return $formatted;
    }

    /**
     * Format education data
     */
    private function formatEducation(array $education): array
    {
        $formatted = [];
        
        foreach ($education as $edu) {
            $formatted[] = [
                'degree' => $edu['degree'] ?? '',
                'institution' => $edu['institution'] ?? '',
                'location' => $edu['location'] ?? '',
                'start_year' => $edu['start_year'] ?? '',
                'end_year' => $edu['end_year'] ?? '',
                'gpa' => $edu['gpa'] ?? '',
                'field_of_study' => $edu['field_of_study'] ?? '',
            ];
        }
        
        return $formatted;
    }

    /**
     * Format certifications data
     */
    private function formatCertifications(array $certifications): array
    {
        $formatted = [];
        
        foreach ($certifications as $cert) {
            $formatted[] = [
                'name' => $cert['name'] ?? '',
                'issuing_organization' => $cert['issuing_organization'] ?? '',
                'issue_date' => $this->formatDate($cert['issue_date'] ?? null),
                'expiry_date' => $this->formatDate($cert['expiry_date'] ?? null),
                'credential_id' => $cert['credential_id'] ?? '',
            ];
        }
        
        return $formatted;
    }

    /**
     * Format projects data
     */
    private function formatProjects(array $projects): array
    {
        $formatted = [];
        
        foreach ($projects as $project) {
            $formatted[] = [
                'name' => $project['name'] ?? '',
                'description' => $project['description'] ?? '',
                'technologies' => $project['technologies'] ?? [],
                'link' => $project['link'] ?? '',
                'start_date' => $this->formatDate($project['start_date'] ?? null),
                'end_date' => $project['end_date'] === 'present' ? 'Present' : $this->formatDate($project['end_date'] ?? null),
            ];
        }
        
        return $formatted;
    }

    /**
     * Format languages data
     */
    private function formatLanguages(array $languages): array
    {
        $formatted = [];
        
        foreach ($languages as $lang) {
            $formatted[] = [
                'language' => $lang['language'] ?? '',
                'proficiency' => $lang['proficiency'] ?? '',
            ];
        }
        
        return $formatted;
    }

    /**
     * Format date
     */
    private function formatDate(?string $date): string
    {
        if (!$date) {
            return '';
        }
        
        try {
            return date('M Y', strtotime($date));
        } catch (\Exception $e) {
            return $date;
        }
    }

    /**
     * Calculate duration between dates
     */
    private function calculateDuration(?string $startDate, ?string $endDate): string
    {
        if (!$startDate) {
            return '';
        }
        
        $start = strtotime($startDate);
        $end = $endDate === 'present' ? time() : strtotime($endDate);
        
        if (!$start || !$end) {
            return '';
        }
        
        $diff = $end - $start;
        $years = floor($diff / (365 * 24 * 60 * 60));
        $months = floor(($diff % (365 * 24 * 60 * 60)) / (30 * 24 * 60 * 60));
        
        $parts = [];
        if ($years > 0) {
            $parts[] = $years . ' ' . ($years == 1 ? 'year' : 'years');
        }
        if ($months > 0) {
            $parts[] = $months . ' ' . ($months == 1 ? 'month' : 'months');
        }
        
        return implode(', ', $parts);
    }
}

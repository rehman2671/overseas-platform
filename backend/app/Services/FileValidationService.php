<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class FileValidationService
{
    /**
     * Allowed file types and their MIME types
     */
    private const ALLOWED_EXTENSIONS = ['pdf', 'docx', 'doc'];
    private const ALLOWED_MIME_TYPES = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
    ];

    /**
     * Maximum file size in bytes (10MB)
     */
    private const MAX_FILE_SIZE = 10 * 1024 * 1024;

    /**
     * Validate uploaded file
     *
     * @param UploadedFile $file
     * @return array ['valid' => bool, 'error' => string|null]
     */
    public function validate(UploadedFile $file): array
    {
        // Check file exists
        if (!$file->isValid()) {
            return [
                'valid' => false,
                'error' => 'Invalid file upload'
            ];
        }

        // Check file extension
        if (!$this->validateExtension($file)) {
            return [
                'valid' => false,
                'error' => 'Only PDF and DOCX files are allowed'
            ];
        }

        // Check MIME type
        if (!$this->validateMimeType($file)) {
            return [
                'valid' => false,
                'error' => 'Invalid file type. Only PDF and DOCX files are allowed'
            ];
        }

        // Check file size
        if (!$this->validateFileSize($file)) {
            return [
                'valid' => false,
                'error' => 'File size exceeds 10MB limit'
            ];
        }

        // Check for malicious content
        if (!$this->isSafeFile($file)) {
            return [
                'valid' => false,
                'error' => 'File appears to contain malicious content'
            ];
        }

        return [
            'valid' => true,
            'error' => null
        ];
    }

    /**
     * Validate file extension
     */
    private function validateExtension(UploadedFile $file): bool
    {
        $extension = strtolower($file->getClientOriginalExtension());
        return in_array($extension, self::ALLOWED_EXTENSIONS);
    }

    /**
     * Validate MIME type
     */
    private function validateMimeType(UploadedFile $file): bool
    {
        $mimeType = $file->getMimeType();
        return in_array($mimeType, self::ALLOWED_MIME_TYPES);
    }

    /**
     * Validate file size
     */
    private function validateFileSize(UploadedFile $file): bool
    {
        return $file->getSize() <= self::MAX_FILE_SIZE;
    }

    /**
     * Check if file is safe (basic checks)
     */
    private function isSafeFile(UploadedFile $file): bool
    {
        // Additional safety checks can be added here
        // For example: ClamAV antivirus scanning
        
        // Basic check: ensure file is actually a document
        $realPath = $file->getRealPath();
        if (!$realPath || !is_readable($realPath)) {
            return false;
        }

        // You can add ClamAV integration here in the future
        // $av = new ClamAV\Scanner();
        // return !$av->isInfected($realPath);

        return true;
    }

    /**
     * Store file securely with random name
     *
     * @param UploadedFile $file
     * @param string $userId
     * @return string Path to stored file
     */
    public function storeFile(UploadedFile $file, string $userId): string
    {
        // Generate random filename to prevent path traversal
        $filename = Str::random(32) . '.' . $file->getClientOriginalExtension();
        
        // Store in user directory
        $path = "resumes/{$userId}";
        $storagePath = $file->storeAs($path, $filename, 'local');

        return $storagePath;
    }

    /**
     * Get temporary file path for processing
     * 
     * @param UploadedFile $file
     * @return string
     */
    public function getTempPath(UploadedFile $file): string
    {
        return $file->getRealPath();
    }

    /**
     * Delete file securely
     *
     * @param string $path
     * @return bool
     */
    public function deleteFile(string $path): bool
    {
        try {
            if (Storage::disk('local')->exists($path)) {
                return Storage::disk('local')->delete($path);
            }
            return true;
        } catch (\Exception $e) {
            return false;
        }
    }
}

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Job Alert - {{ $alert->frequency }} Update</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; }
        .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .job-card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; margin: 15px 0; background-color: #f9fafb; }
        .job-title { font-size: 18px; font-weight: bold; color: #1f2937; margin-bottom: 5px; }
        .job-company { color: #6b7280; font-weight: 500; margin-bottom: 5px; }
        .job-details { color: #4b5563; font-size: 14px; margin-bottom: 10px; }
        .job-salary { color: #059669; font-weight: 600; margin-bottom: 5px; }
        .apply-button { display: inline-block; background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px; }
        .footer { background-color: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 12px; border-top: 1px solid #e5e7eb; }
        .alert-info { background-color: #eff6ff; border-left: 4px solid #2563eb; padding: 15px; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 New Job Opportunities</h1>
            <p>Your {{ ucfirst($alert->frequency) }} Job Alert</p>
        </div>

        <div class="content">
            <p>Hello {{ $user->name }},</p>

            <p>We've found <strong>{{ $jobs->count() }}</strong> new job opportunities that match your criteria:</p>

            <div class="alert-info">
                <strong>Your Alert Preferences:</strong><br>
                @if($alert->keywords) Keywords: {{ $alert->keywords }}<br>@endif
                @if($alert->country) Country: {{ $alert->country }}<br>@endif
                @if($alert->job_type) Job Type: {{ $alert->job_type }}<br>@endif
                @if($alert->experience_level) Experience: {{ $alert->experience_level }}<br>@endif
                @if($alert->salary_min) Minimum Salary: ${{ number_format($alert->salary_min) }}<br>@endif
            </div>

            @foreach($jobs as $job)
            <div class="job-card">
                <div class="job-title">{{ $job->title }}</div>
                <div class="job-company">{{ $job->company_name }}</div>
                <div class="job-details">
                    📍 {{ $job->location }}, {{ $job->country }}<br>
                    💼 {{ $job->job_type }} • {{ $job->experience_level }}<br>
                    @if($job->salary_min && $job->salary_max)
                        💰 ${{ number_format($job->salary_min) }} - ${{ number_format($job->salary_max) }}
                    @elseif($job->salary_min)
                        💰 From ${{ number_format($job->salary_min) }}
                    @elseif($job->salary_max)
                        💰 Up to ${{ number_format($job->salary_max) }}
                    @endif
                </div>
                <a href="{{ config('app.url') }}/jobs/{{ $job->slug }}" class="apply-button">View & Apply</a>
            </div>
            @endforeach

            <p>If you'd like to update your alert preferences or pause these notifications, you can manage your alerts in your <a href="{{ config('app.url') }}/dashboard">dashboard</a>.</p>

            <p>Best regards,<br>The OverseasJob.in Team</p>
        </div>

        <div class="footer">
            <p>
                You're receiving this email because you subscribed to job alerts on OverseasJob.in.<br>
                <a href="{{ config('app.url') }}/unsubscribe?email={{ urlencode($user->email) }}">Unsubscribe</a> |
                <a href="{{ config('app.url') }}/privacy">Privacy Policy</a>
            </p>
        </div>
    </div>
</body>
</html>
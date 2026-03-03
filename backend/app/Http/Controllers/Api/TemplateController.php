<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Template;
use Illuminate\Http\Request;

class TemplateController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        
        $query = Template::active()->ordered();

        // Filter by category
        if ($request->has('category')) {
            $query->byCategory($request->category);
        }

        $templates = $query->get();

        // Add access info for each template
        foreach ($templates as $template) {
            $template->has_access = $user ? $user->canAccessTemplate($template->category) : $template->isFree();
        }

        return response()->json([
            'success' => true,
            'data' => $templates
        ]);
    }

    public function show($id)
    {
        $user = auth()->user();
        
        $template = Template::active()->findOrFail($id);
        $template->has_access = $user ? $user->canAccessTemplate($template->category) : $template->isFree();

        return response()->json([
            'success' => true,
            'data' => $template
        ]);
    }

    public function preview($id)
    {
        $template = Template::active()->findOrFail($id);

        // Sample data for preview
        $sampleData = [
            'name' => 'John Doe',
            'email' => 'john.doe@example.com',
            'phone' => '+1 234 567 8900',
            'location' => 'New York, USA',
            'summary' => 'Experienced software developer with 5+ years in full-stack development.',
            'experience' => [
                [
                    'title' => 'Senior Developer',
                    'company' => 'Tech Corp',
                    'duration' => '2020 - Present',
                    'bullets' => ['Led team of 5 developers', 'Increased performance by 40%']
                ]
            ],
            'education' => [
                [
                    'degree' => 'B.S. Computer Science',
                    'institution' => 'University Name',
                    'year' => '2018'
                ]
            ],
            'skills' => ['PHP', 'Laravel', 'JavaScript', 'React', 'MySQL'],
        ];

        $html = $template->render($sampleData);

        return response()->json([
            'success' => true,
            'data' => [
                'template' => $template,
                'preview_html' => $html,
            ]
        ]);
    }

    public function categories()
    {
        $user = auth()->user();
        
        $categories = [
            [
                'name' => 'free',
                'label' => 'Free Templates',
                'description' => 'Basic templates for getting started',
                'count' => Template::active()->free()->count(),
                'has_access' => true,
            ],
            [
                'name' => 'pro',
                'label' => 'Pro Templates',
                'description' => 'Professional templates for serious job seekers',
                'count' => Template::active()->pro()->count(),
                'has_access' => $user && in_array($user->plan_type, ['pro', 'premium']),
            ],
            [
                'name' => 'premium',
                'label' => 'Premium Templates',
                'description' => 'Executive-level templates for premium users',
                'count' => Template::active()->premium()->count(),
                'has_access' => $user && $user->plan_type === 'premium',
            ],
        ];

        return response()->json([
            'success' => true,
            'data' => $categories
        ]);
    }
}

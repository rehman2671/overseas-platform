<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Template;

class ResumeTest extends TestCase
{
    use RefreshDatabase;

    protected $user;
    protected $token;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        $this->token = auth()->login($this->user);
        
        // Create default template
        Template::create([
            'name' => 'Basic ATS',
            'slug' => 'basic-ats',
            'category' => 'free',
            'html_structure' => '<div>{{name}}</div>',
            'css_styles' => 'body { font-family: Arial; }',
        ]);
    }

    public function test_user_can_create_resume()
    {
        $template = Template::first();

        $response = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->postJson('/api/resumes', [
                'title' => 'My Resume',
                'template_id' => $template->id,
                'sections_json' => json_encode([
                    'personal_info' => [
                        'name' => 'John Doe',
                        'email' => 'john@example.com',
                    ],
                ]),
                'personal_info' => [
                    'name' => 'John Doe',
                    'email' => 'john@example.com',
                ],
                'skills' => ['PHP', 'Laravel', 'React'],
            ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'id',
                    'title',
                    'ats_score',
                ]
            ]);

        $this->assertDatabaseHas('resumes', [
            'user_id' => $this->user->id,
            'title' => 'My Resume',
        ]);
    }

    public function test_user_can_list_resumes()
    {
        $response = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->getJson('/api/resumes');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data'
            ]);
    }

    public function test_user_can_delete_resume()
    {
        $template = Template::first();
        $resume = $this->user->resumes()->create([
            'template_id' => $template->id,
            'title' => 'Test Resume',
            'slug' => 'test-resume',
            'sections_json' => [],
        ]);

        $response = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->deleteJson("/api/resumes/{$resume->id}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Resume deleted successfully'
            ]);
    }
}

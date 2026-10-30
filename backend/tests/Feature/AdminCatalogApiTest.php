<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AdminCatalogApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed([RoleSeeder::class, PermissionSeeder::class]);
    }

    public function test_admin_can_create_update_and_delete_a_category(): void
    {
        Storage::fake('public');
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $created = $this->actingAs($admin, 'sanctum')
            ->post('/api/admin/categories', [
                'name' => 'Home goods',
                'description' => 'Objects for the home.',
                'active' => 'false',
                'image' => UploadedFile::fake()->image('home-goods.png'),
            ])
            ->assertCreated()
            ->assertJsonPath('data.slug', 'home-goods')
            ->assertJsonPath('data.active', false);

        $this->assertNotEmpty($created->json('data.image_url'));
        $categoryId = $created->json('data.id');
        $imagePath = Category::query()->findOrFail($categoryId)->image_path;
        Storage::disk('public')->assertExists($imagePath);

        $this->post("/api/admin/categories/{$categoryId}", [
            '_method' => 'PUT',
            'name' => 'Home & living',
            'description' => 'Thoughtful home objects.',
            'active' => 'true',
            'image' => UploadedFile::fake()->image('home-living.png'),
        ])->assertOk()
            ->assertJsonPath('data.active', true);

        $updatedImagePath = Category::query()->findOrFail($categoryId)->image_path;
        $this->assertNotSame($imagePath, $updatedImagePath);
        Storage::disk('public')->assertMissing($imagePath);
        Storage::disk('public')->assertExists($updatedImagePath);

        $this->deleteJson("/api/admin/categories/{$categoryId}")
            ->assertOk();

        $this->assertDatabaseMissing('categories', ['id' => $categoryId]);
        Storage::disk('public')->assertMissing($updatedImagePath);
    }

    public function test_admin_can_create_and_manage_customer_accounts(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $created = $this->actingAs($admin, 'sanctum')
            ->postJson('/api/admin/users', [
                'name' => 'New customer',
                'email' => 'new-customer@example.com',
                'password' => 'secure-password',
                'password_confirmation' => 'secure-password',
                'role' => 'user',
            ])
            ->assertCreated()
            ->assertJsonPath('data.role', 'user');

        $userId = $created->json('data.id');

        $this->putJson("/api/admin/users/{$userId}", [
            'active' => false,
        ])->assertOk()
            ->assertJsonPath('data.active', false);

        $this->deleteJson("/api/admin/users/{$userId}")
            ->assertOk();

        $this->assertDatabaseMissing('users', ['id' => $userId]);
    }

    public function test_admin_cannot_assign_the_super_admin_role(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $this->actingAs($admin, 'sanctum')
            ->postJson('/api/admin/users', [
                'name' => 'Escalated user',
                'email' => 'escalated@example.com',
                'password' => 'secure-password',
                'password_confirmation' => 'secure-password',
                'role' => 'super-admin',
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('role');
    }
}

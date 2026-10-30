<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApiAuthenticationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed([RoleSeeder::class, PermissionSeeder::class]);
    }

    public function test_customer_can_register_and_sign_in_with_a_sanctum_token(): void
    {
        $this->postJson('/api/auth/register', [
            'name' => 'A Customer',
            'email' => 'customer@example.com',
            'password' => 'secure-password',
            'password_confirmation' => 'secure-password',
        ])->assertCreated()
            ->assertJsonPath('user.role', 'user');

        $login = $this->postJson('/api/auth/login', [
            'email' => 'customer@example.com',
            'password' => 'secure-password',
        ])->assertOk()
            ->assertJsonStructure(['token', 'user' => ['id', 'name', 'email', 'role']]);

        $this->withToken($login->json('token'))
            ->getJson('/api/auth/user')
            ->assertOk()
            ->assertJsonPath('data.role', 'user');
    }

    public function test_incorrect_password_is_rejected(): void
    {
        User::factory()->create([
            'email' => 'customer@example.com',
            'password' => 'secure-password',
        ]);

        $this->postJson('/api/auth/login', [
            'email' => 'customer@example.com',
            'password' => 'incorrect-password',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('email');
    }

    public function test_inactive_accounts_cannot_sign_in(): void
    {
        User::factory()->create([
            'email' => 'disabled@example.com',
            'password' => 'secure-password',
            'is_active' => false,
        ]);

        $this->postJson('/api/auth/login', [
            'email' => 'disabled@example.com',
            'password' => 'secure-password',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('email');
    }

    public function test_authenticated_user_can_revoke_the_current_token(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $this->withToken($token)->postJson('/api/auth/logout')->assertOk();
        $this->assertDatabaseCount('personal_access_tokens', 0);
    }
}

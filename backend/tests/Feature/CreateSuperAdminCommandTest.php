<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class CreateSuperAdminCommandTest extends TestCase
{
    use RefreshDatabase;

    public function test_command_creates_a_super_admin_with_a_hashed_password(): void
    {
        $this->seed(RoleSeeder::class);

        $this->artisan('shopvista:admin', [
            '--name' => 'Store Owner',
            '--email' => 'owner@example.com',
        ])
            ->expectsQuestion('Password (minimum 12 characters)', 'correct-horse-battery')
            ->expectsQuestion('Confirm password', 'correct-horse-battery')
            ->expectsOutputToContain('Super admin account is ready for owner@example.com.')
            ->assertExitCode(0);

        $user = User::query()->where('email', 'owner@example.com')->firstOrFail();

        $this->assertTrue($user->hasRole('super-admin'));
        $this->assertTrue(Hash::check('correct-horse-battery', $user->password));
        $this->assertTrue($user->is_active);
    }
}

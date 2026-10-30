<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Spatie\Permission\Models\Role;

class CreateSuperAdmin extends Command
{
    protected $signature = 'shopvista:admin {--name=} {--email=}';

    protected $description = 'Create or update a Shopvista super-admin account';

    public function handle(): int
    {
        $name = $this->option('name') ?: $this->ask('Super admin name');
        $email = $this->option('email') ?: $this->ask('Super admin email');

        $validator = Validator::make(
            ['name' => $name, 'email' => $email],
            ['name' => ['required', 'string', 'max:120'], 'email' => ['required', 'email', 'max:255']],
        );

        if ($validator->fails()) {
            $this->components->error($validator->errors()->first());

            return self::FAILURE;
        }

        if (! Role::query()->where('name', 'super-admin')->where('guard_name', 'web')->exists()) {
            $this->components->error('Roles are not seeded. Run php artisan db:seed first.');

            return self::FAILURE;
        }

        $password = $this->secret('Password (minimum 12 characters)');
        $passwordConfirmation = $this->secret('Confirm password');

        $passwordValidator = Validator::make(
            ['password' => $password, 'password_confirmation' => $passwordConfirmation],
            ['password' => ['required', 'string', 'min:12', 'confirmed']],
        );

        if ($passwordValidator->fails()) {
            $this->components->error($passwordValidator->errors()->first());

            return self::FAILURE;
        }

        DB::transaction(function () use ($name, $email, $password): void {
            $user = User::updateOrCreate(
                ['email' => $email],
                [
                    'name' => $name,
                    'password' => Hash::make($password),
                    'email_verified_at' => now(),
                    'is_active' => true,
                ],
            );
            $user->syncRoles('super-admin');
        });

        $this->components->info("Super admin account is ready for {$email}.");

        return self::SUCCESS;
    }
}

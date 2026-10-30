<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $permissions = [
            'products.view',
            'products.manage',
            'categories.manage',
            'users.view',
            'users.manage',
            'roles.manage',
        ];

        $registrar = app(PermissionRegistrar::class);
        $registrar->forgetCachedPermissions();

        try {
            DB::transaction(function () use ($permissions): void {
                foreach (['user', 'admin', 'super-admin'] as $roleName) {
                    Role::query()->firstOrCreate([
                        'name' => $roleName,
                        'guard_name' => 'web',
                    ]);
                }

                $permissionModels = [];
                foreach ($permissions as $permissionName) {
                    $permissionModels[$permissionName] = Permission::query()->firstOrCreate([
                        'name' => $permissionName,
                        'guard_name' => 'web',
                    ]);
                }

                $rolePermissions = [
                    'user' => ['products.view'],
                    'admin' => [
                        'products.view',
                        'products.manage',
                        'categories.manage',
                        'users.view',
                        'users.manage',
                    ],
                    'super-admin' => $permissions,
                ];

                foreach ($rolePermissions as $roleName => $permissionNames) {
                    $role = Role::query()
                        ->where('name', $roleName)
                        ->where('guard_name', 'web')
                        ->firstOrFail();

                    $role->syncPermissions(array_map(
                        static fn (string $permissionName) => $permissionModels[$permissionName],
                        $permissionNames,
                    ));
                }
            });
        } finally {
            $registrar->forgetCachedPermissions();
        }
    }
}

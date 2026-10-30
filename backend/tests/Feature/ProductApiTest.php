<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class ProductApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed([RoleSeeder::class, PermissionSeeder::class]);
    }

    public function test_role_and_permission_seeders_are_repeatable_and_keep_the_user_role_permissions(): void
    {
        $this->seed([RoleSeeder::class, PermissionSeeder::class, PermissionSeeder::class]);

        $this->assertDatabaseHas('roles', ['name' => 'user', 'guard_name' => 'web']);
        $this->assertDatabaseHas('permissions', ['name' => 'products.view', 'guard_name' => 'web']);

        $userRole = Role::findByName('user', 'web');
        $this->assertTrue($userRole->hasPermissionTo('products.view'));
        $this->assertFalse($userRole->hasPermissionTo('products.manage'));
    }

    public function test_storefront_only_lists_published_products(): void
    {
        Product::create([
            'name' => 'Published mug',
            'slug' => 'published-mug',
            'price' => 24,
            'is_published' => true,
        ]);
        Product::create([
            'name' => 'Draft mug',
            'slug' => 'draft-mug',
            'price' => 18,
            'is_published' => false,
        ]);

        $this->getJson('/api/products')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'Published mug');
    }

    public function test_customer_cannot_manage_products(): void
    {
        $customer = User::factory()->create();
        $customer->assignRole('user');

        $this->actingAs($customer, 'sanctum')
            ->postJson('/api/admin/products', [
                'name' => 'Forbidden product',
                'category' => 'Home',
                'price' => 12,
                'published' => true,
            ])
            ->assertForbidden();
    }

    public function test_admin_can_create_and_publish_product(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $this->actingAs($admin, 'sanctum')
            ->postJson('/api/admin/products', [
                'name' => 'Handmade bowl',
                'category' => 'Home & living',
                'price' => 45.5,
                'description' => 'A handmade stoneware bowl.',
                'published' => true,
                'featured' => true,
            ])
            ->assertCreated()
            ->assertJsonPath('data.name', 'Handmade bowl')
            ->assertJsonPath('data.published', true)
            ->assertJsonPath('data.featured', true);

        $this->assertDatabaseHas('products', [
            'name' => 'Handmade bowl',
            'slug' => 'handmade-bowl',
            'is_published' => true,
        ]);
    }

    public function test_unpublished_product_cannot_be_fetched_from_public_endpoint(): void
    {
        $product = Product::create([
            'name' => 'Private preview',
            'slug' => 'private-preview',
            'price' => 11,
            'is_published' => false,
        ]);

        $this->getJson("/api/products/{$product->id}")->assertNotFound();
    }
}

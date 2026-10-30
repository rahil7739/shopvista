<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $products = Product::query()
            ->with('category')
            ->when(! $request->routeIs('admin.products.index'), function ($query): void {
                $query->where('is_published', true)
                    ->where(function ($query): void {
                        $query->whereNull('category_id')
                            ->orWhereHas('category', fn ($categoryQuery) => $categoryQuery->where('is_active', true));
                    });
            })
            ->when($request->boolean('featured'), fn ($query) => $query->where('is_featured', true))
            ->orderByDesc('is_featured')
            ->orderByDesc('created_at')
            ->paginate(min(max($request->integer('per_page', 100), 1), 100));

        return ProductResource::collection($products);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate($this->rules());

        $product = DB::transaction(function () use ($request, $validated): Product {
            $category = $this->resolveCategory($validated['category']);
            $product = Product::create([
                'category_id' => $category->id,
                'name' => $validated['name'],
                'slug' => $this->uniqueSlug($validated['name']),
                'description' => $validated['description'] ?? null,
                'price' => $validated['price'],
                'image_url' => $validated['image_url'] ?? null,
                'art_style' => $validated['art_style'] ?? 'ceramic',
                'is_published' => $validated['published'] ?? false,
                'is_featured' => $validated['featured'] ?? false,
            ]);

            if ($request->hasFile('image')) {
                $product->image_path = $request->file('image')->store('products', 'public');
                $product->image_url = null;
                $product->save();
            }

            return $product;
        });

        return (new ProductResource($product->load('category')))
            ->response()
            ->setStatusCode(201);
    }

    public function showPublic(Product $product): ProductResource
    {
        abort_unless($product->is_published, 404);
        abort_if($product->category && ! $product->category->is_active, 404);

        return new ProductResource($product->load('category'));
    }

    public function show(Product $product): ProductResource
    {
        return new ProductResource($product->load('category'));
    }

    public function update(Request $request, Product $product): ProductResource
    {
        $validated = $request->validate($this->rules($product));

        DB::transaction(function () use ($request, $validated, $product): void {
            $category = $this->resolveCategory($validated['category']);
            $product->fill([
                'category_id' => $category->id,
                'name' => $validated['name'],
                'slug' => $product->name === $validated['name']
                    ? $product->slug
                    : $this->uniqueSlug($validated['name'], $product->id),
                'description' => $validated['description'] ?? null,
                'price' => $validated['price'],
                'image_url' => $validated['image_url'] ?? null,
                'art_style' => $validated['art_style'] ?? 'ceramic',
                'is_published' => $validated['published'] ?? false,
                'is_featured' => $validated['featured'] ?? false,
            ]);

            if ($request->hasFile('image')) {
                if ($product->image_path) {
                    Storage::disk('public')->delete($product->image_path);
                }

                $product->image_path = $request->file('image')->store('products', 'public');
                $product->image_url = null;
            } elseif (array_key_exists('image_url', $validated) && $product->image_path) {
                Storage::disk('public')->delete($product->image_path);
                $product->image_path = null;
            }

            $product->save();
        });

        return new ProductResource($product->refresh()->load('category'));
    }

    public function destroy(Product $product): JsonResponse
    {
        if ($product->image_path) {
            Storage::disk('public')->delete($product->image_path);
        }

        $product->delete();

        return response()->json(['message' => 'Product deleted successfully.']);
    }

    private function rules(?Product $product = null): array
    {
        return [
            'name' => ['required', 'string', 'max:180'],
            'category' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:5000'],
            'price' => ['required', 'numeric', 'min:0', 'max:99999999.99'],
            'image_url' => ['nullable', 'url:http,https', 'max:2048'],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'art_style' => ['nullable', Rule::in(['tote', 'headphones', 'ceramic'])],
            'published' => ['sometimes', 'boolean'],
            'featured' => ['sometimes', 'boolean'],
        ];
    }

    private function resolveCategory(string $name): Category
    {
        $slug = Str::slug($name);

        return Category::firstOrCreate(
            ['slug' => $slug],
            ['name' => $name, 'is_active' => true],
        );
    }

    private function uniqueSlug(string $name, ?int $ignoreId = null): string
    {
        $baseSlug = Str::slug($name);
        $slug = $baseSlug;
        $suffix = 2;

        while (Product::query()
            ->where('slug', $slug)
            ->when($ignoreId, fn ($query) => $query->whereKeyNot($ignoreId))
            ->exists()) {
            $slug = "{$baseSlug}-{$suffix}";
            $suffix++;
        }

        return $slug;
    }
}

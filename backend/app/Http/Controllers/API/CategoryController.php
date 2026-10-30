<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        $categories = Category::query()
            ->withCount('products')
            ->when(! $request->routeIs('admin.categories.index'), fn ($query) => $query->where('is_active', true))
            ->orderBy('name')
            ->get();

        return CategoryResource::collection($categories);
    }

    public function store(Request $request): JsonResponse
    {
        $this->normalizeBooleanInput($request, 'active');

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100', 'unique:categories,name'],
            'description' => ['nullable', 'string', 'max:2000'],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'active' => ['sometimes', 'boolean'],
        ]);

        $category = Category::create([
            'name' => $validated['name'],
            'slug' => $this->uniqueSlug($validated['name']),
            'description' => $validated['description'] ?? null,
            'is_active' => $validated['active'] ?? true,
        ]);

        if ($request->hasFile('image')) {
            $category->image_path = $request->file('image')->store('categories', 'public');
            $category->save();
        }

        return (new CategoryResource($category->loadCount('products')))
            ->response()
            ->setStatusCode(201);
    }

    public function update(Request $request, Category $category): CategoryResource
    {
        $this->normalizeBooleanInput($request, 'active');

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100', Rule::unique('categories', 'name')->ignore($category->id)],
            'description' => ['nullable', 'string', 'max:2000'],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'active' => ['sometimes', 'boolean'],
        ]);

        $oldImagePath = $category->image_path;
        $category->update([
            'name' => $validated['name'],
            'slug' => $category->name === $validated['name']
                ? $category->slug
                : $this->uniqueSlug($validated['name'], $category->id),
            'description' => $validated['description'] ?? null,
            'is_active' => $validated['active'] ?? $category->is_active,
        ]);

        if ($request->hasFile('image')) {
            $category->image_path = $request->file('image')->store('categories', 'public');
            $category->save();

            if ($oldImagePath) {
                Storage::disk('public')->delete($oldImagePath);
            }
        }

        return new CategoryResource($category->loadCount('products'));
    }

    public function destroy(Category $category): JsonResponse
    {
        if ($category->image_path) {
            Storage::disk('public')->delete($category->image_path);
        }

        $category->delete();

        return response()->json(['message' => 'Category deleted successfully.']);
    }

    private function uniqueSlug(string $name, ?int $ignoreId = null): string
    {
        $baseSlug = Str::slug($name);
        $slug = $baseSlug;
        $suffix = 2;

        while (Category::query()
            ->where('slug', $slug)
            ->when($ignoreId, fn ($query) => $query->whereKeyNot($ignoreId))
            ->exists()) {
            $slug = "{$baseSlug}-{$suffix}";
            $suffix++;
        }

        return $slug;
    }

    private function normalizeBooleanInput(Request $request, string $key): void
    {
        $value = $request->input($key);
        if (! is_string($value)) {
            return;
        }

        $boolean = filter_var($value, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
        if ($boolean !== null) {
            $request->merge([$key => $boolean]);
        }
    }
}

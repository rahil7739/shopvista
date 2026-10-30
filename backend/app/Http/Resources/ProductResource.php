<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'category_id' => $this->category_id,
            'category' => $this->category?->name,
            'description' => $this->description,
            'price' => (float) $this->price,
            'image_url' => $this->public_image_url,
            'image_is_uploaded' => (bool) $this->image_path,
            'art_style' => $this->art_style,
            'published' => $this->is_published,
            'featured' => $this->is_featured,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}

<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'active' => $this->is_active,
            'roles' => $this->whenLoaded('roles', fn () => $this->getRoleNames()->values()),
            'role' => $this->whenLoaded('roles', fn () => $this->getRoleNames()->first()),
            'created_at' => $this->created_at,
        ];
    }
}

<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class AdminUserController extends Controller
{
    public function index(Request $request)
    {
        $users = User::query()
            ->with('roles')
            ->when($request->filled('search'), function ($query) use ($request): void {
                $search = $request->string('search')->trim()->toString();
                $query->where(function ($query) use ($search): void {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate(min(max($request->integer('per_page', 25), 1), 100));

        return UserResource::collection($users);
    }

    public function show(User $user): UserResource
    {
        return new UserResource($user->load('roles'));
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'role' => ['required', Rule::in($this->assignableRoles($request))],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);
        $user->assignRole($validated['role']);

        return (new UserResource($user->load('roles')))
            ->response()
            ->setStatusCode(201);
    }

    public function update(Request $request, User $user): UserResource
    {
        abort_if(
            $user->hasRole('super-admin') && ! $request->user()->can('roles.manage'),
            403,
            'Only a super admin can manage another super admin account.',
        );

        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:120'],
            'email' => ['sometimes', 'required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'password' => ['sometimes', 'nullable', 'string', 'min:8', 'confirmed'],
            'role' => ['sometimes', 'required', Rule::in($this->assignableRoles($request))],
            'active' => ['sometimes', 'boolean'],
        ]);

        $user->fill(collect($validated)->except(['password', 'role'])->mapWithKeys(function ($value, $key) {
            return [$key === 'active' ? 'is_active' : $key => $value];
        })->all());
        if (! empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
            $user->tokens()->delete();
        }
        $user->save();

        if (isset($validated['role'])) {
            $user->syncRoles($validated['role']);
        }

        return new UserResource($user->load('roles'));
    }

    public function destroy(Request $request, User $user): JsonResponse
    {
        abort_if($request->user()->is($user), 422, 'You cannot delete your own account.');
        abort_if(
            $user->hasRole('super-admin') && ! $request->user()->can('roles.manage'),
            403,
            'Only a super admin can manage another super admin account.',
        );

        if ($user->hasRole('super-admin') && User::role('super-admin')->count() <= 1) {
            abort(422, 'The last super admin account cannot be deleted.');
        }

        $user->tokens()->delete();
        $user->delete();

        return response()->json(['message' => 'User deleted successfully.']);
    }

    private function assignableRoles(Request $request): array
    {
        return $request->user()->can('roles.manage')
            ? ['user', 'admin', 'super-admin']
            : ['user', 'admin'];
    }
}

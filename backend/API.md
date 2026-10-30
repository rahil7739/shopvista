# Shopvista backend API

The backend is a Laravel 12 JSON API. SQLite is the local default; set
`DB_CONNECTION=mysql` and the normal Laravel MySQL environment variables to use
MySQL.

## Local setup

1. Copy `.env.example` to `.env`.
2. Set a unique `APP_KEY` with `php artisan key:generate`; configure your
   database and mail transport in `.env`.
3. Run `composer install`, `php artisan migrate --seed`, and
   `php artisan storage:link`.
4. Start the API with `php artisan serve`.
5. From `../frontend`, run `npm install` and `npm run dev`.

Vite proxies `/api` and `/storage` to `http://127.0.0.1:8000`. Configure
`VITE_API_BASE_URL` when hosting the API at another URL. Configure a real mail
transport in `.env` to deliver password-reset messages; local mail defaults to
the log driver.

Seeding creates roles and permissions only; it never creates or promotes an
account using credentials from environment variables. After migrations and
seeding, create or securely reset the first super-admin with
`php artisan shopvista:admin`. The command prompts for the password without
echoing it and requires at least 12 characters.

## Endpoints

| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/auth/register` | Public; creates a `user` customer |
| POST | `/api/auth/login` | Public; returns a Sanctum bearer token |
| GET | `/api/auth/user` | Authenticated |
| POST | `/api/auth/logout` | Authenticated; revokes current token |
| POST | `/api/auth/forgot-password` | Public, rate limited |
| POST | `/api/auth/reset-password` | Public, rate limited |
| GET | `/api/products` | Public; published products only |
| GET | `/api/categories` | Public; active categories only |
| `/api/admin/products` | GET/POST/PUT/DELETE | `products.manage` |
| `/api/admin/categories` | GET/POST/PUT/DELETE | `categories.manage` |
| `/api/admin/users` | GET/POST/PUT/DELETE | `users.manage` |

Category create/update requests accept an optional `image` upload (JPEG, PNG,
or WebP up to 5 MB); the category API returns its public `image_url` and
`active` status.

Send API tokens in `Authorization: Bearer <token>`. Tokens expire after
`SANCTUM_TOKEN_EXPIRATION` minutes. Product image uploads use the `image`
multipart field (JPEG, PNG, or WebP up to 5 MB); an `image_url` may be used
instead. The product API creates categories by name when a product is saved.

## Roles

- `user`: customer account.
- `admin`: manage products, categories, and customer/admin accounts.
- `super-admin`: all seeded permissions; only this role can assign the
  `super-admin` role.

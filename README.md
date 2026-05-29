# EventStan API

NestJS backend for EventStan v1, a Dubai/GCC-ready multi-vendor event services marketplace.

## Tech Stack

- NestJS + TypeScript
- Swagger/OpenAPI
- In-memory repository for the first runnable API version
- Planned persistence: PostgreSQL, Redis, MinIO, Stripe, WhatsApp Business API

## Run

```bash
npm install
npm run start
```

API base URL:

```text
http://localhost:3000/api/v1
```

Swagger:

```text
http://localhost:3000/docs
```

Swagger JSON:

```text
http://localhost:3000/docs-json
```

## Current Modules

- `health`: API status check
- `auth`: demo login and OTP request
- `master-data`: categories, countries, currencies
- `vendors`: vendor creation, listing, verification status
- `services`: vendor service listing and search
- `packages`: package creation and listing
- `availability`: vendor calendar, blocked/offline/available dates, capacity
- `cart`: customer cart for services and packages
- `bookings`: checkout, lifecycle, vendor accept/reject, customer confirmation, cancellation, refund estimate
- `payments`: Stripe-style payment intent and payment success simulation
- `coupons`: coupon creation and validation
- `reviews`: post-completion reviews with admin approval
- `settlements`: commission calculation and vendor payout status

## Demo Flow

1. Add `svc_decoration` to cart for `usr_customer`.
2. Checkout cart with optional coupon `EVENT10`.
3. Create payment intent for the booking.
4. Mark payment as succeeded.
5. Vendor accepts the booking.
6. Customer confirms the booking.

## Next Backend Step

Replace the in-memory `DataStoreService` with PostgreSQL persistence and migrations. Recommended next layer:

- Prisma or TypeORM schema
- JWT auth guards and role permissions
- Stripe webhook handling
- Redis-backed OTP/session cache
- MinIO file upload module
- WhatsApp notification queue

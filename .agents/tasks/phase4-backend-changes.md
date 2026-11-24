# Backend Changes — Phase 4

## Files Modified

- `backend/.env.example` (**created new**): template environment variables untuk backend — DATABASE_URL, JWT_SECRET, JWT_EXPIRES_IN, PORT, NODE_ENV, CORS_ORIGIN, PROXMOX_HOST, PROXMOX_TOKEN_ID, PROXMOX_TOKEN_SECRET, PORTAINER_URL, PORTAINER_TOKEN, PROMETHEUS_URL.

- `backend/src/services/order.service.ts`: ditambahkan interface `AddressData` (recipient_name, phone, street, city, province, postal_code); interface `CreateOrderInput` diperluas dengan field `addressData?: AddressData`; di dalam `$transaction` ditambahkan logika `resolvedAddressId` — jika `addressId` tidak diberikan tapi `addressData` ada, address baru dibuat via `tx.address.create` dan id-nya digunakan sebagai `address_id` pada order.

- `backend/src/controllers/order.controller.ts`: fungsi `createOrder` diperluas — membaca `req.body.addressData` (camelCase dari frontend) dan memetakannya ke snake_case (`recipientName` → `recipient_name`, `postalCode` → `postal_code`) sebelum diteruskan ke `orderService.createOrder`.

## Files Already Correct (tidak diubah)

- `.env.example` — sudah memiliki `DATABASE_URL` dan `CORS_ORIGIN`.
- `backend/src/config/env.ts` — `CORS_ORIGIN` sudah ada di schema Zod dan sudah di-export.
- `backend/src/app.ts` — sudah menggunakan `CORS_ORIGIN` yang diimport dari `./config/env`.
- `backend/src/controllers/product.controller.ts` — response shape sudah flat `{ data, pagination }`.
- `backend/src/controllers/admin.controller.ts` — `listOrders` sudah flat `{ data, pagination }`.
- `backend/src/services/admin.service.ts` — `getStats()` sudah menggunakan key `totalRevenue`, `totalOrders`, `totalProducts`, `totalCustomers`, dan sudah menyertakan `recentOrders` dalam `Promise.all`.

## TypeScript Check

Exit code: 0
Errors: 0

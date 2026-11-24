# Frontend Changes — Phase 4

## Files Modified

- `frontend/src/types/index.ts`: Ganti seluruh interface ke snake_case sesuai Prisma. `isActive` → `is_active`, `createdAt` → `created_at`, `updatedAt` → `updated_at`, `imageUrl` → `image_url`, `images` → `image_urls`, `categoryId` → `category_id`, `cartId` → `cart_id`, `productId` → `product_id`, `userId` → `user_id`, `priceAtAdd` → `price_at_add`, `reservedQuantity` → `reserved_quantity`, `shippingCost` → `shipping_cost`, `paymentMethod` → `payment_method`, `orderId` → `order_id`, `unitPrice` → `unit_price`, `referenceCode` → `reference_code`, `paidAt` → `paid_at`, `recipientName` → `recipient_name`, `postalCode` → `postal_code`, `isDefault` → `is_default`. Tambah field `updated_at` di User dan Product, `created_at` di Category/CartItem/Address/Payment/Order, `user_id` di Cart/Order, `order_id` di CartItem/OrderItem/Payment.

- `frontend/src/components/product/ProductCard.tsx`: `product.inventory.reservedQuantity` → `product.inventory.reserved_quantity`; `product.images` → `product.image_urls`.

- `frontend/src/components/cart/CartDrawer.tsx`: `item.product.images?.[0]` → `item.product.image_urls?.[0]`; semua `item.priceAtAdd` → `item.price_at_add` (3 occurrences).

- `frontend/src/pages/storefront/CartPage.tsx`: `item.product.images?.[0]` → `item.product.image_urls?.[0]`; semua `item.priceAtAdd` → `item.price_at_add` (3 occurrences).

- `frontend/src/pages/storefront/CheckoutPage.tsx`: `item.product.images?.[0]` → `item.product.image_urls?.[0]`; semua `item.priceAtAdd` → `item.price_at_add` (3 occurrences).

- `frontend/src/pages/storefront/ProductDetailPage.tsx`: `product.inventory.reservedQuantity` → `product.inventory.reserved_quantity`; `product.images` → `product.image_urls`.

- `frontend/src/pages/storefront/OrderDetailPage.tsx`: `order.createdAt` → `order.created_at`; `item.unitPrice` → `item.unit_price`; `order.shippingCost` → `order.shipping_cost`; `order.payment.referenceCode` → `order.payment.reference_code`; `order.payment.paidAt` → `order.payment.paid_at`; `order.address.recipientName` → `order.address.recipient_name`; `order.address.postalCode` → `order.address.postal_code`; `item.productId` → `item.product_id`.

- `frontend/src/pages/storefront/OrdersPage.tsx`: `order.createdAt` → `order.created_at`.

- `frontend/src/pages/admin/ProductsPage.tsx`: `product.images[0]` → `product.image_urls[0]`; `product.isActive` → `product.is_active`; `product.categoryId` → `product.category_id`; payload `categoryId` → `category_id`; payload `images` → `image_urls`; `product.description` → `product.description ?? ''` (fix nullability).

- `frontend/src/pages/admin/UsersPage.tsx`: `user.isActive` → `user.is_active`; `user.createdAt` → `user.created_at`.

- `frontend/src/pages/admin/CategoriesPage.tsx`: `cat.isActive` → `cat.is_active`.

- `frontend/src/pages/admin/DashboardPage.tsx`: `order.createdAt` → `order.created_at`.

- `frontend/src/pages/admin/OrdersPage.tsx`: `order.createdAt` → `order.created_at`; API fetch diperbarui agar toleran terhadap respons paginated (`Array.isArray` guard).

## TypeScript Check
Exit code: 0
Errors: 0

## Production Build
Status: berhasil
Bundle size: 890.82 kB JS (gzip: 256.77 kB), 28.28 kB CSS (gzip: 5.75 kB)

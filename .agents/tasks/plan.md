# Implementation Plan — CloudMart Phase 3: Foundation Build

## Environment Notes
- Node.js v26.11.1, npm 11.20.0, Docker 29.9.2, Docker Compose v5.6.1
- Vite 8.3.8 available via npx
- Workspace root: `d:\Tugas Kuliah\UAS-CC`
- Greenfield: only PROJECT_CONTEXT.md, PROMPT_ONBOARDING.md, PROSEDUR_AKSES.md, and .kiro/ exist
- No commit or push; no deployment; dev only

## Dependency Order
Root files → Backend config/types → Backend DB layer → Backend services/controllers → Backend routes/app → Frontend config/types → Frontend stores/lib → Frontend components → Frontend pages → Docker/Nginx wiring

---

## Items

- [ ] 1. Create root scaffold files
      Create `.gitignore`, `.env.example`, and `README.md` at the monorepo root. These have no dependencies.
      Files:
        - `d:\Tugas Kuliah\UAS-CC\.gitignore`
        - `d:\Tugas Kuliah\UAS-CC\.env.example`
        - `d:\Tugas Kuliah\UAS-CC\README.md`
      Verify: `Test-Path "d:\Tugas Kuliah\UAS-CC\.gitignore"` returns True; `.env.example` contains DB_USER, JWT_SECRET, PROXMOX_HOST, PORTAINER_URL, PROMETHEUS_URL keys.

- [ ] 2. Create backend package.json and TypeScript config
      Create `backend/package.json` with all runtime and dev dependencies listed in the spec. Create `backend/tsconfig.json` with target ES2020, commonjs, strict mode, outDir ./dist, rootDir ./src. No other files depend on this yet but all backend steps below require it.
      Files:
        - `d:\Tugas Kuliah\UAS-CC\backend\package.json`
        - `d:\Tugas Kuliah\UAS-CC\backend\tsconfig.json`
      Verify: `cd d:\Tugas Kuliah\UAS-CC\backend && npm install` exits 0; `node_modules` folder is created.

- [ ] 3. Create Prisma schema and seed file
      Create `backend/prisma/schema.prisma` with postgresql provider and all models: users, categories, products, inventory, carts, cart_items, addresses, orders, order_items, payments, activity_logs, deployment_logs. Include all enums (UserRole, OrderStatus, PaymentStatus). Create `backend/prisma/seed.ts` that upserts 1 admin, 1 customer, 5 categories, 15 products (3 per category, Rupiah pricing), and inventory records for each product using picsum.photos for image URLs. Seed must be fully idempotent via upsert.
      Files:
        - `d:\Tugas Kuliah\UAS-CC\backend\prisma\schema.prisma`
        - `d:\Tugas Kuliah\UAS-CC\backend\prisma\seed.ts`
      Depends on: item 2 (npm install must have run)
      Verify: `cd d:\Tugas Kuliah\UAS-CC\backend && npx prisma validate` exits 0 with no schema errors.

- [ ] 4. Create backend configuration and library files
      Create `src/config/env.ts`: parse and validate all env vars with Zod, throwing if DATABASE_URL or JWT_SECRET are absent; export typed constants. Create `src/lib/prisma.ts`: PrismaClient singleton (global reuse in dev). Create `src/lib/jwt.ts`: `signToken(payload, expiresIn?)` and `verifyToken(token)` functions using jsonwebtoken.
      Files:
        - `d:\Tugas Kuliah\UAS-CC\backend\src\config\env.ts`
        - `d:\Tugas Kuliah\UAS-CC\backend\src\lib\prisma.ts`
        - `d:\Tugas Kuliah\UAS-CC\backend\src\lib\jwt.ts`
      Depends on: item 2
      Verify: `cd d:\Tugas Kuliah\UAS-CC\backend && npx tsc --noEmit` — no type errors in these files (run after all backend source files exist).

- [ ] 5. Create backend types and middleware
      Create `src/types/index.ts`: augment `Express.Request` to add `user?: { id: string; email: string; role: UserRole }` and export shared TypeScript types used across the backend. Create `src/middleware/auth.ts`: extract Bearer token from Authorization header, verify with `verifyToken`, attach `req.user`, call `next()` or return 401. Create `src/middleware/roleGuard.ts`: factory `(roles: UserRole[]) => RequestHandler` that returns 403 if `req.user.role` is not in the list. Create `src/middleware/errorHandler.ts`: Express 4-arg error handler that catches any thrown error or `next(err)`, logs it, and returns `{ success: false, message, errors? }` with an appropriate HTTP status. Create `src/middleware/rateLimiter.ts`: configure `express-rate-limit` for general API (100 req/15 min) and a stricter auth limiter (10 req/15 min).
      Files:
        - `d:\Tugas Kuliah\UAS-CC\backend\src\types\index.ts`
        - `d:\Tugas Kuliah\UAS-CC\backend\src\middleware\auth.ts`
        - `d:\Tugas Kuliah\UAS-CC\backend\src\middleware\roleGuard.ts`
        - `d:\Tugas Kuliah\UAS-CC\backend\src\middleware\errorHandler.ts`
        - `d:\Tugas Kuliah\UAS-CC\backend\src\middleware\rateLimiter.ts`
      Depends on: items 3, 4

- [ ] 6. Create infrastructure adapters
      Each adapter must check its required env var and return `{ status: 'NOT_CONFIGURED', message: '...' }` if absent — never throw, never fabricate data. Create `proxmox.adapter.ts`: checks PROXMOX_HOST; exposes `getStatus()` and `getNodes()`. Create `docker.adapter.ts`: uses dockerode via `/var/run/docker.sock` with `socketPath`; exposes `getCloudMartContainers()` that filters by label or name prefix to avoid touching web1/web2/Prometheus/Grafana/cAdvisor/Portainer; never exposes the socket to any HTTP response. Create `portainer.adapter.ts`: checks PORTAINER_URL; uses axios to call Portainer REST API. Create `prometheus.adapter.ts`: checks PROMETHEUS_URL; uses axios to query `/api/v1/query`.
      Files:
        - `d:\Tugas Kuliah\UAS-CC\backend\src\adapters\proxmox.adapter.ts`
        - `d:\Tugas Kuliah\UAS-CC\backend\src\adapters\docker.adapter.ts`
        - `d:\Tugas Kuliah\UAS-CC\backend\src\adapters\portainer.adapter.ts`
        - `d:\Tugas Kuliah\UAS-CC\backend\src\adapters\prometheus.adapter.ts`
      Depends on: item 4

- [ ] 7. Create backend services
      Services contain business logic and call Prisma; controllers will be thin wrappers. Create:
      - `auth.service.ts`: `register(email,name,password)` → hash password with bcrypt(10), create user, return user+token; `login(email,password)` → find user, compare hash, return user+token; `me(userId)` → return user without password_hash.
      - `product.service.ts`: `listProducts(filters)` with optional category, search query, sort, pagination; `getProduct(id)` with category included; both exclude is_active=false.
      - `category.service.ts`: `listCategories()` returns active categories with product count.
      - `cart.service.ts`: `getCart(userId)` with items+products; `addItem(userId, productId, qty)` checks stock, upserts cart item; `updateItem(userId, cartItemId, qty)` with stock check; `removeItem(userId, cartItemId)`.
      - `order.service.ts`: `createOrder(userId, {addressId?, notes, paymentMethod})` runs in a transaction: reads cart, validates stock, creates order+order_items+payment, decrements inventory reserved_quantity, clears cart; `listOrders(userId)` with items; `getOrder(userId, orderId)`.
      - `user.service.ts`: `getProfile(userId)`; `updateProfile(userId, data)` — only name, phone, email (re-check unique).
      - `admin.service.ts`: `getStats()` → total revenue (sum payments where SUCCESS), total orders, total products, total customers; `listAllOrders(filters)` with pagination; `updateOrderStatus(orderId, status)`; `listUsers()`; `listAllProducts()`; `createProduct(data)`; `updateProduct(id,data)`; `deleteProduct(id)` (soft delete via is_active=false); CRUD for categories.
      - `infrastructure.service.ts`: calls all four adapters and aggregates their status.
      Files:
        - `d:\Tugas Kuliah\UAS-CC\backend\src\services\auth.service.ts`
        - `d:\Tugas Kuliah\UAS-CC\backend\src\services\product.service.ts`
        - `d:\Tugas Kuliah\UAS-CC\backend\src\services\category.service.ts`
        - `d:\Tugas Kuliah\UAS-CC\backend\src\services\cart.service.ts`
        - `d:\Tugas Kuliah\UAS-CC\backend\src\services\order.service.ts`
        - `d:\Tugas Kuliah\UAS-CC\backend\src\services\user.service.ts`
        - `d:\Tugas Kuliah\UAS-CC\backend\src\services\admin.service.ts`
        - `d:\Tugas Kuliah\UAS-CC\backend\src\services\infrastructure.service.ts`
      Depends on: items 3, 4, 5, 6

- [ ] 8. Create backend controllers
      Each controller imports its service, calls it, and returns `{ success: true, data }` or passes to `next(err)`. Create:
      - `auth.controller.ts`: register, login, me, logout (logout just returns 200 — token invalidation is client-side for now)
      - `product.controller.ts`: list, getOne
      - `category.controller.ts`: list
      - `cart.controller.ts`: getCart, addItem, updateItem, removeItem
      - `order.controller.ts`: create, list, getOne
      - `user.controller.ts`: getProfile, updateProfile
      - `admin.controller.ts`: stats, listOrders, updateOrderStatus, listUsers, CRUD products, CRUD categories
      - `infrastructure.controller.ts`: getStatus
      Files:
        - `d:\Tugas Kuliah\UAS-CC\backend\src\controllers\auth.controller.ts`
        - `d:\Tugas Kuliah\UAS-CC\backend\src\controllers\product.controller.ts`
        - `d:\Tugas Kuliah\UAS-CC\backend\src\controllers\category.controller.ts`
        - `d:\Tugas Kuliah\UAS-CC\backend\src\controllers\cart.controller.ts`
        - `d:\Tugas Kuliah\UAS-CC\backend\src\controllers\order.controller.ts`
        - `d:\Tugas Kuliah\UAS-CC\backend\src\controllers\user.controller.ts`
        - `d:\Tugas Kuliah\UAS-CC\backend\src\controllers\admin.controller.ts`
        - `d:\Tugas Kuliah\UAS-CC\backend\src\controllers\infrastructure.controller.ts`
      Depends on: item 7

- [ ] 9. Create backend routes and wire app
      Create individual route files, then `routes/index.ts` aggregator, then `src/app.ts` and `src/index.ts`. Route prefixes under /api:
      - `auth.routes.ts` → /auth: POST /register, POST /login, GET /me (auth), POST /logout
      - `product.routes.ts` → /products: GET /, GET /:id
      - `category.routes.ts` → /categories: GET /
      - `cart.routes.ts` → /cart: GET /, POST /items, PATCH /items/:id, DELETE /items/:id (all require auth middleware)
      - `order.routes.ts` → /orders: POST /, GET /, GET /:id (all require auth)
      - `user.routes.ts` → /users: GET /profile, PUT /profile (require auth)
      - `admin.routes.ts` → /admin: all require auth + roleGuard([ADMIN]): GET /stats, GET /orders, PATCH /orders/:id/status, GET /users, GET/POST /products, PUT/DELETE /products/:id, GET/POST /categories, PUT/DELETE /categories/:id
      - `infrastructure.routes.ts` → /infrastructure: GET /status (require auth + ADMIN)
      `app.ts`: helmet → cors (origin configurable via env) → json → rateLimiter → mount routes → errorHandler. `index.ts`: import app, listen on PORT, log ready.
      Files:
        - `d:\Tugas Kuliah\UAS-CC\backend\src\routes\auth.routes.ts`
        - `d:\Tugas Kuliah\UAS-CC\backend\src\routes\product.routes.ts`
        - `d:\Tugas Kuliah\UAS-CC\backend\src\routes\category.routes.ts`
        - `d:\Tugas Kuliah\UAS-CC\backend\src\routes\cart.routes.ts`
        - `d:\Tugas Kuliah\UAS-CC\backend\src\routes\order.routes.ts`
        - `d:\Tugas Kuliah\UAS-CC\backend\src\routes\user.routes.ts`
        - `d:\Tugas Kuliah\UAS-CC\backend\src\routes\admin.routes.ts`
        - `d:\Tugas Kuliah\UAS-CC\backend\src\routes\infrastructure.routes.ts`
        - `d:\Tugas Kuliah\UAS-CC\backend\src\routes\index.ts`
        - `d:\Tugas Kuliah\UAS-CC\backend\src\app.ts`
        - `d:\Tugas Kuliah\UAS-CC\backend\src\index.ts`
      Depends on: items 5, 8

- [ ] 10. Create backend Dockerfile
       Multi-stage Dockerfile. Stage `build`: `FROM node:20-alpine AS build`, WORKDIR /app, copy package*.json + prisma/, `npm ci`, copy src/, `npx prisma generate`, `npx tsc`. Stage `production`: `FROM node:20-alpine`, WORKDIR /app, copy package*.json, `npm ci --only=production`, copy --from=build /app/dist ./dist, copy --from=build /app/node_modules/.prisma ./node_modules/.prisma, copy prisma/ ./prisma/, `npx prisma generate`, EXPOSE 4000, `CMD ["node","dist/index.js"]`.
       Files:
         - `d:\Tugas Kuliah\UAS-CC\backend\Dockerfile`
       Depends on: items 2, 3
       Verify: `cd d:\Tugas Kuliah\UAS-CC\backend && npx tsc --noEmit` exits 0 (TypeScript compiles without errors across all backend source files created in items 4–9).

- [ ] 11. Create frontend package.json and config files
       Create `frontend/package.json` with all dependencies from spec. Create `frontend/tsconfig.json` and `frontend/tsconfig.node.json` for Vite (target ESNext, module ESNext, bundler moduleResolution, JSX react-jsx). Create `frontend/vite.config.ts`: `@vitejs/plugin-react`, server proxy `/api` → `http://localhost:4000`. Create `frontend/postcss.config.js` and `frontend/tailwind.config.js`: extend colors (brand navy/blue/accent, success, warning, danger), fontFamily Inter. Create `frontend/index.html`: title CloudMart, meta viewport, Inter font link from Google Fonts, `<div id="root">`, script src main.tsx.
       Files:
         - `d:\Tugas Kuliah\UAS-CC\frontend\package.json`
         - `d:\Tugas Kuliah\UAS-CC\frontend\tsconfig.json`
         - `d:\Tugas Kuliah\UAS-CC\frontend\tsconfig.node.json`
         - `d:\Tugas Kuliah\UAS-CC\frontend\vite.config.ts`
         - `d:\Tugas Kuliah\UAS-CC\frontend\postcss.config.js`
         - `d:\Tugas Kuliah\UAS-CC\frontend\tailwind.config.js`
         - `d:\Tugas Kuliah\UAS-CC\frontend\index.html`
       Verify: `cd d:\Tugas Kuliah\UAS-CC\frontend && npm install` exits 0.

- [ ] 12. Create frontend types, stores, and lib
       Create `src/types/index.ts`: TypeScript interfaces for User, Product, Category, CartItem, Cart, Order, OrderItem, Payment, Address, AdminStats, PaginatedResponse<T>, ApiResponse<T>. Create `src/store/authStore.ts`: Zustand store with `{ user, token, isAuthenticated }` state; `login(user,token)` persists token to localStorage, `logout()` clears it, `setUser(user)` updates profile. Create `src/store/cartStore.ts`: `{ items, isOpen }` state with `openCart`, `closeCart`, `setItems` actions. Create `src/lib/api.ts`: axios instance with `baseURL: '/api'`; request interceptor adds `Authorization: Bearer <token>` from authStore; response interceptor calls `authStore.logout()` and redirects to `/login` on 401. Create `src/lib/utils.ts`: `cn(...inputs)` = `twMerge(clsx(...))`, `formatCurrency(amount)` → Rupiah (Intl.NumberFormat id-ID), `formatDate(date)` → locale date string. Create `src/lib/constants.ts`: ROUTES object (all app paths), ORDER_STATUS_LABELS map, PAYMENT_STATUS_LABELS map.
       Files:
         - `d:\Tugas Kuliah\UAS-CC\frontend\src\types\index.ts`
         - `d:\Tugas Kuliah\UAS-CC\frontend\src\store\authStore.ts`
         - `d:\Tugas Kuliah\UAS-CC\frontend\src\store\cartStore.ts`
         - `d:\Tugas Kuliah\UAS-CC\frontend\src\lib\api.ts`
         - `d:\Tugas Kuliah\UAS-CC\frontend\src\lib\utils.ts`
         - `d:\Tugas Kuliah\UAS-CC\frontend\src\lib\constants.ts`
       Depends on: item 11

- [ ] 13. Create frontend hooks
       Create TanStack Query hooks. `useAuth.ts`: wraps authStore, adds `isAdmin` boolean helper (user.role === 'ADMIN'). `useProducts.ts`: `useProducts(params?)` → GET /products with query params (category, search, sort, page, limit), `useProduct(id)` → GET /products/:id. `useCart.ts`: `useCart()` → GET /cart (enabled only when authenticated), `useAddToCart()` mutation POST /cart/items, `useUpdateCartItem()` mutation PATCH /cart/items/:id, `useRemoveCartItem()` mutation DELETE /cart/items/:id; on success mutations invalidate the cart query. `useOrders.ts`: `useOrders()` → GET /orders, `useOrder(id)` → GET /orders/:id, `useCreateOrder()` mutation POST /orders.
       Files:
         - `d:\Tugas Kuliah\UAS-CC\frontend\src\hooks\useAuth.ts`
         - `d:\Tugas Kuliah\UAS-CC\frontend\src\hooks\useProducts.ts`
         - `d:\Tugas Kuliah\UAS-CC\frontend\src\hooks\useCart.ts`
         - `d:\Tugas Kuliah\UAS-CC\frontend\src\hooks\useOrders.ts`
       Depends on: item 12

- [ ] 14. Create UI primitive components
       Implement real, non-stub components with full Tailwind styling. Each must compile and render without errors:
       - `Button.tsx`: `variant` prop (primary=blue-600, secondary=gray-100, outline=border-blue-600, ghost=transparent, danger=red-600); `size` prop (sm/md/lg); `loading` prop shows inline Spinner and disables clicks; uses `cn()` for class merging; forwards all button HTML attributes.
       - `Input.tsx`: label above, error message below in red, forward ref, full width by default, ring-blue-500 focus.
       - `Card.tsx`: exports `Card` (rounded-xl shadow-sm border), `CardHeader`, `CardContent`, `CardFooter` as composable sub-components.
       - `Badge.tsx`: `variant` prop (default=gray, success=green, warning=orange, danger=red, info=blue); small pill shape.
       - `Modal.tsx`: renders into a React portal on `document.body`; dark backdrop; centers a white panel; closes on backdrop click or Escape key; accepts `isOpen`, `onClose`, `title`, `children`.
       - `Table.tsx`: exports `Table` (overflow-x-auto wrapper), `TableHead`, `TableRow`, `TableCell` for responsive data tables.
       - `Spinner.tsx`: animated SVG circle; `size` prop (sm=16px, md=24px, lg=40px).
       - `Toast.tsx`: fixed bottom-right stack; auto-dismisses after 4 s; `variant` (success/error/warning/info) with matching icon color.
       - `EmptyState.tsx`: centered icon (passed as prop or default inbox), title, description, optional `action` button.
       Files:
         - `d:\Tugas Kuliah\UAS-CC\frontend\src\components\ui\Button.tsx`
         - `d:\Tugas Kuliah\UAS-CC\frontend\src\components\ui\Input.tsx`
         - `d:\Tugas Kuliah\UAS-CC\frontend\src\components\ui\Card.tsx`
         - `d:\Tugas Kuliah\UAS-CC\frontend\src\components\ui\Badge.tsx`
         - `d:\Tugas Kuliah\UAS-CC\frontend\src\components\ui\Modal.tsx`
         - `d:\Tugas Kuliah\UAS-CC\frontend\src\components\ui\Table.tsx`
         - `d:\Tugas Kuliah\UAS-CC\frontend\src\components\ui\Spinner.tsx`
         - `d:\Tugas Kuliah\UAS-CC\frontend\src\components\ui\Toast.tsx`
         - `d:\Tugas Kuliah\UAS-CC\frontend\src\components\ui\EmptyState.tsx`
       Depends on: items 11, 12

- [ ] 15. Create layout components
       Build the two layout shells. Storefront: `Navbar.tsx` — gradient logo "CloudMart", nav links Home/Products, search bar (submit navigates to /products?search=), cart icon with item-count badge from cartStore, auth section showing Login/Register links or a user dropdown (email + Logout) when authenticated, mobile hamburger that toggles nav on small screens. `Footer.tsx` — dark navy background, quick links (Home/Products/Login), copyright. `StorefrontLayout.tsx` — `<Navbar /> + <main>{children}</main> + <Footer />`. Admin: `AdminSidebar.tsx` — fixed left sidebar, bg-[#0F172A] text-white, CloudMart logo, nav items with lucide icons: Dashboard (/admin), Products (/admin/products), Categories (/admin/categories), Orders (/admin/orders), Users (/admin/users), divider, Platform (/admin/platform), Infrastructure (/admin/infrastructure) — active item gets blue-600 highlight. `AdminTopbar.tsx` — breadcrumb based on current route + logged-in user name. `AdminLayout.tsx` — flex: sidebar (fixed width) + flex-1 column (topbar + scrollable main).
       Files:
         - `d:\Tugas Kuliah\UAS-CC\frontend\src\components\layout\Navbar.tsx`
         - `d:\Tugas Kuliah\UAS-CC\frontend\src\components\layout\Footer.tsx`
         - `d:\Tugas Kuliah\UAS-CC\frontend\src\components\layout\StorefrontLayout.tsx`
         - `d:\Tugas Kuliah\UAS-CC\frontend\src\components\layout\AdminSidebar.tsx`
         - `d:\Tugas Kuliah\UAS-CC\frontend\src\components\layout\AdminTopbar.tsx`
         - `d:\Tugas Kuliah\UAS-CC\frontend\src\components\layout\AdminLayout.tsx`
       Depends on: items 12, 13, 14

- [ ] 16. Create product, cart, and common components
       `ProductCard.tsx`: image with aspect-ratio-4/3, `object-cover`, graceful fallback to a gradient placeholder div if image fails; category badge (Badge component); 2-line clamped name; formatCurrency price; stock status badge (green "In Stock" / red "Out of Stock"); "Add to Cart" Button that calls useAddToCart mutation. `ProductGrid.tsx`: responsive CSS grid (2 cols sm → 3 cols md → 4 cols lg); when `isLoading` shows 8 `ProductCard` skeleton divs with animate-pulse. `ProductFilters.tsx`: text search input, category <select> populated from useCategories (or prop), sort <select> (newest / price-asc / price-desc / name). `CartDrawer.tsx`: fixed right panel that slides in when cartStore.isOpen is true (translate-x-0 / translate-x-full); lists cart items with product image, name, qty stepper (− qty +), remove button (trash icon), computed item subtotal; sticky bottom section shows cart total and "Proceed to Checkout" Button. Common: `ProtectedRoute.tsx` — if not authenticated redirect to /login with `state.from`; if `role` prop provided and user.role does not match redirect to /; wraps `<Outlet />`. `LoadingPage.tsx` — full-page centered spinner with "CloudMart" text. `ErrorBoundary.tsx` — React class component with componentDidCatch; renders a styled error card with "Reload" button.
       Files:
         - `d:\Tugas Kuliah\UAS-CC\frontend\src\components\product\ProductCard.tsx`
         - `d:\Tugas Kuliah\UAS-CC\frontend\src\components\product\ProductGrid.tsx`
         - `d:\Tugas Kuliah\UAS-CC\frontend\src\components\product\ProductFilters.tsx`
         - `d:\Tugas Kuliah\UAS-CC\frontend\src\components\cart\CartDrawer.tsx`
         - `d:\Tugas Kuliah\UAS-CC\frontend\src\components\common\ProtectedRoute.tsx`
         - `d:\Tugas Kuliah\UAS-CC\frontend\src\components\common\LoadingPage.tsx`
         - `d:\Tugas Kuliah\UAS-CC\frontend\src\components\common\ErrorBoundary.tsx`
       Depends on: items 13, 14, 15

- [ ] 17. Create storefront pages
       All pages use real hooks and real components — no hardcoded data except fallbacks. Each page compiles and renders without blank screens:
       - `HomePage.tsx`: hero section (full-width gradient bg-[#0F172A] to bg-blue-700, large headline, two CTA buttons); categories row (5 icon cards using lucide icons, clicking navigates to /products?category=<slug>); "Featured Products" section (ProductGrid limited to 8, loading skeletons while fetching).
       - `ProductsPage.tsx`: reads URL search params (category, search, sort, page) into ProductFilters; passes filtered params to useProducts; renders ProductGrid; pagination controls (prev/next) based on PaginatedResponse.
       - `ProductDetailPage.tsx`: reads :id param; fetches useProduct(id); image gallery (main large image + thumbnails if multiple); name, category badge, price, description; qty selector (number input, min 1, max stock_quantity); "Add to Cart" button with loading state; "Back to Products" link.
       - `CartPage.tsx`: reads cartStore; renders each item (image, name, unit price, qty, subtotal); empty state (EmptyState component) when cart is empty; order summary panel (subtotal, shipping Rp 15.000, total); "Go to Checkout" Button → /checkout.
       - `CheckoutPage.tsx`: 3-step progress indicator; Step 1 — delivery address form (react-hook-form + Zod schema: recipient_name, phone, street, city, province, postal_code); Step 2 — order review (item list + subtotal + shipping 15000 + grand total); Step 3 — payment method selection (Transfer Bank / COD radio); final submit calls useCreateOrder mutation with cart items + address + payment_method; on success shows confirmation card with order ID.
       - `OrdersPage.tsx`: useOrders(); Table with columns Order ID (truncated), Date, Items count, Total, Status badge, View Detail link.
       - `OrderDetailPage.tsx`: useOrder(id); order header (ID, date, status badge), items table, payment info, address.
       - `ProfilePage.tsx`: useAuth(); form pre-filled with user data (react-hook-form); PUT /users/profile on submit; success toast.
       - `LoginPage.tsx`: react-hook-form + Zod (email, password); POST /api/auth/login; on success store token + user and navigate to previous page (state.from) or /; inline error messages.
       - `RegisterPage.tsx`: react-hook-form + Zod (name, email, password, confirmPassword — must match); POST /api/auth/register; auto-login on success; link to /login.
       Files:
         - `d:\Tugas Kuliah\UAS-CC\frontend\src\pages\HomePage.tsx`
         - `d:\Tugas Kuliah\UAS-CC\frontend\src\pages\ProductsPage.tsx`
         - `d:\Tugas Kuliah\UAS-CC\frontend\src\pages\ProductDetailPage.tsx`
         - `d:\Tugas Kuliah\UAS-CC\frontend\src\pages\CartPage.tsx`
         - `d:\Tugas Kuliah\UAS-CC\frontend\src\pages\CheckoutPage.tsx`
         - `d:\Tugas Kuliah\UAS-CC\frontend\src\pages\OrdersPage.tsx`
         - `d:\Tugas Kuliah\UAS-CC\frontend\src\pages\OrderDetailPage.tsx`
         - `d:\Tugas Kuliah\UAS-CC\frontend\src\pages\ProfilePage.tsx`
         - `d:\Tugas Kuliah\UAS-CC\frontend\src\pages\LoginPage.tsx`
         - `d:\Tugas Kuliah\UAS-CC\frontend\src\pages\RegisterPage.tsx`
       Depends on: items 13, 15, 16

- [ ] 18. Create admin pages
       Admin pages sit inside AdminLayout (ProtectedRoute ADMIN wrapper in router). All use real hooks calling admin API endpoints:
       - `admin/DashboardPage.tsx`: four metric cards (Total Revenue Rp, Total Orders, Total Products, Total Customers) from GET /api/admin/stats; Recharts LineChart showing 7-day revenue trend (use static placeholder data array if no dedicated time-series endpoint exists yet); recent orders table (last 5, columns: ID, Customer, Total, Status badge, Date).
       - `admin/ProductsPage.tsx`: table of all products (name, category, price, stock, status badge, Edit/Delete actions); "New Product" button opens Modal with create form (name, slug, description, price, category_id select, stock_quantity, image URLs textarea); Edit opens same modal pre-filled; Delete soft-deletes via is_active=false.
       - `admin/CategoriesPage.tsx`: table (name, slug, product count, active toggle); CRUD modal.
       - `admin/OrdersPage.tsx`: table with status filter tabs (All / Pending / Processing / Shipped / Delivered / Cancelled); PATCH /api/admin/orders/:id/status via a status <select> per row.
       - `admin/UsersPage.tsx`: table (name, email, role badge, joined date, active status).
       - `admin/InfrastructurePage.tsx`: single card "IaaS Integration" with status "NOT CONFIGURED" in a yellow badge; placeholder text "Configure Proxmox and Portainer credentials in environment variables to enable infrastructure monitoring."; non-functional "Configure" button.
       - `admin/PlatformPage.tsx`: single card "PaaS Platform" with status "NOT CONFIGURED"; same placeholder pattern.
       Files:
         - `d:\Tugas Kuliah\UAS-CC\frontend\src\pages\admin\DashboardPage.tsx`
         - `d:\Tugas Kuliah\UAS-CC\frontend\src\pages\admin\ProductsPage.tsx`
         - `d:\Tugas Kuliah\UAS-CC\frontend\src\pages\admin\CategoriesPage.tsx`
         - `d:\Tugas Kuliah\UAS-CC\frontend\src\pages\admin\OrdersPage.tsx`
         - `d:\Tugas Kuliah\UAS-CC\frontend\src\pages\admin\UsersPage.tsx`
         - `d:\Tugas Kuliah\UAS-CC\frontend\src\pages\admin\InfrastructurePage.tsx`
         - `d:\Tugas Kuliah\UAS-CC\frontend\src\pages\admin\PlatformPage.tsx`
       Depends on: items 14, 15, 16

- [ ] 19. Create App.tsx, main.tsx, and global CSS
       `App.tsx`: BrowserRouter → QueryClientProvider (new QueryClient) → all routes as defined in spec: storefront routes inside StorefrontLayout, /checkout|orders|profile inside ProtectedRoute+StorefrontLayout, /admin/* inside ProtectedRoute(role=ADMIN)+AdminLayout, /login and /register as standalone pages. Add `<CartDrawer />` outside the route tree so it renders globally. Wrap the whole tree in `<ErrorBoundary>`. `main.tsx`: `ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>)`. `src/index.css`: `@tailwind base; @tailwind components; @tailwind utilities;` plus any global resets (body font-family Inter, box-sizing border-box).
       Files:
         - `d:\Tugas Kuliah\UAS-CC\frontend\src\App.tsx`
         - `d:\Tugas Kuliah\UAS-CC\frontend\src\main.tsx`
         - `d:\Tugas Kuliah\UAS-CC\frontend\src\index.css`
       Depends on: items 15, 16, 17, 18

- [ ] 20. Create frontend Dockerfile and nginx SPA config
       `frontend/Dockerfile`: stage `build` FROM node:20-alpine, WORKDIR /app, copy package*.json, `npm ci`, copy src/ + public/ + index.html + vite.config.ts + tsconfig*.json + postcss.config.js + tailwind.config.js, `npm run build` (outputs to /app/dist). Stage `production` FROM nginx:alpine, copy --from=build /app/dist /usr/share/nginx/html, copy nginx.conf /etc/nginx/conf.d/default.conf, EXPOSE 80. `frontend/nginx.conf` (SPA config for the container — distinct from the reverse-proxy nginx.conf in docker/nginx/): `server { listen 80; root /usr/share/nginx/html; index index.html; location / { try_files $uri $uri/ /index.html; } }`.
       Files:
         - `d:\Tugas Kuliah\UAS-CC\frontend\Dockerfile`
         - `d:\Tugas Kuliah\UAS-CC\frontend\nginx.conf`
       Depends on: item 11

- [ ] 21. Create Docker Compose files and reverse-proxy Nginx config
       `docker/nginx/nginx.conf`: define two upstreams — `upstream backend_api { server backend:4000; }` and `upstream frontend_app { server frontend:80; }`. Single server block listening on 80: `location /api/ { proxy_pass http://backend_api; proxy_set_header Host $host; proxy_set_header X-Real-IP $remote_addr; proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; }` — `location / { proxy_pass http://frontend_app; proxy_http_version 1.1; proxy_set_header Upgrade $http_upgrade; proxy_set_header Connection 'upgrade'; }`. `docker-compose.yml`: postgres service (image postgres:15-alpine, env POSTGRES_USER/PASSWORD/DB from env_file, volume pgdata:/var/lib/postgresql/data, healthcheck `pg_isready -U $${POSTGRES_USER}`, network cloudmart-internal, NO ports mapping); backend service (build ./backend, env_file .env, env DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/${DB_NAME}, depends_on postgres with condition service_healthy, network cloudmart-internal, volume /var/run/docker.sock:/var/run/docker.sock:ro); frontend service (build ./frontend, network cloudmart-internal); nginx service (image nginx:alpine, ports 8080:80, volumes docker/nginx/nginx.conf:/etc/nginx/conf.d/cloudmart.conf:ro, depends_on frontend + backend, network cloudmart-internal). Top-level volumes: pgdata. Top-level networks: cloudmart-internal driver bridge. `docker-compose.dev.yml`: extend backend with ports 4000:4000; extend postgres with ports 5432:5432.
       Files:
         - `d:\Tugas Kuliah\UAS-CC\docker\nginx\nginx.conf`
         - `d:\Tugas Kuliah\UAS-CC\docker-compose.yml`
         - `d:\Tugas Kuliah\UAS-CC\docker-compose.dev.yml`
       Depends on: items 10, 20

- [ ] 22. Run backend TypeScript compile check
       After all backend source files are written, verify the TypeScript configuration is clean. This is a compile-only check — no DATABASE_URL is needed.
       Command: `cd "d:\Tugas Kuliah\UAS-CC\backend" && npx tsc --noEmit`
       Expected: exits 0, no error output. If type errors exist, fix them before proceeding.
       Depends on: items 2–10

- [ ] 23. Run frontend TypeScript compile check and production build
       Verify frontend TypeScript compiles and Vite produces a dist/ folder.
       Commands:
         1. `cd "d:\Tugas Kuliah\UAS-CC\frontend" && npx tsc --noEmit`
         2. `cd "d:\Tugas Kuliah\UAS-CC\frontend" && npm run build`
       Expected: both exit 0; `frontend/dist/index.html` exists; `frontend/dist/assets/` contains hashed JS and CSS bundles.
       Depends on: items 11–20

---

## Complete File Manifest

### Root
```
d:\Tugas Kuliah\UAS-CC\.gitignore
d:\Tugas Kuliah\UAS-CC\.env.example
d:\Tugas Kuliah\UAS-CC\README.md
d:\Tugas Kuliah\UAS-CC\docker-compose.yml
d:\Tugas Kuliah\UAS-CC\docker-compose.dev.yml
```

### docker/
```
d:\Tugas Kuliah\UAS-CC\docker\nginx\nginx.conf
```

### backend/
```
d:\Tugas Kuliah\UAS-CC\backend\package.json
d:\Tugas Kuliah\UAS-CC\backend\tsconfig.json
d:\Tugas Kuliah\UAS-CC\backend\Dockerfile
d:\Tugas Kuliah\UAS-CC\backend\prisma\schema.prisma
d:\Tugas Kuliah\UAS-CC\backend\prisma\seed.ts
d:\Tugas Kuliah\UAS-CC\backend\src\config\env.ts
d:\Tugas Kuliah\UAS-CC\backend\src\lib\prisma.ts
d:\Tugas Kuliah\UAS-CC\backend\src\lib\jwt.ts
d:\Tugas Kuliah\UAS-CC\backend\src\types\index.ts
d:\Tugas Kuliah\UAS-CC\backend\src\middleware\auth.ts
d:\Tugas Kuliah\UAS-CC\backend\src\middleware\roleGuard.ts
d:\Tugas Kuliah\UAS-CC\backend\src\middleware\errorHandler.ts
d:\Tugas Kuliah\UAS-CC\backend\src\middleware\rateLimiter.ts
d:\Tugas Kuliah\UAS-CC\backend\src\adapters\proxmox.adapter.ts
d:\Tugas Kuliah\UAS-CC\backend\src\adapters\docker.adapter.ts
d:\Tugas Kuliah\UAS-CC\backend\src\adapters\portainer.adapter.ts
d:\Tugas Kuliah\UAS-CC\backend\src\adapters\prometheus.adapter.ts
d:\Tugas Kuliah\UAS-CC\backend\src\services\auth.service.ts
d:\Tugas Kuliah\UAS-CC\backend\src\services\product.service.ts
d:\Tugas Kuliah\UAS-CC\backend\src\services\category.service.ts
d:\Tugas Kuliah\UAS-CC\backend\src\services\cart.service.ts
d:\Tugas Kuliah\UAS-CC\backend\src\services\order.service.ts
d:\Tugas Kuliah\UAS-CC\backend\src\services\user.service.ts
d:\Tugas Kuliah\UAS-CC\backend\src\services\admin.service.ts
d:\Tugas Kuliah\UAS-CC\backend\src\services\infrastructure.service.ts
d:\Tugas Kuliah\UAS-CC\backend\src\controllers\auth.controller.ts
d:\Tugas Kuliah\UAS-CC\backend\src\controllers\product.controller.ts
d:\Tugas Kuliah\UAS-CC\backend\src\controllers\category.controller.ts
d:\Tugas Kuliah\UAS-CC\backend\src\controllers\cart.controller.ts
d:\Tugas Kuliah\UAS-CC\backend\src\controllers\order.controller.ts
d:\Tugas Kuliah\UAS-CC\backend\src\controllers\user.controller.ts
d:\Tugas Kuliah\UAS-CC\backend\src\controllers\admin.controller.ts
d:\Tugas Kuliah\UAS-CC\backend\src\controllers\infrastructure.controller.ts
d:\Tugas Kuliah\UAS-CC\backend\src\routes\auth.routes.ts
d:\Tugas Kuliah\UAS-CC\backend\src\routes\product.routes.ts
d:\Tugas Kuliah\UAS-CC\backend\src\routes\category.routes.ts
d:\Tugas Kuliah\UAS-CC\backend\src\routes\cart.routes.ts
d:\Tugas Kuliah\UAS-CC\backend\src\routes\order.routes.ts
d:\Tugas Kuliah\UAS-CC\backend\src\routes\user.routes.ts
d:\Tugas Kuliah\UAS-CC\backend\src\routes\admin.routes.ts
d:\Tugas Kuliah\UAS-CC\backend\src\routes\infrastructure.routes.ts
d:\Tugas Kuliah\UAS-CC\backend\src\routes\index.ts
d:\Tugas Kuliah\UAS-CC\backend\src\app.ts
d:\Tugas Kuliah\UAS-CC\backend\src\index.ts
```

### frontend/
```
d:\Tugas Kuliah\UAS-CC\frontend\package.json
d:\Tugas Kuliah\UAS-CC\frontend\tsconfig.json
d:\Tugas Kuliah\UAS-CC\frontend\tsconfig.node.json
d:\Tugas Kuliah\UAS-CC\frontend\vite.config.ts
d:\Tugas Kuliah\UAS-CC\frontend\postcss.config.js
d:\Tugas Kuliah\UAS-CC\frontend\tailwind.config.js
d:\Tugas Kuliah\UAS-CC\frontend\index.html
d:\Tugas Kuliah\UAS-CC\frontend\Dockerfile
d:\Tugas Kuliah\UAS-CC\frontend\nginx.conf
d:\Tugas Kuliah\UAS-CC\frontend\src\index.css
d:\Tugas Kuliah\UAS-CC\frontend\src\main.tsx
d:\Tugas Kuliah\UAS-CC\frontend\src\App.tsx
d:\Tugas Kuliah\UAS-CC\frontend\src\types\index.ts
d:\Tugas Kuliah\UAS-CC\frontend\src\store\authStore.ts
d:\Tugas Kuliah\UAS-CC\frontend\src\store\cartStore.ts
d:\Tugas Kuliah\UAS-CC\frontend\src\lib\api.ts
d:\Tugas Kuliah\UAS-CC\frontend\src\lib\utils.ts
d:\Tugas Kuliah\UAS-CC\frontend\src\lib\constants.ts
d:\Tugas Kuliah\UAS-CC\frontend\src\hooks\useAuth.ts
d:\Tugas Kuliah\UAS-CC\frontend\src\hooks\useProducts.ts
d:\Tugas Kuliah\UAS-CC\frontend\src\hooks\useCart.ts
d:\Tugas Kuliah\UAS-CC\frontend\src\hooks\useOrders.ts
d:\Tugas Kuliah\UAS-CC\frontend\src\components\ui\Button.tsx
d:\Tugas Kuliah\UAS-CC\frontend\src\components\ui\Input.tsx
d:\Tugas Kuliah\UAS-CC\frontend\src\components\ui\Card.tsx
d:\Tugas Kuliah\UAS-CC\frontend\src\components\ui\Badge.tsx
d:\Tugas Kuliah\UAS-CC\frontend\src\components\ui\Modal.tsx
d:\Tugas Kuliah\UAS-CC\frontend\src\components\ui\Table.tsx
d:\Tugas Kuliah\UAS-CC\frontend\src\components\ui\Spinner.tsx
d:\Tugas Kuliah\UAS-CC\frontend\src\components\ui\Toast.tsx
d:\Tugas Kuliah\UAS-CC\frontend\src\components\ui\EmptyState.tsx
d:\Tugas Kuliah\UAS-CC\frontend\src\components\layout\Navbar.tsx
d:\Tugas Kuliah\UAS-CC\frontend\src\components\layout\Footer.tsx
d:\Tugas Kuliah\UAS-CC\frontend\src\components\layout\StorefrontLayout.tsx
d:\Tugas Kuliah\UAS-CC\frontend\src\components\layout\AdminSidebar.tsx
d:\Tugas Kuliah\UAS-CC\frontend\src\components\layout\AdminTopbar.tsx
d:\Tugas Kuliah\UAS-CC\frontend\src\components\layout\AdminLayout.tsx
d:\Tugas Kuliah\UAS-CC\frontend\src\components\product\ProductCard.tsx
d:\Tugas Kuliah\UAS-CC\frontend\src\components\product\ProductGrid.tsx
d:\Tugas Kuliah\UAS-CC\frontend\src\components\product\ProductFilters.tsx
d:\Tugas Kuliah\UAS-CC\frontend\src\components\cart\CartDrawer.tsx
d:\Tugas Kuliah\UAS-CC\frontend\src\components\common\ProtectedRoute.tsx
d:\Tugas Kuliah\UAS-CC\frontend\src\components\common\LoadingPage.tsx
d:\Tugas Kuliah\UAS-CC\frontend\src\components\common\ErrorBoundary.tsx
d:\Tugas Kuliah\UAS-CC\frontend\src\pages\HomePage.tsx
d:\Tugas Kuliah\UAS-CC\frontend\src\pages\ProductsPage.tsx
d:\Tugas Kuliah\UAS-CC\frontend\src\pages\ProductDetailPage.tsx
d:\Tugas Kuliah\UAS-CC\frontend\src\pages\CartPage.tsx
d:\Tugas Kuliah\UAS-CC\frontend\src\pages\CheckoutPage.tsx
d:\Tugas Kuliah\UAS-CC\frontend\src\pages\OrdersPage.tsx
d:\Tugas Kuliah\UAS-CC\frontend\src\pages\OrderDetailPage.tsx
d:\Tugas Kuliah\UAS-CC\frontend\src\pages\ProfilePage.tsx
d:\Tugas Kuliah\UAS-CC\frontend\src\pages\LoginPage.tsx
d:\Tugas Kuliah\UAS-CC\frontend\src\pages\RegisterPage.tsx
d:\Tugas Kuliah\UAS-CC\frontend\src\pages\admin\DashboardPage.tsx
d:\Tugas Kuliah\UAS-CC\frontend\src\pages\admin\ProductsPage.tsx
d:\Tugas Kuliah\UAS-CC\frontend\src\pages\admin\CategoriesPage.tsx
d:\Tugas Kuliah\UAS-CC\frontend\src\pages\admin\OrdersPage.tsx
d:\Tugas Kuliah\UAS-CC\frontend\src\pages\admin\UsersPage.tsx
d:\Tugas Kuliah\UAS-CC\frontend\src\pages\admin\InfrastructurePage.tsx
d:\Tugas Kuliah\UAS-CC\frontend\src\pages\admin\PlatformPage.tsx
```

**Total: 76 source files + 2 verification commands**

---

## Technical Notes

### Node 26 compatibility
Node 26 ships with an updated OpenSSL. No `--openssl-legacy-provider` flag is needed for Vite 5+. All listed package versions are compatible with Node 26.

### Prisma on Node 26
`npx prisma generate` on Node 26 works without flags. The `DATABASE_URL` env var is not needed at generate time — only at runtime and migrate time.

### Docker socket mount (read-only)
The `docker.adapter.ts` mounts `/var/run/docker.sock` as `ro` in Compose. On Linux this works; on the development Windows host this socket does not exist, so dockerode will throw a connection error — the adapter must catch that error and return `{ status: 'NOT_CONFIGURED', message: 'Docker socket not available' }` instead of propagating it.

### Environment at runtime
`docker-compose.yml` uses `env_file: .env`. The coder must NOT hard-code any secrets. The `.env` file is created from `.env.example` by the developer and is listed in `.gitignore`.

### CORS
In development (Vite proxy), CORS is irrelevant since all /api calls go through localhost:5173 → localhost:4000. In Docker Compose, CORS is also irrelevant since nginx reverse-proxies everything through port 8080. The backend CORS middleware can allow `*` in development and restrict to configured origins in production via env var.

### Decimal type in Prisma
Prisma returns `Decimal` objects (from the `decimal.js` library), not plain numbers. The seed file and services that compute totals must call `.toNumber()` or use `+value` when doing arithmetic, and the JSON serializer must handle Decimal → number conversion (add a `toJSON` method or convert in service layer).

### Recharts in admin dashboard
The 7-day revenue chart in `admin/DashboardPage.tsx` uses static placeholder data (array of 7 date/value objects) since no time-series endpoint is specified. This is acceptable per spec ("hardcode jika belum ada endpoint").

### Port 8080 pre-check
The spec requires verifying port 8080 is free before Docker deployment. The README must include the command: `netstat -ano | findstr :8080` (Windows).

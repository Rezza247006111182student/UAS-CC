import { Prisma, OrderStatus } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { AppError } from '../types';

function makeError(message: string, statusCode: number): AppError {
  const err = new Error(message) as AppError;
  err.statusCode = statusCode;
  return err;
}

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// ---- Stats ----

export async function getStats() {
  const [revenueResult, totalOrders, activeProducts, totalCustomers, recentOrders] = await Promise.all([
    prisma.payment.aggregate({
      where: { status: 'SUCCESS' },
      _sum: { amount: true },
    }),
    prisma.order.count(),
    prisma.product.count({ where: { is_active: true } }),
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.order.findMany({
      take: 5,
      orderBy: { created_at: 'desc' },
      include: {
        user: { select: { id: true, email: true, name: true } },
        items: { include: { product: { select: { id: true, name: true, price: true } } } },
        payment: true,
      },
    }),
  ]);

  return {
    totalRevenue: revenueResult._sum.amount?.toNumber() ?? 0,
    totalOrders,
    totalProducts: activeProducts,
    totalCustomers,
    recentOrders,
  };
}

// ---- Orders ----

export interface ListAllOrdersParams {
  status?: OrderStatus;
  page?: number;
  limit?: number;
}

export async function listAllOrders(params: ListAllOrdersParams = {}) {
  const { status, page = 1, limit = 20 } = params;
  const where: Prisma.OrderWhereInput = {};
  if (status) where.status = status;

  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: limit,
      include: {
        user: { select: { id: true, email: true, name: true } },
        _count: { select: { items: true } },
        payment: true,
      },
      orderBy: { created_at: 'desc' },
    }),
    prisma.order.count({ where }),
  ]);

  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { payment: true },
  });

  if (!order) throw makeError('Order not found', 404);

  await prisma.order.update({ where: { id: orderId }, data: { status } });

  if (order.payment) {
    if (status === 'DELIVERED' && order.payment.status === 'PENDING') {
      await prisma.payment.update({
        where: { id: order.payment.id },
        data: { status: 'SUCCESS', paid_at: new Date() },
      });
    } else if (status === 'CANCELLED' && order.payment.status === 'PENDING') {
      await prisma.payment.update({
        where: { id: order.payment.id },
        data: { status: 'FAILED' },
      });
    }
  }

  return prisma.order.findUnique({
    where: { id: orderId },
    include: { payment: true, items: true },
  });
}

// ---- Users ----

export async function listUsers() {
  return prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      phone: true,
      is_active: true,
      created_at: true,
      updated_at: true,
    },
    orderBy: { created_at: 'desc' },
  });
}

// ---- Products ----

export interface CreateProductInput {
  name: string;
  description?: string;
  price: number;
  category_id: string;
  image_urls?: string[];
  stock_quantity?: number;
}

export interface UpdateProductInput {
  name?: string;
  description?: string;
  price?: number;
  category_id?: string;
  image_urls?: string[];
  stock_quantity?: number;
  is_active?: boolean;
}

export async function listAllProducts() {
  return prisma.product.findMany({
    include: { category: true, inventory: true },
    orderBy: { created_at: 'desc' },
  });
}

export async function createProduct(data: CreateProductInput) {
  const slug = toSlug(data.name);

  const existing = await prisma.product.findUnique({ where: { slug } });
  if (existing) throw makeError('A product with this name already exists', 409);

  const category = await prisma.category.findUnique({ where: { id: data.category_id } });
  if (!category) throw makeError('Category not found', 404);

  return prisma.$transaction(async (tx) => {
    const product = await tx.product.create({
      data: {
        name: data.name,
        slug,
        description: data.description ?? null,
        price: data.price,
        category_id: data.category_id,
        image_urls: data.image_urls ?? [],
      },
    });

    await tx.inventory.create({
      data: {
        product_id: product.id,
        quantity: data.stock_quantity ?? 0,
        reserved_quantity: 0,
      },
    });

    return product;
  });
}

export async function updateProduct(id: string, data: UpdateProductInput) {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw makeError('Product not found', 404);

  const updateData: Prisma.ProductUpdateInput = {};
  if (data.name !== undefined) {
    updateData.name = data.name;
    updateData.slug = toSlug(data.name);
  }
  if (data.description !== undefined) updateData.description = data.description;
  if (data.price !== undefined) updateData.price = data.price;
  if (data.image_urls !== undefined) updateData.image_urls = data.image_urls;
  if (data.is_active !== undefined) updateData.is_active = data.is_active;
  if (data.category_id !== undefined) {
    const category = await prisma.category.findUnique({ where: { id: data.category_id } });
    if (!category) throw makeError('Category not found', 404);
    updateData.category = { connect: { id: data.category_id } };
  }

  const updated = await prisma.product.update({ where: { id }, data: updateData });

  if (data.stock_quantity !== undefined) {
    await prisma.inventory.upsert({
      where: { product_id: id },
      update: { quantity: data.stock_quantity },
      create: { product_id: id, quantity: data.stock_quantity, reserved_quantity: 0 },
    });
  }

  return updated;
}

export async function deleteProduct(id: string) {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw makeError('Product not found', 404);

  return prisma.product.update({
    where: { id },
    data: { is_active: false },
  });
}

// ---- Categories ----

export interface CreateCategoryInput {
  name: string;
  description?: string;
  image_url?: string;
}

export interface UpdateCategoryInput {
  name?: string;
  description?: string;
  image_url?: string;
  is_active?: boolean;
}

export async function listAllCategories() {
  return prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: 'asc' },
  });
}

export async function createCategory(data: CreateCategoryInput) {
  const slug = toSlug(data.name);
  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) throw makeError('Category already exists', 409);

  return prisma.category.create({
    data: { name: data.name, slug, description: data.description ?? null, image_url: data.image_url ?? null },
  });
}

export async function updateCategory(id: string, data: UpdateCategoryInput) {
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) throw makeError('Category not found', 404);

  const updateData: Prisma.CategoryUpdateInput = {};
  if (data.name !== undefined) {
    updateData.name = data.name;
    updateData.slug = toSlug(data.name);
  }
  if (data.description !== undefined) updateData.description = data.description;
  if (data.image_url !== undefined) updateData.image_url = data.image_url;
  if (data.is_active !== undefined) updateData.is_active = data.is_active;

  return prisma.category.update({ where: { id }, data: updateData });
}

export async function deleteCategory(id: string) {
  const category = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { products: true } } },
  });
  if (!category) throw makeError('Category not found', 404);
  if (category._count.products > 0) {
    throw makeError('Cannot delete category with existing products', 400);
  }

  return prisma.category.delete({ where: { id } });
}

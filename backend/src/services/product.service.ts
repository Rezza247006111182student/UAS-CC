import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { AppError } from '../types';

export interface ListProductsParams {
  category?: string;
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

function makeError(message: string, statusCode: number): AppError {
  const err = new Error(message) as AppError;
  err.statusCode = statusCode;
  return err;
}

export async function listProducts(params: ListProductsParams = {}) {
  const { category, search, sort = 'newest', page = 1, limit = 12 } = params;

  const where: Prisma.ProductWhereInput = { is_active: true };

  if (category) {
    where.category = { slug: category };
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  let orderBy: Prisma.ProductOrderByWithRelationInput;
  switch (sort) {
    case 'price-asc':
      orderBy = { price: 'asc' };
      break;
    case 'price-desc':
      orderBy = { price: 'desc' };
      break;
    case 'name':
      orderBy = { name: 'asc' };
      break;
    case 'newest':
    default:
      orderBy = { created_at: 'desc' };
  }

  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: { category: true, inventory: true },
    }),
    prisma.product.count({ where }),
  ]);

  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getProduct(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true, inventory: true },
  });

  if (!product || !product.is_active) {
    throw makeError('Product not found', 404);
  }

  return product;
}

import { prisma } from '../lib/prisma';

export async function listCategories() {
  return prisma.category.findMany({
    where: { is_active: true },
    include: {
      _count: { select: { products: { where: { is_active: true } } } },
    },
    orderBy: { name: 'asc' },
  });
}

export async function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({ where: { slug } });
}

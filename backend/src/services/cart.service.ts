import { prisma } from '../lib/prisma';
import { AppError } from '../types';

function makeError(message: string, statusCode: number): AppError {
  const err = new Error(message) as AppError;
  err.statusCode = statusCode;
  return err;
}

async function getOrCreateCart(userId: string) {
  let cart = await prisma.cart.findFirst({
    where: { user_id: userId },
    include: { items: { include: { product: { include: { inventory: true } } } } },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { user_id: userId },
      include: { items: { include: { product: { include: { inventory: true } } } } },
    });
  }

  return cart;
}

export async function getCart(userId: string) {
  return getOrCreateCart(userId);
}

export async function addItem(userId: string, productId: string, quantity: number) {
  const product = await prisma.product.findUnique({
    where: { id: productId, is_active: true },
    include: { inventory: true },
  });

  if (!product) {
    throw makeError('Product not found', 404);
  }

  const stock = product.inventory?.quantity ?? 0;
  if (stock < quantity) {
    throw makeError(`Insufficient stock. Available: ${stock}`, 400);
  }

  const cart = await getOrCreateCart(userId);

  const existing = cart.items.find((i) => i.product_id === productId);

  if (existing) {
    const newQty = existing.quantity + quantity;
    if (stock < newQty) {
      throw makeError(`Insufficient stock. Available: ${stock}`, 400);
    }
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: newQty },
    });
  } else {
    await prisma.cartItem.create({
      data: {
        cart_id: cart.id,
        product_id: productId,
        quantity,
        price_at_add: product.price,
      },
    });
  }

  return getCart(userId);
}

export async function updateItem(userId: string, cartItemId: string, quantity: number) {
  const cart = await prisma.cart.findFirst({ where: { user_id: userId } });
  if (!cart) throw makeError('Cart not found', 404);

  const item = await prisma.cartItem.findFirst({
    where: { id: cartItemId, cart_id: cart.id },
    include: { product: { include: { inventory: true } } },
  });

  if (!item) throw makeError('Cart item not found', 404);

  const stock = item.product.inventory?.quantity ?? 0;
  if (stock < quantity) {
    throw makeError(`Insufficient stock. Available: ${stock}`, 400);
  }

  if (quantity <= 0) {
    await prisma.cartItem.delete({ where: { id: cartItemId } });
  } else {
    await prisma.cartItem.update({ where: { id: cartItemId }, data: { quantity } });
  }

  return getCart(userId);
}

export async function removeItem(userId: string, cartItemId: string) {
  const cart = await prisma.cart.findFirst({ where: { user_id: userId } });
  if (!cart) throw makeError('Cart not found', 404);

  const item = await prisma.cartItem.findFirst({
    where: { id: cartItemId, cart_id: cart.id },
  });

  if (!item) throw makeError('Cart item not found', 404);

  await prisma.cartItem.delete({ where: { id: cartItemId } });

  return getCart(userId);
}

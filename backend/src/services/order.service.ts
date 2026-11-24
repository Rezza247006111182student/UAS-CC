import { prisma } from '../lib/prisma';
import { AppError } from '../types';

function makeError(message: string, statusCode: number): AppError {
  const err = new Error(message) as AppError;
  err.statusCode = statusCode;
  return err;
}

function generateReferenceCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'INV-';
  for (let i = 0; i < 12; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export interface AddressData {
  recipient_name: string;
  phone: string;
  street: string;
  city: string;
  province: string;
  postal_code: string;
}

export interface CreateOrderInput {
  addressId?: string;
  addressData?: AddressData;
  notes?: string;
  paymentMethod?: string;
}

export async function createOrder(userId: string, input: CreateOrderInput) {
  const cart = await prisma.cart.findFirst({
    where: { user_id: userId },
    include: {
      items: {
        include: { product: { include: { inventory: true } } },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    throw makeError('Cart is empty', 400);
  }

  for (const item of cart.items) {
    const available = item.product.inventory?.quantity ?? 0;
    if (available < item.quantity) {
      throw makeError(
        `Insufficient stock for "${item.product.name}". Available: ${available}`,
        400
      );
    }
  }

  const SHIPPING_COST = 15000;
  const subtotal = cart.items.reduce((sum, item) => {
    return sum + item.price_at_add.toNumber() * item.quantity;
  }, 0);
  const total = subtotal + SHIPPING_COST;

  const order = await prisma.$transaction(async (tx) => {
    let resolvedAddressId: string | null = input.addressId ?? null;
    if (!resolvedAddressId && input.addressData) {
      const newAddress = await tx.address.create({
        data: {
          user_id: userId,
          recipient_name: input.addressData.recipient_name,
          phone: input.addressData.phone,
          street: input.addressData.street,
          city: input.addressData.city,
          province: input.addressData.province,
          postal_code: input.addressData.postal_code,
        },
      });
      resolvedAddressId = newAddress.id;
    }

    const newOrder = await tx.order.create({
      data: {
        user_id: userId,
        address_id: resolvedAddressId,
        notes: input.notes ?? null,
        payment_method: input.paymentMethod ?? null,
        subtotal,
        shipping_cost: SHIPPING_COST,
        total,
        status: 'PENDING',
        items: {
          create: cart.items.map((item) => ({
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: item.price_at_add,
            subtotal: item.price_at_add.toNumber() * item.quantity,
          })),
        },
      },
      include: { items: { include: { product: true } }, payment: true },
    });

    await tx.payment.create({
      data: {
        order_id: newOrder.id,
        amount: total,
        method: input.paymentMethod ?? null,
        reference_code: generateReferenceCode(),
        status: 'PENDING',
      },
    });

    for (const item of cart.items) {
      await tx.inventory.update({
        where: { product_id: item.product_id },
        data: {
          quantity: { decrement: item.quantity },
          reserved_quantity: { increment: item.quantity },
        },
      });
    }

    await tx.cartItem.deleteMany({ where: { cart_id: cart.id } });

    return newOrder;
  });

  return prisma.order.findUnique({
    where: { id: order.id },
    include: { items: { include: { product: true } }, payment: true },
  });
}

export async function listOrders(userId: string) {
  return prisma.order.findMany({
    where: { user_id: userId },
    include: {
      items: { include: { product: true } },
      payment: true,
    },
    orderBy: { created_at: 'desc' },
  });
}

export async function getOrder(userId: string, orderId: string) {
  const order = await prisma.order.findFirst({
    where: { id: orderId, user_id: userId },
    include: {
      items: { include: { product: true } },
      payment: true,
      address: true,
    },
  });

  if (!order) {
    throw makeError('Order not found', 404);
  }

  return order;
}

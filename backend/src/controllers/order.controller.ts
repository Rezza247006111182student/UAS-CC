import { Request, Response, NextFunction } from 'express';
import * as orderService from '../services/order.service';

export const createOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { addressId, notes, paymentMethod } = req.body;
    const rawAddressData = req.body.addressData;
    const addressData = rawAddressData ? {
      recipient_name: rawAddressData.recipientName,
      phone: rawAddressData.phone,
      street: rawAddressData.street,
      city: rawAddressData.city,
      province: rawAddressData.province,
      postal_code: rawAddressData.postalCode,
    } : undefined;
    const data = await orderService.createOrder(req.user!.id, { addressId, addressData, notes, paymentMethod });
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await orderService.listOrders(req.user!.id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const getOne = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await orderService.getOrder(req.user!.id, req.params.id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

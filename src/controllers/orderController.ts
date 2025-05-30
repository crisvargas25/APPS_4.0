import { Request, Response } from 'express';
import { Order, IOrder } from '../models/order';
import { User } from '../models/user';
import { Types } from 'mongoose';


// Create a new order
export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fkUser, total, subtotal } = req.body;

    if (!fkUser || total === undefined || subtotal === undefined) {
      res.status(400).json({ message: 'fkUser, total, and subtotal are required' });
      return;
    }

    if (!Types.ObjectId.isValid(fkUser)) {
      res.status(400).json({ message: 'Invalid fkUser ID' });
      return;
    }

    // Check if user exists and is active
    const user = await User.findOne({ _id: fkUser, status: true });
    if (!user) {
      res.status(404).json({ message: 'User not found or inactive' });
      return;
    }

    const order: IOrder = await Order.create({
      fkUser,
      total,
      subtotal,
      status: true
    });

    await order.populate('fkUser', 'name email');

    res.status(201).json({
      message: 'Order created successfully',
      order: {
        id: order._id,
        creationDate: order.creationDate,
        fkUser: order.fkUser,
        total: order.total,
        subtotal: order.subtotal,
        status: order.status
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      message: 'An error occurred while creating order',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get all orders
export const getAllOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const orders = await Order.find({ status: true })
      .populate('fkUser', 'name email');

    res.status(200).json({
      message: 'Orders retrieved successfully',
      orders
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      message: 'An error occurred while getting all orders',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get a single order by ID
export const getOrderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: 'Invalid order ID' });
      return;
    }

    const order = await Order.findOne({ _id: id, status: true })
      .populate('fkUser', 'name email');

    if (!order) {
      res.status(404).json({ message: 'Order not found or inactive' });
      return;
    }

    res.status(200).json({
      message: 'Order retrieved successfully',
      order: {
        id: order._id,
        creationDate: order.creationDate,
        fkUser: order.fkUser,
        total: order.total,
        subtotal: order.subtotal,
        status: order.status
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      message: 'An error occurred while getting order by ID',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Update an order
export const updateOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { fkUser, total, subtotal } = req.body;

    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: 'Invalid order ID' });
      return;
    }

    const order = await Order.findOne({ _id: id, status: true });
    if (!order) {
      res.status(404).json({ message: 'Order not found or inactive' });
      return;
    }

    if (fkUser) {
      if (!Types.ObjectId.isValid(fkUser)) {
        res.status(400).json({ message: 'Invalid fkUser ID' });
        return;
      }
      const user = await User.findOne({ _id: fkUser, status: true });
      if (!user) {
        res.status(404).json({ message: 'User not found or inactive' });
        return;
      }
      order.fkUser = fkUser;
    }

    if (total !== undefined) order.total = total;
    if (subtotal !== undefined) order.subtotal = subtotal;
    if (typeof req.body.status === 'boolean') order.status = req.body.status;

    const savedOrder = await order.save();

    await savedOrder.populate('fkUser', 'name email');

    res.status(200).json({
      message: 'Order updated successfully',
      order: {
        id: savedOrder._id,
        creationDate: savedOrder.creationDate,
        fkUser: savedOrder.fkUser,
        total: savedOrder.total,
        subtotal: savedOrder.subtotal,
        status: savedOrder.status
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      message: 'An error occurred while updating order',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Delete an order (logical delete)
export const deleteOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: 'Invalid order ID' });
      return;
    }

    const order = await Order.findOne({ _id: id, status: true });
    if (!order) {
      res.status(404).json({ message: 'Order not found or already inactive' });
      return;
    }

    order.status = false;

    const savedOrder = await order.save();

    await savedOrder.populate('fkUser', 'name email');

    res.status(200).json({
      message: 'Order logically deleted successfully',
      order: {
        id: savedOrder._id,
        creationDate: savedOrder.creationDate,
        fkUser: savedOrder.fkUser,
        total: savedOrder.total,
        subtotal: savedOrder.subtotal,
        status: savedOrder.status
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      message: 'An error occurred while deleting order',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
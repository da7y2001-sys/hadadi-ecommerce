const mongoose = require("mongoose");
const Product = require("../models/Product");
const Order = require("../models/Order");
const Notification = require("../models/Notification");

class OrderError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

const createOrder = async (req, res) => {
  const { items, shippingAddress } = req.body || {};

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      message: "Order must contain at least one item",
    });
  }

  if (!shippingAddress || typeof shippingAddress !== "object") {
    return res.status(400).json({
      message: "Shipping address is required",
    });
  }

  const fullName =
    typeof shippingAddress.fullName === "string"
      ? shippingAddress.fullName.trim()
      : "";

  const phone =
    typeof shippingAddress.phone === "string"
      ? shippingAddress.phone.trim()
      : "";

  const address =
    typeof shippingAddress.address === "string"
      ? shippingAddress.address.trim()
      : "";

  if (!fullName || !phone || !address) {
    return res.status(400).json({
      message: "Full name, phone and address are required",
    });
  }

  const requestedItems = [];

  for (const item of items) {
    if (!item || !mongoose.Types.ObjectId.isValid(item.product)) {
      return res.status(400).json({
        message: "Invalid product in order",
      });
    }

    if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
      return res.status(400).json({
        message: "Quantity must be a positive whole number",
      });
    }

    requestedItems.push({
      product: item.product,
      quantity: item.quantity,
    });
  }

  let session;

  try {
    session = await mongoose.startSession();
    session.startTransaction();

    const orderItems = [];
    let calculatedTotal = 0;

    for (const item of requestedItems) {
      const product = await Product.findOneAndUpdate(
        {
          _id: item.product,
          isActive: true,
          stock: { $gte: item.quantity },
        },
        {
          $inc: {
            stock: -item.quantity,
            soldCount: item.quantity,
          },
        },
        {
          new: true,
          session,
        }
      );

      if (!product) {
        const existingProduct = await Product.findById(
          item.product
        ).session(session);

        if (!existingProduct) {
          throw new OrderError("Product not found", 400);
        }

        if (!existingProduct.isActive) {
          throw new OrderError(
            `"${existingProduct.name}" is currently unavailable and cannot be ordered`,
            400
          );
        }

        throw new OrderError(
          `Insufficient stock for ${existingProduct.name}. Only ${existingProduct.stock} left.`,
          409
        );
      }

      const itemPrice =
        Math.round(product.price * (1 - product.discount / 100) * 100) / 100;

      calculatedTotal =
        Math.round((calculatedTotal + itemPrice * item.quantity) * 100) / 100;

      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.image,
        quantity: item.quantity,
        price: itemPrice,
      });
    }

    const [order] = await Order.create(
      [
        {
          user: req.user.userId,
          items: orderItems,
          total: calculatedTotal,
          shippingAddress: {
            fullName,
            phone,
            address,
          },
        },
      ],
      { session }
    );

    await session.commitTransaction();

    // Create admin notification asynchronously after successful order commit
    try {
      await Notification.create({
        type: "NEW_ORDER",
        title: "New order received!",
        message: `Order #${order._id.toString().slice(-6)} received with total ${order.total} SAR`,
        orderId: order._id,
        orderTotal: order.total,
        customerName: fullName || "Customer",
        isRead: false,
      });
    } catch (notifErr) {
      console.warn("Notification creation notice:", notifErr.message);
    }

    res.status(201).json({
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    if (session?.inTransaction()) {
      await session.abortTransaction();
    }

    if (error instanceof OrderError) {
      return res.status(error.status).json({
        message: error.message,
      });
    }

    console.error("Order creation failed:", error);

    res.status(500).json({
      message: "Failed to create order",
    });
  } finally {
    if (session) {
      await session.endSession();
    }
  }
};

const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user.userId,
    })
      .populate("items.product")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error("Failed to get user orders:", error);

    res.status(500).json({
      message: "Failed to get orders",
    });
  }
};

async function restoreOrderInventory(orderItems, session) {
  for (const item of orderItems) {
    const productId = item.product?._id || item.product;

    const updatedProduct = await Product.findOneAndUpdate(
      {
        _id: productId,
        soldCount: { $gte: item.quantity },
      },
      {
        $inc: {
          stock: item.quantity,
          soldCount: -item.quantity,
        },
      },
      {
        new: true,
        session,
      }
    );

    if (!updatedProduct) {
      const existingProduct = await Product.findById(productId).session(
        session
      );

      if (!existingProduct) {
        throw new OrderError(
          `Cannot cancel order: Product with ID '${productId}' no longer exists`,
          404
        );
      }

      throw new OrderError(
        `Cannot cancel order: Product '${existingProduct.name}' has soldCount (${existingProduct.soldCount}) less than order quantity (${item.quantity})`,
        409
      );
    }
  }
}

const cancelOrder = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      message: "Invalid order ID",
    });
  }

  let session;

  try {
    session = await mongoose.startSession();
    session.startTransaction();

    const order = await Order.findById(id).session(session);

    if (!order) {
      await session.abortTransaction();
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (order.user.toString() !== req.user.userId) {
      await session.abortTransaction();
      return res.status(403).json({
        message: "You are not authorized to cancel this order",
      });
    }

    if (order.status === "Cancelled") {
      await session.abortTransaction();
      return res.status(400).json({
        message: "Order is already cancelled",
      });
    }

    if (order.status !== "Processing") {
      await session.abortTransaction();
      return res.status(400).json({
        message: `Cannot cancel order with '${order.status}' status. Only orders in 'Processing' status can be cancelled.`,
      });
    }

    await restoreOrderInventory(order.items, session);

    order.status = "Cancelled";
    await order.save({ session });

    await session.commitTransaction();

    res.json({
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    if (session?.inTransaction()) {
      await session.abortTransaction();
    }

    if (error instanceof OrderError) {
      return res.status(error.status).json({
        message: error.message,
      });
    }

    console.error("Failed to cancel order:", error);

    res.status(500).json({
      message: "Failed to cancel order",
    });
  } finally {
    if (session) {
      await session.endSession();
    }
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  cancelOrder,
  restoreOrderInventory,
  OrderError,
};
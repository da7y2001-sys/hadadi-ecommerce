require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const { rateLimit } = require("express-rate-limit");

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is missing");
}
require("./db");
const app = express();
const Product = require("./models/Product");
const User = require("./models/User");
const Order = require("./models/Order");
const bcrypt = require("bcryptjs");
const authRoutes = require("./routes/auth");
const authMiddleware = require("./middleware/authMiddleware");
const adminMiddleware = require("./middleware/adminMiddleware");

app.use(helmet());
app.use(express.json());

const allowedOrigins = (
  process.env.FRONTEND_URL ||
  "http://localhost:5173,http://localhost:4173"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(null, false);
    },
  })
);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    message: "Too many authentication attempts. Please try again later.",
  },
});

app.use("/auth", authLimiter, authRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "E-commerce API is running",
  });
});

app.post(
  "/products",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
  try {
    const product = await Product.create(req.body);

    res.status(201).json({
      message: "Product created successfully",
      product: product
    });

  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation failed",
        errors: Object.values(error.errors).map(
          (error) => error.message
        ),
      });
    }

    console.error("Product creation failed:", error);

    res.status(500).json({
      message: "Failed to create product",
    });
  }
});
app.get("/products", async (req, res) => {
  try {
    const products = await Product.find();

    res.json(products);
  } catch (error) {
    console.error("Failed to get products:", error);

    res.status(500).json({
      message: "Failed to get products",
    });
  }
});

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

app.get("/products/search", async (req, res) => {
  try {
    const searchTerm = req.query.q;

    if (!searchTerm || !searchTerm.trim()) {
      return res.status(400).json({
        message: "Search query is required",
      });
    }

    const safeSearchTerm = escapeRegex(searchTerm.trim());

    const products = await Product.find({
      $or: [
        {
          name: {
            $regex: safeSearchTerm,
            $options: "i",
          },
        },
        {
          brand: {
            $regex: safeSearchTerm,
            $options: "i",
          },
        },
        {
          category: {
            $regex: safeSearchTerm,
            $options: "i",
          },
        },
      ],
    });

    res.json(products);
  } catch (error) {
    console.error("Product search failed:", error);

    res.status(500).json({
      message: "Search failed",
    });
  }
});

app.get("/products/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: "Invalid product ID",
      });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json(product);
  } catch (error) {
    console.error("Failed to get product:", error);

    res.status(500).json({
      message: "Failed to get product",
    });
  }
});

app.patch(
  "/products/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({
          message: "Invalid product ID",
        });
      }

      const product = await Product.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

      if (!product) {
        return res.status(404).json({
          message: "Product not found",
        });
      }

      res.json({
        message: "Product updated successfully",
        product,
      });
    } catch (error) {
      if (error.name === "ValidationError") {
        return res.status(400).json({
          message: "Validation failed",
          errors: Object.values(error.errors).map(
            (error) => error.message
          ),
        });
      }

      res.status(500).json({
        message: "Failed to update product",
      });
    }
  }
);

app.delete(
  "/products/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({
          message: "Invalid product ID",
        });
      }

      const product = await Product.findByIdAndDelete(req.params.id);

      if (!product) {
        return res.status(404).json({
          message: "Product not found",
        });
      }

      res.json({
        message: "Product deleted successfully",
        product: product,
      });
    } catch (error) {
      console.error("Failed to delete product:", error);

      res.status(500).json({
        message: "Failed to delete product",
      });
    }
  }
);

app.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({
      message: "You are authenticated",
      user,
    });
  } catch (error) {
    console.error("Failed to get profile:", error);

    res.status(500).json({
      message: "Failed to get profile",
    });
  }
});

app.patch("/profile", authMiddleware, async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name?.trim() || !email?.trim()) {
      return res.status(400).json({
        message: "Name and email are required",
      });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      {
        name: cleanName,
        email: cleanEmail,
      },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Email is already in use",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation failed",
        errors: Object.values(error.errors).map(
          (error) => error.message
        ),
      });
    }

    res.status(500).json({
      message: "Failed to update profile",
    });
  }
});

app.patch("/profile/password", authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        message: "All password fields are required",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        message: "New password must be at least 8 characters",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "New passwords do not match",
      });
    }

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(400).json({
        message: "Current password is incorrect",
      });
    }

    const newHashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = newHashedPassword;

    await user.save();

    res.json({
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Failed to update password:", error);

    res.status(500).json({
      message: "Failed to update password",
    });
  }
});

class OrderError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

app.post("/orders", authMiddleware, async (req, res) => {
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
          stock: { $gte: item.quantity },
        },
        {
          $inc: { stock: -item.quantity },
        },
        {
          new: true,
          session,
        },
      );

      if (!product) {
        const existingProduct = await Product.findById(item.product).session(
          session,
        );

        if (!existingProduct) {
          throw new OrderError("Product not found", 400);
        }

        throw new OrderError(
          `Insufficient stock for ${existingProduct.name}. Only ${existingProduct.stock} left.`,
          409,
        );
      }

      const itemPrice = product.price;

      calculatedTotal += itemPrice * item.quantity;

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
      { session },
    );

    await session.commitTransaction();

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
});
app.get("/orders", authMiddleware, async (req, res) => {
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
});

app.get("/admin/orders", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error("Failed to get admin orders:", error);

    res.status(500).json({
      message: "Failed to get orders",
    });
  }
});

app.patch(
  "/admin/orders/:id/status",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    const { status } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: "Invalid order ID",
      });
    }

    const allowedStatuses = [
      "Processing",
      "Shipped",
      "Delivered",
      "Cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid order status",
      });
    }

    let session;

    try {
      session = await mongoose.startSession();
      session.startTransaction();

      const order = await Order.findById(req.params.id).session(session);

      if (!order) {
        await session.abortTransaction();

        return res.status(404).json({
          message: "Order not found",
        });
      }

      if (order.status === "Cancelled" && status !== "Cancelled") {
        await session.abortTransaction();

        return res.status(400).json({
          message: "Cancelled orders cannot be changed to another status",
        });
      }

      if (status === "Cancelled" && order.status !== "Cancelled") {
        for (const item of order.items) {
          await Product.updateOne(
            { _id: item.product },
            { $inc: { stock: item.quantity } },
            { session },
          );
        }
      }

      order.status = status;

      await order.save({ session });
      await session.commitTransaction();

      res.json({
        message: "Order status updated successfully",
        order,
      });
    } catch (error) {
      if (session?.inTransaction()) {
        await session.abortTransaction();
      }

      console.error("Failed to update order status:", error);

      res.status(500).json({
        message: "Failed to update order status",
      });
    } finally {
      if (session) {
        await session.endSession();
      }
    }
  },
);

app.get("/admin/users", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    console.error("Failed to get admin users:", error);

    res.status(500).json({
      message: "Failed to get users",
    });
  }
});

app.use((err, req, res, _next) => {
  console.error(err);

  if (err.name === "ValidationError") {
    return res.status(400).json({
      message: "Validation failed",
      errors: Object.values(err.errors).map((error) => error.message),
    });
  }

  res.status(500).json({
    message: "Internal server error",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT} 🚀`);
});
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

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
app.use(express.json());
app.use(
  cors({
    origin: "*",
  })
);

app.use("/auth", authRoutes);
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/file/index.html");
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
    res.status(500).json({
      message: "Search failed",
      error: error.message,
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
    res.status(500).json({
      message: "Failed to update password",
    });
  }
});

app.post("/orders", authMiddleware, async (req, res) => {
  let session;

  try {
    session = await mongoose.startSession();

    const { items, shippingAddress } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      message: "Order must contain at least one item",
    });
  }

  if (!shippingAddress) {
    return res.status(400).json({
      message: "Shipping address is required",
    });
  }

  session.startTransaction();
    const orderItems = [];
    let calculatedTotal = 0;

    for (const item of items) {
      if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
        throw new Error("Quantity must be a positive whole number");
      }

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
        throw new Error("Product not found or insufficient stock");
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
          shippingAddress,
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
  console.error("Order creation failed:", error);

  if (session?.inTransaction()) {
    await session.abortTransaction();
  }

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
    res.status(500).json({
      message: "Failed to get orders",
      error: error.message,
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
    res.status(500).json({
      message: "Failed to get orders",
      error: error.message,
    });
  }
});

app.patch(
  "/admin/orders/:id/status",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const { status } = req.body;

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

      const order = await Order.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true, runValidators: true },
      );

      if (!order) {
        return res.status(404).json({
          message: "Order not found",
        });
      }

      res.json({
        message: "Order status updated successfully",
        order,
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to update order status",
        error: error.message,
      });
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
    res.status(500).json({
      message: "Failed to get users",
      error: error.message,
    });
  }
});

app.use((err, req, res, next) => {
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

app.listen(5000, () => {
  console.log("Server started on port 5000 🚀");
});
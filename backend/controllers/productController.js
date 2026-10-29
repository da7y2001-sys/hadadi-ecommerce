const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Product = require("../models/Product");

const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);

    res.status(201).json({
      message: "Product created successfully",
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
    if (error.code === 11000) {
  return res.status(409).json({
    message: "SKU is already in use",
  });
}

    console.error("Product creation failed:", error);

    res.status(500).json({
      message: "Failed to create product",
    });
  }
};

const getProducts = async (req, res) => {
  try {
    const products = await Product.find({ isActive: true }).sort({
      createdAt: -1,
    });

    res.json(products);
  } catch (error) {
    console.error("Failed to get products:", error);

    res.status(500).json({
      message: "Failed to get products",
    });
  }
};

const getAdminProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    console.error("Failed to get admin products:", error);

    res.status(500).json({
      message: "Failed to get products",
    });
  }
};

const getBestSellingProducts = async (req, res) => {
  try {
    const products = await Product.find({
      isActive: true,
      soldCount: { $gt: 0 },
    })
      .sort({ soldCount: -1, createdAt: -1 })
      .limit(8);

    res.json(products);
  } catch (error) {
    console.error("Failed to get best selling products:", error);

    res.status(500).json({
      message: "Failed to get best selling products",
    });
  }
};


function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const searchProducts = async (req, res) => {
  try {
    const searchTerm = req.query.q;

    if (!searchTerm || !searchTerm.trim()) {
      return res.status(400).json({
        message: "Search query is required",
      });
    }

    const safeSearchTerm = escapeRegex(searchTerm.trim());

    const products = await Product.find({
      isActive: true,
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
};

const getProductById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: "Invalid product ID",
      });
    }

    let isAdmin = false;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role === "admin") {
          isAdmin = true;
        }
      } catch {
        // Ignore invalid token on public endpoint
      }
    }

    const query = { _id: req.params.id };
    if (!isAdmin) {
      query.isActive = true;
    }

    const product = await Product.findOne(query);

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
};

const updateProduct = async (req, res) => {
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
    if (error.code === 11000) {
  return res.status(409).json({
    message: "SKU is already in use",
  });
}

    console.error("Product update failed:", error);

    res.status(500).json({
      message: "Failed to update product",
    });
  }
};

const deleteProduct = async (req, res) => {
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
      product,
    });
  } catch (error) {
    console.error("Failed to delete product:", error);

    res.status(500).json({
      message: "Failed to delete product",
    });
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct("category", { isActive: true });

    res.json(categories);
  } catch (error) {
    console.error("Failed to get categories:", error);

    res.status(500).json({
      message: "Failed to get categories",
    });
  }
};

const getProductSuggestions = async (req, res) => {
  try {
    const searchTerm = req.query.q;

    if (!searchTerm || !searchTerm.trim()) {
      return res.json([]);
    }

    const safeSearchTerm = escapeRegex(searchTerm.trim());

    const suggestions = await Product.find({
      isActive: true,
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
    })
      .select("_id name image")
      .limit(5);

    res.json(suggestions);
  } catch (error) {
    console.error("Failed to get product suggestions:", error);

    res.status(500).json({
      message: "Failed to get suggestions",
    });
  }
};

module.exports = {
  createProduct,
  getCategories,
  getProductSuggestions,
  getProducts,
  getAdminProducts,
  getBestSellingProducts,
  searchProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
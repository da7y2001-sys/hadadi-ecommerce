const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

items: [
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
  },
],

  total: {
    type: Number,
    required: true,
  },

  status: {
    type: String,
    default: "Processing",
  },

  shippingAddress: {
    fullName: String,
    phone: String,
    address: String,
  },
  
},
{
     timestamps: true,
}
);

module.exports = mongoose.model("Order", orderSchema);
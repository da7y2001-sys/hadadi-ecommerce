const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
name: {
  type: String,
  required: true,
  trim: true,
  minlength: 2,
},

  price: {
    type: Number,
    required: true,
    min: 0,
  },


description: {
  type: String,
  required: true,
  trim: true,
  minlength: 5,
},

category: {
  type: String,
  required: true,
  trim: true,
},

  brand: {
  type: String,
  required: true,
  trim: true,
},
  stock: {
    type: Number,
    required: true,
    min: 0,
    validate: {
      validator: Number.isInteger,
      message: "Stock must be a whole number",
    },
},

  image: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model("Product", productSchema);
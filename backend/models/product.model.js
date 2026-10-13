const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      validate: {
        validator: function (val) {
          return typeof val === 'number' && val > 0;
        },
        message: 'Price must be greater than 0',
      },
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    image: {
      type: String,
      required: [true, 'Product image URL is required'],
      trim: true,
    },
    stock: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: [0, 'Stock cannot be negative'],
      validate: {
        validator: function (val) {
          return Number.isInteger(val) && val >= 0;
        },
        message: 'Stock must be a non-negative integer',
      },
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

const Product = mongoose.model('Product', productSchema);

module.exports = Product;

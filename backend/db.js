const mongoose = require("mongoose");


if (!process.env.MONGO_URI) {
  throw new Error("MONGO_URI is missing");
}

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((error) => {
    console.log("MongoDB connection failed:");
    console.log(error.message);
  });
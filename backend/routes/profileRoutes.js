const express = require("express");
const router = express.Router();

const {
  getProfile,
  updateProfile,
  updatePassword,
} = require("../controllers/profileController");

const authMiddleware = require("../middleware/authMiddleware");

router.get("/", authMiddleware, getProfile);
router.patch("/", authMiddleware, updateProfile);
router.patch("/password", authMiddleware, updatePassword);

module.exports = router;
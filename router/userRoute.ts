import express from "express";
import {
  createUser,
  getAllUsers,
  login,
  refresh,
  sendResetPassword,
  resetPassword,
} from "../controller/userController";

const router = express.Router();

router.post("/user", createUser);
router.post("/login", login);
router.post("/refresh", refresh);
router.get("/user", getAllUsers);
router.post("/send-reset-password", sendResetPassword);
router.post("/reset-password/:resetToken", resetPassword);

export default router;

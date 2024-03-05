import { Router } from "express";
import { default as oauthSignInRoutes } from "./signin";
import {
  changePassword,
  refreshToken,
  registerUser,
  requestVerificationCode,
  verifyAccount,
} from "../controlers";
import { authenticate } from "../../../middlewares";
const router = Router();
router.get("/verify", authenticate, requestVerificationCode);
router.post("/verify", authenticate, verifyAccount);
router.post("/change-password", authenticate, changePassword);
router.use("/signin", oauthSignInRoutes);
router.post("/signup", registerUser);
router.get("/refresh-token", refreshToken);
export default router;

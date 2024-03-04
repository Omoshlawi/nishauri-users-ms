import { Router } from "express";
import { default as oauthSignInRoutes } from "./signin";
import { refreshToken, registerUser } from "../controlers";
const router = Router();
router.use("/signin", oauthSignInRoutes);
router.post("/signup", registerUser);
router.get("/refresh-token", refreshToken);
export default router;

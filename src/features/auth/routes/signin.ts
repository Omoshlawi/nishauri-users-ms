import { Router } from "express";
import { googleSignIn, loginUser } from "../controlers";

const router = Router();
router.post("/credentials", loginUser);
router.get("/google", googleSignIn);
export default router;

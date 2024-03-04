import { Router } from "express";
import {
  deleteUser,
  getUser,
  getUsers,
  updateProfile,
  viewProfile,
} from "../controlers";
import { authenticate as requireAuthenticated } from "../../../middlewares";

const router = Router();
router.get("/", getUsers);
router.get("/profile", requireAuthenticated, viewProfile);
router.post("/profile", requireAuthenticated, updateProfile);
router.get("/:id", getUser);
router.put("/:id", requireAuthenticated, getUser);
router.delete("/:id", requireAuthenticated, deleteUser);
export default router;

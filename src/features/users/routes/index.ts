import { Router } from "express";
import {
  deleteUser,
  getUser,
  getUsers,
  updateProfile,
  viewProfile,
} from "../controlers";
import {
  fileUploader,
  requireAccountVerified,
  authenticate as requireAuthenticated,
} from "../../../middlewares";
import { PROFILE_URL } from "../../../utils";

const router = Router();
router.get("/", getUsers);
router.get("/profile", requireAuthenticated, viewProfile);
router.post(
  "/profile",
  [
    requireAuthenticated,
    requireAccountVerified as any,
    fileUploader({ dest: PROFILE_URL }).single("image"),
  ],
  updateProfile
);
router.get("/:id", getUser);
router.put("/:id", requireAuthenticated, getUser);
router.delete("/:id", requireAuthenticated, deleteUser);
export default router;

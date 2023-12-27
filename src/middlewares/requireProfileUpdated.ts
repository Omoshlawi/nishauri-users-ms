import { NextFunction, Response } from "express";
import { UserRequest } from "../shared/types";

const requireProfileUpdated = async (
  req: UserRequest,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;
  if (!user.profileUpdated) {
    return res
      .status(403)
      .json({ detail: "Access Denied. You must complete your profile" });
  }
  next();
};

export default requireProfileUpdated;

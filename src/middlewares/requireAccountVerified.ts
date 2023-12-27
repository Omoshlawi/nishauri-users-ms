import { NextFunction, Response } from "express";
import { UserRequest } from "../shared/types";

const requireAccountSetupComplete = async (
  req: UserRequest,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;
  if (!user.accountVerified) {
    return res
      .status(403)
      .json({ detail: "Access Denied. You must verify you account" });
  }
  next();
};

export default requireAccountSetupComplete;

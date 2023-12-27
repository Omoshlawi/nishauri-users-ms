import config from "config";
import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import { UserRequest } from "../shared/types";
import { User } from "../features/auth/data/models";

const refreshToken = async (
  req: UserRequest,
  res: Response,
  next: NextFunction
) => {
  const refreshToken = req.header("x-refresh-token");

  if (!refreshToken) {
    return res
      .status(401)
      .json({ detail: "Access Denied. No refresh token provided" });
  }

  try {
    const decoded: any = jwt.verify(refreshToken, config.get("jwt"));
    const userId = decoded._id;
    const user = await User.findOne({ _id: userId });
    if (!user) return res.status(400).json({ detail: "Invalid Refresh Token" });
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ detail: "Invalid refresh token or expired" });
  }
};

export default refreshToken;

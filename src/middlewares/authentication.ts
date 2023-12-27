import config from "config";
import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import { UserRequest } from "../shared/types";
import { User } from "../features/auth/data/models";

const authenticate = async (
  req: UserRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.header("x-access-token");
  if (!token)
    return res.status(401).json({ detail: "Access Denied.No token Provided" });
  try {
    const decoded: any = jwt.verify(token, config.get("jwt"));
    const userId = decoded._id;
    const user = await User.findOne({ _id: userId }).select("-password");
    //   .populate("roles");
    if (!user) return res.status(400).json({ detail: "Invalid Token" });
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ detail: "Invalid token" });
  }
};

export default authenticate;

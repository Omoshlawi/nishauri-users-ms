import { NextFunction, Request, Response } from "express";
import { UserRequest } from "../../../../shared/types";
import { userRepository } from "../../data/respositories";
import { UserSchema } from "../../presentation";
import { APIException } from "../../../../shared/exceprions";
import { PROFILE_URL } from "../../../../utils";
import { getUpdateFileAsync } from "../../../../utils/helpers";
import { Types } from "mongoose";

export const profileView = async (
  req: UserRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await userRepository.getUserProfileById(req.user._id);
    return res.json(user);
  } catch (error) {
    next(error);
  }
};
export const profileUpdate = async (
  req: UserRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const validation = await UserSchema.safeParseAsync({
      ...req.body,
      image: await getUpdateFileAsync(req, PROFILE_URL, req.user.image),
    });
    if (!validation.success)
      throw new APIException(400, validation.error.format());
    const user = await userRepository.updateUserProfile(
      req.user._id,
      validation.data
    );
    return res.json(user);
  } catch (error) {
    next(error);
  }
};

export const userProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await userRepository.getUserProfileById(req.params.id);
    return res.json(user);
  } catch (error) {
    next(error);
  }
};

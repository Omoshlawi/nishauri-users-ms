import { NextFunction, Request, Response } from "express";
import { userRepo } from "../repositories";
import { UserRequest } from "../../../shared/types";
import { UpdateUserSchema } from "../schema";
import { APIException } from "../../../shared/exceprions";
import { z } from "zod";

export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await userRepo.findAll();
    return res.json({ results: users });
  } catch (error) {
    next(error);
  }
};

export const getUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const idValidation = z.string().uuid().safeParse(req.params.id);
    if (
      !idValidation.success ||
      !(await userRepo.exists({ id: idValidation.data }))
    ) {
      throw { status: 404, errors: { detail: "User not found" } };
    }
    const users = await userRepo.findOneById(req.params.id);
    return res.json({ results: users });
  } catch (error) {
    next(error);
  }
};

export const viewProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    return res.json((req as UserRequest).user);
  } catch (error) {
    next(error);
  }
};
export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validation = await UpdateUserSchema.safeParseAsync(req.body);
    if (!validation.success)
      throw new APIException(400, validation.error.format());
    const user = await userRepo.updateById(
      (req as UserRequest).user.id,
      validation.data
    );
    return res.json(user);
  } catch (error) {
    next(error);
  }
};
export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const idValidation = z.string().uuid().safeParse(req.params.id);
    if (
      !idValidation.success ||
      !(await userRepo.exists({ id: idValidation.data }))
    ) {
      throw { status: 404, errors: { detail: "User not found" } };
    }
    const validation = await UpdateUserSchema.safeParseAsync(req.body);
    if (!validation.success)
      throw new APIException(400, validation.error.format());
    const user = await userRepo.updateById(req.params.id, validation.data);
    return res.json(user);
  } catch (error) {
    next(error);
  }
};
export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const idValidation = z.string().uuid().safeParse(req.params.id);
    if (
      !idValidation.success ||
      !(await userRepo.exists({ id: idValidation.data }))
    ) {
      throw { status: 404, errors: { detail: "User not found" } };
    }
    const user = await userRepo.deleteById(req.params.id);
    return res.json(user);
  } catch (error) {
    next(error);
  }
};

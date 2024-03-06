import { NextFunction, Request, Response } from "express";
import { authRepo } from "../repositories";
import {
  AccountVerificationSchema,
  ChangePasswordSchema,
  Login,
  Register,
} from "../schema";
import { APIException } from "../../../shared/exceprions";
import { omit } from "lodash";
import { parseMessage, sendSms } from "../../../utils/helpers";
import config from "config";
import { UserRequest } from "../../../shared/types";
import { userRepo } from "../../users/repositories";
export * from "./oauthSignIn";

export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validation = await Register.safeParseAsync(req.body);
    if (!validation.success)
      throw new APIException(400, validation.error.format());
    const user = await authRepo.credentialsSignUp(
      omit(validation.data, ["confirmPassword"]) as any
    );
    const token = authRepo.generateUserToken(user);
    return res.json({ user, token });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validation = await Login.safeParseAsync(req.body);
    if (!validation.success)
      throw new APIException(400, validation.error.format());
    const user = await authRepo.login(validation.data);
    const token = authRepo.generateUserToken(user);
    return res.json({ user, token });
  } catch (error) {
    next(error);
  }
};
export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const refreshToken = req.header("x-refresh-token");
  if (!refreshToken)
    return res.status(401).json({ detail: "Unauthorized - Token missing" });
  try {
    const token = await authRepo.refreshUserToken(refreshToken);
    return res
      .header("x-refresh-token", token.refreshToken)
      .header("x-access-token", token.accessToken)
      .json(token);
  } catch (err: any) {
    if (err.status) return res.status(err.status).json({ detail: err.detail });
    return res.status(401).json({ detail: "Unauthorized - Invalid token" });
  }
};

export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validation = await ChangePasswordSchema.safeParseAsync(req.body);
    if (!validation.success)
      throw new APIException(400, validation.error.format());
    await authRepo.changeUserPassword((req as any).user.id, validation.data);
    return res.json({ detail: "Password changed successfully!" });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
  } catch (error) {
    next(error);
  }
};

export const verifyAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validation = await AccountVerificationSchema.safeParseAsync(req.body);
    if (!validation.success)
      throw new APIException(400, validation.error.format());
    await authRepo.verifyUserAccount((req as any).user.id, validation.data);

    return res.json({ detail: "Verification successfull" });
  } catch (error) {
    next(error);
  }
};

export const requestVerificationCode = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // TODO Restrict only to creds account
  try {
    const modes = ["sms", "watsapp", "email"];
    const mode: "sms" | "watsapp" | "email" = modes.includes(
      req.query.mode as any
    )
      ? (req.query.mode as any)
      : "sms";

    const { otp: code } = await authRepo.getOrCreateAccountVerification(
      (req as any).user.id,
      mode
    );
    const messageTemplate: string = config.get("sms.OTP_SMS");

    const parsedMessage = parseMessage({ code }, messageTemplate);
    sendSms(parsedMessage, (req as any).user.person!.phoneNumber);
    return res.json({
      detail: `OTP sent to ${mode} ${
        (req as any).user.person!.phoneNumber
      } successfully`,
    });
  } catch (error) {
    next(error);
  }
};

import { NextFunction, Request, Response } from "express";
import { getProfileInfo } from "../../../utils";
import { authRepo } from "../repositories";
import { OauthAuthSchema } from "../schema";
import logger from "../../../shared/logger";

export const googleSignIn = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const code = req.query.code as string;
    const profile = await getProfileInfo(code);

    const validation = await OauthAuthSchema.safeParseAsync({
      providerAccountId: profile?.sub,
      name: profile?.name,
      firstName: profile?.given_name,
      lastName: profile?.family_name,
      email: profile?.email,
      image: profile?.picture,
      type: "google",
      provider: "Google",
    });
    if (!validation.success) {
      logger.error(validation.error.format());
      throw {
        status: 401,
        errors: { detail: "Unauthorized - Error authenticating with google" },
      };
    }
    const user = await authRepo.oauthSignin(validation.data);
    const token = authRepo.generateUserToken(user);
    return res.json({ user, token });
  } catch (e: any) {
    if (e.status === 400)
      next({
        status: 401,
        errors: { detail: "Unauthorized - Error authenticating with google" },
      });
    else next(e);
  }
};

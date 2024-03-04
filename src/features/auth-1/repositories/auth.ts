import { tuple, z } from "zod";
import { Login, OauthAuthSchema, Register } from "../schema";
import bcrypt from "bcrypt";
import { Prisma, User } from "@prisma/client";
import { userRepo } from "../../users/repositories";
import { AccountModel } from "../models";
import {
  sign,
  verify,
  decode,
  TokenExpiredError,
  VerifyErrors,
  JsonWebTokenError,
} from "jsonwebtoken";
import { configuration } from "../../../utils";
import { TokenPayload } from "../../../shared/types";
import { UserModel } from "../../users/models";

class AuthRepository {
  selectFileds: Prisma.UserSelect = {
    id: true,
    username: true,
    accounts: {
      select: {
        id: true,
        provider: true,
        providerAccountId: true,
        type: true,
        createdAt: true,
        updatedAt: true,
      },
    },
    accountVerified: true,
    isActive: true,
    profileUpdated: true,
    person: {
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        gender: true,
        phoneNumber: true,
        dateOfBirth: true,
        constituency: true,
        county: true,
        image: true,
        maritalStatus: true,
        primaryLanguage: true,
        createdAt: true,
        updatedAt: true,
      },
    },
    patientProfile: {
      select: {
        id: true,
        allergies: true,
        bloodGroup: true,
        chronics: true,
        disabilities: true,
        educationLevel: true,
        height: true,
        weight: true,
        occupation: true,
        createdAt: true,
        updatedAt: true,
      },
    },
    lastLogin: true,
    createdAt: true,
    updatedAt: true,
  };
  async credentialsSignUp(data: z.infer<typeof Register>): Promise<User> {
    const { password, confirmPassword, email, phoneNumber, username } = data;
    const hash = await this.hashPassword(password);
    // Validate unique fields ensuriing no other with them then creates user with related person
    const user = await userRepo.create({
      password: hash,
      username,
      email,
      phoneNumber,
    });
    // const { accessToken, refreshToken } = this.generateUserToken(user);
    const account = await AccountModel.create({
      data: {
        provider: "Credentials",
        type: "credentials",
        userId: user.id,
      },
    });
    return await userRepo.findOneById(user.id);
  }

  async register(data: z.infer<typeof Register>): Promise<User> {
    const { password, email, phoneNumber, username } = data;
    const hash = await this.hashPassword(password);
    const user = await userRepo.create({
      password: hash,
      username,
      email,
      phoneNumber,
    });

    return user;
  }

  async login({ identifier, password }: z.infer<typeof Login>): Promise<User> {
    const users = await userRepo.findByCriteria({
      OR: [
        { username: identifier },
        { person: { email: identifier } },
        { person: { phoneNumber: identifier } },
      ],
      accounts: { some: { type: "credentials" } },
    });
    const passwordChecks = await Promise.all(
      users.map((user) => this.checkPassword(user, password))
    );
    if (passwordChecks.every((val) => val === false))
      throw {
        errors: {
          password: { _errors: ["Invalid username or password"] },
          identifier: { _errors: ["Invalid username or password"] },
        },
        status: 400,
      };
    return users[passwordChecks.findIndex((val) => val)];
  }

  async checkPassword(user: User, password: string) {
    const valid = await bcrypt.compare(password, user.password!);
    return valid;
  }

  async hashPassword(password: string) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    return hash;
  }

  /**
   * Decordes jwt token to extract Id and gets user with Id
   * @param token {string}
   * @throws Unauthorized exception with status 401
   * @returns {User} object
   */
  async getUserByToken(token: string) {
    if (!token) {
      throw { status: 401, detail: "Unauthorized - Token required" };
    }
    try {
      const { id, type: tokenType }: TokenPayload = verify(
        token,
        configuration.oauth.auth_secrete
      ) as TokenPayload;
      if (tokenType !== "access") throw Error();
      const user = await userRepo.findOneById(id);
      return user;
    } catch (error) {
      let detail;
      if (error instanceof TokenExpiredError) {
        detail = "Unauthorized - Token expired";
      } else if (error instanceof JsonWebTokenError) {
        detail = "Unauthorized - Invalid Token";
      } else {
        detail = "Unauthorized - Invalid Token";
      }
      throw { status: 401, detail };
    }
  }
  async refreshUserToken(token: string) {
    if (!token) {
      throw { status: 401, detail: "Unauthorized - Token required" };
    }
    try {
      const { id, type: tokenType }: TokenPayload = verify(
        token,
        configuration.oauth.auth_secrete
      ) as TokenPayload;
      if (tokenType !== "refresh") throw Error();
      const user = await userRepo.findOneById(id);
      return this.generateUserToken(user);
    } catch (error) {
      let detail;
      if (error instanceof TokenExpiredError) {
        detail = "Unauthorized - Token expired";
      } else if (error instanceof JsonWebTokenError) {
        detail = "Unauthorized - Invalid Token";
      } else {
        detail = "Unauthorized - Invalid Token";
      }
      throw { status: 401, detail };
    }
  }

  generateUserToken(user: User) {
    const accessPayload: TokenPayload = {
      id: user.id,
      type: "access",
      username: user.username ?? undefined,
      // TODO add commented details
      // name: user?. ?? undefined,
      // email: user.email ?? undefined,
      // phoneNumber: user.phoneNumber ?? undefined,
      // image: user.image ?? undefined,
    };
    const refreshPayload: TokenPayload = { id: user.id, type: "refresh" };
    const accessToken = sign(accessPayload, configuration.oauth.auth_secrete, {
      expiresIn: configuration.oauth.access_token_age,
    });
    const refreshToken = sign(
      refreshPayload,
      configuration.oauth.auth_secrete,
      {
        expiresIn: configuration.oauth.refresh_token_age,
      }
    );
    return { accessToken, refreshToken };
  }

  async getUserProviderAccount(user: User, provider: string) {
    const account = await AccountModel.findFirst({
      where: { userId: user.id, provider },
    });
    return account;
  }

  async oauthSignin({
    provider,
    providerAccountId,
    type,
    email,
    firstName,
    image,
    lastName,
    name,
  }: z.infer<typeof OauthAuthSchema>): Promise<User> {
    let account = await AccountModel.findFirst({
      where: { type: type as string, providerAccountId },
    });
    if (account !== null) return (await userRepo.findByAccount(account))!;
    let user;
    if (email) user = await userRepo.findOne({ person: { email } });
    if (user === null)
      user = await UserModel.create({
        data: {
          person: {
            create: {
              email,
              firstName,
              lastName,
              image,
            },
          },
        },
      });
    await AccountModel.create({
      data: {
        provider,
        providerAccountId,
        type: type as string,
        userId: user!.id,
      },
    });
    return user!;
  }
}
export default AuthRepository;

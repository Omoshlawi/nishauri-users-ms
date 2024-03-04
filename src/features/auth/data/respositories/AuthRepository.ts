import { z } from "zod";
import {
  AccountVerificationSchema,
  LoginSchema,
  RegisterSchema,
} from "../../presentation";
import { AccountVerification, Person, User } from "../models";
import bcrypt from "bcrypt";
import { isEmpty } from "lodash";
import { Types } from "mongoose";
import moment from "moment/moment";
import ChangePasswordSchema from "../../presentation/ChangepasswordSchema";

const checkPassword = async (user: any, password: string) => {
  const valid = await bcrypt.compare(password, user.password);
  return valid;
};

const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  return hash;
};

const loginUser = async ({
  password,
  username,
}: z.infer<typeof LoginSchema>) => {
  /**
   * get persons with email or phone number equals provided username
   * Gets user with username or id in user ids
   * Check all user against provided password
   * return fist user whos creds matched
   * else return undefined
   */
  const person = await Person.find({
    $or: [{ email: username }, { phoneNumber: username }],
  }).select("user");
  const _userIds = person.map(({ user }) => user);
  const users = await User.find({
    $or: [{ username }, { _id: { $in: _userIds } }],
  });
  const passwordChecks = await Promise.all(
    users.map((user) => checkPassword(user, password))
  );
  if (passwordChecks.every((val) => val === false))
    throw {
      errors: { password: { _errors: ["Invalid username or password"] } },
      status: 400,
    };
  return users[passwordChecks.findIndex((val) => val)];
};

const registerUser = async ({
  email,
  password,
  phoneNumber,
  username,
}: z.infer<typeof RegisterSchema>) => {
  /**
   * Check if no user has the username,
   * checks if no person has email r
   * checks if no person has phone number
   * creates user
   * creates person
   * return user
   * else return underfinied
   */
  const errors: any = {};

  if (await User.findOne({ username }))
    errors["username"] = { _errors: ["Username taken"] };

  if (await Person.findOne({ email }))
    errors["email"] = { _errors: ["Email taken taken"] };

  if (await Person.findOne({ phoneNumber }))
    errors["phoneNumber"] = { _errors: ["phoneNumber taken"] };

  if (!isEmpty(errors)) throw { status: 400, errors };

  const user = new User({ username, password: await hashPassword(password) });
  await user.save();

  const person = new Person({ user: user.id, email, phoneNumber });
  await person.save();
  return user;
};

const verifyUserAccount = async (
  userId: string | Types.ObjectId,
  { mode, otp }: z.infer<typeof AccountVerificationSchema>
) => {
  // TODO Can use mode against the extra field to make sure its same with what user has provided
  const verification = await AccountVerification.findOne({
    user: userId,
    verified: false,
    expiry: {
      $gte: moment(),
    },
    otp: otp,
  });
  if (!verification)
    throw {
      errors: { otp: { _errors: ["Invalid or Expired code!"] } },
      status: 400,
    };
  const user = await User.findByIdAndUpdate(
    userId,
    { accountVerified: true },
    { new: true }
  );
  verification.verified = true;
  await verification.save();

  return user;
};

const getOrCreateAccountVerification = async (
  userId: string | Types.ObjectId,
  mode: "sms" | "watsapp" | "email"
) => {
  const verification = await AccountVerification.getOrCreate({
    user: userId,
    extra: mode,
  });
  return verification;
};

const changeUserPassword = async (
  userId: string | Types.ObjectId,
  {
    confirmNewPassword,
    currentPassword,
    newPassword,
  }: z.infer<typeof ChangePasswordSchema>
) => {
  const user = await User.findById(userId);
  if (!(await checkPassword(user, currentPassword)))
    throw {
      errors: { currentPassword: { _errors: ["Invalid password"] } },
      status: 400,
    };
  user!.password = await hashPassword(newPassword);
  await user!.save();
};

export default {
  registerUser,
  loginUser,
  verifyUserAccount,
  getOrCreateAccountVerification,
  changeUserPassword,
};



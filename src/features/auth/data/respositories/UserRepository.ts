import { Types } from "mongoose";
import { Person, User } from "../models";
import { z } from "zod";
import { UserSchema } from "../../presentation";
import { isEmpty } from "lodash";

const getUserProfileById = async (id: string | Types.ObjectId) => {
  if (!Types.ObjectId.isValid(id))
    throw { status: 404, errors: { detail: "User not found" } };
  const userId = typeof id === "string" ? new Types.ObjectId(id) : id;
  const users = await User.aggregate([
    {
      $match: {
        _id: userId,
      },
    },
    {
      $lookup: {
        from: "people",
        as: "person",
        foreignField: "user",
        localField: "_id",
      },
    },
    { $project: { password: 0, __v: 0, "person.__v": 0 } },
  ]);

  const user = users[0];

  if (!user) throw { status: 404, errors: { detail: "User not found" } };
  return user;
};

const updateUserProfile = async (
  userId: string | Types.ObjectId,
  data: z.infer<typeof UserSchema>
) => {
  const {
    // allergies,
    // chronics,
    // disabilities,
    email,
    phoneNumber,
    username,
    ...others
  } = data;

  /**
   * Check if no user has the username,
   * checks if no person has email r
   * checks if no person has phone number
   * update user
   * update person
   * Update user profile updated flag to true
   */
  const errors: any = {};
  const _user = await User.findOne({ username });
  if (_user && !(_user as any).equals(userId))
    errors["username"] = { _errors: ["Username taken"] };
  let _person = await Person.findOne({ email });
  if (_person && !(_person.user as any).equals(userId))
    errors["email"] = { _errors: ["Email taken taken"] };
  _person = await Person.findOne({ phoneNumber });
  if (_person && !(_person.user as any).equals(userId))
    errors["phoneNumber"] = { _errors: ["phoneNumber taken"] };

  if (!isEmpty(errors)) throw { status: 400, errors };

  const user = await User.findByIdAndUpdate(
    userId,
    { username, profileUpdated: true },
    { new: true }
  );
  const person = await Person.findOneAndUpdate(
    { user: user?.id },
    { ...others, phoneNumber, email }
  );
  return await getUserProfileById(userId);
};

const getPersonByUserId = async (userId: string | Types.ObjectId) => {
  return await Person.findOne({ user: userId });
};

export default {
  getUserProfileById,
  updateUserProfile,
  getPersonByUserId,
};

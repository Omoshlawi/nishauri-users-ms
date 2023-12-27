import config from "config";
import { Schema, model } from "mongoose";
import jwt from "jsonwebtoken";

const User = model(
  "User",
  new Schema(
    {
      username: {
        type: String,
        required: true,
        unique: true,
        maxlength: 30,
        minlength: 4,
        validate: {
          validator: async function (v: string) {
            const currentUser: any = this; // Reference to the current user document

            // Check if another user exists with the same username
            const existingUser = await User.findOne({ username: v });

            // If an existing user is found and it is not the current user, throw an error
            if (existingUser && !existingUser._id.equals(currentUser._id)) {
              throw new Error("User with username " + v + " already exists!");
            }

            return true;
          },
          message: "User with username {VALUE} already exists!",
        },
      },
      password: {
        type: String,
        maxlength: 1024,
        required: true,
      },
      isActive: {
        type: Boolean,
        default: true,
      },
      accountVerified: {
        type: Boolean,
        default: false,
      },
      profileUpdated: {
        type: Boolean,
        default: false,
      },
    },
    {
      timestamps: true,
      methods: {
        generateAuthToken() {
          const accessToken = jwt.sign(
            { _id: this._id },
            config.get("jwt") as string,
            {
              expiresIn: "2h",
            }
          );
          const refreshToken = jwt.sign(
            { _id: this._id },
            config.get("jwt") as string,
            {
              expiresIn: "1d",
            }
          );
          return { accessToken, refreshToken };
        },
      },
      // overide toJSON that ommits password and __v fields
      // overide toJSON that ommits password and __v fields
      toJSON: {
        transform: function (doc, ret) {
          // delete the password and __v fields from the returned object
          delete ret.password;
          delete ret.__v;
        },
      },
    }
  )
);

export default User;

import { Schema, model } from "mongoose";
import { generateExpiryTime, generateOTP } from "../../../../utils/helpers";
import moment from "moment/moment";

const AccountVerification = model(
  "AccountVerification",
  new Schema(
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      otp: {
        type: String,
        default: () => generateOTP(5),
      },
      expiry: {
        type: Date,
        default: () => generateExpiryTime(5),
      },
      verified: {
        type: Boolean,
        default: false,
      },
      extra: {
        type: String,
        maxlength: 255,
      },
    },
    {
      statics: {
        async getOrCreate({ user, extra }) {
          let verification = await this.findOne({
            user,
            verified: false,
            expiry: {
              $gte: moment(),
            },
          });
          if (!verification) {
            verification = new this({ user, extra });
            await verification.save();
          }
          return verification;
        },
      },
      timestamps: true,
    }
  )
);

export default AccountVerification;

import { Schema, Types, model } from "mongoose";

const Person = model(
  "Person",
  new Schema(
    {
      user: {
        type: Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
      },
      image: {
        type: String,
        default: null, // You can set a default value if needed
      },
      firstName: {
        type: String,
        default: null,
      },
      lastName: {
        type: String,
        default: null,
      },
      email: {
        type: String,
        required: true,
        unique: true,
      },
      phoneNumber: {
        type: String,
        required: true,
        unique: true,
      },
      dateOfBirth: {
        type: Date,
        default: null,
      },
      gender: {
        type: String,
        enum: ["U", "F", "M"],
        default: "U",
      },
      county: {
        type: String,
        default: null,
      },
      constituency: {
        type: String,
        default: null,
      },
      bloodGroup: {
        type: String,
        default: null,
      },
      weight: {
        type: String,
        default: null,
      },
      height: {
        type: String,
        default: null,
      },
      maritalStatus: {
        type: String,
        default: null,
      },
      educationLevel: {
        type: String,
        default: null,
      },
      primaryLanguage: {
        type: String,
        default: null,
      },
      occupation: {
        type: String,
        default: null,
      },
      allergies: {
        type: [String],
        default: [],
      },
      chronics: {
        type: [String],
        default: [],
      },
      disabilities: {
        type: [String],
        default: [],
      },
    },
    { timestamps: true }
  )
);

export default Person;

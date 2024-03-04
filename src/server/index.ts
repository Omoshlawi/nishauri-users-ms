import cors from "cors";
import express, { Application } from "express";
import mongoose from "mongoose";
import morgan from "morgan";
import { MEDIA_ROOT, configuration } from "../utils";
import { default as authRoutes } from "../features/auth/route";
import { default as authRoutes1 } from "../features/auth-1/routes";
import { default as usersRoutes } from "../features/users/routes";
import proxy from "express-http-proxy";
import { handleErrors } from "../middlewares";
import { Channel } from "amqplib";

export const dbConnection = async () => {
  try {
    await mongoose.connect(configuration.db as string);
    console.info(
      `[+]${configuration.name}:${configuration.version} Connected to database Successfully`
    );
  } catch (error) {
    console.error("[x]Could not connect to database" + error);
    process.exit(1); // Exit the application on database connection error
  }
};

export const configureExpressApp = async (
  app: Application,
  channel: Channel
) => {
  // --------------------middlewares---------------------------

  if (app.get("env") === "development") {
    app.use(morgan("tiny"));
    console.info(
      `[+]${configuration.name}:${configuration.version} enable morgan`
    );
  }
  app.use(cors());
  app.use(express.json());
  app.use(express.static(MEDIA_ROOT));
  // ------------------End middlewares------------------------

  //------------------- routes --------------------------------
  app.use("/auth", authRoutes);
  app.use("/api/auth", authRoutes1);
  app.use("/users", usersRoutes);
  //-------------------end routes-----------------------------

  //---------------- error handler -----------------------
  app.use(handleErrors);
  //---------------- end error handler -----------------------
};

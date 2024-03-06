import cors from "cors";
import express, { Application } from "express";
import morgan from "morgan";
import { MEDIA_ROOT, configuration } from "../utils";
import { default as authRoutes } from "../features/auth/routes";
import { default as usersRoutes } from "../features/users/routes";
import proxy from "express-http-proxy";
import { handleErrors } from "../middlewares";
import { Channel } from "amqplib";

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
  app.use("/api/auth", authRoutes);
  app.use("/users", usersRoutes);
  //-------------------end routes-----------------------------

  //---------------- error handler -----------------------
  app.use(handleErrors);
  //---------------- end error handler -----------------------
};

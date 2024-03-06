import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { configureExpressApp } from "./server";
import { messageBroker } from "./amqp";
import { configuration } from "./utils";
import { registry } from "./utils/helpers";
import { toNumber } from "lodash";

const startServer = async () => {
  const app = express();
  const httpServer = createServer(app);
  // -----------------Message broker--------------------------
  const channel = await messageBroker.createChannel();
  // -----------------End Message broker---------------------
  await configureExpressApp(app, channel);
  const port = configuration.port ?? 0;
  httpServer.listen(port, () => {
    const address:any = httpServer.address();

    const { register, unregister } = registry(
      configuration.registry.url,
      configuration.name,
      configuration.version,
      toNumber(address.port)
    );
    register();
    const interval = setInterval(register, 10000);
    const cleanupAndExit = async () => {
      clearInterval(interval);
      await unregister();
      process.exit(0);
    };

    process.on("exit", cleanupAndExit);
    process.on("uncaughtException", cleanupAndExit);
    process.on("SIGTERM", cleanupAndExit);
    process.on("SIGINT", cleanupAndExit);

    const bind =
      typeof address === "string" ? `pipe ${address}` : `port ${address?.port}`;
    console.info(
      `[+]${configuration.name}:${configuration.version} listening on ${bind}`
    );
  });
};

startServer();

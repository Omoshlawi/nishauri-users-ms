import amqp, { Channel, Message } from "amqplib";
import config from "config";

export const MESSAGE_BROKER_URL: string = config.get("message_broker_url");
export const NISHAURI_EXCHANGE_NAME: string = config.get(
  "message_broker.exchanges.nishauri.name"
);
export const NISHAURI_PATIENT_BINDING_KEY: string = config.get(
  "message_broker.exchanges.nishauri.queues.patient.binding_key"
);
export const NISHAURI_LOGGING_BINDING_KEY: string = config.get(
  "message_broker.exchanges.nishauri.queues.logging.binding_key"
);
export const NISHAURI_APPOINTMENT_BINDING_KEY: string = config.get(
  "message_broker.exchanges.nishauri.queues.appointment.binding_key"
);
export const NISHAURI_APPOINTMENT_QUEUE: string = config.get(
  "message_broker.exchanges.nishauri.queues.appointment.name"
);
export const NISHAURI_LOGGING_QUEUE: string = config.get(
  "message_broker.exchanges.nishauri.queues.logging.name"
);
export const NISHAURI_PATIENT_QUEUE: string = config.get(
  "message_broker.exchanges.nishauri.queues.patient.name"
);

const createChannel = async (exchangeType: string = "direct") => {
  try {
    const connection = await amqp.connect(MESSAGE_BROKER_URL);
    const channel = await connection.createChannel();
    await channel.assertExchange(NISHAURI_EXCHANGE_NAME, exchangeType);
    return channel;
  } catch (error) {
    console.error("Error creating channel:", error);
    throw error;
  }
};
const publishMessage = async (
  channel: Channel,
  bindingKey: string,
  message: any
) => {
  try {
    channel.publish(
      NISHAURI_EXCHANGE_NAME,
      bindingKey,
      Buffer.from(JSON.stringify(message), "utf-8")
    );
  } catch (error) {
    console.error("Error publishing message:", error);
    throw error;
  }
};

const subscribeMessage = async (
  channel: Channel,
  bindingKey: string,
  queueName: string
) => {
  try {
    const queue = await channel.assertQueue(queueName);
    channel.bindQueue(queue.queue, NISHAURI_EXCHANGE_NAME, bindingKey);

    channel.consume(queue.queue, (data) => {
      if (data) {
        console.log("Received data:", data.content.toString());
        channel.ack(data as Message);
      }
    });
  } catch (error) {
    console.error("Error subscribing to message:", error);
    throw error;
  }
};
export default {
  createChannel,
  publishMessage,
  subscribeMessage,
};

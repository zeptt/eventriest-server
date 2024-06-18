import { Kafka } from "kafkajs";

const kafka = new Kafka({
  clientId: "api-server",
  brokers: ["kafka:9092"],
  retry: {
    retries: 10,
    multiplier: 2,
  },
});

const producer = kafka.producer();

producer.connect();

export default producer;

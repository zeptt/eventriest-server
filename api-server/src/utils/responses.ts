import { Response } from "express";
import producer from "./kafka-client";

export const successResponse = (
  res: Response,
  message: string,
  data: Record<string, any>,
  status = 200
) => {
  return res.status(status).json({
    message,
    data,
    error: null,
  });
};

export const errorResponse = async (res: Response, message: string, status = 400) => {
  await producer.send({
    topic: "logger",
    messages: [
      {
        value: JSON.stringify({
          level: "error",
          message,
          timestamp: new Date().toISOString(),
        }),
        key: `API_SERVER-ERROR-`,
      },
    ],
  });
  return res.status(status).json({
    message,
    data: null,
    error: null,
  });
};

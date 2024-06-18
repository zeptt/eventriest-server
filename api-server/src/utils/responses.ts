import { Request, Response } from "express";
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

export const errorResponse = async (
  req: Request,
  res: Response,
  message: string,
  status = 400
) => {
  await producer.send({
    topic: "logger",
    messages: [
      {
        value: JSON.stringify({
          level: "error",
          message,
          timestamp: new Date().toISOString(),
          meta: {
            req: {
              method: req.method,
              url: req.url,
              ip: req.ip,
            },
          },
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

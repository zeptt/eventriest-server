import { Response } from "express";

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

export const errorResponse = (res: Response, message: string, status = 400) => {
  return res.status(status).json({
    message,
    data: null,
    error: null,
  });
};

import { RequestHandler } from "express";

function isAuthenticated(): RequestHandler {
  return (req, res, next) => {
    if (!req.session.user) {
      return res.status(401).send("Unauthorized");
    }

    next();
  };
}

export default isAuthenticated;

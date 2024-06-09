import express from "express";
import mainRouter from "./router";
import * as redis from "redis";
import RedisStore from "connect-redis";
import session from "express-session";

interface User {
  id: number;
  name: string;
  email: string;
}

declare module "express-session" {
  interface SessionData {
    user: User;
  }
}

async function runServer() {
  const app = express();

  app.use(express.json());

  app.use(express.urlencoded({ extended: true }));

  app.set("trust proxy", 1);

  const client = redis.createClient({
    url: process.env.REDIS_URL,
  });

  await client.connect();

  const sessionMiddleware = session({
    store: new RedisStore({ client }),
    secret: process.env.SESSION_SECRET || "my-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24,
    },
  });

  app.use(sessionMiddleware);

  app.use("/", mainRouter);

  app.listen(process.env.PORT || 3000, () => {
    console.log(
      `Server is running on http://127.0.0.1:${process.env.PORT || 3000}`
    );
  });
}

runServer().catch((err) => {
  console.error(err);
});

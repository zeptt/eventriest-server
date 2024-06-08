import express from "express";

const app = express();

app.get("/", (_, res) => {
  res.send("Hello World!");
});

app.listen(process.env.PORT || 3000, () => {
  console.log(
    `Server is running on http://127.0.0.1:${process.env.PORT || 3000}`
  );
});

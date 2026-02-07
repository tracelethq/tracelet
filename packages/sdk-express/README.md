# Tracelet (Express)

Lightweight request logging for Express apps.

## Install
yarn add @tracelet/express

## Usage
```ts
import express from "express";
import tracelet from "@tracelet/express";

const app = express();

app.use(tracelet({
  serviceName: "example-api"
}));

app.get("/users/:id", (req, res) => {
  res.json({ id: req.params.id });
});

app.listen(3000);

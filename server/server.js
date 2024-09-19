import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import "dotenv/config";
import userRouter from "./routes/userRoute.js";
import taskRouter from "./routes/taskRoute.js";
import dashboardRouter from "./routes/dashboardRoute.js";
import { app, server } from "./socket/socket.js";

const port = process.env.PORT || 9000;

app.use(express.json());
app.use(cors());

connectDB();

app.use("/api/user", userRouter);
app.use("/api/task", taskRouter);
app.use("/api/dashboard", dashboardRouter);

app.get("/", (req, res) => {
  res.send("Hello World");
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

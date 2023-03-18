import { authRegisterV2, authLoginV2 } from "./auth";
import { clearV1 } from "./other";
import { userProfileV2 } from "./users";
import { storeData } from "./helperFunctions";
import express, { json, Request, Response } from "express";
import { echo } from "./echo";
import morgan from "morgan";
import config from "./config.json";
import cors from "cors";

// Set up web app
const app = express();
// Use middleware that allows us to access the JSON body of requests
app.use(json());
// Use middleware that allows for access from other domains
app.use(cors());
// for logging errors (print to terminal)
app.use(morgan("dev"));

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || "localhost";

// Example get request
app.get("/echo", (req: Request, res: Response, next) => {
  const data = req.query.echo as string;
  return res.json(echo(data));
});

app.post("/auth/login/v2", (req: Request, res: Response) => {
  const { email, password } = req.body;
  res.json(authLoginV2(email, password));
  storeData();
});

app.post("/auth/register/v2", (req: Request, res: Response) => {
  const { email, password, nameFirst, nameLast } = req.body;
  res.json(authRegisterV2(email, password, nameFirst, nameLast));
  storeData();
});

app.get("/user/profile/v2", (req: Request, res: Response) => {
  const token = String(req.query.token);
  const uId = parseInt(String(req.query.uId));
  res.json(userProfileV2(token, uId));
  storeData();
});

app.delete("/clear/v1", (req: Request, res: Response) => {
  res.json(clearV1());
  storeData();
});

// start server
const server = app.listen(PORT, HOST, () => {
  // DO NOT CHANGE THIS LINE
  console.log(`⚡️ Server started on port ${PORT} at ${HOST}`);
});

// For coverage, handle Ctrl+C gracefully
process.on("SIGINT", () => {
  server.close(() => console.log("Shutting down server gracefully."));
});

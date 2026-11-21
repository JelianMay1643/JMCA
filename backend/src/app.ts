import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import cors from "cors";
import helmet from "helmet";
import hpp from "hpp";
import { ENV } from "@/config/env";
import routes from "@/routes";

const app = express();

app.use(helmet());
app.use(cors({ origin: ENV.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(hpp());

app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: `${ENV.APP_NAME} is running`,
    timestamp: new Date().toISOString(),
  });
});

app.use("/api", routes);


app.use((req, res) => {
  res.status(404).json({ status: "error", message: "Route not found" });
});


app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ message: "Something went wrong. Please try again." });
});

export default app;
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import mustacheExpress from "mustache-express";
import router from "./routes.js";
import {
  NotFoundMiddleware,
  ServerErrorMiddleware,
} from "./Middlewares/ErrorMiddleware.js";

class Application {
  constructor() {
    this.app = express();
    this.name = process.env.APP_NAME;
    this.env = process.env.APP_ENV;
    this.port = process.env.APP_PORT;

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    this.app.set("views", path.join(__dirname, "Views"));
    this.app.set("view engine", "html");
    this.app.engine("html", mustacheExpress());
    this.applyHandlers();
  }

  run() {
    this.app.listen(this.port, this.listener.bind(this));
  }

  listener() {
    console.log(`${this.name} ${this.env} listening on port ${this.port}`);
  }

  applyHandlers() {
    const globalMiddlewares = this.getGlobalMiddleware();

    globalMiddlewares.before.forEach((middleware) => {
      this.app.use(middleware);
    });

    this.app.use("/", router);

    globalMiddlewares.after.forEach((middleware) => {
      this.app.use(middleware);
    });
  }

  getGlobalMiddleware() {
    return {
      before: [express.json(), express.static("public")],
      after: [NotFoundMiddleware, ServerErrorMiddleware],
    };
  }
}

export default new Application();

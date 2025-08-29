import { Router } from "express";
import MockController from "./Controllers/MockController.js";
import DocsController from "./Controllers/DocsController.js";
import SchemaParserMiddleware from "./Middlewares/SchemaParserMiddleware.js";

const router = Router();

router.get("/", DocsController.index);
router.use(SchemaParserMiddleware).all("/api", MockController.index);

export default router;

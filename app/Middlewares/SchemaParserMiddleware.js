import SchemaParserService from "../Services/SchemaParserService.js";

export default function SchemaParserMiddleware(req, res, next) {
  const schemaParser = new SchemaParserService();

  if (req.query.s) {
    req.schema = schemaParser.parse(req.query.s);
  }

  if (req.query.h) {
    req.headerSchema = schemaParser.parseHeader(req.query.h);
    res.set(req.headerSchema);
  }

  next();
}

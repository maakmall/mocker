export const NotFoundMiddleware = (req, res) => {
  console.log("404 Triggered for:", req.method, req.originalUrl);
  res.status(404).json({ message: "Endpoint not found" });
};

export const ServerErrorMiddleware = (err, req, res, next) => {
  console.log("500 Triggered for:", req.method, req.originalUrl, err.message);
  res.status(500).json({ message: "Sorry, something when wrong" });
};

import FakerService from "./../Services/FakerService.js";

class MockController {
  constructor() {
    this.faker = new FakerService();
  }

  index = (req, res) => {
    const data = this.faker.generate(req.schema || {});
    const statusCode = parseInt(req.query.c) || 200;

    res.status(statusCode).json(data);
  };
}

export default new MockController();

import FakerService from "../Services/FakerService.js";

class DocsController {
  constructor() {
    this.faker = new FakerService();
  }

  index = (req, res) => {
    res.render("index", {
      title: "Mocker",
      url: process.env.APP_URL + (`:${process.env.APP_PORT}` || ""),
      modules: JSON.stringify(this.faker.getModules()),
    });
  };
}

export default new DocsController();

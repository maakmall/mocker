class DocsController {
  index = (req, res) => {
    res.render("index", {
      title: "Mocker",
    });
  };
}

export default new DocsController();

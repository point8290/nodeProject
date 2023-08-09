const express = require("express");
const bodyParser = require("body-parser");
const apiRoutes = require("./src/routes");
require("dotenv").config();

const app = express();
app.use(bodyParser.json());

app.use("/api/v1", apiRoutes);

const PORT = process.env.PORT || 3000;
app.listen(process.env.PORT, () => {
  console.log(`server started on ${process.env.PORT}`);
});

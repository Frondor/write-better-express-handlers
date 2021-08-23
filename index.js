const express = require("express");
const { addMock } = require("./lib/axios-mock");
const badExampleRouteHandler = require("./example-bad");
const goodExampleRouteHandler = require("./example-good");

addMock("api.com/users", { data: [{ id: 123 }] });
addMock("api.com/profiles/123", { data: { name: "Tom" } });
// addMock("api.com/orders?user=123", { data: { id: 456 } }) // uncomment for a working use case

const app = express();
app.use("/bad", badExampleRouteHandler);
app.use("/good", goodExampleRouteHandler);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send(`<pre>${err.stack}</pre>`);
});

app.listen("8080", () => console.log("App started @ http://localhost:8080"));

module.exports = {
  errorHandler,
};

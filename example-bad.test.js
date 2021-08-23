const express = require("express");
const supertest = require("supertest");
const badExampleRouteHandler = require("./example-bad");
const { addMock, resetAllMocks } = require("./lib/axios-mock");

const errorHandler = (err, req, res, next) => {
  res.status(500).send(err.stack);
};

describe("badExampleRouteHandler", () => {
  const app = express();
  beforeEach(() => {
    resetAllMocks();
    app.removeAllListeners();
  });

  test("should work as intended", async () => {
    addMock("api.com/users", { data: [{ id: 123 }] });
    addMock("api.com/profiles/123", { data: { name: "Tom" } });
    addMock("api.com/orders?user=123", { data: { id: 456 } });

    app.use("/", badExampleRouteHandler).use(errorHandler);
    const response = await supertest(app).get("/");

    expect(response.body).toMatchObject({
      users: [
        {
          id: 123,
          orders: {
            id: 456,
          },
          profile: {
            name: "Tom",
          },
        },
      ],
    });
  });

  test("should return an error with incomplete stack trace", async () => {
    addMock("api.com/users", { data: [{ id: 123 }] });
    addMock("api.com/profiles/123", { data: { name: "Tom" } });
    // addMock("api.com/orders?user=123", { data: { id: 456 } }) - MAKE ORDERS FAIL

    app.use("/", badExampleRouteHandler).use(errorHandler);
    const response = await supertest(app).get("/");

    expect(response.text).toMatchInlineSnapshot(`
"Error: connect ECONNREFUSED 127.0.0.1:80
    at TCPConnectWrap.afterConnect [as oncomplete] (net.js:1148:16)"
`);
  });
});

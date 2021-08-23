const express = require("express");
const supertest = require("supertest");
const goodExampleRouteHandler = require("./example-good");
const { addMock, resetAllMocks } = require("./lib/axios-mock");

const errorHandler = (err, req, res, next) => {
  res.status(500).send(err.stack);
};

describe("goodExampleRouteHandler", () => {
  const app = express();
  beforeEach(() => {
    resetAllMocks();
    app.removeAllListeners();
  });

  test("should work as intended", async () => {
    addMock("api.com/users", { data: [{ id: 123 }] });
    addMock("api.com/profiles/123", { data: { name: "Tom" } });
    addMock("api.com/orders?user=123", { data: { id: 456 } });

    app.use("/", goodExampleRouteHandler).use(errorHandler);
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

  test("should return an error with COMPLETE stack trace", async () => {
    addMock("api.com/users", { data: [{ id: 123 }] });
    addMock("api.com/profiles/123", { data: { name: "Tom" } });
    // addMock("api.com/orders?user=123", { data: { id: 456 } }) - MAKE ORDERS FAIL

    app.use("/", goodExampleRouteHandler).use(errorHandler);
    const response = await supertest(app).get("/");

    expect(response.text).toMatchInlineSnapshot(`
"Error: Failed to fetchUserOrders() @ api.com/orders?user=123 [message:connect ECONNREFUSED 127.0.0.1:80] [user:123]
    at fetchUserOrders (C:\\\\Users\\\\Fede\\\\Documents\\\\write-better-express-handlers\\\\example-good.js:57:15)
    at processTicksAndRejections (internal/process/task_queues.js:95:5)
    at async Promise.all (index 0)
    at async Promise.all (index 1)
    at decorateUsers (C:\\\\Users\\\\Fede\\\\Documents\\\\write-better-express-handlers\\\\example-good.js:77:32)
    at goodExampleRouteHandler (C:\\\\Users\\\\Fede\\\\Documents\\\\write-better-express-handlers\\\\example-good.js:7:28)"
`);
  });
});

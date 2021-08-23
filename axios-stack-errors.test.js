const express = require("express");
const axios = require("axios");
const supertest = require("supertest");

const handlerWithoutIndividualCatchOfPromises = async (req, res, next) => {
  try {
    const { data: users } = await axios.get("api.com/users");
    res.json({ users });
  } catch (error) {
    res.send(error.stack);
  }
};

const handlerWithIndividualCatchOfPromises = async (req, res, next) => {
  try {
    // Add a try/catch block for Promise rejections
    try {
      const { data: users } = await axios.get("api.com/users");
      res.json({ users });
    } catch (error) {
      throw new Error(`Failed to get users [message:${error.message}]`);
    }
  } catch (error) {
    res.send(error.stack);
  }
};

describe("Handling Axios errors with Express", () => {
  const app = express();

  describe("given a handler with async calls and no try/catch", () => {
    it("should handle an error with incomplete stack", async () => {
      app.get("/bad-trace", handlerWithoutIndividualCatchOfPromises);
      const response = await supertest(app).get("/bad-trace");

      expect(response.text).toMatchInlineSnapshot(`
        "Error: connect ECONNREFUSED 127.0.0.1:80
            at TCPConnectWrap.afterConnect [as oncomplete] (net.js:1148:16)"
      `);
    });
  });

  describe("given a handler with async calls and try/catch (rethrow)", () => {
    it("should handle an error with complete stack", async () => {
      app.get("/good-trace", handlerWithIndividualCatchOfPromises);
      const response = await supertest(app).get("/good-trace");

      expect(response.text).toMatchInlineSnapshot(`
"Error: Failed to get users [message:connect ECONNREFUSED 127.0.0.1:80]
    at handlerWithIndividualCatchOfPromises (C:\\\\Users\\\\Fede\\\\Documents\\\\write-better-express-handlers\\\\axios-stack-errors.test.js:21:13)
    at processTicksAndRejections (internal/process/task_queues.js:95:5)"
`);
    });
  });
});

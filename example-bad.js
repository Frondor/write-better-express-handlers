const axios = require("axios");

const badExampleRouteHandler = async (req, res, next) => {
  try {
    const users = (await axios.get("api.com/users")).data;
    const decoratedUsers = await Promise.all(
      users.map(async (user) => {
        return {
          ...user,
          profile: (await axios.get(`api.com/profiles/${user.id}`)).data,
          orders: (await axios.get(`api.com/orders?user=${user.id}`)).data,
        };
      })
    );

    res.send({ users: decoratedUsers });
  } catch (err) {
    next(err);
  }
};

module.exports = badExampleRouteHandler;

const axios = require("axios");

const goodExampleRouteHandler = async (req, res, next) => {
  try {
    // now, both methods have proper error handling
    const users = await fetchUsers();
    const decoratedUsers = await decorateUsers(users);
    res.send({ users: decoratedUsers });
  } catch (err) {
    next(err);
  }
};

const fetchUsers = async () => {
  try {
    const { data } = await axios.get("api.com/users");
    return data;
  } catch (err) {
    const error = new Error(`Failed to get users [message:${err.message}]`);
    error.cause = err; // in upcoming versions of JS you could simply do: new Error('', { cause: err })
    throw error; // here we are ensuring a stack with a pointer to this line of code
  }
};

const fetchUserProfile = async (user) => {
  const url = `api.com/profiles/${user.id}`;
  try {
    const { data } = await axios.get(url);
    return data;
  } catch (err) {
    let error;
    if (err.status === 404) {
      error = new Error(`Profile not found for user ${user.id}`);
    } else {
      error = new Error(
        `Failed to fetchUserProfile() @ ${url} [status:${err.status}] [message:${err.message}]`
      );
    }

    error.cause = err;
    throw error;
  }
};

const fetchUserOrders = async (user) => {
  const url = `api.com/orders?user=${user.id}`;
  try {
    const { data } = await axios.get(url);
    return data;
  } catch (err) {
    let error;
    if (err.status === 404) {
      // Maybe its ok if we get a 404 because user has no orders yet,
      // so we mask the error instead of throwing
      return [];
    } else {
      error = new Error(
        `Failed to fetchUserOrders() @ ${url} [message:${err.message}] [user:${user.id}]`
      );
    }

    error.cause = err;
    throw error;
  }
};

const decorateUsers = async (users) => {
  const profilePromises = [];
  const orderPromises = [];

  users.forEach((user) => {
    profilePromises.push(fetchUserProfile(user));
    orderPromises.push(fetchUserOrders(user));
  });

  try {
    const [profiles, orders] = await Promise.all([
      Promise.all(profilePromises),
      Promise.all(orderPromises),
    ]);

    return users.map((user, index) => ({
      ...user,
      profile: profiles[index],
      orders: orders[index] || [],
    }));
  } catch (err) {
    if (err.cause) throw err;
    err.message = `Failed to decorateUsers [message:${err.message}]`;
    throw err;
  }
};

module.exports = goodExampleRouteHandler;

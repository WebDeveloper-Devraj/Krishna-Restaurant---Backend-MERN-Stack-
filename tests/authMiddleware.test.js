const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { userVerification } = require("../middlewares/AuthMiddleware");
const ExpressError = require("../util/ExpressError");
const User = require("../models/User");

jest.mock("jsonwebtoken");
jest.mock("../models/User");

describe("userVerification", () => {
  const res = {};
  let next;

  beforeEach(() => {
    next = jest.fn();
  });

  it("should throw error if no token", () => {
    const req = { cookies: {} };

    expect(() => userVerification(req, res, next)).toThrow(
      "User should be logged in!"
    );
  });

  it("should throw error if user not found", async () => {
    const req = { cookies: { token: "valid-token" } };
    jwt.verify.mockImplementation((token, secret, cb) => {
      cb(null, { id: "123" });
    });
    User.findById.mockResolvedValue(null);

    await userVerification(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(ExpressError));
    expect(next.mock.calls[0][0].message).toBe("User Not Found!");
  });

  it("should attach user to req and call next if token is valid", async () => {
    const req = { cookies: { token: "valid-token" } };
    const fakeUser = { _id: "123", name: "Devraj" };
    jwt.verify.mockImplementation((token, secret, cb) => {
      cb(null, { id: "123" });
    });
    User.findById.mockResolvedValue(fakeUser);

    await userVerification(req, res, next);

    expect(req.user).toEqual(fakeUser);
    expect(next).toHaveBeenCalledWith(); // No error
  });
});

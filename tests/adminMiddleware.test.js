const { adminMiddleware } = require("../middlewares/adminMiddleware");
const ExpressError = require("../util/ExpressError");

describe("adminMiddleware", () => {
  it("should call next with error if user is not admin", () => {
    const req = { user: { role: "user" } };
    const res = {};
    const next = jest.fn();

    adminMiddleware(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.any(ExpressError)
    );
    expect(next.mock.calls[0][0].message).toBe("Access denied. Admins only.");
  });

  it("should call next with error if no user object", () => {
    const req = {};
    const res = {};
    const next = jest.fn();

    adminMiddleware(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.any(ExpressError)
    );
  });

  it("should call next() if user is admin", () => {
    const req = { user: { role: "admin" } };
    const res = {};
    const next = jest.fn();

    adminMiddleware(req, res, next);

    expect(next).toHaveBeenCalledWith(); // No error passed
  });
});

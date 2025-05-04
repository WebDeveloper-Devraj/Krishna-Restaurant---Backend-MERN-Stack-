const request = require("supertest");
const app = require("./testApp");
const mongoose = require("mongoose");
const Order = require("../models/Order");
const User = require("../models/User");
const Dish = require("../models/Dish");

jest.mock("../middlewares/AuthMiddleware.js", () => ({
  userVerification: async (req, res, next) => {
    req.user = global.user || { role: "admin" };
    next();
  },
}));

jest.mock("../middlewares/adminMiddleware", () => ({
  adminMiddleware: (req, res, next) => {
    if (req.user.role === "admin") next();
    else res.status(403).json({ message: "Access denied" });
  },
}));

beforeAll(async () => {
  const mongoURL = "mongodb://127.0.0.1:27017/restaurant_test_adminOrders";
  await mongoose.connect(mongoURL);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

let order;

beforeEach(async () => {
  await User.deleteMany();

  await Dish.deleteMany();
  await Order.deleteMany();

  const dish = await Dish.create({
    name: "Test Dish",
    description: "testing",
    price: 200,
    category: "testing",
    ingredients: "testing",
    image: "testing",
    featured: false,
  });

  order = await Order.create({
    userId: new mongoose.Types.ObjectId(),
    items: [{ dishId: dish._id, quantity: 2 }],
    totalAmount: 400,
    paymentMethod: "online",
    status: "preparing",
    paymentStatus: "paid",
  });
});

describe("Admin Order Routes", () => {
  it("should get all orders", async () => {
    const res = await request(app).get("/restaurant/admin/orders");
    expect(res.statusCode).toBe(200);
    expect(res.body.orders.length).toBeGreaterThan(0);
  });

  it("should update order status", async () => {
    const res = await request(app)
      .put(`/restaurant/admin/orders/update-status/${order._id}`)
      .send({ status: "delivered" });

    expect(res.statusCode).toBe(200);
    expect(res.body.updatedOrder.status).toBe("delivered");
  });

  it("should return 404 for not existing order ID for updating status", async () => {
    const notExistedOrderId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .put(`/restaurant/admin/orders/update-status/${notExistedOrderId}`)
      .send({ status: "delivered" });

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Order Not Found!");
  });

  it("should update payment status", async () => {
    const res = await request(app)
      .put(`/restaurant/admin/orders/update-payment/${order._id}`)
      .send({ paymentStatus: "paid" });

    expect(res.statusCode).toBe(200);
    expect(res.body.order.paymentStatus).toBe("paid");
  });

  it("should return 404 for not existing order ID for updating paymnet", async () => {
    const notExistedOrderId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .put(`/restaurant/admin/orders/update-payment/${notExistedOrderId}`)
      .send({ paymentStatus: "paid" });

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Order Not Found!");
  });

  it("should get recent orders", async () => {
    const res = await request(app).get(
      "/restaurant/admin/orders/recent-orders"
    );
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });
});

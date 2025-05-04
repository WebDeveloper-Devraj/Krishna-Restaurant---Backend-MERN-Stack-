const request = require("supertest");
const mongoose = require("mongoose");
const app = require("./testApp"); // Your Express app without listen()
const Order = require("../models/Order");
const User = require("../models/User");
const SiteStat = require("../models/SiteStat");

// ✅ MOCKING Middleware
jest.mock("../middlewares/AuthMiddleware.js", () => ({
  userVerification: (req, res, next) => {
    const mongoose = require("mongoose");
    req.user = { _id: new mongoose.Types.ObjectId(), role: "admin" };
    next();
  },
}));

jest.mock("../middlewares/adminMiddleware", () => ({
  adminMiddleware: (req, res, next) => {
    // Assume user is already set by userVerification
    if (req.user.role === "admin") {
      next();
    } else {
      res.status(403).json({ message: "Access denied" });
    }
  },
}));

describe("Admin Dashboard Route", () => {
  beforeAll(async () => {
    const mongoURL = "mongodb://127.0.0.1:27017/restaurant_test_adminDashboard";
    await mongoose.connect(mongoURL);
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Order.deleteMany({});
    await User.deleteMany({});
    await SiteStat.deleteMany({});
  });

  it("should return dashboard info with correct metrics", async () => {
    // Add dummy orders
    await Order.create([
      {
        userId: new mongoose.Types.ObjectId(),
        items: [],
        totalAmount: 100,
        paymentMethod: "online",
        paymentStatus: "paid",
      },
      {
        userId: new mongoose.Types.ObjectId(),
        items: [],
        totalAmount: 200,
        paymentMethod: "cash",
        paymentStatus: "unpaid",
      },
    ]);

    // Add dummy users
    await User.create([
      {
        username: "user1",
        email: "user1@gmail.com",
        password: "user1pass",
        phoneNo: "1111111111",
        role: "user",
      },
      {
        username: "user2",
        email: "user2@gmail.com",
        password: "user2pass",
        phoneNo: "2222222222",
        role: "admin",
      },
    ]);
  
    // Add site visits
    await SiteStat.create({ totalVisits: 123 });

    const res = await request(app).get("/restaurant/admin/dashboard");

    expect(res.statusCode).toBe(200);
    expect(res.body.totalOrders).toBe(2);
    expect(res.body.totalRevenue).toBe(300);
    expect(res.body.totalCustomers).toBe(1); // Only one with role: "user"
    expect(res.body.siteVisits).toBe(123);
  });

  it("should handle no data gracefully", async () => {
    const res = await request(app).get("/restaurant/admin/dashboard");

    expect(res.statusCode).toBe(200);
    expect(res.body.totalOrders).toBe(0);
    expect(res.body.totalRevenue).toBe(0);
    expect(res.body.totalCustomers).toBe(0);
    expect(res.body.siteVisits).toBe(0);
  });
});

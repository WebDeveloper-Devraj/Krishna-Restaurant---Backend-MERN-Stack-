const request = require("supertest");
const mongoose = require("mongoose");
const app = require("./testApp");
const Order = require("../models/Order");
const User = require("../models/User");
const Dish = require("../models/Dish");

describe("Order Routes", () => {
  let userId;
  let dish;

  beforeAll(async () => {
    const mongoURL = "mongodb://127.0.0.1:27017/restaurant_test_orders";
    await mongoose.connect(mongoURL);
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Order.deleteMany({});
    await Dish.deleteMany({});
    await User.deleteMany({});

    const user = await User.create({
      username: "devraj",
      email: "devrajpujari003@gmail.com",
      password: "devraj",
      phoneNo: "9321892873",
    });

    userId = user._id;

    dish = await Dish.create({
      name: "Test Dish",
      price: 100,
      description: "test",
      ingredients: "test test test",
      category: "test",
      image: "testImage",
    });
  });

  describe("POST /restaurant/orders", () => {
    it("should place a new order", async () => {
      const res = await request(app)
        .post("/restaurant/orders")
        .send({
          userId,
          items: [{ dishId: dish._id, quantity: 2 }],
          totalAmount: 100,
          paymentMethod: "online",
          paymentStatus: "unpaid",
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.newOrder).toHaveProperty("_id");
      expect(res.body.newOrder.items[0].dishId).toBe(dish._id.toString());
    });
  });

  describe("GET /restaurant/orders/:userId", () => {
    it("should get all orders of a user", async () => {
      await Order.create({
        userId,
        items: [{ dishId: dish._id, quantity: 2 }],
        totalAmount: 100,
        paymentMethod: "COD",
        paymentStatus: "paid",
        status: "delivered",
      });

      const res = await request(app).get(`/restaurant/orders/${userId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.orders.length).toBe(1);
      expect(res.body.orders[0].userId).toBe(userId.toString());
    });

    it("should return 400 for invalid user ID", async () => {
      const res = await request(app).get(`/restaurant/orders/invalid-id`);
  
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});
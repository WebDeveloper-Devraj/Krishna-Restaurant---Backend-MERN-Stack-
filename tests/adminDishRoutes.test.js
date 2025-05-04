// tests/adminDishRoutes.test.js
const request = require("supertest");
const app = require("./testApp");
const mongoose = require("mongoose");
const Dish = require("../models/Dish");
const User = require("../models/User");

// ✅ MOCKING Middleware
jest.mock("../middlewares/AuthMiddleware.js", () => ({
  userVerification: async (req, res, next) => {
    const User = require("../models/User");

    req.user = global.user || { role: "admin" };
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

beforeAll(async () => {
  const mongoURL = "mongodb://127.0.0.1:27017/restaurant_test_adminDish";
  await mongoose.connect(mongoURL);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

beforeEach(async () => {
  await Dish.deleteMany({});

  await Dish.create({
    name: "Test Dish",
    description: "test",
    price: 250,
    category: "test",
    ingredients: "test",
    image: "test",
    featured: true,
  });
});

describe("Admin Dish Routes", () => {
  it("should get all dishes", async () => {
    const res = await request(app).get("/restaurant/admin/dishes");
    expect(res.statusCode).toBe(200);
    expect(res.body.dishes.length).toBeGreaterThan(0);
  });

  it("should add a new dish", async () => {
    const res = await request(app).post("/restaurant/admin/dishes/add").send({
      name: "Test Dish 2",
      description: "test",
      price: 150,
      category: "test",
      ingredients: "test",
      featured: true,
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.dish.name).toBe("Test Dish 2");

    res2 = await request(app).get("/restaurant/admin/dishes");
    expect(res2.body.dishes.length).toBe(2);
  });

  it("should edit an existing dish", async () => {
    const dish = await Dish.findOne({ name: "Test Dish" });
    const res = await request(app).post("/restaurant/admin/dishes/edit").send({
      dishId: dish._id,
      name: "Updated Test Dish",
      description: "test",
      price: 200,
      image: "test",
      category: "test",
      ingredients: "test",
      featured: false,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.dish.name).toBe("Updated Test Dish");
  });

  it("should return 404 for notExisting dish ID", async () => {
    const res = await request(app).post("/restaurant/admin/dishes/edit").send({
      dishId: new mongoose.Types.ObjectId(),
      name: "Updated Test Dish",
      description: "test",
      price: 200,
      image: "test",
      category: "test",
      ingredients: "test",
      featured: false,
    });

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Dish Not Found!");
  });

  it("should delete a dish with correct admin password", async () => {
    await User.deleteMany({});

    global.user = await User.create({
      username: "devraj",
      email: "devrajpujari003@gmail.com",
      password: "testing",
      phoneNo: "9321892873",
      role: "admin",
    });

    const dish = await Dish.findOne({ name: "Test Dish" });
    const res = await request(app)
      .delete(`/restaurant/admin/dishes/${dish._id}`)
      .send({ password: "testing" });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Dish deleted successfully");
  });

  it("should fail to delete a dish with wrong password", async () => {
    await User.deleteMany({});

    global.user = await User.create({
      username: "devraj",
      email: "devrajpujari003@gmail.com",
      password: "testing",
      phoneNo: "9321892873",
      role: "admin",
    });

    const dish = await Dish.findOne({ name: "Test Dish" });
    const res = await request(app)
      .delete(`/restaurant/admin/dishes/${dish._id}`)
      .send({ password: "wrongPass" });

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toBe("Incorrect password");
  });

  it("should delete a dish with correct admin password", async () => {
    await User.deleteMany({});

    global.user = await User.create({
      username: "devraj",
      email: "devrajpujari003@gmail.com",
      password: "testing",
      phoneNo: "9321892873",
      role: "admin",
    });

    const res = await request(app)
      .delete(`/restaurant/admin/dishes/${new mongoose.Types.ObjectId()}`)
      .send({ password: "testing" });

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Dish Not Found!");
  });
});

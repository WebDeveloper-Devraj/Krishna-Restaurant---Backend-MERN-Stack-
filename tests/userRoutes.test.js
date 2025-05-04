const request = require("supertest");
const app = require("./testApp");
const mongoose = require("mongoose");
const User = require("../models/User");

// MOCK Middleware: userVerification
jest.mock("../middlewares/AuthMiddleware", () => {
  return {
    userVerification: (req, res, next) => {
      req.user = { _id: global.testUserId };
      next();
    },
  };
});

describe("User Routes", () => {
  beforeAll(async () => {
    const mongoURL = "mongodb://127.0.0.1:27017/restaurant_test_user";
    await mongoose.connect(mongoURL);
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe("POST /restaurant/use/signup", () => {
    it("should create a new user", async () => {
      const res = await request(app).post("/restaurant/user/signup").send({
        username: "devraj",
        email: "devrajpujari003@gmail.com",
        password: "devraj",
        phoneNo: "9321892873",
        createdAt: new Date(),
      });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.user.email).toBe("devrajpujari003@gmail.com");
    });

    it("should not allow duplicate email", async () => {
      // inserting one demo user
      await User.create({
        username: "devraj1",
        email: "devrajpujari003@gmail.com",
        password: "devraj",
        phoneNo: "1234567890",
        createdAt: new Date(),
      });

      const res = await request(app).post("/restaurant/user/signup").send({
        username: "devraj2",
        email: "devrajpujari003@gmail.com",
        password: "devraj",
        phoneNo: "1234567890",
        createdAt: new Date(),
      });

      expect(res.statusCode).toBe(400);
    });
  });

  describe("POST /restaurant/user/login", () => {
    it("should login an existing user", async () => {
      // inserting one demo user
      await User.create({
        username: "devraj1",
        email: "devrajpujari003@gmail.com",
        password: "devraj",
        phoneNo: "1234567890",
        createdAt: new Date(),
      });

      const res = await request(app).post("/restaurant/user/login").send({
        email: "devrajpujari003@gmail.com",
        password: "devraj",
      });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.user.email).toBe("devrajpujari003@gmail.com");
    });

    it("should not login with incorrect email", async () => {
      const res = await request(app).post("/restaurant/user/login").send({
        email: "notExist@gmail.com",
        password: "devraj",
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe(
        "Incorrect email! please enter correct email."
      );
    });

    it("should not login with incorrect email", async () => {
      // inserting one demo user
      await User.create({
        username: "devraj1",
        email: "devrajpujari003@gmail.com",
        password: "devraj",
        phoneNo: "1234567890",
        createdAt: new Date(),
      });

      const res = await request(app).post("/restaurant/user/login").send({
        email: "devrajpujari003@gmail.com",
        password: "incorrect",
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe(
        "Incorrect password! please enter correct password."
      );
    });
  });

  describe("GET /restaurant/user/logout", () => {
    it("should logout user", async () => {
      const res = await request(app).get("/restaurant/user/logout");
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe("PUT /restaurant/user/update", () => {
    it("should update user profile and password", async () => {
      // inserting one demo user
      const user = await User.create({
        username: "devraj1",
        email: "devrajpujari003@gmail.com",
        password: "devraj",
        phoneNo: "1234567890",
        createdAt: new Date(),
      });

      global.testUserId = user._id;

      const res = await request(app).put("/restaurant/user/update").send({
        name: "Devraj Updated",
        phoneNo: "6363182596",
        currentPassword: "devraj",
        newPassword: "newdevraj",
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.user.username).toBe("Devraj Updated");
    });

    it("should reject update with wrong current password", async () => {
      // inserting one demo user
      const user = await User.create({
        username: "devraj1",
        email: "devrajpujari003@gmail.com",
        password: "devraj",
        phoneNo: "1234567890",
        createdAt: new Date(),
      });

      global.testUserId = user._id;

      const res = await request(app).put("/restaurant/user/update").send({
        name: "Wrong Try",
        phoneNo: "0000000000",
        currentPassword: "WrongPass",
        newPassword: "Another123",
      });

      expect(res.statusCode).toBe(400);
    });
  });

  describe("POST /restaurant/user/delete", () => {
    it("should delete user account with correct password", async () => {
      // inserting one demo user
      const user = await User.create({
        username: "devraj1",
        email: "devrajpujari003@gmail.com",
        password: "devraj",
        phoneNo: "1234567890",
        createdAt: new Date(),
      });

      global.testUserId = user._id;
      const res = await request(app).post("/restaurant/user/delete").send({
        password: "devraj",
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("should return 401 for incorrect password", async () => {
      // inserting one demo user
      const user = await User.create({
        username: "devraj1",
        email: "devrajpujari003@gmail.com",
        password: "devraj",
        phoneNo: "1234567890",
        createdAt: new Date(),
      });

      global.testUserId = user._id;
      const res = await request(app).post("/restaurant/user/delete").send({
        password: "incorrect",
      });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("should return 404 if user is already deleted", async () => {
      // inserting one demo user
      const user = await User.create({
        username: "devraj1",
        email: "devrajpujari003@gmail.com",
        password: "devraj",
        phoneNo: "1234567890",
        createdAt: new Date(),
      });

      global.testUserId = user._id;
      let res = await request(app).post("/restaurant/user/delete").send({
        password: "devraj",
      });

      res = await request(app).post("/restaurant/user/delete").send({
        password: "devraj",
      });

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe("User Not Found!");
    });
  });
});

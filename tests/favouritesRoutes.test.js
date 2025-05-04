const request = require("supertest");
const app = require("./testApp"); // Assuming your Express app is in app.js
const mongoose = require("mongoose");
const User = require("../models/User");
const Dish = require("../models/Dish");

describe("Favourites Routes", () => {
  let userId;
  let dish1, dish2;

  beforeAll(async () => {
    const mongoURL = "mongodb://127.0.0.1:27017/restaurant_test_favourites";
    await mongoose.connect(mongoURL);
  });

  beforeEach(async () => {
    await Dish.deleteMany({});
    await User.deleteMany({});
    // Create a user
    const user = new User({
      username: "devraj",
      email: "devrajpujari003@example.com",
      password: "devraj",
      phoneNo: "9321892873",
    });
    await user.save();
    userId = user._id;

    // Create some dishes
    await Dish.create([
      {
        name: "Paneer Tikka",
        price: 200,
        description: "testing",
        image: "testing",
        category: "testing",
        ingredients: "testing",
      },
      {
        name: "Veg Biryani",
        price: 100,
        description: "testing",
        image: "testing",
        category: "testing",
        ingredients: "testing",
      },
    ]);

    dish1 = await Dish.findOne({ name: "Paneer Tikka" });
    dish2 = await Dish.findOne({ name: "Veg Biryani" });

    // Add dish1 to user's favourites
    user.favourites.push(dish1._id);
    await user.save();
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  describe("GET /restaurant/favourites/:userId", () => {
    it("should return the user's favourites", async () => {
      const res = await request(app).get(`/restaurant/favourites/${userId}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.favourites.length).toBe(1); // Should have one favourite (dish1)
      expect(res.body.favourites[0].name).toBe("Paneer Tikka");
    });

    it("should return 400 for invalid user ID", async () => {
      const res = await request(app).get("/restaurant/favourites/invalid-id");
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 404 for non-existing user", async () => {
      const validNotExistingId = new mongoose.Types.ObjectId();
      const res = await request(app).get(
        `/restaurant/favourites/${validNotExistingId}`
      );
      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe("POST /restaurant/favourites/toggle", () => {
    it("should add a dish to favourites if not already in the list", async () => {
      const res = await request(app)
        .post("/restaurant/favourites/toggle")
        .send({ userId, dishId: dish2._id });
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.updatedFavouritesIds.length).toBe(2); // Should have both dish1 and dish2
    });

    it("should remove a dish from favourites if already in the list", async () => {
      const res = await request(app)
        .post("/restaurant/favourites/toggle")
        .send({ userId, dishId: dish1._id });
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.updatedFavouritesIds.length).toBe(0);
    });

    it("should return 400 if dishId is missing", async () => {
      const res = await request(app)
        .post("/restaurant/favourites/toggle")
        .send({ userId });
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 404 if user is not found", async () => {
      const validNotExistingId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .post("/restaurant/favourites/toggle")
        .send({ userId: validNotExistingId, dishId: dish2._id });
      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });
});

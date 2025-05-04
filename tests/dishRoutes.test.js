const request = require("supertest");
const mongoose = require("mongoose");
const app = require("./testApp");
const Dish = require("../models/Dish");

describe("Dish Routes", () => {
  beforeAll(async () => {
    const mongoURL = "mongodb://127.0.0.1:27017/restaurant_test_dishes";
    await mongoose.connect(mongoURL);
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Dish.deleteMany({});
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
  });

  describe("GET /restaurant/dishes", () => {
    it("should return all dishes", async () => {
      const res = await request(app).get("/restaurant/dishes");
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.dishes.length).toBe(2);
    });
  });

  describe("GET /restaurant/dishes/:id", () => {
    it("should return a single dish by ID", async () => {
      const dish = await Dish.findOne({ name: "Paneer Tikka" });

      const res = await request(app).get(`/restaurant/dishes/${dish._id}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.dish.name).toBe("Paneer Tikka");
    });

    it("should return 404 for non-existing but valid dish ID", async () => {
      const validId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/restaurant/dishes/${validId}`);
      expect(res.statusCode).toBe(404);
    });

    it("should return 400 or 500 for invalid dish ID", async () => {
      const res = await request(app).get("/restaurant/dishes/invalid-id");
      expect([400, 500]).toContain(res.statusCode);
    });
  });
});

const request = require("supertest");
const mongoose = require("mongoose");
const SiteStat = require("../models/SiteStat");
const app = require("./testApp"); // import your express app

describe("Site Visit Tracking Routes", () => {
  beforeAll(async () => {
    const mongoURL = "mongodb://127.0.0.1:27017/restaurant_test_trackvisit";
    await mongoose.connect(mongoURL);
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await SiteStat.deleteMany({});
  });

  describe("POST /restaurant/track-visit", () => {
    it("should create SiteStat and count first visit", async () => {
      const res = await request(app).post("/restaurant/track-visit");
      const stat = await SiteStat.findOne();

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("Visit counted");
      expect(stat.totalVisits).toBe(1);
    });

    it("should increment visits on multiple requests", async () => {
      await request(app).post("/restaurant/track-visit");
      await request(app).post("/restaurant/track-visit");

      const stat = await SiteStat.findOne();
      expect(stat.totalVisits).toBe(2);
    });
  });

  describe("GET /restaurant/site-visits", () => {
    it("should return 0 if no visits yet", async () => {
      const res = await request(app).get("/restaurant/site-visits");
      expect(res.statusCode).toBe(200);
      expect(res.body.visits).toBe(0);
    });

    it("should return correct visit count", async () => {
      await request(app).post("/restaurant/track-visit");
      await request(app).post("/restaurant/track-visit");

      const res = await request(app).get("/restaurant/site-visits");
      expect(res.statusCode).toBe(200);
      expect(res.body.visits).toBe(2);
    });
  });
});

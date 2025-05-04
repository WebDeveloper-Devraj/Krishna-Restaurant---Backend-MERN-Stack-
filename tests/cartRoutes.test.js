const request = require("supertest");
const mongoose = require("mongoose");
const app = require("./testApp");
const Cart = require("../models/Cart");
const Dish = require("../models/Dish");

describe("Cart Routes", () => {
  let userId;
  let dish1, dish2;

  beforeAll(async () => {
    const mongoURL = "mongodb://127.0.0.1:27017/restaurant_test_cart";
    await mongoose.connect(mongoURL);
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Cart.deleteMany({});
    await Dish.deleteMany({});

    // Setup test dishes
    const dishes = await Dish.create([
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

    dish1 = dishes[0];
    dish2 = dishes[1];

    // Setup user and cart
    userId = new mongoose.Types.ObjectId();
    await Cart.create({
      userId,
      items: [{ dishId: dish1._id, quantity: 1 }],
    });
  });

  describe("GET /restaurant/cart/:userId", () => {
    it("should get user cart", async () => {
      const res = await request(app).get(`/restaurant/cart/${userId}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.cart.items.length).toBe(1);
    });

    it("should return 400 for invalid user ID", async () => {
      const res = await request(app).get(`/restaurant/cart/invalid-id`);
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should return 404 for non-existing but valid user ID", async () => {
      const validId = new mongoose.Types.ObjectId();

      const res = await request(app).get(`/restaurant/cart/${validId}`);
      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe("POST /restaurant/cart", () => {
    it("should add item to cart", async () => {
      const res = await request(app).post("/restaurant/cart").send({
        userId,
        dishId: dish2._id,
        quantity: 2,
      });
      expect(res.statusCode).toBe(200);
      expect(res.body.cart.items.length).toBe(2);
    });
  });

  describe("PUT /restaurant/cart/update", () => {
    it("should update item quantity", async () => {
      const res = await request(app).put("/restaurant/cart/update").send({
        userId,
        dishId: dish1._id,
        quantity: 5,
      });
      expect(res.statusCode).toBe(200);
      expect(res.body.cart.items[0].quantity).toBe(5);
    });
  });

  describe("DELETE /restaurant/cart/remove", () => {
    it("should remove item from cart", async () => {
      const res = await request(app).delete("/restaurant/cart/remove").send({
        userId,
        dishId: dish1._id,
      });
      expect(res.statusCode).toBe(200);
      expect(res.body.cart.items.length).toBe(0);
    });
  });

  describe("DELETE /restaurant/cart/remove-multiple", () => {
    it("should remove multiple items", async () => {
      // Add second item
      await request(app).post("/restaurant/cart").send({
        userId,
        dishId: dish2._id,
        quantity: 1,
      });

      const res = await request(app)
        .delete("/restaurant/cart/remove-multiple")
        .send({
          userId,
          dishIds: [dish1._id.toString(), dish2._id.toString()],
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.cart.items.length).toBe(0);
    });
  });

  describe("POST /restaurant/cart/merge", () => {
    it("should merge guest cart", async () => {
      const guestCart = [
        { dishId: { _id: dish1._id }, quantity: 1 },
        { dishId: { _id: dish2._id }, quantity: 2 },
      ];

      const res = await request(app).post("/restaurant/cart/merge").send({
        userId,
        guestCart,
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.cart.items.length).toBe(2);
    });
  });
});

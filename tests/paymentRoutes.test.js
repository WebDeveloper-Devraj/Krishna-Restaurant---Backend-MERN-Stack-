const request = require("supertest");
const mongoose = require("mongoose");
const app = require("./testApp"); // Your test express app
const Order = require("../models/Order");

// MOCK Razorpay
jest.mock("razorpay", () => {
  return jest.fn().mockImplementation(() => ({
    orders: {
      create: jest.fn().mockResolvedValue({
        id: "order_Fake12345",
        amount: 5000,
        currency: "INR",
        receipt: "receipt_order_74394",
        status: "created",
      }),
    },
  }));
});

// MOCK Middleware: userVerification
jest.mock("../middlewares/AuthMiddleware", () => {
  const mongoose = require("mongoose"); // ✅ move inside the mock factory

  return {
    userVerification: (req, res, next) => {
      req.user = { _id: new mongoose.Types.ObjectId() };
      next();
    },
  };
});

describe("Payment Routes", () => {
  beforeAll(async () => {
    const mongoURL = "mongodb://127.0.0.1:27017/restaurant_test_payment";
    await mongoose.connect(mongoURL);
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Order.deleteMany({});
  });

  describe("POST /restaurant/payment/orders", () => {
    it("should create a Razorpay order and save initial order in DB", async () => {
      const res = await request(app)
        .post("/restaurant/payment/orders")
        .send({
          amount: 5000,
          items: [
            {
              dishId: { _id: new mongoose.Types.ObjectId() },
              quantity: 2,
            },
          ],
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.order).toHaveProperty("id");
      expect(res.body.order.amount).toBe(5000);

      const savedOrder = await Order.findOne({
        razorpayOrderId: res.body.order.id,
      });
      expect(savedOrder).toBeTruthy();
      expect(savedOrder.paymentStatus).toBe("unpaid");
    });

    it("should return 400 if amount is missing", async () => {
      const res = await request(app)
        .post("/restaurant/payment/orders")
        .send({ items: [] });

      expect(res.statusCode).toBe(400);
    });
  });

  describe("POST /restaurant/payment/success", () => {
    it("should verify signature and update payment status", async () => {
      const dummyUserId = new mongoose.Types.ObjectId();

      // Insert dummy unpaid order
      await Order.create({
        userId: dummyUserId,
        items: [],
        totalAmount: 50,
        status: "preparing",
        ETA: 15,
        paymentMethod: "online",
        paymentStatus: "unpaid",
        razorpayOrderId: "order_Fake12345",
      });

      // Generate a fake valid signature
      const crypto = require("crypto");
      const secret = process.env.RAZORPAY_SECRET || "test_secret";
      const paymentId = "payment_Fake67890";
      const orderCreationId = "order_Fake12345";

      const hmac = crypto.createHmac("sha256", secret);
      hmac.update(`${orderCreationId}|${paymentId}`);
      const signature = hmac.digest("hex");

      const res = await request(app).post("/restaurant/payment/success").send({
        orderCreationId,
        razorpayPaymentId: paymentId,
        razorpayOrderId: "order_Fake12345",
        razorpaySignature: signature,
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.order.paymentStatus).toBe("paid");
      expect(res.body.order.paymentId).toBe(paymentId);
    });

    it("should return 400 for invalid signature", async () => {
      const res = await request(app).post("/restaurant/payment/success").send({
        orderCreationId: "order_fake",
        razorpayPaymentId: "payment_fake",
        razorpayOrderId: "order_fake",
        razorpaySignature: "invalid_signature",
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});

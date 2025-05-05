const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const ExpressError = require("../util/ExpressError");
const app = express();

// Parse JSON request bodies
app.use(express.json());

// serving public folder (ex. for serving images)
app.use(express.static("public"));

// Enable CORS so that your frontend can make requests
app.use(
  cors({
    origin: [
      "http://localhost:5173, https://restaurant-backend-3qa8.onrender.com",
    ], // Allow only frontend origin
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, // Allow cookies and authentication headers
  })
);

app.use(cookieParser());

app.use("/restaurant/cart", require("../routes/cartRoutes"));
app.use("/restaurant/dishes", require("../routes/dishRoutes"));
app.use("/restaurant/favourites", require("../routes/favourites"));
app.use("/restaurant/orders", require("../routes/orderRoutes"));
app.use("/restaurant/payment", require("../routes/payment"));
app.use("/restaurant/user", require("../routes/userRoutes"));
app.use("/restaurant", require("../routes/trackVisits"));
app.use(
  "/restaurant/admin/dashboard",
  require("../routes/admin/adminDashboardRoutes")
);
app.use("/restaurant/admin/dishes", require("../routes/admin/adminDishRoutes"));
app.use(
  "/restaurant/admin/orders",
  require("../routes/admin/adminOrderRoutes")
);

app.use("*", (req, res, next) => {
  throw new ExpressError(404, "API route Not Found!");
});

// Error handling middleware
app.use((err, req, res, next) => {
  let { status = 500, message = "Something went wrong!" } = err;

  // Mongoose validation errors should have status code = 400
  if (err.name === "ValidationError" || err.name == "CastError") {
    status = 400;
  }

  // Other errors
  res.status(status).send({ success: false, message });
});

module.exports = app;

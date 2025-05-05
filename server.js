require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const ExpressError = require("./util/ExpressError");
const app = express();

// Parse JSON request bodies
app.use(express.json());

// serving public folder (ex. for serving images)
app.use(express.static("public"));

// Enable CORS so that your frontend can make requests
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://krishna-restaurant-frontend.vercel.app",
    ], // Allow only frontend origin
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, // Allow cookies and authentication headers
  })
);

app.use(cookieParser());

// mongoose connection
const mongoURL = process.env.MONGO_URL;

mongoose
  .connect(mongoURL)
  .then(() => console.log("DB connection successFull."))
  .catch((err) => console.log("Error connecting to MongoDB", err));

app.use("/restaurant/dishes", require("./routes/dishRoutes"));
app.use("/restaurant/testimonial", require("./routes/testimonialRoutes"));
app.use("/restaurant/cart", require("./routes/cartRoutes"));
app.use("/restaurant/members", require("./routes/memberRoutes"));
app.use("/restaurant/gallery", require("./routes/gallery"));
app.use("/restaurant/contact", require("./routes/contactRoutes"));
app.use("/restaurant/orders", require("./routes/orderRoutes"));
app.use("/restaurant/user", require("./routes/userRoutes"));
app.use("/restaurant/payment", require("./routes/payment"));
app.use("/restaurant/favourites", require("./routes/favourites"));
app.use("/restaurant", require("./routes/trackVisits"));
app.use(
  "/restaurant/admin/dashboard",
  require("./routes/admin/adminDashboardRoutes")
);
app.use("/restaurant/admin/dishes", require("./routes/admin/adminDishRoutes"));
// app.use("/restaurant/admin/users", require("./routes/admin/adminUserRoutes"));
app.use("/restaurant/admin/orders", require("./routes/admin/adminOrderRoutes"));

app.use("*", (req, res, next) => {
  throw new ExpressError(404, "API route Not Found!");
});

// Error handling middleware
app.use((err, req, res, next) => {
  let { status = 500, message = "Something went wrong!" } = err;

  // Mongoose validation errors should have status code = 400
  if (err.name === "ValidationError") {
    status = 400;
  }

  // Other errors
  res.status(status).send({ success: false, message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});

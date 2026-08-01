const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const connectDB = require("./src/config/db");
const { errorHandler } = require("./src/middlewares/errorMiddleware");

dotenv.config();
connectDB();

const app = express();

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

app.use(helmet());
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: ["http://localhost:3000", "https://employeemanagementtest.netlify.app"],
    credentials: true,
  })
);

//app.use(cors());
//This allows requests from all origins. 
// It's okay for a personal demo project, but for production it's better to explicitly list allowed origins.

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  })
);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: {
    message: "Too many auth attempts, please try again later.",
  },
});

app.use("/api/auth", authLimiter, require("./src/routes/authRoutes"));
app.use("/api/employees", require("./src/routes/employeeRoutes"));

app.use(errorHandler);

app.listen(process.env.PORT, () =>
  console.log(`Server running on port ${process.env.PORT}`)
);
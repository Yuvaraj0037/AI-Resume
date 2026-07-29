require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const passport = require("passport");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const resumeRoutes = require("./routes/resumeRoutes");
const resumeBuilderRoutes = require("./routes/resumeBuilderRoutes");
const coachRoutes = require("./routes/coachRoutes");

const app = express();

const PORT = Number(process.env.PORT) || 5000;

const allowedOrigins = (
  process.env.CLIENT_URL ||
  "http://localhost:5173"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

// Required when deployed behind Render, Railway or another proxy.
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

// Security middleware
app.disable("x-powered-by");

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  })
);

app.use(compression());

// CORS configuration
app.use(
  cors({
    origin(origin, callback) {
      // Allow Postman, Thunder Client, mobile clients
      // and other server-to-server requests.
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      const error = new Error(
        `Origin ${origin} is not allowed by CORS`
      );

      error.status = 403;

      return callback(error);
    },

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],

    credentials: true,
  })
);

// Request body parsing
app.use(
  express.json({
    limit: "2mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "2mb",
  })
);

// Passport is required for Google OAuth.
app.use(passport.initialize());

// Authentication rate limiter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,

  message: {
    message:
      "Too many authentication requests. Try again later.",
  },
});

// AI Coach rate limiter
const coachLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,

  message: {
    message:
      "Too many AI Coach requests. Try again later.",
  },
});

// Resume analysis rate limiter
const resumeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,

  message: {
    message:
      "Too many resume requests. Try again later.",
  },
});

// Root health endpoint
app.get("/", (req, res) => {
  return res.status(200).json({
    message:
      "AI Resume Analyzer API is running",
    status: "ok",
  });
});

// Deployment health endpoint
app.get("/api/health", (req, res) => {
  return res.status(200).json({
    status: "ok",
    environment:
      process.env.NODE_ENV ||
      "development",
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use(
  "/api/auth",
  authLimiter,
  authRoutes
);

app.use(
  "/api/resume",
  resumeLimiter,
  resumeRoutes
);

app.use(
  "/api/resume-builder",
  resumeBuilderRoutes
);

app.use(
  "/api/coach",
  coachLimiter,
  coachRoutes
);

// Unknown endpoint
app.use((req, res) => {
  return res.status(404).json({
    message: "Route not found",
    method: req.method,
    path: req.originalUrl,
  });
});

// Central error handler
app.use((error, req, res, next) => {
  console.error("Server error:", error);

  // Multer upload errors
  if (error.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({
      message:
        "Resume file is too large. Maximum size is 5 MB.",
    });
  }

  if (error.name === "MulterError") {
    return res.status(400).json({
      message:
        error.message ||
        "Resume upload failed",
    });
  }

  // Invalid MongoDB ID
  if (error.name === "CastError") {
    return res.status(400).json({
      message: "Invalid resource ID",
    });
  }

  // MongoDB duplicate value
  if (error.code === 11000) {
    return res.status(409).json({
      message:
        "A record with these details already exists",
    });
  }

  const status =
    Number(error.status) ||
    Number(error.statusCode) ||
    500;

  return res.status(status).json({
    message:
      process.env.NODE_ENV ===
      "production"
        ? status === 500
          ? "Internal server error"
          : error.message
        : error.message ||
          "Internal server error",
  });
});

async function startServer() {
  try {
    await connectDB();

    app.listen(
      PORT,
      "0.0.0.0",
      () => {
        console.log(
          `Server running on port ${PORT}`
        );
      }
    );
  } catch (error) {
    console.error(
      "Server startup failed:",
      error.message
    );

    process.exit(1);
  }
}

startServer();
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcryptjs");
// const { NSE, BSE } = require("nse-bse-api"); // Disabled - using mock data for development
const http = require("http");
const socketIo = require("socket.io");

const { HoldingsModel } = require("./model/HoldingsModel");

const { PositionsModel } = require("./model/PositionsModel");
const { OrdersModel } = require("./model/OrdersModel");
const { UserModel } = require("./model/UserModel");

// Mock data for development (NSE/BSE API disabled)
const nse = null;
const bse = null;

const PORT = process.env.PORT || 3002;
const uri = process.env.MONGO_URL;

const app = express();
const server = http.createServer(app);
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  process.env.FRONTEND_URL,
  process.env.DASHBOARD_URL
].filter(Boolean);

const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(bodyParser.json());

app.get("/addHoldings", async (req, res) => {
  let tempHoldings = [
    {
      name: "BHARTIARTL",
      qty: 2,
      avg: 538.05,
      price: 541.15,
      net: "+0.58%",
      day: "+2.99%",
    },
    {
      name: "HDFCBANK",
      qty: 2,
      avg: 1383.4,
      price: 1522.35,
      net: "+10.04%",
      day: "+0.11%",
    },
    {
      name: "HINDUNILVR",
      qty: 1,
      avg: 2335.85,
      price: 2417.4,
      net: "+3.49%",
      day: "+0.21%",
    },
    {
      name: "INFY",
      qty: 1,
      avg: 1350.5,
      price: 1555.45,
      net: "+15.18%",
      day: "-1.60%",
      isLoss: true,
    },
    {
      name: "ITC",
      qty: 5,
      avg: 202.0,
      price: 207.9,
      net: "+2.92%",
      day: "+0.80%",
    },
    {
      name: "KPITTECH",
      qty: 5,
      avg: 250.3,
      price: 266.45,
      net: "+6.45%",
      day: "+3.54%",
    },
    {
      name: "M&M",
      qty: 2,
      avg: 809.9,
      price: 779.8,
      net: "-3.72%",
      day: "-0.01%",
      isLoss: true,
    },
    {
      name: "RELIANCE",
      qty: 1,
      avg: 2193.7,
      price: 2112.4,
      net: "-3.71%",
      day: "+1.44%",
    },
    {
      name: "SBIN",
      qty: 4,
      avg: 324.35,
      price: 430.2,
      net: "+32.63%",
      day: "-0.34%",
      isLoss: true,
    },
    {
      name: "SGBMAY29",
      qty: 2,
      avg: 4727.0,
      price: 4719.0,
      net: "-0.17%",
      day: "+0.15%",
    },
    {
      name: "TATAPOWER",
      qty: 5,
      avg: 104.2,
      price: 124.15,
      net: "+19.15%",
      day: "-0.24%",
      isLoss: true,
    },
    {
      name: "TCS",
      qty: 1,
      avg: 3041.7,
      price: 3194.8,
      net: "+5.03%",
      day: "-0.25%",
      isLoss: true,
    },
    {
      name: "WIPRO",
      qty: 4,
      avg: 489.3,
      price: 577.75,
      net: "+18.08%",
      day: "+0.32%",
    },
  ];

  tempHoldings.forEach((item) => {
    let newHolding = new HoldingsModel({
      name: item.name,
      qty: item.qty,
      avg: item.avg,
      price: item.price,
      net: item.net,
      day: item.day,
    });

    newHolding.save();
  });
  res.send("Done!");
});

app.get("/addPositions", async (req, res) => {
  let tempPositions = [
    {
      product: "CNC",
      name: "EVEREADY",
      qty: 2,
      avg: 316.27,
      price: 312.35,
      net: "+0.58%",
      day: "-1.24%",
      isLoss: true,
    },
    {
      product: "CNC",
      name: "JUBLFOOD",
      qty: 1,
      avg: 3124.75,
      price: 3082.65,
      net: "+10.04%",
      day: "-1.35%",
      isLoss: true,
    },
  ];

  tempPositions.forEach((item) => {
    let newPosition = new PositionsModel({
      product: item.product,
      name: item.name,
      qty: item.qty,
      avg: item.avg,
      price: item.price,
      net: item.net,
      day: item.day,
      isLoss: item.isLoss,
    });

    newPosition.save();
  });
  res.send("Done!");
});

app.get("/allHoldings", async (req, res) => {
  const { userId } = req.query;
  if (!userId) {
    return res.status(400).json({ message: "userId is required" });
  }
  let allHoldings = await HoldingsModel.find({ userId });
  res.json(allHoldings);
});

app.get("/allPositions", async (req, res) => {
  let allPositions = await PositionsModel.find({});
  res.json(allPositions);
});

app.get("/allOrders/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    let allOrders = await OrdersModel.find({ userId }).sort({ timestamp: -1 });
    res.json(allOrders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders", error: error.message });
  }
});

app.delete("/cancelOrder/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;
    await OrdersModel.findByIdAndDelete(orderId);
    res.json({ message: "Order cancelled successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error cancelling order", error: error.message });
  }
});

// Function to update holdings
async function updateHoldings(userId, stockName, qty, price, mode) {
  const existingHolding = await HoldingsModel.findOne({ userId, name: stockName });

  if (mode === 'BUY') {
    if (existingHolding) {
      // Update existing holding
      const totalQty = existingHolding.qty + qty;
      const totalValue = (existingHolding.avg * existingHolding.qty) + (price * qty);
      const newAvg = totalValue / totalQty;
      existingHolding.qty = totalQty;
      existingHolding.avg = newAvg;
      await existingHolding.save();
    } else {
      // Create new holding
      const newHolding = new HoldingsModel({
        name: stockName,
        qty,
        avg: price,
        price, // current price, will be updated later
        net: "0%",
        day: "0%",
        userId
      });
      await newHolding.save();
    }
  } else if (mode === 'SELL') {
    if (existingHolding) {
      const newQty = existingHolding.qty - qty;
      if (newQty <= 0) {
        // Remove holding if qty becomes 0 or negative
        await HoldingsModel.deleteOne({ _id: existingHolding._id });
      } else {
        existingHolding.qty = newQty;
        await existingHolding.save();
      }
    }
    // If no existing holding, do nothing (can't sell what you don't have)
  }
}

app.post("/newOrder", async (req, res) => {
  try {
    const { name, qty, price, mode, userId } = req.body;
    
    // Save the original order
    let newOrder = new OrdersModel({
      name,
      qty,
      price,
      mode,
      userId
    });
    await newOrder.save();

    // Update holdings for the user
    await updateHoldings(userId, name, qty, price, mode);

    res.json({ message: "Order saved successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error saving order", error: error.message });
  }
});

app.post("/signup", async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = new UserModel({
      name,
      email,
      password: hashedPassword,
      phone
    });

    await newUser.save();

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone
      }
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Error creating user", error: error.message });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Return user data (excluding password)
    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
});

app.get("/user", async (req, res) => {
  try {
    const { email, id } = req.query;
    let user;

    if (email) {
      user = await UserModel.findOne({ email });
    } else if (id) {
      user = await UserModel.findById(id);
    } else {
      return res.status(400).json({ message: "Missing user identifier" });
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error("Fetch user error:", error);
    res.status(500).json({ message: "Error fetching user", error: error.message });
  }
});

// Funds management routes
app.post("/addFunds", async (req, res) => {
  try {
    const { userId, amount } = req.body;
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.funds += parseFloat(amount);
    await user.save();
    res.json({ message: "Funds added successfully", funds: user.funds });
  } catch (error) {
    res.status(500).json({ message: "Error adding funds", error: error.message });
  }
});

app.post("/withdrawFunds", async (req, res) => {
  try {
    const { userId, amount } = req.body;
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const withdrawAmount = parseFloat(amount);
    if (user.funds < withdrawAmount) {
      return res.status(400).json({ message: "Insufficient funds" });
    }
    user.funds -= withdrawAmount;
    await user.save();
    res.json({ message: "Funds withdrawn successfully", funds: user.funds });
  } catch (error) {
    res.status(500).json({ message: "Error withdrawing funds", error: error.message });
  }
});

// Stock Market API Routes
app.get("/api/stocks/:symbol", async (req, res) => {
  try {
    const { symbol } = req.params;
    const { exchange = "NSE" } = req.query; // Default to NSE, can be "BSE"

    // If NSE/BSE APIs are not available, return fallback data
    if (!nse || !bse) {
      return res.json({
        priceInfo: {
          lastPrice: 1500 + Math.random() * 500, // Mock price
          previousClose: 1450 + Math.random() * 500,
          change: Math.random() * 100 - 50,
          changePercent: Math.random() * 2 - 1
        },
        symbol: symbol,
        exchange: exchange,
        note: "Using fallback data - API not available"
      });
    }

    let stockData;
    if (exchange.toUpperCase() === "BSE") {
      // For BSE, need to use script code. We'll try the symbol as-is first
      try {
        stockData = await bse.quote(symbol);
      } catch (e) {
        stockData = null;
      }
    } else {
      // For NSE, use equityQuote
      try {
        stockData = await nse.equityQuote(symbol);
      } catch (e) {
        stockData = null;
      }
    }

    // If API fails, return fallback data
    if (!stockData) {
      return res.json({
        priceInfo: {
          lastPrice: 1500 + Math.random() * 500,
          previousClose: 1450 + Math.random() * 500,
          change: Math.random() * 100 - 50,
          changePercent: Math.random() * 2 - 1
        },
        symbol: symbol,
        exchange: exchange,
        note: "Stock data not found, using fallback"
      });
    }

    res.json(stockData);
  } catch (error) {
    console.error("Stock data error:", error);
    // Return mock data on any error
    res.json({
      priceInfo: {
        lastPrice: 1500 + Math.random() * 500,
        previousClose: 1450 + Math.random() * 500,
        change: Math.random() * 100 - 50,
        changePercent: Math.random() * 2 - 1
      },
      note: "Error fetching real data, using mock data"
    });
  }
});

app.get("/api/market-status", async (req, res) => {
  try {
    if (!nse || !bse) {
      return res.json({
        NSE: { status: "OPEN", note: "Mock data" },
        BSE: { status: "OPEN", note: "Mock data" }
      });
    }

    const nseStatus = await nse.market?.getStatus?.();
    const bseStatus = await bse.market?.getStatus?.();

    res.json({
      NSE: nseStatus || { status: "OPEN", note: "Fallback data" },
      BSE: bseStatus || { status: "OPEN", note: "Fallback data" }
    });
  } catch (error) {
    console.error("Market status error:", error);
    res.json({
      NSE: { status: "OPEN", note: "Fallback data" },
      BSE: { status: "OPEN", note: "Fallback data" }
    });
  }
});

app.get("/api/indices", async (req, res) => {
  try {
    const { exchange = "NSE" } = req.query;

    if (!nse && !bse) {
      return res.json([
        { name: "NIFTY 50", value: 23000, change: 100, changePercent: 0.45 }
      ]);
    }

    if (exchange.toUpperCase() === "BSE") {
      res.json([]);
    } else {
      const status = await nse.market?.getStatus?.();
      res.json(status || []);
    }
  } catch (error) {
    console.error("Indices data error:", error);
    res.json([
      { name: "NIFTY 50", value: 23000, change: 100, changePercent: 0.45 }
    ]);
  }
});

app.get("/api/top-gainers", async (req, res) => {
  try {
    const { exchange = "NSE" } = req.query;

    if (!nse && !bse) {
      return res.json([]);
    }

    let gainersData = [];
    if (exchange.toUpperCase() === "BSE") {
      gainersData = await bse.gainers?.() || [];
    } else {
      gainersData = [];
    }

    res.json(gainersData);
  } catch (error) {
    console.error("Gainers data error:", error);
    res.json([]);
  }
});

app.get("/api/top-losers", async (req, res) => {
  try {
    const { exchange = "NSE" } = req.query;

    if (!nse && !bse) {
      return res.json([]);
    }

    let losersData = [];
    if (exchange.toUpperCase() === "BSE") {
      losersData = await bse.losers?.() || [];
    } else {
      losersData = [];
    }

    res.json(losersData);
  } catch (error) {
    console.error("Losers data error:", error);
    res.json([]);
  }
});


// Socket.io real-time communication
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Subscribe to stock updates
  socket.on('subscribe-stock', async (symbol) => {
    console.log(`Client ${socket.id} subscribed to ${symbol}`);

    // Send initial data
    try {
      const stockData = await nse.equityQuote(symbol);
      socket.emit('stock-update', { symbol, data: stockData });
    } catch (error) {
      socket.emit('stock-error', { symbol, error: error.message });
    }

    // Set up periodic updates (every 30 seconds)
    const interval = setInterval(async () => {
      try {
        const stockData = await nse.equityQuote(symbol);
        socket.emit('stock-update', { symbol, data: stockData });
      } catch (error) {
        socket.emit('stock-error', { symbol, error: error.message });
      }
    }, 30000);

    // Clean up on disconnect
    socket.on('disconnect', () => {
      clearInterval(interval);
      console.log(`Client ${socket.id} unsubscribed from ${symbol}`);
    });
  });

  // Subscribe to market indices
  socket.on('subscribe-indices', () => {
    console.log(`Client ${socket.id} subscribed to indices`);

    const interval = setInterval(async () => {
      try {
        const indicesData = await nse.market.getStatus();
        socket.emit('indices-update', indicesData);
      } catch (error) {
        socket.emit('indices-error', error.message);
      }
    }, 60000); // Update every minute

    socket.on('disconnect', () => {
      clearInterval(interval);
      console.log(`Client ${socket.id} unsubscribed from indices`);
    });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const startServer = async () => {
  try {
    await mongoose.connect(uri);
    console.log("DB connection established!");

    server.listen(PORT, () => {
      console.log(`App started on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start backend:", error);
    process.exit(1);
  }
};

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use. Stop the existing backend or set PORT in your .env file to a free port.`);
  } else {
    console.error("Server error:", error);
  }
  process.exit(1);
});

startServer();
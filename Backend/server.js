const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const Admin = require("./db/Admin/adminSchema");
const User = require("./db/User/userSchema");
const Survey = require("./db/User/surveySchema");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect("mongodb://127.0.0.1:27017/surveyform")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err));

// ===== ROOT ROUTE =====
app.get("/", (req, res) => {
  res.send("Server is up and running 🚀");
});

// ===== USER SIGNUP =====
app.post("/api/user/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      return res.status(400).json({ Status: "Failed", message: "User already exists" });
    }

    const newUser = new User({ name, email, password });
    await newUser.save();
    return res.status(201).json({ Status: "Success", message: "User registered successfully" });
  } catch (error) {
    return res.status(500).json({ Status: "Failed", message: "Server error", error });
  }
});

// ===== USER LOGIN =====
app.post("/api/user/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || user.password !== password) {
      return res.status(401).json({ Status: "Failed", message: "Invalid email or password" });
    }

    return res.status(200).json({ Status: "Success", user });
  } catch (error) {
    return res.status(500).json({ Status: "Failed", message: "Server error", error });
  }
});

// ===== ADMIN LOGIN =====
app.post("/api/admin/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await Admin.findOne({ email });
    if (admin && admin.password === password) {
      res.status(200).json({ message: "Login successful", admin });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// ===== GET USERS =====
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// ===== CREATE SURVEY =====
app.post("/api/surveys", async (req, res) => {
  try {
    const newSurvey = new Survey(req.body);
    await newSurvey.save();
    res.status(201).json({ message: "Survey created successfully", newSurvey });
  } catch (error) {
    res.status(500).json({ message: "Error creating survey", error });
  }
});

// ===== GET ALL SURVEYS =====
app.get("/api/surveys", async (req, res) => {
  try {
    const surveys = await Survey.find();
    res.status(200).json(surveys);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// ===== GET SINGLE SURVEY BY ID =====
app.get("/api/surveys/:id", async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id);
    if (!survey) {
      return res.status(404).json({ message: "Survey not found" });
    }
    res.status(200).json(survey);
  } catch (error) {
    res.status(500).json({ message: "Error fetching survey", error });
  }
});

// ===== SUBMIT RESPONSE =====
app.post("/api/surveys/:id/respond", async (req, res) => {
  try {
    const { respondent, answers } = req.body;

    // Validation
    if (!respondent || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ message: "Invalid response format" });
    }

    const survey = await Survey.findById(req.params.id);
    if (!survey) {
      return res.status(404).json({ message: "Survey not found" });
    }

    const formattedAnswers = survey.questions.map((q, index) => ({
      question: q.question,
      answer: answers[index] || ""
    }));

    survey.responses.push({ respondent, answers: formattedAnswers });
    await survey.save();

    res.status(200).json({ message: "Response submitted successfully" });
  } catch (error) {
    console.error("Error submitting response:", error.message);
    res.status(500).json({ message: "Error submitting response", error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

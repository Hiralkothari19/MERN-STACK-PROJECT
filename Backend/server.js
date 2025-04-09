const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt'); // Added for password hashing
const { body, validationResult } = require('express-validator'); // Added for input validation
const mongoose = require('mongoose');
require('./db/config');

// Models
const Admin = require('./db/Admin/adminSchema');
const User = require('./db/User/userSchema');
const Survey = require('./db/User/surveySchema');

// Initialize express
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Input validation middleware
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: "Error", errors: errors.array() });
  }
  next();
};

// Standard response formatter
// Updated response formatter for consistency with frontend
const formatResponse = (status, data, message = null) => {
  // Use capital S for Status to match frontend expectations
  const response = { Status: status };
  
  // For login/authentication responses, specifically format with 'user' property
  if (status === "Success" && data && (data._id || data.email)) {
    response.user = data;
  } 
  // For all other data types
  else if (data) {
    response.data = data;
  }
  
  if (message) response.message = message;
  return response;
};

// ======================= ADMIN ROUTES =======================

// Admin login
// User login with updated response format
app.post('/api/user/login', [
  body('email').isEmail().withMessage('Invalid email format'),
  body('password').notEmpty().withMessage('Password is required')
], validateRequest, async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      // Return standard response format with capital S Status
      return res.status(404).json({ Status: "Failed", message: "User not found" });
    }
    
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordMatch) {
      // Return standard response format with capital S Status
      return res.status(401).json({ Status: "Failed", message: "Invalid credentials" });
    }
    
    // Return exactly what frontend expects, with user property
    res.json({ 
      Status: "Success", 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email 
      }
    });
  } catch (error) {
    console.error("User login error:", error);
    res.status(500).json({ Status: "Error", message: "Server error" });
  }
});

// Admin signup
// User signup with updated response format
app.post('/api/user/signup', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Invalid email format'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], validateRequest, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      return res.status(409).json({ Status: "Failed", message: "User already exists" });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = await User.create({ 
      name, 
      email, 
      password: hashedPassword 
    });
    
    res.status(201).json({ Status: "Success", message: "User account created" });
  } catch (error) {
    console.error("User signup error:", error);
    res.status(500).json({ Status: "Error", message: "Server error" });
  }
});

// ======================= USER ROUTES =======================

// User login
app.post('/api/user/login', [
  body('email').isEmail().withMessage('Invalid email format'),
  body('password').notEmpty().withMessage('Password is required')
], validateRequest, async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json(formatResponse("Failed", null, "User not found"));
    }
    
    // Use bcrypt.compare for secure password verification
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordMatch) {
      return res.status(401).json(formatResponse("Failed", null, "Invalid credentials"));
    }
    
    res.json(formatResponse("Success", { 
      id: user._id, 
      name: user.name, 
      email: user.email 
    }));
  } catch (error) {
    console.error("User login error:", error);
    res.status(500).json(formatResponse("Error", null, "Server error"));
  }
});

// User signup
app.post('/api/user/signup', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Invalid email format'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], validateRequest, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      return res.status(409).json(formatResponse("Failed", null, "User already exists"));
    }
    
    // Hash password before storing
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = await User.create({ 
      name, 
      email, 
      password: hashedPassword 
    });
    
    res.status(201).json(formatResponse("Success", null, "User account created"));
  } catch (error) {
    console.error("User signup error:", error);
    res.status(500).json(formatResponse("Error", null, "Server error"));
  }
});

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find().select('-password'); // Exclude password
    res.json(formatResponse("Success", users));
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json(formatResponse("Error", null, "Server error"));
  }
});

// Get user by ID
app.get('/api/users/:id', async (req, res) => {
  try {
    const id = req.params.id;
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json(formatResponse("Error", null, "Invalid user ID format"));
    }
    
    const user = await User.findById(id).select('-password');
    
    if (!user) {
      return res.status(404).json(formatResponse("Failed", null, "User not found"));
    }
    
    res.json(formatResponse("Success", user));
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json(formatResponse("Error", null, "Server error"));
  }
});

// Update user
app.put('/api/users/:id', [
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().withMessage('Invalid email format'),
  body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], validateRequest, async (req, res) => {
  try {
    const id = req.params.id;
    const { name, email, password } = req.body;
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json(formatResponse("Error", null, "Invalid user ID format"));
    }
    
    // Prepare update data
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json(formatResponse("Failed", null, "User not found"));
    }
    
    res.json(formatResponse("Success", updatedUser));
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json(formatResponse("Error", null, "Server error"));
  }
});

// Delete user
app.delete('/api/users/:id', async (req, res) => {
  try {
    const id = req.params.id;
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json(formatResponse("Error", null, "Invalid user ID format"));
    }
    
    const result = await User.deleteOne({ _id: id });
    
    if (result.deletedCount === 0) {
      return res.status(404).json(formatResponse("Failed", null, "User not found"));
    }
    
    res.json(formatResponse("Success", null, "User deleted successfully"));
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json(formatResponse("Error", null, "Server error"));
  }
});

// ======================= SURVEY ROUTES =======================

// Get all surveys
// Get all surveys
app.get('/api/surveys', async (req, res) => {
  try {
    const surveys = await Survey.find();
    res.json({ Status: "Success", data: surveys });
  } catch (error) {
    console.error("Get surveys error:", error);
    res.status(500).json({ Status: "Error", message: "Server error" });
  }
});

// Add alias route for /surveyforms for frontend compatibility
app.get('/surveyforms', async (req, res) => {
  try {
    const surveys = await Survey.find();
    res.json({ Status: "Success", data: surveys });
  } catch (error) {
    console.error("Get surveyforms error:", error);
    res.status(500).json({ Status: "Error", message: "Server error" });
  }
});

// Get surveys by user ID
app.get('/api/surveys/user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ Status: "Error", message: "Invalid user ID format" });
    }
    
    const surveys = await Survey.find({ userId });
    res.json({ Status: "Success", data: surveys });
  } catch (error) {
    console.error("Get user surveys error:", error);
    res.status(500).json({ Status: "Error", message: "Server error" });
  }
});

// Create survey
app.post('/api/surveys/create', [
  body('title').notEmpty().withMessage('Title is required'),
  body('questions').isArray({ min: 1 }).withMessage('At least one question is required'),
  body('userId').notEmpty().withMessage('User ID is required'),
  body('userName').notEmpty().withMessage('User name is required')
], validateRequest, async (req, res) => {
  try {
    const { title, questions, userId, userName } = req.body;
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ Status: "Error", message: "Invalid user ID format" });
    }
    
    const newSurvey = new Survey({ title, questions, userId, userName });
    await newSurvey.save();
    
    res.status(201).json({ Status: "Success", data: { surveyId: newSurvey._id } });
  } catch (error) {
    console.error("Create survey error:", error);
    res.status(500).json({ Status: "Error", message: "Server error" });
  }
});

// Get survey by ID
app.get('/api/surveys/:id', async (req, res) => {
  try {
    const id = req.params.id;
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ Status: "Error", message: "Invalid survey ID format" });
    }
    
    const survey = await Survey.findById(id);
    
    if (!survey) {
      return res.status(404).json({ Status: "Failed", message: "Survey not found" });
    }
    
    res.json({ Status: "Success", data: survey });
  } catch (error) {
    console.error("Get survey error:", error);
    res.status(500).json({ Status: "Error", message: "Server error" });
  }
});

// Submit survey response
app.post('/api/surveys/:id/respond', [
  body('respondent').notEmpty().withMessage('Respondent is required'),
  body('answers').isArray().withMessage('Answers must be an array')
], validateRequest, async (req, res) => {
  try {
    const id = req.params.id;
    const { respondent, answers } = req.body;
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ Status: "Error", message: "Invalid survey ID format" });
    }
    
    const survey = await Survey.findById(id);
    
    if (!survey) {
      return res.status(404).json({ Status: "Failed", message: "Survey not found" });
    }
    
    // Validate answers array length
    if (answers.length !== survey.questions.length) {
      return res.status(400).json({ Status: "Error", message: "Number of answers must match number of questions" });
    }
    
    // Create response with questions
    const responseWithQuestions = answers.map((answer, index) => ({
      question: survey.questions[index].question,
      answer
    }));
    
    survey.responses.push({ respondent, answers: responseWithQuestions });
    await survey.save();
    
    res.json({ Status: "Success", data: survey });
  } catch (error) {
    console.error("Survey response error:", error);
    res.status(500).json({ Status: "Error", message: "Server error" });
  }
});

// Get survey results
app.get('/api/surveys/:id/results', async (req, res) => {
  try {
    const id = req.params.id;
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ Status: "Error", message: "Invalid survey ID format" });
    }
    
    const survey = await Survey.findById(id);
    
    if (!survey) {
      return res.status(404).json({ Status: "Failed", message: "Survey not found" });
    }
    
    res.json({ Status: "Success", data: survey.responses });
  } catch (error) {
    console.error("Get survey results error:", error);
    res.status(500).json({ Status: "Error", message: "Server error" });
  }
});

// Delete survey
app.delete('/api/surveys/:id', async (req, res) => {
  try {
    const id = req.params.id;
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ Status: "Error", message: "Invalid survey ID format" });
    }
    
    const result = await Survey.deleteOne({ _id: id });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ Status: "Failed", message: "Survey not found" });
    }
    
    res.json({ Status: "Success", message: "Survey deleted successfully" });
  } catch (error) {
    console.error("Delete survey error:", error);
    res.status(500).json({ Status: "Error", message: "Server error" });
  }
});

// Delete response
app.delete('/api/surveys/responses/delete/:responseId', async (req, res) => {
  try {
    const responseId = req.params.responseId;
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(responseId)) {
      return res.status(400).json({ Status: "Error", message: "Invalid response ID format" });
    }
    
    const result = await Survey.updateOne(
      { 'responses._id': responseId },
      { $pull: { responses: { _id: responseId } } }
    );
    
    if (result.modifiedCount === 0) {
      return res.status(404).json({ Status: "Failed", message: "Response not found" });
    }
    
    res.status(204).end();
  } catch (error) {
    console.error("Delete response error:", error);
    res.status(500).json({ Status: "Error", message: "Server error" });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ Status: "Error", message: "Internal server error" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ Status: "Error", message: "Endpoint not found" });
});


// Start server
app.listen(port, () => console.log(`Server running on port ${port}`));
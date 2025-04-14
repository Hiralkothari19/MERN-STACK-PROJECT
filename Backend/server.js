// Import at the top of your server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const { body, validationResult } = require("express-validator");
const authMiddleware = require('./middleware'); // Adjust the path as necessary

// Import your database models
const Admin = require("./db/Admin/adminSchema");
const User = require("./db/User/userSchema");
const Survey = require("./db/User/surveySchema");

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// More explicit CORS configuration
app.use(cors({
  origin: 'http://localhost:5173', // Your React app's address
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json()); // Add space or newline between middleware setup
// MongoDB Connection Setup
mongoose.set('strictQuery', false);

// Connection with all possible options
mongoose.connect('mongodb://localhost:27017/survey_system', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 60000, // Increase timeout to 60 seconds
  socketTimeoutMS: 45000, // Socket timeout
  family: 4, // Use IPv4, skip trying IPv6
  maxPoolSize: 10 // Maintain up to 10 socket connections
})

// Add connection event listeners
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to DB');
});

mongoose.connection.on('error', (err) => {
  console.log('Mongoose connection error: ', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected');
});

// Input validation middleware
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: "Error", errors: errors.array() });
  }
  next();
};

// Standard response formatter
const formatResponse = (status, data, message = null) => {
  const response = { status };
  if (data) response.data = data;
  if (message) response.message = message;
  return response;
};


// ===== USER SIGNUP =====
app.post("/api/user/signup", [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Invalid email format'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], validateRequest, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json(formatResponse(
        "Failed", 
        null, 
        "User with this email already exists"
      ));
    }
    
    // Hash password before storing
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new user with hashed password
    const newUser = new User({ 
      name, 
      email, 
      password: hashedPassword 
    });
    await newUser.save();
    
    return res.status(201).json(formatResponse(
      "Success", 
      null, 
      "User created successfully"
    ));
  } catch (error) {
    console.error("User signup error:", error);
    return res.status(500).json(formatResponse(
      "Error", 
      null, 
      "Server error"
    ));
  }
});

// ===== USER LOGIN =====
// Modified login route to handle both hashed and plaintext passwords
app.post("/api/user/login", [
  body('email').isEmail().withMessage('Invalid email format'),
  body('password').notEmpty().withMessage('Password is required')
], validateRequest, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json(formatResponse("Failed", null, "Invalid email or password"));
    }
    
    // Check if password is hashed (starts with $2a$ or $2b$)
    let passwordMatch = false;
    
    if (user.password.startsWith('$2')) {
      // Hashed password - use bcrypt compare
      passwordMatch = await bcrypt.compare(password, user.password);
    } else {
      // Plain text password - direct comparison
      passwordMatch = user.password === password;
      
      // Update to hashed password if match found
      if (passwordMatch) {
        user.password = await bcrypt.hash(password, 10);
        await user.save();
      }
    }
    
    if (!passwordMatch) {
      return res.status(401).json(formatResponse("Failed", null, "Invalid email or password"));
    }

    // Return user info (excluding password)
    const userResponse = {
      id: user._id, // Use _id as id for consistency
      name: user.name,
      email: user.email
    };

    return res.status(200).json(formatResponse("Success", { user: userResponse }));
  } catch (error) {
    console.error("User login error:", error);
    return res.status(500).json(formatResponse("Error", null, "Server error"));
  }
});

// ======================= ADMIN ROUTES =======================

// Admin login with validation and secure password checking
app.post('/api/admin/login', [
  body('email').isEmail().withMessage('Invalid email format'),
  body('password').notEmpty().withMessage('Password is required')
], validateRequest, async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    
    if (!admin) {
      return res.status(404).json(formatResponse("Failed", null, "Admin not found"));
    }
    
    // Use bcrypt.compare for secure password verification
    const passwordMatch = await bcrypt.compare(password, admin.password);
    
    if (!passwordMatch) {
      return res.status(401).json(formatResponse("Failed", null, "Invalid credentials"));
    }
    
    res.json(formatResponse("Success", { 
      id: admin._id, 
      name: admin.name, 
      email: admin.email 
    }));
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json(formatResponse("Error", null, "Server error"));
  }
});

// Admin signup
app.post('/api/admin/signup', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Invalid email format'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], validateRequest, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    const existingAdmin = await Admin.findOne({ email });
    
    if (existingAdmin) {
      return res.status(409).json(formatResponse("Failed", null, "Admin already exists"));
    }
    
    // Hash password before storing
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newAdmin = await Admin.create({ 
      name, 
      email, 
      password: hashedPassword 
    });
    
    res.status(201).json(formatResponse("Success", null, "Admin account created"));
  } catch (error) {
    console.error("Admin signup error:", error);
    res.status(500).json(formatResponse("Error", null, "Server error"));
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

// Get a single user by ID
app.get('/api/users/:id', async (req, res) => {
  try {
    const id = req.params.id;
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json(formatResponse("Error", null, "Invalid user ID format"));
    }
    
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json(formatResponse("Failed", null, "User not found"));
    }
    
    // Don't send the password back
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email
    };
    
    res.json(formatResponse("Success", userResponse));
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json(formatResponse("Error", null, "Server error"));
  }
});

// Update a user
app.put('/api/users/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { name, email, password } = req.body;
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json(formatResponse("Error", null, "Invalid user ID format"));
    }
    
    // Find the user first
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json(formatResponse("Failed", null, "User not found"));
    }
    
    // Update user data
    user.name = name || user.name;
    user.email = email || user.email;
    
    // Only update password if provided
    if (password && password.trim() !== '') {
      user.password = await bcrypt.hash(password, 10);
    }
    
    // Save the updated user
    await user.save();
    
    res.json(formatResponse("Success", null, "User updated successfully"));
  } catch (error) {
    console.error("Update user error:", error);
    
    // Handle duplicate email
    if (error.code === 11000) {
      return res.status(409).json(formatResponse("Error", null, "Email already in use"));
    }
    
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

// For backward compatibility with older admin code
app.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 });
    res.status(200).json(users);
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.delete('/userdelete/:id', async (req, res) => {
  try {
    const id = req.params.id;
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }
    
    const result = await User.findByIdAndDelete(id);
    
    if (!result) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.get('/users/:id', async (req, res) => {
  try {
    const id = req.params.id;
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }
    
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Don't send the hashed password back
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      password: "" // Send empty string for security
    };
    
    res.status(200).json(userResponse);
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.put('/useredit/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { name, email, password } = req.body;
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }
    
    // Find the user first
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Update user data
    user.name = name || user.name;
    user.email = email || user.email;
    
    // Only update password if provided
    if (password && password.trim() !== '') {
      user.password = await bcrypt.hash(password, 10);
    }
    
    // Save the updated user
    await user.save();
    
    res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ======================= SURVEY ROUTES =======================

// Create survey
app.post('/api/surveys/create', [
  body('title').trim().notEmpty().withMessage('Survey title is required'),
  // other validations...
], async (req, res) => {
  try {
    const { title, description = '', questions, userId, userName } = req.body;
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json(formatResponse("Error", null, "Invalid user ID"));
    }
    
    // Additional questions validation
    if (!validateSurveyQuestions(questions)) {
      return res.status(400).json(formatResponse("Error", null, "Invalid survey questions"));
    }
    
    const newSurvey = new Survey({ 
      title, 
      description,
      questions, 
      userId, 
      userName,
      responses: [],
      createdAt: new Date()
    });
    
    await newSurvey.save();
    
    res.status(201).json(formatResponse("Success", { 
      surveyId: newSurvey._id,
      message: "Survey created successfully" 
    }));
  } catch (error) {
    console.error("Create survey error:", error);
    
    // Better error messages based on error type
    if (error.name === 'ValidationError') {
      return res.status(400).json(formatResponse("Error", null, 
        "Validation failed: " + Object.values(error.errors).map(e => e.message).join(', ')
      ));
    }
    
    if (error.code === 11000) { // Duplicate key error
      return res.status(409).json(formatResponse("Error", null, "A survey with this title already exists"));
    }
    
    res.status(500).json(formatResponse("Error", null, "Failed to create survey: Server error"));
  }
});

const validateSurveyQuestions = (questions) => {
  if (!Array.isArray(questions) || questions.length === 0) {
    return false;
  }
  
  return questions.every(question => {
    // Validate basic question structure
    if (!question.question || typeof question.question !== 'string') {
      return false;
    }
    
    // Validate question type
    const validTypes = ['multiple-choice', 'checkbox', 'text'];
    if (!validTypes.includes(question.type)) {
      return false;
    }
    
    // Validate options for non-text questions
    if (question.type !== 'text') {
      if (!Array.isArray(question.options) || question.options.length === 0) {
        return false;
      }
      
      // Ensure options are non-empty strings
      return question.options.every(option => 
        typeof option === 'string' && option.trim() !== ''
      );
    }
    
    return true;
  });
};

// Get all surveys
// Get all surveys - FIXED VERSION
// Get all surveys - FIXED VERSION
app.get('/api/surveys', async (req, res) => {
  try {
    const surveys = await Survey.find({}, { title: 1, userId: 1, userName: 1, createdAt: 1, _id: 1 });
    res.json(formatResponse("Success", surveys));
  } catch (error) {
    console.error("Get surveys error:", error);
    res.status(500).json(formatResponse("Error", null, "Unable to retrieve surveys"));
  }
});

// For backward compatibility with older admin code
app.get('/surveyforms', async (req, res) => {
  try {
    const surveys = await Survey.find({}, { questions: 0 });
    res.status(200).json(surveys);
  } catch (error) {
    console.error("Get surveys error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get surveys by user ID
app.get('/api/surveys/user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json(formatResponse("Error", null, "Invalid user ID"));
    }
    
    const surveys = await Survey.find({ userId }, 'title questions responses createdAt');
    
    if (surveys.length === 0) {
      return res.status(404).json(formatResponse("Not Found", null, "No surveys found for this user"));
    }
    
    res.json(formatResponse("Success", surveys));
  } catch (error) {
    console.error("Get user surveys error:", error);
    res.status(500).json(formatResponse("Error", null, "Server error retrieving user surveys"));
  }
});

app.get('/mysurveyforms/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const surveys = await Survey.find({ userId }, { questions: 0 });
    res.status(200).json(surveys);
  } catch (error) {
    console.error("Get user surveys error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get survey by ID
app.get('/api/surveys/:id', async (req, res) => {
  try {
    const id = req.params.id;
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json(formatResponse("Error", null, "Invalid survey ID"));
    }
    
    const survey = await Survey.findById(id);
    
    if (!survey) {
      return res.status(404).json(formatResponse("Not Found", null, "Survey not found"));
    }
    
    res.json(formatResponse("Success", survey));
  } catch (error) {
    console.error("Get survey error:", error);
    res.status(500).json(formatResponse("Error", null, "Unable to retrieve survey"));
  }
});

// Delete survey
app.delete('/api/surveys/:id', async (req, res) => {
  try {
    const id = req.params.id;
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json(formatResponse("Error", null, "Invalid survey ID"));
    }
    
    const survey = await Survey.findByIdAndDelete(id);
    
    if (!survey) {
      return res.status(404).json(formatResponse("Not Found", null, "Survey not found"));
    }
    
    res.json(formatResponse("Success", { message: "Survey deleted successfully" }));
  } catch (error) {
    console.error("Delete survey error:", error);
    res.status(500).json(formatResponse("Error", null, "Failed to delete survey"));
  }
});

// Add route for responding to a survey
app.post('/api/surveys/respond/:id', [
  body('respondent').notEmpty().withMessage('Respondent name is required'),
  body('answers').isArray().withMessage('Answers must be an array')
], validateRequest, async (req, res) => {
  try {
    const { id } = req.params;
    const { respondent, answers } = req.body;
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json(formatResponse("Error", null, "Invalid survey ID"));
    }
    
    const survey = await Survey.findById(id);
    
    if (!survey) {
      return res.status(404).json(formatResponse("Not Found", null, "Survey not found"));
    }
    
    // Create a new response object
    const newResponse = {
      respondent,
      answers,
      submittedAt: new Date()
    };
    
    // Add response to the survey
    survey.responses.push(newResponse);
    await survey.save();
    
    res.status(201).json(formatResponse("Success", { 
      responseId: survey.responses[survey.responses.length - 1]._id 
    }));
  } catch (error) {
    console.error("Survey response error:", error);
    res.status(500).json(formatResponse("Error", null, "Failed to submit response"));
  }
});

// Get survey results by survey ID
app.get('/api/surveys/:id/results', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json(formatResponse("Error", null, "Invalid survey ID"));
    }
    
    const survey = await Survey.findById(id);
    
    if (!survey) {
      return res.status(404).json(formatResponse("Not Found", null, "Survey not found"));
    }
    
    res.json(formatResponse("Success", survey.responses));
  } catch (error) {
    console.error("Get survey results error:", error);
    res.status(500).json(formatResponse("Error", null, "Failed to fetch survey results"));
  }
});

// Additional route for older admin interfaces
app.get('/api/surveys/results/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json(formatResponse("Error", null, "Invalid survey ID"));
    }
    
    const survey = await Survey.findById(id);
    
    if (!survey) {
      return res.status(404).json(formatResponse("Not Found", null, "Survey not found"));
    }
    
    res.json(formatResponse("Success", survey.responses));
  } catch (error) {
    console.error("Get survey results error:", error);
    res.status(500).json(formatResponse("Error", null, "Failed to fetch survey results"));
  }
});

// Delete response
app.delete('/api/surveys/responses/delete/:responseId', async (req, res) => {
  try {
    const { responseId } = req.params;
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(responseId)) {
      return res.status(400).json(formatResponse("Error", null, "Invalid response ID format"));
    }
    
    const result = await Survey.updateOne(
      { 'responses._id': responseId },
      { $pull: { responses: { _id: responseId } } }
    );
    
    if (result.modifiedCount === 0) {
      return res.status(404).json(formatResponse("Failed", null, "Response not found"));
    }
    
    res.status(200).json(formatResponse("Success", null, "Response deleted successfully"));
  } catch (error) {
    console.error("Delete response error:", error);
    res.status(500).json(formatResponse("Error", null, "Server error"));
  }
});

// Delete response (original route for backward compatibility)
app.delete('/api/surveys/responses/:responseId', async (req, res) => {
  try {
    const responseId = req.params.responseId;
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(responseId)) {
      return res.status(400).json(formatResponse("Error", null, "Invalid response ID format"));
    }
    
    const result = await Survey.updateOne(
      { 'responses._id': responseId },
      { $pull: { responses: { _id: responseId } } }
    );
    
    if (result.modifiedCount === 0) {
      return res.status(404).json(formatResponse("Failed", null, "Response not found"));
    }
    
    res.status(204).end();
  } catch (error) {
    console.error("Delete response error:", error);
    res.status(500).json(formatResponse("Error", null, "Server error"));
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json(formatResponse("Error", null, "Internal server error"));
});

// 404 handler
app.use((req, res) => {
  res.status(404).json(formatResponse("Error", null, "Endpoint not found"));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const Ulogin = () => {
  // Form state management
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [isLoginActive, setIsLoginActive] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  // Toggle between login and signup forms
  const toggleForm = () => {
    setIsLoginActive(!isLoginActive);
  };

  // Handle login submission with loading state and improved error handling
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const payload = { email: loginEmail, password: loginPassword };
      console.log("Sending login request with payload:", payload);
      
      const response = await axios.post("http://localhost:5000/api/user/login", payload);
      console.log("Login response:", response.data);
      
      if (response.data && response.data.Status === "Success") {
        console.log("Login successful, user data:", response.data.user);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        toast.success("Login successful! Redirecting...");
        setTimeout(() => navigate('/createsurvey'), 2000);
      } else {
        const errorMessage = response.data?.message || "Login failed - unexpected response format";
        console.error("Login error:", errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Login request failed:", error);
      
      // More detailed error handling
      if (error.response) {
        // The server responded with a status code outside the 2xx range
        console.error("Server response:", error.response.data);
        console.error("Status code:", error.response.status);
        toast.error(`Login failed: ${error.response.data.message || 'Server error'}`);
      } else if (error.request) {
        // The request was made but no response was received
        console.error("No response received");
        toast.error("Login failed: No response from server");
      } else {
        // Something happened in setting up the request
        console.error("Error message:", error.message);
        toast.error(`Login failed: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced signup with form validation and loading state
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (signupPassword.length < 6) {
      toast.warning("Password must be at least 6 characters long");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const payload = { name: signupName, email: signupEmail, password: signupPassword };
      const result = await axios.post("http://localhost:5000/api/user/signup", payload);
      
      console.log(result);
      if (result.data.Status === "Success") {
        toast.success("Account created successfully! You can now log in.");
        // Clear signup form and switch to login
        setSignupName('');
        setSignupEmail('');
        setSignupPassword('');
        setIsLoginActive(true);
      } else {
        toast.error(result.data.message || "Account creation failed");
      }
    } catch (err) {
      console.log(err);
      if (err.response && err.response.data && err.response.data.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error("Failed to create an account. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-header">
        <h1>Survey Platform</h1>
        <Link to="/alogin" className="admin-link">
          Login as Admin
        </Link>
      </div>
      
      <div className="auth-card">
        <div className="auth-tabs">
          <button 
            className={`tab-btn ${isLoginActive ? 'active' : ''}`} 
            onClick={() => setIsLoginActive(true)}
          >
            Login
          </button>
          <button 
            className={`tab-btn ${!isLoginActive ? 'active' : ''}`} 
            onClick={() => setIsLoginActive(false)}
          >
            Sign Up
          </button>
        </div>
        
        <div className="form-container">
          {isLoginActive ? (
            <form onSubmit={handleLoginSubmit} className="auth-form">
              <h2>Welcome Back</h2>
              <p className="form-subtitle">Log in to your account to create and manage surveys</p>
              
              <div className="form-group">
                <label htmlFor="loginEmail">Email</label>
                <input 
                  type="email" 
                  id="loginEmail"
                  placeholder="Enter your email" 
                  value={loginEmail} 
                  onChange={(e) => setLoginEmail(e.target.value)} 
                  required 
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="loginPassword">Password</label>
                <input 
                  type="password" 
                  id="loginPassword"
                  placeholder="Enter your password" 
                  value={loginPassword} 
                  onChange={(e) => setLoginPassword(e.target.value)} 
                  required 
                />
              </div>
              
              <button 
                type="submit" 
                className="submit-btn"
                disabled={isLoading}
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
              
              <p className="form-footer">
                Don't have an account?{" "}
                <button type="button" className="link-btn" onClick={toggleForm}>
                  Sign up
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleSignupSubmit} className="auth-form">
              <h2>Create Account</h2>
              <p className="form-subtitle">Join our platform to create and share surveys</p>
              
              <div className="form-group">
                <label htmlFor="signupName">Full Name</label>
                <input 
                  type="text" 
                  id="signupName"
                  placeholder="Enter your name" 
                  value={signupName} 
                  onChange={(e) => setSignupName(e.target.value)} 
                  required 
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="signupEmail">Email</label>
                <input 
                  type="email" 
                  id="signupEmail"
                  placeholder="Enter your email" 
                  value={signupEmail} 
                  onChange={(e) => setSignupEmail(e.target.value)} 
                  required 
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="signupPassword">Password</label>
                <input 
                  type="password" 
                  id="signupPassword"
                  placeholder="Create a password (min. 6 characters)" 
                  value={signupPassword} 
                  onChange={(e) => setSignupPassword(e.target.value)} 
                  required 
                  minLength="6"
                />
              </div>
              
              <button 
                type="submit" 
                className="submit-btn"
                disabled={isLoading}
              >
                {isLoading ? 'Creating account...' : 'Sign Up'}
              </button>
              
              <p className="form-footer">
                Already have an account?{" "}
                <button type="button" className="link-btn" onClick={toggleForm}>
                  Log in
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
      
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      
      <style jsx>{`
        /* Modern authentication styling */
        .auth-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 20px;
          background: linear-gradient(135deg, #24243e 0%, #302b63 50%, #0f0c29 100%);
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        .auth-header {
          width: 100%;
          max-width: 450px;
          margin-bottom: 30px;
          text-align: center;
        }
        
        .auth-header h1 {
          color: white;
          font-size: 2.5rem;
          margin-bottom: 15px;
          font-weight: 600;
        }
        
        .admin-link {
          display: inline-block;
          color: #94a3b8;
          text-decoration: none;
          font-size: 0.9rem;
          padding: 8px 16px;
          border-radius: 20px;
          background-color: rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
        }
        
        .admin-link:hover {
          background-color: rgba(255, 255, 255, 0.2);
          color: white;
        }
        
        .auth-card {
          width: 100%;
          max-width: 450px;
          background-color: white;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
          overflow: hidden;
        }
        
        .auth-tabs {
          display: flex;
          border-bottom: 1px solid #e2e8f0;
        }
        
        .tab-btn {
          flex: 1;
          background: none;
          border: none;
          padding: 16px;
          font-size: 1rem;
          font-weight: 500;
          color: #64748b;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .tab-btn.active {
          color: #3b82f6;
          box-shadow: inset 0 -2px 0 #3b82f6;
        }
        
        .tab-btn:hover {
          background-color: #f8fafc;
        }
        
        .form-container {
          padding: 30px;
        }
        
        .auth-form {
          width: 100%;
        }
        
        .auth-form h2 {
          font-size: 1.5rem;
          color: #1e293b;
          margin-bottom: 8px;
        }
        
        .form-subtitle {
          font-size: 0.9rem;
          color: #64748b;
          margin-bottom: 24px;
        }
        
        .form-group {
          margin-bottom: 20px;
        }
        
        .form-group label {
          display: block;
          font-size: 0.875rem;
          font-weight: 500;
          color: #475569;
          margin-bottom: 6px;
        }
        
        .form-group input {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          font-size: 1rem;
          transition: all 0.3s ease;
        }
        
        .form-group input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
        }
        
        .submit-btn {
          width: 100%;
          padding: 12px;
          background-color: #3b82f6;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 10px;
        }
        
        .submit-btn:hover {
          background-color: #2563eb;
        }
        
        .submit-btn:disabled {
          background-color: #94a3b8;
          cursor: not-allowed;
        }
        
        .form-footer {
          margin-top: 24px;
          text-align: center;
          font-size: 0.875rem;
          color: #64748b;
        }
        
        .link-btn {
          background: none;
          border: none;
          color: #3b82f6;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          padding: 0;
        }
        
        .link-btn:hover {
          text-decoration: underline;
        }
        
        /* Responsive adjustments */
        @media (max-width: 500px) {
          .form-container {
            padding: 20px;
          }
          
          .auth-header h1 {
            font-size: 2rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Ulogin;
import axios from "axios";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const Alogin = () => {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [isLoginActive, setIsLoginActive] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  // Debug function to log response structure
  const logResponseDetails = (response) => {
    console.log("Response structure:", {
      status: response.status,
      headers: response.headers,
      data: response.data
    });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    let payload = { email: loginEmail, password: loginPassword };
    
    try {
      const response = await axios.post("/api/admin/login", payload);
      
      // Log response for debugging
      logResponseDetails(response);
      
      // Check for both lowercase and uppercase status field to be safe
      if (response.data.status === "Success" || response.data.Status === "Success") {
        // Store user data correctly based on response structure
        const userData = response.data.data || response.data.user || response.data;
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('userType', 'admin'); // Store user type for role-based access
        
        toast.success("Login successful");
        setTimeout(() => navigate('/ahome'), 2000);
      } else {
        toast.error(response.data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      
      if (error.response) {
        console.log("Error response data:", error.response.data);
        toast.error(error.response.data.message || "Login failed");
      } else if (error.request) {
        toast.error("No response from server. Please try again.");
      } else {
        toast.error("Error during login. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    let payload = { name: signupName, email: signupEmail, password: signupPassword };
    
    try {
      const response = await axios.post("/api/admin/signup", payload);
      
      // Log response for debugging
      logResponseDetails(response);
      
      // Check for both lowercase and uppercase status field to be safe
      if (response.data.status === "Success" || response.data.Status === "Success") {
        toast.success(response.data.message || "Account created successfully");
        // Clear form fields after successful signup
        setSignupName('');
        setSignupEmail('');
        setSignupPassword('');
        // Switch to login tab
        setIsLoginActive(true);
      } else {
        toast.error(response.data.message || "Failed to create account");
      }
    } catch (error) {
      console.error("Signup error:", error);
      
      if (error.response) {
        console.log("Error response data:", error.response.data);
        toast.error(error.response.data.message || "Failed to create account");
      } else if (error.request) {
        toast.error("No response from server. Please try again.");
      } else {
        toast.error("Error during signup. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-header">
        <h1>Admin Portal</h1>
        <Link to='/' className="user-link">Login As User</Link>
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
            <div className="auth-form">
              <h2>Admin Access</h2>
              <p className="form-subtitle">Enter your admin credentials</p>
              
              <form onSubmit={handleLoginSubmit}>
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input 
                    type="email" 
                    id="email" 
                    placeholder="admin@example.com" 
                    value={loginEmail} 
                    onChange={(e) => setLoginEmail(e.target.value)} 
                    required 
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <input 
                    type="password" 
                    id="password" 
                    placeholder="********" 
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
              </form>
              
              <div className="form-footer">
                Need an admin account?{' '}
                <button 
                  className="link-btn" 
                  onClick={() => setIsLoginActive(false)}
                >
                  Sign up
                </button>
              </div>
            </div>
          ) : (
            <div className="auth-form">
              <h2>Create Admin Account</h2>
              <p className="form-subtitle">Register as a new administrator</p>
              
              <form onSubmit={handleSignupSubmit}>
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input 
                    type="text" 
                    id="name" 
                    placeholder="John Doe" 
                    value={signupName} 
                    onChange={(e) => setSignupName(e.target.value)} 
                    required 
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="signup-email">Email Address</label>
                  <input 
                    type="email" 
                    id="signup-email" 
                    placeholder="admin@example.com" 
                    value={signupEmail} 
                    onChange={(e) => setSignupEmail(e.target.value)} 
                    required 
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="signup-password">Password</label>
                  <input 
                    type="password" 
                    id="signup-password" 
                    placeholder="Choose a strong password" 
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
                  {isLoading ? 'Creating Account...' : 'Sign Up'}
                </button>
              </form>
              
              <div className="form-footer">
                Already have an admin account?{' '}
                <button 
                  className="link-btn" 
                  onClick={() => setIsLoginActive(true)}
                >
                  Login
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <ToastContainer
        position="top-center"
        autoClose={1500}
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
        
        .user-link {
          display: inline-block;
          color: #f3f4f6;
          text-decoration: none;
          font-size: 0.9rem;
          padding: 8px 16px;
          border-radius: 20px;
          background-color: rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
        }
        
        .user-link:hover {
          background-color: rgba(255, 255, 255, 0.2);
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .auth-card {
          width: 100%;
          max-width: 450px;
          background-color: white;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
          overflow: hidden;
          margin-bottom: 30px;
        }
        
        .auth-tabs {
          display: flex;
          border-bottom: 1px solid #e5e7eb;
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
          color: #7c3aed; /* Purple for admin */
          box-shadow: inset 0 -2px 0 #7c3aed;
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
          border-color: #7c3aed;
          box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.2);
        }
        
        .submit-btn {
          width: 100%;
          padding: 12px;
          background-color: #7c3aed; /* Purple for admin */
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
          background-color: #6d28d9;
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .submit-btn:disabled {
          background-color: #a78bfa;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
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
          color: #7c3aed;
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
          .auth-header h1 {
            font-size: 2rem;
          }
          
          .form-container {
            padding: 20px;
          }
          
          .auth-card {
            border-radius: 8px;
          }
        }
      `}</style>
    </div>
  );
};

export default Alogin;
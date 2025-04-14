import axios from "axios";
import { useState } from "react";
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
    
    let payload = { email: loginEmail, password: loginPassword };
    
    try {
      const response = await axios.post("/api/user/login", payload, {
        timeout: 8000 // 8-second timeout
      });
      
      if (response.data.status === "Success") {
        // Store user data correctly
        if (response.data.data && response.data.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.data.user));
        } else if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        
        toast.success("Login successful");
        setTimeout(() => navigate('/createsurvey'), 2000);
      } else {
        toast.error(response.data.message || "Login failed");
      }
    } catch (err) {
      console.error("Login error details:", err);
      
      if (err.code === 'ECONNABORTED') {
        toast.error("Request timed out. Server may be unavailable.");
      } else if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        toast.error(err.response.data?.message || `Error: ${err.response.status}`);
      } else if (err.request) {
        // The request was made but no response was received
        toast.error("No response from server. Please check if server is running.");
      } else {
        // Something happened in setting up the request
        toast.error(err.message || "An error occurred during login");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced signup with form validation and loading state
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    let payload = { name: signupName, email: signupEmail, password: signupPassword };
    
    try {
      const result = await axios.post("http://localhost:5000/api/user/signup", payload);
      
      if (result.data.status === "Success") {
        toast.success("Account created successfully");
        // Clear form
        setSignupName('');
        setSignupEmail('');
        setSignupPassword('');
        // Switch to login tab
        setIsLoginActive(true);
      } else {
        toast.error(result.data.message || "User already exists");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to create an account");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-5 bg-gradient-to-br from-[#24243e] via-[#302b63] to-[#0f0c29] font-sans">
      <div className="w-full max-w-md mb-8 text-center">
        <h1 className="text-4xl text-white font-semibold mb-4">Survey System</h1>
        <Link to='/alogin' className="inline-block text-gray-100 text-sm px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 hover:text-white hover:-translate-y-0.5 transition-all hover:shadow-md">
          Login As Admin
        </Link>
      </div>
      
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl overflow-hidden mb-8">
        <div className="flex border-b border-gray-200">
          <button 
            className={`flex-1 py-4 text-base font-medium transition-colors ${isLoginActive ? 'text-blue-500 shadow-[inset_0_-2px_0_0_#3b82f6]' : 'text-gray-500 hover:bg-gray-50'}`}
            onClick={() => setIsLoginActive(true)}
          >
            Login
          </button>
          <button 
            className={`flex-1 py-4 text-base font-medium transition-colors ${!isLoginActive ? 'text-blue-500 shadow-[inset_0_-2px_0_0_#3b82f6]' : 'text-gray-500 hover:bg-gray-50'}`}
            onClick={() => setIsLoginActive(false)}
          >
            Sign Up
          </button>
        </div>
        
        <div className="p-6 md:p-8">
          {isLoginActive ? (
            <div>
              <h2 className="text-2xl text-gray-800 font-semibold mb-2">Welcome Back</h2>
              <p className="text-sm text-gray-500 mb-6">Enter your credentials to continue</p>
              
              <form onSubmit={handleLoginSubmit}>
                <div className="mb-5">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-600 mb-1.5">
                    Email Address
                  </label>
                  <input 
                    type="email" 
                    id="email" 
                    placeholder="you@example.com" 
                    value={loginEmail} 
                    onChange={(e) => setLoginEmail(e.target.value)} 
                    required 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base transition-all focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                
                <div className="mb-5">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-600 mb-1.5">
                    Password
                  </label>
                  <input 
                    type="password" 
                    id="password" 
                    placeholder="********" 
                    value={loginPassword} 
                    onChange={(e) => setLoginPassword(e.target.value)} 
                    required 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base transition-all focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className={`w-full py-3 px-4 rounded-lg text-white font-medium mt-3 transition-all ${
                    isLoading 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-blue-500 hover:bg-blue-600 hover:-translate-y-0.5 hover:shadow-md'
                  }`}
                >
                  {isLoading ? 'Logging in...' : 'Login'}
                </button>
              </form>
              
              <div className="mt-6 text-center text-sm text-gray-500">
                Don't have an account?{' '}
                <button 
                  onClick={() => setIsLoginActive(false)}
                  className="text-blue-500 font-medium hover:underline"
                >
                  Sign up
                </button>
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-2xl text-gray-800 font-semibold mb-2">Create Account</h2>
              <p className="text-sm text-gray-500 mb-6">Sign up to get started</p>
              
              <form onSubmit={handleSignupSubmit}>
                <div className="mb-5">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-600 mb-1.5">
                    Full Name
                  </label>
                  <input 
                    type="text" 
                    id="name" 
                    placeholder="John Doe" 
                    value={signupName} 
                    onChange={(e) => setSignupName(e.target.value)} 
                    required 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base transition-all focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                
                <div className="mb-5">
                  <label htmlFor="signup-email" className="block text-sm font-medium text-gray-600 mb-1.5">
                    Email Address
                  </label>
                  <input 
                    type="email" 
                    id="signup-email" 
                    placeholder="you@example.com" 
                    value={signupEmail} 
                    onChange={(e) => setSignupEmail(e.target.value)} 
                    required 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base transition-all focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                
                <div className="mb-5">
                  <label htmlFor="signup-password" className="block text-sm font-medium text-gray-600 mb-1.5">
                    Password
                  </label>
                  <input 
                    type="password" 
                    id="signup-password" 
                    placeholder="Choose a strong password" 
                    value={signupPassword} 
                    onChange={(e) => setSignupPassword(e.target.value)} 
                    required 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base transition-all focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className={`w-full py-3 px-4 rounded-lg text-white font-medium mt-3 transition-all ${
                    isLoading 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-blue-500 hover:bg-blue-600 hover:-translate-y-0.5 hover:shadow-md'
                  }`}
                >
                  {isLoading ? 'Creating Account...' : 'Sign Up'}
                </button>
              </form>
              
              <div className="mt-6 text-center text-sm text-gray-500">
                Already have an account?{' '}
                <button 
                  onClick={() => setIsLoginActive(true)}
                  className="text-blue-500 font-medium hover:underline"
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
    </div>
  );
};

export default Ulogin;
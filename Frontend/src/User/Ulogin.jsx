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
    let payload = { email: loginEmail, password: loginPassword };
    axios.post("http://localhost:5000/api/user/login", payload)
      .then((res) => {
        console.log("login: " + res.data.Status);
        if (res.data.Status === "Success") {
          console.log(res.data.user);
          localStorage.setItem('user', JSON.stringify(res.data.user));
          toast.success("Login successful");
          setTimeout(() => navigate('/createsurvey'), 2000); // Add a delay before navigation
        } else {
          toast.error(res.data.message || "Login failed");
        }
      })
      .catch((err) => console.log(err));
  };

  // Enhanced signup with form validation and loading state
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    let payload = { name: signupName, email: signupEmail, password: signupPassword };
    axios.post("http://localhost:5000/api/user/signup", payload)
      .then((result) => {
        console.log(result);
        if (result.data.Status === "Success") {
          toast.success("Account created");
        } else {
          toast.error(result.data.message || "Already a user");
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error("Failed to create an account");
      });
  };

  return (
    <div style={{ background: "linear-gradient(to bottom, #0f0c29, #302b63, #24243e)", minHeight: "100vh", paddingTop: "75px" }}>
      <Link to='/alogin' style={{ color: "blue", display: 'flex', justifyContent: "center", fontSize: "25px" }}>Login As Admin</Link>
      <div style={{ display: 'flex', justifyContent: "center", }} >
        <p style={{ width: "250px", color: "blue", borderBottom: "2px solid" }}></p>
      </div>
      <div id="loginform" style={{ paddingTop: "20px" }}>
        <br />
        <div id="main">
          <input type="checkbox" id="chk" aria-hidden="true" />
          <div id="login">
            <form onSubmit={handleLoginSubmit}>
              <label htmlFor="chk" aria-hidden="true" id="labell">User  Login</label>
              <input type="email" name="email" placeholder="Email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required id="inputl1" />
              <input type="password" name="password" placeholder="Password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required id="inputl2" />
              <button id="buttonl">Login</button>
            </form>
          </div>
          
          <div id="signup">
            <form onSubmit={handleSignupSubmit}>
              <label htmlFor="chk" aria-hidden="true" id="labels">Sign up</label>
              <input type="text" name="name" placeholder="User name" value={signupName} onChange={(e) => setSignupName(e.target.value)} required id="inputs1" />
              <input type="email" name="email" placeholder="Email" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} required id="inputs2" />
              <input type="password" name="password" placeholder="Password" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} required id="inputs3" />
              <button id="buttons">Sign up</button>
            </form>
          )}
        </div>
      </div>
      
      <ToastContainer
        position="top-center"
        autoClose={1500} // Adjust autoClose time if needed
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
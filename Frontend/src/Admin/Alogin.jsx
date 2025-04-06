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

  const navigate = useNavigate();


  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    let payload = { email: loginEmail, password: loginPassword };
    
    try {
      const response = await axios.post("http://localhost:5000/api/admin/login", payload);
      
      if (response.data.status === "Success") {
        console.log(response.data.data);
        localStorage.setItem('user', JSON.stringify(response.data.data));
        toast.success("Login successful");
        setTimeout(() => navigate('/ahome'), 2000); // Add a delay before navigation
      } else {
        toast.error(response.data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        toast.error(error.response.data.message || "Login failed");
      } else if (error.request) {
        // The request was made but no response was received
        toast.error("No response from server. Please try again.");
      } else {
        // Something happened in setting up the request
        toast.error("Error during login. Please try again.");
      }
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    let payload = { name: signupName, email: signupEmail, password: signupPassword };
    
    try {
      const response = await axios.post("http://localhost:5000/api/admin/signup", payload);
      
      if (response.data.status === "Success") {
        toast.success(response.data.message || "Account created successfully");
        // Clear form fields after successful signup
        setSignupName('');
        setSignupEmail('');
        setSignupPassword('');
      } else {
        toast.error(response.data.message || "Failed to create account");
      }
    } catch (error) {
      console.error("Signup error:", error);
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        toast.error(error.response.data.message || "Failed to create account");
      } else if (error.request) {
        // The request was made but no response was received
        toast.error("No response from server. Please try again.");
      } else {
        // Something happened in setting up the request
        toast.error("Error during signup. Please try again.");
      }
    }
  };

  return (
    <div style={{ background: "linear-gradient(to bottom, #0f0c29, #302b63, #24243e)", minHeight: "100vh", paddingTop: "75px" }}>
      <Link to='/' style={{ color: "blue", display: 'flex', justifyContent: "center", fontSize: "25px" }}>Login As User</Link>
      <div style={{ display: 'flex', justifyContent: "center", }} >
        <p style={{ width: "250px", color: "blue", borderBottom: "2px solid" }}></p>
      </div>
      <div id="loginform" style={{ paddingTop: "20px" }}>
        <br />
        <div id="main">
          <input type="checkbox" id="chk" aria-hidden="true" />
          <div id="login">
            <form onSubmit={handleLoginSubmit}>
              <label htmlFor="chk" aria-hidden="true" id="labell">Admin Login</label>
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
          </div>
        </div>
      </div>
      <ToastContainer
        position="top-center"
        autoClose={1500} // Adjust autoClose time if needed
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default Alogin;
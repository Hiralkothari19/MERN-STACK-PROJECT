import axios from "axios";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const Ulogin = () => {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  const navigate = useNavigate();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { email: loginEmail, password: loginPassword };
      console.log("Sending login request with payload:", payload);
      
      const response = await axios.post("http://localhost:5000/api/user/login", payload);
      console.log("Login response:", response.data);
      
      if (response.data && response.data.Status === "Success") {
        console.log("Login successful, user data:", response.data.user);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        toast.success("Login successful");
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
    }
  };

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

export default Ulogin;

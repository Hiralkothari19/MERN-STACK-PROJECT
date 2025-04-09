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

    if (!loginEmail || !loginPassword) {
      toast.warning("Please fill in all login fields");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/user/login", {
        email: loginEmail,
        password: loginPassword,
      });

      if (response.data.Status === "Success") {
        localStorage.setItem("user", JSON.stringify(response.data.user));
        toast.success("Login successful");
        setTimeout(() => navigate('/createsurvey'), 2000);
      } else {
        toast.error(response.data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login Error:", error);
      toast.error("Server error. Please try again later.");
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();

    if (!signupName || !signupEmail || !signupPassword) {
      toast.warning("Please fill in all signup fields");
      return;
    }

    try {
      const result = await axios.post("http://localhost:5000/api/user/signup", {
        name: signupName,
        email: signupEmail,
        password: signupPassword,
      });

      if (result.data.Status === "Success") {
        toast.success("Account created");
        setSignupName('');
        setSignupEmail('');
        setSignupPassword('');
      } else {
        toast.error(result.data.message || "Signup failed");
      }
    } catch (error) {
      console.error("Signup Error:", error);
      toast.error("Server error. Please try again later.");
    }
  };

  return (
    <div style={{ background: "linear-gradient(to bottom, #0f0c29, #302b63, #24243e)", minHeight: "100vh", paddingTop: "75px" }}>
      <Link to='/alogin' style={{ color: "blue", display: 'flex', justifyContent: "center", fontSize: "25px" }}>Login As Admin</Link>
      <div style={{ display: 'flex', justifyContent: "center" }}>
        <p style={{ width: "250px", color: "blue", borderBottom: "2px solid" }}></p>
      </div>
      <div id="loginform" style={{ paddingTop: "20px" }}>
        <div id="main">
          <input type="checkbox" id="chk" aria-hidden="true" />
          <div id="login">
            <form onSubmit={handleLoginSubmit}>
              <label htmlFor="chk" aria-hidden="true" id="labell">User Login</label>
              <input type="email" name="email" placeholder="Email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required id="inputl1" />
              <input type="password" name="password" placeholder="Password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required id="inputl2" />
              <button id="buttonl" type="submit">Login</button>
            </form>
          </div>

          <div id="signup">
            <form onSubmit={handleSignupSubmit}>
              <label htmlFor="chk" aria-hidden="true" id="labels">Sign up</label>
              <input type="text" name="name" placeholder="User name" value={signupName} onChange={(e) => setSignupName(e.target.value)} required id="inputs1" />
              <input type="email" name="email" placeholder="Email" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} required id="inputs2" />
              <input type="password" name="password" placeholder="Password" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} required id="inputs3" />
              <button id="buttons" type="submit">Sign up</button>
            </form>
          </div>
        </div>
      </div>
      <ToastContainer
        position="top-center"
        autoClose={1500}
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

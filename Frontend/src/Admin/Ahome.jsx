import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Anavbar from './Anavbar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Ahome() {
  const [users, setUsers] = useState([]);
  const [surveyForms, setSurveyForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch user data using the correct endpoint
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch users with correct endpoint
        const usersResponse = await axios.get(`http://localhost:5000/api/users`);
        setUsers(usersResponse.data);
        
        // Fetch surveys with correct endpoint
        const surveysResponse = await axios.get(`http://localhost:5000/api/surveys`);
        
        // Handle the nested data structure from formatResponse
        if (surveysResponse.data && surveysResponse.data.status === "Success") {
          setSurveyForms(surveysResponse.data.data);
        } else {
          setSurveyForms([]);
          toast.warning("No surveys found");
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError("Failed to load dashboard data");
        toast.error("Network error. Please try again.");
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
 
  const colors = ['#2B124C', '#AE4451'];

  // Calculate the number of users and bookings
  const totalUsers = users.length;
  const totalsurveyforms = surveyForms.length;

  // Define data for the bar chart
  const data = [
    { name: 'Users', value: totalUsers, fill: 'purple' }, 
    { name: 'SurveyForms', value: totalsurveyforms, fill: 'darkcyan' },
  ];

  if (loading) return (
    <div>
      <Anavbar/>
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-b-4 border-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div>
      <Anavbar/>
      <div className="flex justify-center items-center h-screen">
        <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <Anavbar/>
      <h3 className="text-center text-3xl mt-4">Dashboard</h3>
      <Card body style={{ background: "whitesmoke", width: "93%", marginLeft: "3.7%", marginTop: "20px", height: "680px" }}>
        <div className="flex justify-around temples-center p-2">
          <Link to="/users" style={{textDecoration:"none"}}>
            <div className="w-64 h-32 rounded-lg shadow-md flex flex-col justify-center temples-center text-xl font-bold text-white text-center" style={{backgroundColor:"purple"}}>
              USERS <br /> <br />{totalUsers}
            </div>
          </Link> 
          <Link to="/surveyforms" style={{textDecoration:"none"}}>
            <div className="w-64 h-32 rounded-lg shadow-md flex flex-col justify-center temples-center text-xl font-bold text-white text-center" style={{backgroundColor:"darkcyan"}}>
              Survey Forms <br /> <br /> {totalsurveyforms}
            </div>
          </Link>
        </div>
        <br/>
        <div style={{display:"flex",justifyContent:"space-around"}}>
        </div>
        <br/>
        <br/>
        <br/>
        <div style={{paddingLeft:"450px"}}>
          <BarChart width={400} height={300} data={data}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#8884d8" barSize={50} />
          </BarChart>
        </div>
      </Card>
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
      />
    </div>
  );
}

export default Ahome;
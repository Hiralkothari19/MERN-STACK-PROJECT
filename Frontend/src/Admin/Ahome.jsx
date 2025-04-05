import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Anavbar from './Anavbar';

function Ahome() {
  const [users, setUsers] = useState([]);
  const [surveyForms,setSurveyForms]=useState([])


  useEffect(() => {
    // Fetch user data
    axios.get(`http://localhost:5000/users`)
      .then((response) => {
        setUsers(response.data);
      })
      .catch((error) => {
        console.error('Error fetching users: ', error);
      });

    // Fetch Grooming data
    axios.get(`http://localhost:5000/surveyforms`)
      .then((response) => {
        setSurveyForms(response.data);
      })
      .catch((error) => {
        console.error('Error fetching surveys: ', error);
      });

     

  }, []);
 
  const colors = ['#2B124C', '#AE4451',];

  // Calculate the number of users and bookings
  const totalUsers = users.length;
  const totalsurveyforms = surveyForms.length;


  // Define data for the bar chart
  const data = [
    { name: 'Users', value: totalUsers, fill: 'purple' }, 
    { name: 'SurveyForms', value: totalsurveyforms, fill: 'darkcyan' },
  ];


  return (
    <div>
        <Anavbar/>
      <h3 className="text-center text-3xl" style={{color:""}}>DashBoard</h3>
      <Card body style={{ background: "whitesmoke", width: "93%", marginLeft: "3.7%", marginTop: "20px", height: "680px" }}>
        <div className="flex justify-around temples-center p-2">
           <Link to="/users" style={{textDecoration:"none"}}>
          <div className="w-64 h-32  rounded-lg shadow-md flex flex-col justify-center temples-center text-xl font-bold text-gray-800 text-center " style={{backgroundColor:"purple"}}>
           USERS <br /> <br />{totalUsers}
         </div>
         </Link> 
        <Link to="/surveyforms" style={{textDecoration:"none"}}>
         <div className="w-64 h-32  rounded-lg shadow-md flex flex-col justify-center temples-center text-xl font-bold text-gray-800 text-center" style={{backgroundColor:"darkcyan"}}>
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
       <BarChart width={400} height={300} data={data} >
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip   />
          <Legend />
          <Bar dataKey="value" fill="#8884d8" barSize={50} />
          
        </BarChart>
       </div>
       </Card>
   
    </div>
  );
}

export default Ahome;

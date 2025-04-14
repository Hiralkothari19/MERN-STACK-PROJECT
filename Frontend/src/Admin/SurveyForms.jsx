import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Anavbar from './Anavbar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SurveyForms = () => {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/api/surveys');
        
        // Properly handle the nested data structure
        if (response.data && response.data.status === "Success") {
          setSurveys(response.data.data);
        } else {
          setError("Failed to fetch surveys");
          toast.error("Failed to load surveys");
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching surveys:', error);
        setError("Network error");
        toast.error("Connection error. Please try again.");
        setLoading(false);
      }
    };
    
    fetchSurveys();
  }, []);

  const deleteSurvey = async (id) => {
    if (window.confirm("Are you sure you want to delete this survey?")) {
      try {
        const response = await axios.delete(`http://localhost:5000/api/surveys/${id}`);
        
        if (response.data && response.data.status === "Success") {
          setSurveys(surveys.filter(survey => survey._id !== id));
          toast.success("Survey deleted successfully");
        } else {
          toast.error(response.data?.message || "Failed to delete survey");
        }
      } catch (error) {
        console.error('Error deleting survey:', error);
        toast.error("Server error. Please try again.");
      }
    }
  };

  if (loading) {
    return (
      <div>
        <Anavbar />
        <div className="flex justify-center items-center h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading surveys...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Anavbar />
        <div className="flex justify-center items-center h-screen">
          <div className="text-center bg-white p-6 rounded-lg shadow-md">
            <p className="text-red-500 text-xl mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Anavbar />
      <div className="container mx-auto p-4 mt-8">
        <h2 className="text-2xl font-bold mb-6 text-center">All Survey Forms</h2>
        
        {surveys.length === 0 ? (
          <div className="text-center p-8 bg-gray-100 rounded-lg">
            <p className="text-lg text-gray-600">No surveys found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {surveys.map((survey) => (
              <div key={survey._id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                <div className="p-5">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{survey.title}</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Created by: {survey.userName}<br />
                    Date: {new Date(survey.createdAt).toLocaleDateString()}
                  </p>
                  
                  <div className="flex justify-between mt-4">
                    <Link 
                      to={`/adminresponses/${survey._id}`}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                    >
                      View Responses
                    </Link>
                    <button
                      onClick={() => deleteSurvey(survey._id)}
                      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
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
};

export default SurveyForms;
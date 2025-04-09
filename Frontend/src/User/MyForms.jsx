import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import the toastify CSS

const MyForms = () => {
    const [surveyForms, setSurveyForms] = useState([]);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
    
        if (user) {
            const fetchSurveyForms = async () => {
                try {
                    // Use the correct endpoint for fetching surveys by user ID
                    const response = await axios.get(`http://localhost:5000/api/surveys/user/${user.id}`);
                    
                    // Check for success status and extract data correctly
                    if (response.data && response.data.Status === "Success") {
                        setSurveyForms(response.data.data); // Notice the nested .data
                    } else {
                        console.error('Failed to fetch survey forms:', response.data.message || 'Unknown error');
                        toast.error('Failed to fetch your surveys');
                    }
                } catch (error) {
                    console.error('Error fetching survey forms:', error);
                    toast.error('Could not connect to server');
                }
            };
    
            fetchSurveyForms();
        }
    }, []);
    const deleteForm = (id) => {
        // Confirm before deleting
        if (window.confirm('Are you sure you want to delete this survey?')) {
            // Use the correct endpoint for deleting surveys
            axios.delete(`http://localhost:5000/api/surveys/${id}`)
                .then((response) => {
                    if (response.data && response.data.Status === "Success") {
                        toast.success('Survey form deleted successfully');
                        // Update state instead of reloading the page
                        setSurveyForms(surveyForms.filter(form => form._id !== id));
                    } else {
                        toast.error(response.data.message || 'Failed to delete survey form');
                    }
                })
                .catch((error) => {
                    console.error('Error deleting survey:', error);
                    toast.error('Server error when deleting survey');
                });
        }
    };
    

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <div className="container mx-auto py-8 w-[500px]">
                <h2 className="text-3xl font-bold mb-6 text-center">My Survey Forms</h2>
                {surveyForms.length === 0 ? (
                    <div className="text-center text-gray-500">No survey forms found.</div>
                ) : (
                    <ol className="space-y-4">
                        {surveyForms.map((surveyForm) => (
                            <li key={surveyForm._id} className="bg-white shadow-md rounded-lg p-6">
                                <div className='flex justify-end'>
                                    <button 
                                        className='bg-red-500 text-white rounded-sm p-1'        
                                        onClick={() => deleteForm(surveyForm._id)} // Use arrow function to pass the id
                                    >
                                        Close Form
                                    </button>
                                </div>
                                <h3 className="text-xl font-semibold mb-4">Survey Name: {surveyForm.title}</h3>
                                <ol className="list-decimal pl-5">
                                    <strong>Questions</strong>
                                    {surveyForm.questions.map((question, index) => (
                                        <li key={index} className="mb-2">{question.question}</li>
                                    ))}
                                </ol>
                                <Link 
                                    to={`/responses/${surveyForm._id}`} 
                                    className="inline-block mt-4 text-blue-500 hover:text-blue-700 font-semibold"
                                >
                                    View Responses
                                </Link>
                                <div className="mt-6">
                                    <h3 className="text-lg font-bold text-blue-800">Share this survey Link with others:</h3>
                                    <a
                                        href={`http://localhost:5173/respond/${surveyForm._id}`}
                                        target="_blank"
                                        className="text-blue-500 hover:underline"
                                    >
                                        {`http://localhost:5173/respond/${surveyForm._id}`}
                                    </a>
                                </div>
                            </li>
                        ))}
                    </ol>
                )}
            </div>
            <ToastContainer
                position="top-center"
                autoClose={1000}
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

export default MyForms;

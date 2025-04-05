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
                    const response = await axios.get(`http://localhost:5000/mysurveyforms/${user.id}`);
                    setSurveyForms(response.data);
                } catch (error) {
                    console.error('Error fetching survey forms:', error);
                }
            };

            fetchSurveyForms();
        }
    }, []);

    const deleteForm = (id) => {
        axios.delete(`http://localhost:5000/deletesurveyform/${id}`)
            .then(() => {
                toast.success('Survey form deleted successfully', {
                    onClose: () => window.location.assign('/mysurveyforms'),
                    
                });
            })
            .catch(() => {
                toast.error('Failed to delete survey form');
            });
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

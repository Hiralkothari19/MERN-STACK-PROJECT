import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Anavbar from './Anavbar';

const AdminResponses = () => {
    const { id } = useParams();
    const [responses, setResponses] = useState([]);
    const [survey, setSurvey] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSurvey = async () => {
            try {
                const surveyResponse = await axios.get(`/api/surveys/${id}`);
                if (surveyResponse.data && surveyResponse.data.status === "Success") {
                    setSurvey(surveyResponse.data.data);
                } else {
                    setError("Failed to fetch survey");
                    toast.error("Failed to load survey");
                }
            } catch (error) {
                console.error('Error fetching survey:', error);
                setError("Error fetching survey");
                toast.error("Network error loading survey");
            }
        };

        const fetchResponses = async () => {
            try {
                // Using the correct endpoint as defined in server.js
                const response = await axios.get(`/api/surveys/${id}/results`);
                if (response.data && response.data.status === "Success") {
                    setResponses(response.data.data);
                } else {
                    toast.warn("No responses found");
                }
                setLoading(false);
            } catch (error) {
                console.error('Error fetching responses:', error);
                toast.error("Failed to load responses");
                setLoading(false);
            }
        };

        fetchSurvey();
        fetchResponses();
    }, [id]);

    const deleteResponse = (responseId) => {
        // Using the correct endpoint as defined in server.js
        axios.delete(`/api/surveys/responses/delete/${responseId}`)
            .then((response) => {
                if (response.data && response.data.status === "Success") {
                    setResponses(prevResponses => prevResponses.filter(response => response._id !== responseId));
                    toast.success('Response deleted successfully');
                } else {
                    toast.error(response.data?.message || "Failed to delete response");
                }
            })
            .catch((error) => {
                console.error("Error deleting response:", error);
                toast.error('Server error when deleting response');
            });
    };

    if (loading) return (
        <div>
            <Anavbar/>
            <div className="min-h-screen bg-gray-100 flex items-center justify-center text-gray-500">
                <div className="text-center">
                    <div className="w-16 h-16 border-t-4 border-b-4 border-green-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p>Loading responses...</p>
                </div>
            </div>
        </div>
    );

    if (error) return (
        <div>
            <Anavbar/>
            <div className="min-h-screen bg-gray-100 flex items-center justify-center text-red-500">
                <div className="text-center">
                    <p className="text-xl mb-4">⚠️ {error}</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        </div>
    );

    if (!survey) return (
        <div>
            <Anavbar/>
            <div className="min-h-screen bg-gray-100 flex items-center justify-center text-gray-500">
                <p>Survey not found</p>
            </div>
        </div>
    );

    return (
        <div>
            <Anavbar/>
            <div className="flex justify-center mt-12">
                <div className="min-h-screen w-[700px]">
                    <div className="container mx-auto p-4 bg-green-200 shadow-md rounded-lg">
                        <h2 className="text-3xl font-bold mb-6 text-center">{survey.title}</h2>
                        {responses && responses.length > 0 ? (
                            responses.map((response, index) => (
                                <div key={response._id || index} className="mb-4 p-4 border border-gray-300 rounded-lg bg-white">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-xl font-bold mb-2">Response {index + 1}</h3>
                                        <button
                                            onClick={() => deleteResponse(response._id)}
                                            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded mb-3"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                    <hr style={{ borderColor: 'gray' }} />
                                    <h3 className="text-xl font-semibold mb-2">User Name: {response.respondent}</h3>
                                    {response.answers && response.answers.map((answer, idx) => (
                                        <div key={idx} className="mb-2">
                                            <p>{idx + 1}. Question : {answer.question}</p>
                                            <p>Response : {answer.answer}</p>
                                        </div>
                                    ))}
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-500">No responses yet.</p>
                        )}
                    </div>
                </div>
            </div>
            <ToastContainer
                position="top-center"
                autoClose={3000}
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

export default AdminResponses;
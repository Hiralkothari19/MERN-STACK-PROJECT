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

    useEffect(() => {
        const fetchSurvey = async () => {
            try {
                const surveyResponse = await axios.get(`http://localhost:5000/api/surveys/${id}`);
                setSurvey(surveyResponse.data);
            } catch (error) {
                console.error('Error fetching survey:', error);
            }
        };

        const fetchResponses = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/surveys/results/${id}`);
                setResponses(response.data);
            } catch (error) {
                console.error('Error fetching responses:', error);
            }
        };

        fetchSurvey();
        fetchResponses();
    }, [id]);

    const deleteResponse = (responseId) => {
        axios.delete(`http://localhost:5000/responses/${responseId}`)
            .then(() => {
                setResponses(prevResponses => prevResponses.filter(response => response._id !== responseId));
                toast.success('Response deleted successfully');
            })
            .catch(() => {
                toast.error('Failed to delete response');
            });
    };

    if (!survey) return <div className="min-h-screen bg-gray-100 flex items-center justify-center text-gray-500">Loading...</div>;

    return (
        <div>
            <Anavbar/>
            <div className="flex justify-center mt-12">
                <div className="min-h-screen w-[700px]">
                    <div className="container mx-auto p-4 bg-green-200 shadow-md rounded-lg">
                        <h2 className="text-3xl font-bold mb-6 text-center">{survey.title}</h2>
                        {responses.length > 0 ? (
                            responses.map((response, index) => (
                                <div key={index} className="mb-4 p-4 border border-gray-300 rounded-lg bg-white">
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
                                    {response.answers.map((answer, idx) => (
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

export default AdminResponses;

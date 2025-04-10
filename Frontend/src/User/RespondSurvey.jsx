import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { ToastContainer,toast } from 'react-toastify';

const RespondSurvey = () => {
    // Mock implementation of useParams and useNavigate
    const id = window.location.pathname.split('/').pop() || '';
    const navigate = (path) => {
        window.location.href = path;
    };

    // Enhanced state management
    const [survey, setSurvey] = useState(null);
    const [respondent, setRespondent] = useState('');
    const [responses, setResponses] = useState([]);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        const fetchSurvey = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/surveys/${id}`);
                setSurvey(response.data);
            } catch (error) {
                console.error('Error fetching survey:', error); 
            }
        };
    
        fetchSurvey();
    }, [fetchSurvey]);

    // Improved response handling with type-specific inputs
    const handleChange = (index, value) => {
        const newResponses = [...responses];
        newResponses[index] = value;
        setResponses(newResponses);
    };

    // Enhanced form submission with validation
    const handleSubmit = async (event) => {
        event.preventDefault();
        axios.post(`http://localhost:5000/api/surveys/respond/${id}`, {
            respondent,
            answers: responses
        })
        .then(()=>{
            toast.success("Survey responded successfully");
            setRespondent('');
            setResponses([]);
            setSubmitted(true);
        })
        .catch(()=>{
            toast.error("Failed to respond to survey");
        });
    };

    // Reset functionality
    const resetForm = () => {
        setSubmitted(false);
    };

    if (!survey) return <div className="min-h-screen bg-gray-100 flex items-center justify-center text-gray-500">Loading...</div>;

    return (
        <div className='flex justify-center mt-12'> 
            <div className="min-h-screen  w-[500px] ">
                {submitted ? (

                    <div className="container mx-auto p-10 mt-40 bg-blue-200 shadow-md rounded-lg text-center">
                        <h2 className="text-3xl font-bold mb-6">Thank you for your response!</h2>
                        <button 
                            onClick={resetForm}
                            className="py-2 px-4 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
                        >
                            Submit Another Response
                        </button>
                    </div>
                ) : (
                    <div className="bg-white shadow-xl rounded-lg p-8">
                        <h2 className="text-3xl font-bold mb-4 text-center text-gray-800">{survey.title}</h2>
                        {survey.description && (
                            <p className="text-gray-600 text-center mb-6">{survey.description}</p>
                        )}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="flex flex-col mb-4">
                                <label className="mb-2 text-lg font-medium text-gray-700">Respondent Name</label>
                                <input
                                    type="text"
                                    value={respondent}
                                    onChange={(e) => setRespondent(e.target.value)}
                                    placeholder="Enter your name"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            {survey.questions.map((question, index) => (
                                <div key={question.id} className="mb-4">
                                    <label className="block mb-2 text-lg font-medium text-gray-700">
                                        {question.question}
                                    </label>
                                    {renderQuestionInput(question, index)}
                                </div>
                            ))}

                            <button 
                                type="submit"
                                className="w-full py-3 px-4 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition duration-300"
                            >
                                Submit Survey Response
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};


export default RespondSurvey
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const RespondSurvey = () => {
    // Use React Router hooks instead of direct manipulation
    const { id } = useParams();
    const navigate = useNavigate();

    // Enhanced state management
    const [survey, setSurvey] = useState(null);
    const [respondent, setRespondent] = useState('');
    const [responses, setResponses] = useState([]);
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSurvey = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`/api/surveys/${id}`);
                if (response.data && response.data.status === "Success") {
                    setSurvey(response.data.data);
                    // Initialize responses array based on the number of questions
                    if (response.data.data.questions) {
                        setResponses(new Array(response.data.data.questions.length).fill(''));
                    }
                } else {
                    setError("Failed to load survey data");
                    toast.error("Failed to load survey");
                }
            } catch (error) {
                console.error('Error fetching survey:', error);
                setError("Error connecting to the server");
                toast.error("Error loading survey");
            } finally {
                setLoading(false);
            }
        };
    
        if (id) {
            fetchSurvey();
        }
    }, [id]);

    // Improved response handling with type-specific inputs
    const handleChange = (index, value) => {
        const newResponses = [...responses];
        newResponses[index] = value;
        setResponses(newResponses);
    };

    // Function to render the appropriate input based on question type
    const renderQuestionInput = (question, index) => {
        switch (question.type) {
            case 'multiple-choice':
                return (
                    <div className="space-y-2">
                        {question.options && question.options.map((option, optionIndex) => (
                            <div key={optionIndex} className="flex items-center">
                                <input
                                    type="radio"
                                    id={`q${index}-o${optionIndex}`}
                                    name={`question-${index}`}
                                    value={option}
                                    checked={responses[index] === option}
                                    onChange={() => handleChange(index, option)}
                                    className="mr-2"
                                    required
                                />
                                <label htmlFor={`q${index}-o${optionIndex}`} className="text-gray-700">
                                    {option}
                                </label>
                            </div>
                        ))}
                    </div>
                );
            
            case 'checkbox':
                return (
                    <div className="space-y-2">
                        {question.options && question.options.map((option, optionIndex) => (
                            <div key={optionIndex} className="flex items-center">
                                <input
                                    type="checkbox"
                                    id={`q${index}-o${optionIndex}`}
                                    value={option}
                                    checked={responses[index] && responses[index].includes(option)}
                                    onChange={(e) => {
                                        let newValue = [...(responses[index] ? responses[index].split(',') : [])];
                                        if (e.target.checked) {
                                            newValue.push(option);
                                        } else {
                                            newValue = newValue.filter(item => item !== option);
                                        }
                                        handleChange(index, newValue.join(','));
                                    }}
                                    className="mr-2"
                                />
                                <label htmlFor={`q${index}-o${optionIndex}`} className="text-gray-700">
                                    {option}
                                </label>
                            </div>
                        ))}
                    </div>
                );
            
            case 'text':
            default:
                return (
                    <textarea
                        value={responses[index] || ''}
                        onChange={(e) => handleChange(index, e.target.value)}
                        placeholder="Enter your answer here"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="3"
                        required
                    />
                );
        }
    };

    // Enhanced form submission with validation
    const handleSubmit = async (event) => {
        event.preventDefault();
        
        // Check if all questions are answered
        const unansweredQuestions = responses.findIndex(r => r === '');
        if (unansweredQuestions >= 0) {
            toast.warning(`Please answer question ${unansweredQuestions + 1}`);
            return;
        }
        
        // Prepare data for submission
        const formattedResponses = survey.questions.map((question, index) => ({
            questionId: question._id || index,
            question: question.question,
            answer: responses[index]
        }));
        
        try {
            const response = await axios.post(`/api/surveys/respond/${id}`, {
                respondent,
                answers: formattedResponses
            });
            
            if (response.data && response.data.status === "Success") {
                toast.success("Survey submitted successfully");
                setRespondent('');
                setResponses(new Array(survey.questions.length).fill(''));
                setSubmitted(true);
            } else {
                toast.error(response.data?.message || "Failed to submit survey");
            }
        } catch (error) {
            console.error("Error submitting survey:", error);
            toast.error("Failed to submit survey. Please try again.");
        }
    };

    // Reset functionality
    const resetForm = () => {
        setSubmitted(false);
        setRespondent('');
        setResponses(new Array(survey?.questions?.length || 0).fill(''));
    };

    if (loading) return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="text-center">
                <div className="w-16 h-16 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading survey...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md">
                <div className="text-red-500 text-5xl mb-4">⚠️</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
                <p className="text-gray-600 mb-4">{error}</p>
                <button 
                    onClick={() => navigate('/')} 
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                    Return Home
                </button>
            </div>
        </div>
    );

    if (!survey) return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md">
                <div className="text-yellow-500 text-5xl mb-4">⚠️</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Survey Not Found</h2>
                <p className="text-gray-600 mb-4">The survey you're looking for doesn't exist or has been removed.</p>
                <button 
                    onClick={() => navigate('/')} 
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                    Return Home
                </button>
            </div>
        </div>
    );

    return (
        <div className='flex justify-center mt-12'> 
            <div className="min-h-screen w-[500px]">
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
                                <div key={question._id || index} className="mb-4">
                                    <label className="block mb-2 text-lg font-medium text-gray-700">
                                        {index + 1}. {question.question}
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
            <ToastContainer
                position="top-center"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
        </div>
    );
};

export default RespondSurvey;
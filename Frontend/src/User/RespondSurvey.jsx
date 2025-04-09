import React, { useState, useEffect, useCallback } from 'react';

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
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch survey data with improved error handling
    const fetchSurvey = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`/api/surveys/${id}/respond`);
            if (!response.ok) {
                throw new Error('Failed to fetch survey');
            }
            const data = await response.json();
            setSurvey(data);
            // Initialize responses array with empty strings
            setResponses(new Array(data.questions.length).fill(''));
        } catch (error) {
            console.error('Error fetching survey:', error);
            setError('Unable to load survey. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => {
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
        
        // Basic validation
        const isValid = respondent.trim() && 
            responses.every(response => response.trim() !== '');
        
        if (!isValid) {
            alert('Please fill out all fields');
            return;
        }

        try {
            const response = await fetch(`/api/surveys/respond/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    respondent: respondent.trim(),
                    answers: responses
                })
            });

            if (!response.ok) {
                throw new Error('Survey submission failed');
            }

            alert("Survey responded successfully");
            setSubmitted(true);
        } catch (error) {
            console.error('Survey submission error:', error);
            alert("Failed to submit survey response");
        }
    };

    // Reset functionality
    const resetForm = () => {
        setSubmitted(false);
        setRespondent('');
        setResponses(new Array(survey?.questions.length || 0).fill(''));
    };

    // Render input based on question type
    const renderQuestionInput = (question, index) => {
        switch (question.type) {
            case 'multiple-choice':
                return (
                    <select
                        value={responses[index] || ''}
                        onChange={(e) => handleChange(index, e.target.value)}
                        className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                        required
                    >
                        <option value="">Select an option</option>
                        {question.options && question.options.map((option, optIndex) => (
                            <option key={optIndex} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                );
            case 'rating':
                return (
                    <div className="flex items-center space-x-2">
                        {[1, 2, 3, 4, 5].map((rating) => (
                            <label key={rating} className="inline-flex items-center">
                                <input
                                    type="radio"
                                    name={`rating-${index}`}
                                    value={rating.toString()}
                                    checked={responses[index] === rating.toString()}
                                    onChange={() => handleChange(index, rating.toString())}
                                    className="form-radio"
                                />
                                <span className="ml-2">{rating}</span>
                            </label>
                        ))}
                    </div>
                );
            case 'long-text':
                return (
                    <textarea
                        value={responses[index] || ''}
                        onChange={(e) => handleChange(index, e.target.value)}
                        className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full min-h-[100px]"
                        required
                    />
                );
            default: // 'text'
                return (
                    <input
                        type="text"
                        value={responses[index] || ''}
                        onChange={(e) => handleChange(index, e.target.value)}
                        className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                        required
                    />
                );
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-xl text-gray-600 animate-pulse">
                    Loading survey...
                </div>
            </div>
        );
    }

    // Error state
    if (error || !survey) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{error || 'Unable to load survey'}</span>
                    <button 
                        onClick={fetchSurvey}
                        className="ml-4 bg-red-500 text-white py-1 px-2 rounded hover:bg-red-600"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    // Main render
    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4"> 
            <div className="w-full max-w-2xl">
                {submitted ? (
                    <div className="bg-white shadow-xl rounded-lg p-10 text-center">
                        <h2 className="text-3xl font-bold mb-6 text-green-600">Thank you for your response!</h2>
                        <p className="text-gray-600 mb-6">Your survey has been successfully submitted.</p>
                        <div className="flex justify-center space-x-4">
                            <button 
                                onClick={resetForm}
                                className="py-2 px-6 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 transition duration-300"
                            >
                                Submit Another Response
                            </button>
                            <button 
                                onClick={() => navigate('/surveys')}
                                className="py-2 px-6 bg-gray-200 text-gray-700 font-semibold rounded-lg shadow-md hover:bg-gray-300 transition duration-300"
                            >
                                Back to Surveys
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white shadow-xl rounded-lg p-8">
                        <h2 className="text-3xl font-bold mb-4 text-center text-gray-800">{survey.title}</h2>
                        {survey.description && (
                            <p className="text-gray-600 text-center mb-6">{survey.description}</p>
                        )}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="mb-4">
                                <label className="block mb-2 text-lg font-medium text-gray-700">
                                    Your Name
                                </label>
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

export default RespondSurvey;
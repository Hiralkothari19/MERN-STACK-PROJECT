import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MyForms = () => {
    const [surveyForms, setSurveyForms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedSurvey, setExpandedSurvey] = useState(null);
    const [copiedId, setCopiedId] = useState(null);
    
    const navigate = useNavigate();

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
    
        if (user) {
            const fetchSurveyForms = async () => {
                setLoading(true);
                try {
                    const response = await axios.get(`http://localhost:5000/api/surveys/user/${user.id}`);
                    
                    if (response.data && response.data.status === "Success") {
                        setSurveyForms(response.data.data);
                    } else {
                        setError(response.data.message || 'Failed to fetch surveys');
                        toast.error('Failed to fetch your surveys');
                    }
                } catch (error) {
                    console.error('Error fetching survey forms:', error);
                    setError('Could not connect to server');
                    toast.error('Connection error. Please try again later.');
                } finally {
                    setLoading(false);
                }
            };
    
            fetchSurveyForms();
        } else {
            setLoading(false);
            setError('Please log in to view your surveys');
            toast.error('You need to log in first');
            setTimeout(() => navigate('/login'), 2000);
        }
    }, [navigate]);

    const deleteForm = (id) => {
        if (window.confirm('Are you sure you want to delete this survey?')) {
            axios.delete(`/api/surveys/${id}`)
                .then((response) => {
                    if (response.data && response.data.status === "Success") {
                        toast.success('Survey deleted successfully');
                        setSurveyForms(surveyForms.filter(form => form._id !== id));
                    } else {
                        toast.error(response.data.message || 'Failed to delete survey');
                    }
                })
                .catch((error) => {
                    console.error('Error deleting survey:', error);
                    toast.error('Server error when deleting survey');
                });
        }
    };
    
    const copyToClipboard = (id) => {
        const surveyLink = `http://localhost:5173/respond/${id}`;
        navigator.clipboard.writeText(surveyLink)
            .then(() => {
                setCopiedId(id);
                toast.success('Survey link copied to clipboard!');
                setTimeout(() => setCopiedId(null), 3000);
            })
            .catch(err => {
                toast.error('Failed to copy link');
            });
    };
    
    const toggleExpandSurvey = (id) => {
        if (expandedSurvey === id) {
            setExpandedSurvey(null);
        } else {
            setExpandedSurvey(id);
        }
    };

    // Render loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
                <Navbar />
                <div className="container mx-auto py-16 text-center max-w-2xl px-4">
                    <h2 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600">My Survey Forms</h2>
                    <div className="bg-white rounded-xl shadow-md p-8">
                        <div className="flex justify-center">
                            <div className="w-12 h-12 border-t-4 border-b-4 border-indigo-500 rounded-full animate-spin"></div>
                        </div>
                        <p className="mt-4 text-gray-600">Loading your surveys...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Render error state
    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
                <Navbar />
                <div className="container mx-auto py-16 text-center max-w-2xl px-4">
                    <h2 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600">My Survey Forms</h2>
                    <div className="bg-white rounded-xl shadow-md p-8">
                        <div className="text-red-500 text-5xl mb-4">⚠️</div>
                        <p className="text-red-600 font-medium">{error}</p>
                        <button 
                            onClick={() => window.location.reload()} 
                            className="mt-6 bg-indigo-600 text-white py-2 px-6 rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
            <Navbar />
            <div className="container mx-auto py-12 px-4 max-w-4xl">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600">
                        My Survey Forms
                    </h2>
                    <Link 
                        to="/createsurvey" 
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
                    >
                        <span className="mr-2">➕</span>
                        Create New Survey
                    </Link>
                </div>
                
                {surveyForms.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                        <div className="text-6xl mb-4">📊</div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">No surveys found</h3>
                        <p className="text-gray-600 mb-6">You haven't created any surveys yet. Start by creating your first survey.</p>
                        <Link 
                            to="/createsurvey" 
                            className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            Create Your First Survey
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {surveyForms.map((survey) => (
                            <div key={survey._id} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                                {/* Survey Header */}
                                <div className="bg-white p-6 border-b border-gray-100">
                                    <div className="flex justify-between items-start">
                                        <div className="mr-4">
                                            <h3 className="text-xl font-bold text-gray-800">{survey.title}</h3>
                                            <p className="text-gray-500 text-sm mt-1">
                                                Created: {new Date(survey.createdAt || Date.now()).toLocaleDateString()}
                                                {survey.responses && ` • ${survey.responses.length} ${survey.responses.length === 1 ? 'response' : 'responses'}`}
                                            </p>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button 
                                                onClick={() => toggleExpandSurvey(survey._id)}
                                                className="px-3 py-1 border border-gray-300 text-gray-600 rounded hover:bg-gray-100 transition-colors"
                                            >
                                                {expandedSurvey === survey._id ? "Hide Details" : "Show Details"}
                                            </button>
                                            <button
                                                onClick={() => deleteForm(survey._id)}
                                                className="px-3 py-1 bg-red-100 border border-red-300 text-red-600 rounded hover:bg-red-200 transition-colors flex items-center"
                                            >
                                                <span className="mr-1">🗑️</span>
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Expandable Content */}
                                {expandedSurvey === survey._id && (
                                    <div className="p-6 bg-gray-50 border-b border-gray-100">
                                        <div className="mb-4">
                                            <h4 className="font-semibold text-gray-700 mb-2">Questions</h4>
                                            <ol className="list-decimal ml-5 space-y-2">
                                                {survey.questions.map((question, index) => (
                                                    <li key={index} className="text-gray-700">
                                                        {question.question}
                                                        {question.type !== 'text' && question.options && question.options.length > 0 && (
                                                            <ul className="list-disc ml-5 mt-1 text-sm text-gray-600">
                                                                {question.options.map((option, optIdx) => (
                                                                    <li key={optIdx}>{option}</li>
                                                                ))}
                                                            </ul>
                                                        )}
                                                    </li>
                                                ))}
                                            </ol>
                                        </div>
                                    </div>
                                )}
                                
                                {/* Survey Actions */}
                                <div className="bg-white p-6">
                                    <div className="flex flex-wrap items-center justify-between gap-4">
                                        <div className="flex space-x-3">
                                            <Link 
                                                to={`/responses/${survey._id}`} 
                                                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                            >
                                                <span className="mr-2">📊</span>
                                                View Responses
                                            </Link>
                                            <a 
                                                href={`http://localhost:5173/respond/${survey._id}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                            >
                                                <span className="mr-2">📝</span>
                                                Take Survey
                                            </a>
                                        </div>
                                        
                                        <div className="flex items-center">
                                            <div className="text-sm text-gray-500 mr-2">Share:</div>
                                            <button
                                                onClick={() => copyToClipboard(survey._id)}
                                                className="flex items-center text-indigo-600 hover:text-indigo-800"
                                                title="Copy link to clipboard"
                                            >
                                                {copiedId === survey._id ? (
                                                    <span className="flex items-center">
                                                        <span className="mr-1">✓</span> Copied!
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center">
                                                        <span className="mr-1">📋</span> Copy Link
                                                    </span>
                                                )}
                                            </button>
                                        </div>
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
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
        </div>
    );
};

export default MyForms;
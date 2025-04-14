import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { PlusCircle, Trash2, Save, X, HelpCircle, Copy, CheckCircle, Edit3, AlertTriangle } from 'lucide-react';
import Navbar from './Navbar';  // Assuming you have a Navbar component

const CreateSurvey = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState([{ question: '', options: [''], type: 'multiple-choice' }]);
  const [surveyId, setSurveyId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState(0);
  const [showTips, setShowTips] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem('user');
    if (!user) {
      toast.error("Please login to create a survey");
      setTimeout(() => navigate('/login'), 2000);
    }
  }, [navigate]);

  const addQuestion = () => {
    setQuestions([...questions, { question: '', options: [''], type: 'multiple-choice' }]);
    // Set new question as active
    setActiveQuestion(questions.length);
    // Scroll to the new question after a short delay
    setTimeout(() => {
      document.getElementById(`question-${questions.length}`)?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const removeQuestion = (qIndex) => {
    if (questions.length === 1) {
      toast.warning("Your survey needs at least one question");
      return;
    }
    
    const newQuestions = [...questions];
    newQuestions.splice(qIndex, 1);
    setQuestions(newQuestions);
    
    // Adjust active question if needed
    if (activeQuestion >= qIndex && activeQuestion > 0) {
      setActiveQuestion(activeQuestion - 1);
    }
  };

  const handleQuestionChange = (qIndex, e) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].question = e.target.value;
    setQuestions(newQuestions);
  };

  const handleQuestionTypeChange = (qIndex, type) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].type = type;
    // If changing to text response type, remove options
    if (type === 'text') {
      newQuestions[qIndex].options = [];
    } else if (newQuestions[qIndex].options.length === 0) {
      // If changing from text to a type with options, add one empty option
      newQuestions[qIndex].options = [''];
    }
    setQuestions(newQuestions);
  };

  const addOption = (qIndex) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options.push('');
    setQuestions(newQuestions);
  };

  const removeOption = (qIndex, oIndex) => {
    if (questions[qIndex].options.length === 1) {
      toast.warning("Question needs at least one option");
      return;
    }
    
    const newQuestions = [...questions];
    newQuestions[qIndex].options.splice(oIndex, 1);
    setQuestions(newQuestions);
  };

  const handleOptionChange = (qIndex, oIndex, e) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[oIndex] = e.target.value;
    setQuestions(newQuestions);
  };

  const copyToClipboard = () => {
    const surveyLink = `respond/${surveyId}`;
    navigator.clipboard.writeText(surveyLink)
      .then(() => {
        setIsCopied(true);
        toast.success("Survey link copied to clipboard!");
        setTimeout(() => setIsCopied(false), 3000);
      })
      .catch(err => {
        toast.error("Failed to copy link");
        console.error('Failed to copy: ', err);
      });
  };

  const validateForm = () => {
    if (!title.trim()) {
      toast.error("Please enter a survey title");
      return false;
    }

    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].question.trim()) {
        toast.error(`Question ${i + 1} cannot be empty`);
        setActiveQuestion(i);
        return false;
      }

      // Validate options for multiple choice questions
      if (questions[i].type !== 'text') {
        for (let j = 0; j < questions[i].options.length; j++) {
          if (!questions[i].options[j].trim()) {
            toast.error(`Option ${j + 1} in question ${i + 1} cannot be empty`);
            setActiveQuestion(i);
            return false;
          }
        }
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Basic form validation
    if (!validateForm()) return;
  
    setIsLoading(true);
  
    try {
      // Robust user retrieval
      const userString = localStorage.getItem('user');
      
      if (!userString) {
        toast.error("Please log in to create a survey");
        setIsLoading(false);
        return;
      }
  
      let user;
      try {
        user = JSON.parse(userString);
      } catch (parseError) {
        toast.error("Invalid user data. Please log out and log in again.");
        setIsLoading(false);
        return;
      }
  
      // Validate user object
      if (!user || !user.id || !user.name) {
        toast.error("Invalid user information. Please log out and log in again.");
        setIsLoading(false);
        return;
      }
  
      // Validate and format questions
      const formattedQuestions = questions.map(q => {
        // Ensure each question has required fields
        const formattedQuestion = {
          question: q.question.trim(),
          type: q.type
        };
  
        // Add options for non-text question types
        if (q.type !== 'text') {
          formattedQuestion.options = q.options.map(opt => opt.trim()).filter(opt => opt !== '');
          
          // Ensure at least one option for multiple-choice/checkbox questions
          if (formattedQuestion.options.length === 0) {
            toast.error(`Question "${q.question}" must have at least one option`);
            throw new Error('Invalid question options');
          }
        }
  
        return formattedQuestion;
      });
  
      // Prepare form data
      const formData = {
        title: title.trim(),
        description: description.trim(),
        questions: formattedQuestions,
        userId: user.id,
        userName: user.name
      };
  
      // Submit survey
      const response = await axios.post('api/surveys/create', formData);
  
      // Handle successful response
      if (response.data && response.data.status === "Success") {
        toast.success("Survey created successfully!");
        setSurveyId(response.data.data.surveyId);
  
        // Smoothly scroll to the share section
        setTimeout(() => {
          document.getElementById('share-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 500);
      } else {
        // Handle server-side validation errors
        toast.error(response.data?.message || "Failed to create survey");
      }
    } catch (error) {
      // Comprehensive error handling
      console.error("Survey creation error:", error);
  
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        const errorMessage = error.response.data?.message || 
          error.response.data?.error || 
          "Failed to create survey due to server error";
        
        toast.error(errorMessage);
      } else if (error.request) {
        // The request was made but no response was received
        toast.error("No response from server. Please check your internet connection.");
      } else {
        // Something happened in setting up the request that triggered an Error
        toast.error("An unexpected error occurred. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };
  const toggleTips = () => {
    setShowTips(!showTips);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600">
            Create Your Survey
          </h1>
          <p className="text-gray-600 mt-2">Design a professional survey in minutes</p>
          
          <button 
            className="mt-4 flex items-center mx-auto text-indigo-600 hover:text-indigo-800"
            onClick={toggleTips}
          >
            <HelpCircle size={16} className="mr-1" />
            {showTips ? "Hide tips" : "Show tips"}
          </button>
          
          {showTips && (
            <div className="mt-4 bg-white p-4 rounded-lg shadow-md text-left">
              <h3 className="font-semibold text-indigo-700 mb-2">Tips for creating effective surveys:</h3>
              <ul className="text-gray-700 space-y-2">
                <li>• Keep your questions clear and concise</li>
                <li>• Avoid leading or biased questions</li>
                <li>• Group related questions together</li>
                <li>• Include a mix of question types for better insights</li>
                <li>• Test your survey before sharing it widely</li>
              </ul>
            </div>
          )}
        </div>
        
        {/* Main Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-xl overflow-hidden">
          {/* Survey Details */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Survey Details</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Survey Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a descriptive title for your survey"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Description <span className="text-gray-400">(optional)</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide additional context about your survey"
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>
          </div>
          
          {/* Questions Section */}
          <div className="bg-gray-50 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Questions</h2>
              <button
                type="button"
                onClick={addQuestion}
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <PlusCircle size={18} className="mr-2" />
                Add Question
              </button>
            </div>
            
            {/* Question Cards */}
            <div className="space-y-6">
              {questions.map((q, qIndex) => (
                <div 
                  key={qIndex} 
                  id={`question-${qIndex}`}
                  className={`bg-white rounded-lg shadow-md overflow-hidden transition-all ${activeQuestion === qIndex ? 'ring-2 ring-indigo-500' : ''}`}
                >
                  {/* Question Header */}
                  <div 
                    className="flex justify-between items-center px-4 py-3 bg-gray-100 cursor-pointer"
                    onClick={() => setActiveQuestion(qIndex)}
                  >
                    <h3 className="font-semibold text-gray-700">
                      Question {qIndex + 1}
                    </h3>
                    <div className="flex items-center">
                      <div className="mr-4">
                        <select
                          value={q.type}
                          onChange={(e) => handleQuestionTypeChange(qIndex, e.target.value)}
                          className="text-sm border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <option value="multiple-choice">Multiple Choice</option>
                          <option value="checkbox">Checkbox (Multiple Answers)</option>
                          <option value="text">Text Response</option>
                        </select>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeQuestion(qIndex);
                        }}
                        className="text-red-500 hover:text-red-700 transition-colors"
                        aria-label="Remove question"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  
                  {/* Question Content */}
                  <div className={`p-4 ${activeQuestion === qIndex ? 'block' : 'hidden'}`}>
                    <div className="mb-4">
                      <input
                        type="text"
                        value={q.question}
                        onChange={(e) => handleQuestionChange(qIndex, e)}
                        placeholder="Enter your question here"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>
                    
                    {/* Options Section (Only for multiple-choice and checkbox) */}
                    {q.type !== 'text' && (
                      <div className="space-y-3">
                        <label className="block text-gray-700 font-medium">
                          Options <span className="text-red-500">*</span>
                        </label>
                        
                        {q.options.map((option, oIndex) => (
                          <div key={oIndex} className="flex items-center">
                            <div className="w-6 mr-2 text-gray-400">
                              {q.type === 'multiple-choice' ? (
                                <div className="w-4 h-4 rounded-full border-2 border-gray-400"></div>
                              ) : (
                                <div className="w-4 h-4 rounded border-2 border-gray-400"></div>
                              )}
                            </div>
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => handleOptionChange(qIndex, oIndex, e)}
                              placeholder={`Option ${oIndex + 1}`}
                              className="flex-grow px-3 py-2 border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => removeOption(qIndex, oIndex)}
                              className="ml-2 text-red-500 hover:text-red-700"
                              aria-label="Remove option"
                            >
                              <X size={18} />
                            </button>
                          </div>
                        ))}
                        
                        <button
                          type="button"
                          onClick={() => addOption(qIndex)}
                          className="mt-2 flex items-center text-indigo-600 hover:text-indigo-800"
                        >
                          <PlusCircle size={16} className="mr-1" />
                          Add Option
                        </button>
                      </div>
                    )}
                    
                    {q.type === 'text' && (
                      <div className="bg-gray-100 border border-gray-300 rounded-lg p-4">
                        <p className="text-gray-500 italic">
                          This question will allow respondents to enter a free-form text response.
                        </p>
                        <div className="mt-2 p-2 bg-white border border-gray-300 rounded min-h-16 text-gray-400">
                          Text response will appear here
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Empty State */}
            {questions.length === 0 && (
              <div className="text-center py-8">
                <AlertTriangle size={48} className="mx-auto text-amber-500 mb-4" />
                <p className="text-gray-600">Your survey needs at least one question.</p>
                <button
                  type="button"
                  onClick={addQuestion}
                  className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Add a Question
                </button>
              </div>
            )}
          </div>
          
          {/* Submit Button */}
          <div className="p-6 bg-white border-t border-gray-200">
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className={`px-6 py-3 rounded-lg flex items-center font-medium ${
                  isLoading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg transition-all'
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Save size={18} className="mr-2" />
                    Create Survey
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
        
        {/* Share Section */}
        {surveyId && (
          <div id="share-section" className="mt-8 bg-white rounded-xl shadow-xl p-6 border-l-4 border-green-500">
            <div className="flex items-center text-green-600 mb-4">
              <CheckCircle size={24} className="mr-2" />
              <h2 className="text-2xl font-bold">Survey Created Successfully!</h2>
            </div>
            
            <p className="text-gray-600 mb-4">
              Your survey is now ready to be shared. Use the link below to distribute your survey to participants.
            </p>
            
            <div className="flex items-center bg-gray-100 p-3 rounded-lg mb-4">
              <input
                type="text"
                value={`/respond/${surveyId}`}
                readOnly
                className="bg-transparent flex-grow outline-none text-gray-700"
              />
              <button
                onClick={copyToClipboard}
                className="ml-2 flex items-center px-3 py-1 rounded bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
              >
                {isCopied ? <CheckCircle size={16} className="mr-1" /> : <Copy size={16} className="mr-1" />}
                {isCopied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => navigate('/mysurveyforms')}
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                <Edit3 size={18} className="mr-2" />
                Manage Surveys
              </button>
              
              <button
                onClick={() => {
                  // Reset form for a new survey
                  setTitle('');
                  setDescription('');
                  setQuestions([{ question: '', options: [''], type: 'multiple-choice' }]);
                  setSurveyId('');
                  setActiveQuestion(0);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex items-center px-4 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50"
              >
                <PlusCircle size={18} className="mr-2" />
                Create Another Survey
              </button>
            </div>
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

export default CreateSurvey;
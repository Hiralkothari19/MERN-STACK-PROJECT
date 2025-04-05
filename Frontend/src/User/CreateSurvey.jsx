import React, { useState } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CreateSurvey = () => {
    const [title, setTitle] = useState('');
    const [questions, setQuestions] = useState([{ question: '', options: [''] }]);
    const [surveyId, setSurveyId] = useState('');

    const handleQuestionChange = (index, event) => {
        const newQuestions = questions.slice();
        newQuestions[index].question = event.target.value;
        setQuestions(newQuestions);
    };

    const handleOptionChange = (qIndex, oIndex, event) => {
        const newQuestions = questions.slice();
        newQuestions[qIndex].options[oIndex] = event.target.value;
        setQuestions(newQuestions);
    };

    const addQuestion = () => {
        setQuestions([...questions, { question: '', options: [''] }]);
    };

    const removeQuestion = (qIndex) => {
        const newQuestions = questions.filter((_, index) => index !== qIndex);
        setQuestions(newQuestions);
    };

    const addOption = (qIndex) => {
        const newQuestions = questions.slice();
        newQuestions[qIndex].options.push('');
        setQuestions(newQuestions);
    };

    const removeOption = (qIndex, oIndex) => {
        const newQuestions = questions.slice();
        newQuestions[qIndex].options.splice(oIndex, 1);
        setQuestions(newQuestions);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        
        const user = JSON.parse(localStorage.getItem('user'));
        const userId = user.id;
        const userName = user.name;

        const newSurvey = { title, questions, userId, userName };
        try {
            const response = await axios.post('http://localhost:5000/api/surveys/create', newSurvey);
            setTitle('');
            setQuestions([{ question: '', options: [''] }]);
            setSurveyId(response.data.surveyId);
            toast.success("Form Created Successfully");
        } catch (error) {
            console.error('There was an error submitting the form!', error);
            toast.error("Failed to create the survey");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-r from-blue-200 to-purple-300">
            <Navbar />
            <div className="max-w-xl mx-auto p-6 rounded-lg shadow-lg mt-8 bg-purple-400 to-blue-400">
                <h2 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-700 to-red-300 text-center">
                    Create Customized Survey
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-lg font-semibold text-gray-700">Survey Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="border rounded-md p-2 w-full mt-1"
                            required
                        />
                    </div>
                    {questions.map((q, qIndex) => (
                        <div key={qIndex} className="border p-4 rounded mt-4 bg-gray-50">
                            <div className="flex justify-between">
                                <label className="block text-lg font-semibold text-gray-700">Question {qIndex + 1}</label>
                                <button
                                    type="button"
                                    onClick={() => removeQuestion(qIndex)}
                                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                                >
                                    Remove Question
                                </button>
                            </div>
                            <input
                                type="text"
                                value={q.question}
                                onChange={(e) => handleQuestionChange(qIndex, e)}
                                className="border rounded-md p-2 w-full mt-2"
                            required

                            />
                            {q.options.map((o, oIndex) => (
                                <div key={oIndex} className="mt-2">
                                    <div className="flex justify-between">
                                        <label className="block text-sm font-medium text-gray-700">Option {oIndex + 1}</label>
                                        <button
                                            type="button"
                                            onClick={() => removeOption(qIndex, oIndex)}
                                            className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
                                        >
                                            Remove Option
                                        </button>
                                    </div>
                                    <input
                                        type="text"
                                        value={o}
                                        onChange={(e) => handleOptionChange(qIndex, oIndex, e)}
                                        className="border rounded-md p-2 w-full mt-1"
                                    />
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => addOption(qIndex)}
                                className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                            >
                                Add Option
                            </button>
                        </div>
                    ))}
                    <div className="flex justify-between mt-6">
                        <button
                            type="button"
                            onClick={addQuestion}
                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                        >
                            Add Question
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                            Create Survey
                        </button>
                    </div>
                </form>
                {surveyId && (
                    <div className="mt-6">
                        <h3 className="text-lg font-bold text-blue-800">Share this survey Link with others:</h3>
                        <a
                            href={`http://localhost:5173/respond/${surveyId}`}
                            target="_blank"
                            className="text-blue-500 hover:underline"
                        >
                            {`http://localhost:5173/respond/${surveyId}`}
                        </a>
                    </div>
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

export default CreateSurvey;

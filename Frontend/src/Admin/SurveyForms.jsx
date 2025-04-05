import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Anavbar from './Anavbar';

const SurveyForms = () => {
    const [surveyForms, setSurveyForms] = useState([]);

    useEffect(() => {

                const fetchSurveyForms = async () => {
                    try {
                        const response = await axios.get(`http://localhost:5000/surveyforms`);
                        setSurveyForms(response.data);
                    } catch (error) {
                        console.error('Error fetching survey forms:', error);
                    }
                };

                fetchSurveyForms();
      
    }, []);

    return (
        <div className="min-h-screen bg-gray-100">
            <Anavbar/>
            <div className="container mx-auto py-8 w-[500px]">
                <h2 className="text-3xl font-bold mb-6 text-center">Survey Forms</h2>
                {surveyForms.length === 0 ? (
                    <div className="text-center text-gray-500">No survey forms found.</div>
                ) : (
                    <ol className="space-y-4">
                        {surveyForms.map((surveyForm) => (
                            <li key={surveyForm._id} className="bg-white shadow-md rounded-lg p-6">
                                <h3 className="text-xl font-semibold mb-4">Owner: {surveyForm.userName}</h3>
                                <h3 className="text-xl font-semibold mb-4">Survey Form Name: {surveyForm.title}</h3>
                                <ol className="list-decimal pl-5">
                                    <strong>Questions</strong>
                                    {surveyForm.questions.map((question, index) => (
                                        <li key={index} className="mb-2">{question.question}</li>
                                    ))}
                                </ol>
                                <Link 
                                    to={`/adminresponses/${surveyForm._id}`} 
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
        </div>
    );
};

export default SurveyForms;

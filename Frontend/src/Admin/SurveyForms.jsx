// src/Admin/SurveyForms.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const SurveyForms = () => {
  const [surveys, setSurveys] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/surveys')
      .then(response => {
        setSurveys(response.data);
      })
      .catch(error => {
        console.error('Error fetching surveys:', error);
      });
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Survey List</h2>
      {surveys.length === 0 ? (
        <p>No surveys found.</p>
      ) : (
        <ul className="list-disc pl-6">
          {surveys.map((survey, index) => (
            <li key={index}>{survey.title}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SurveyForms;

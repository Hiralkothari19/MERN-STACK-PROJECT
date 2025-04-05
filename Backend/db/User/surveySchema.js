const mongoose = require('mongoose');

const surveySchema = new mongoose.Schema({
    title: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userName:{ type: String, required: true },  
    questions: [{
        question: { type: String, required: true },
        options: [{ type: String, required: true }]
    }],
    responses: [{
        respondent: { type: String, required: true },
        answers: [{
            question: { type: String, required: true },
            answer: { type: String, required: true }
        }]
    }]
});

module.exports= mongoose.model('Survey', surveySchema);
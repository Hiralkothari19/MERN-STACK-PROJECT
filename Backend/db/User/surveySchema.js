const mongoose = require('mongoose');

const surveySchema = new mongoose.Schema({
  title: { type: String, required: true },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  userName: { type: String, required: true },

  questions: [
    {
      question: { type: String, required: true },
      options: {
        type: [String],
        required: true,
        validate: [
          arr => arr.length >= 2,
          'At least two options are required.'
        ]
      }
    }
  ],

  responses: [
    {
      respondent: { type: String, required: true },
      answers: [
        {
          question: { type: String, required: true },
          answer: { type: String, required: true }
        }
      ]
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Survey', surveySchema);

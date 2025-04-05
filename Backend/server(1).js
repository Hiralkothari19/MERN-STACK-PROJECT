const express = require('express');
const cors = require('cors');
require('./db/config')

const Admin = require('./db/Admin/adminSchema')

const User = require('./db/User/userSchema')
const Survey = require('./db/User/surveySchema')
const app = express();
const port = process.env.PORT || 5000;

app.use(express.json())
app.use(cors());


                                                        // Admin
app.post('/alogin', (req, resp) => {
        const { email, password } = req.body;
        Admin.findOne({ email: email })
            .then(user => {
                if (user) {
                    if (user.password === password) {
                        return resp.json({ Status: "Success", user: { id: user.id, name: user.name, email: user.email } })
                    } else {
                        resp.json("login fail")
                    }
                } else {
                    resp.json("no user")
                }
            })
    })
    // Asignup
    app.post('/asignup', (req, resp) => {
        const { name, email, password } = req.body;
        Admin.findOne({ email: email })
            .then(user => {
                if (user) {
                    resp.json({ Status: "Failed", message: "Already a user" });
                } else {
                    Admin.create({ email: email, name: name, password: password })
                        .then(result => resp.json({ Status: "Success", message: "Account Created" }))
                        .catch(err => resp.json({ Status: "Error", message: "Failed to create an account" }));
                }
            }).catch(err => resp.json({ Status: "Error", message: "An error occurred" }));
    });
    
 
    


                                                       //  User  //
// Login Api
app.post('/ulogin', (req, resp) => {
    const { email, password } = req.body;
    User.findOne({ email: email })
        .then(user => {
            if (user) {
                if (user.password === password) {
                    return resp.json({ Status: "Success", user: { id: user.id, name: user.name, email: user.email } })
                } else {
                    resp.json("login fail")
                }
            } else {
                resp.json("no user")
            }
        })
})

// singup Api 
app.post('/usignup', (req, resp) => {
    const { name, email, password } = req.body;
    User.findOne({ email: email })
        .then(user => {
            if (user) {
                resp.json({ Status: "Failed", message: "Already a user" });
            } else {
                User.create({ email: email, name: name, password: password })
                    .then(result => resp.json({ Status: "Success", message: "Account Created" }))
                    .catch(err => resp.json({ Status: "Error", message: "Failed to create an account" }));
            }
        }).catch(err => resp.json({ Status: "Error", message: "An error occurred" }));
});

    
    app.get('/users',(req,res)=>{
        User.find()
        .then((user)=>{
            res.status(200).json(user)
        })
        .catch(() => {
            res.sendStatus(500)
        })
    })
    
    app.get('/users/:id',(req,res)=>{
        const id =req.params.id;
        User.findById({_id:id})
        .then((user)=>{
            res.status(200).json(user)
        })
        .catch(() => {
            res.sendStatus(500)
        })
    })
    
    app.put('/useredit/:id',(req,res)=>{
        const id =req.params.id;
        const { name, email, password } = req.body;
        User.findByIdAndUpdate(id, { name, email, password }, { new: true })
        .then(updatedUser => {  
            res.json(updatedUser);
          })
          .catch(error => {
            console.error(error);
            res.status(500).send('Internal Server Error');
          });
    })
    
    app.delete('/userdelete/:id',(req,res)=>{
        let id=req.params.id;
           User.deleteOne({ _id: id })
           .then((user)=>{
            res.status(200).json(user)
             })
           .catch(() => {
            res.sendStatus(500)
           })
    }) 





                                        //   survey Form

app.get('/surveyforms', (req, res) => {
    Survey.find()
        .then((response) => {
            console.log(response);
            res.send(response);
        })
        .catch((err) => {
            console.error('Error fetching survey forms:', err);
            res.status(500).json({ error: 'Server error' });
        });
});

app.get('/mysurveyforms/:userId', async (req, res) => {                                                                                    
    const userId =req.params.userId;
    try {
        const tasks = await Survey.find({ userId });
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
});

app.post('/api/surveys/create', async (req, res) => {
    const { title, questions,userId,userName } = req.body;
    const newSurvey = new Survey({ title, questions, userId, userName });
    await newSurvey.save();
    res.json({ surveyId: newSurvey._id }); // Return the surveyId
});


app.post('/api/surveys/respond/:id', async (req, res) => {
    const { id } = req.params;
    const { respondent, answers } = req.body;
    try {
        const survey = await Survey.findById(id);
        if (survey) {
            const responseWithQuestions = answers.map((answer, index) => ({
                question: survey.questions[index].question,
                answer: answer
            }));
            survey.responses.push({ respondent, answers: responseWithQuestions });
            await survey.save();
            res.json(survey);
        } else {
            res.status(404).json({ msg: 'Survey not found' });
        }
    } catch (error) {
        res.status(500).json({ msg: 'Server error' });
    }
});


app.get('/api/surveys/results/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const survey = await Survey.findById(id);
        if (survey) {
            res.json(survey.responses);
        } else {
            res.status(404).json({ msg: 'Survey not found' });
        }
    } catch (error) {
        res.status(500).json({ msg: 'Server error' });
    }
});

app.get('/api/surveys/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const survey = await Survey.findById(id);
        if (!survey) {
            return res.status(404).json({ msg: 'Survey not found' });
        }
        res.json(survey);
    } catch (error) {
        res.status(500).json({ msg: 'Server error' });
    }
});

app.delete('/deletesurveyform/:id',(req,res)=>{
        const id=req.params.id;
       Survey.deleteOne({ _id : id})
       .then((data)=>{
        res.status(200).json(data)
         })
       .catch(() => {
        res.sendStatus(500)
       })     
})

// Delete response route
app.delete('/responses/:id', async (req, res) => {
    try {
        await Survey.updateOne(
            { 'responses._id': req.params.id },
            { $pull: { responses: { _id: req.params.id } } }
        );
        res.status(204).end();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});



// Start server
app.listen(port, () => console.log(`Server running on port ${port}`));

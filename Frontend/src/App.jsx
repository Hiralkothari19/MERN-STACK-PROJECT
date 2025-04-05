import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import CreateSurvey from './User/CreateSurvey';
import RespondSurvey from './User/RespondSurvey';
import ViewResponse from './User/ViewResponse';
import MyForms from './User/MyForms';
import Ulogin from './User/Ulogin';
import Alogin from './Admin/Alogin';
import Ahome from './Admin/Ahome';
import Users from './Admin/Users';
import UserEdit from './Admin/UserEdit';
import SurveyForms from './Admin/SurveyForms';
import AdminResponses from './Admin/AdminResponses';


const App = () => (
    <Router>
        <Routes>

        <Route path="/alogin" element={<Alogin/>} />
        <Route path="/ahome" element={<Ahome/>} />
        <Route path="/users" element={<Users/>} />
        <Route path="/useredit/:id" element={<UserEdit/>} />
        <Route path="/surveyforms" element={<SurveyForms/>} />
        <Route path="/adminresponses/:id" element={<AdminResponses/>} />
        

            <Route path="/" element={<Ulogin/>} />
            <Route path="/createsurvey" element={<CreateSurvey/>} />
            <Route path="/mysurveyforms" element={<MyForms/>} />
            <Route path="/respond/:id" element={<RespondSurvey/>} />
            <Route path="/responses/:id" element={<ViewResponse/>} />  
        </Routes>
    </Router>
);

export default App;

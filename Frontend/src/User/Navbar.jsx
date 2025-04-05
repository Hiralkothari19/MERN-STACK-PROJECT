import React from 'react';
import { Link, json } from 'react-router-dom';


const Navbar = () => {

    const name = JSON.parse(localStorage.getItem('user')).name
    return (
        <div className="text-white p-4 flex justify-between items-center" style={{backgroundColor:"#302b63"}}>
            
            <p className="text-lg font-bold">Survey-Forms</p>
            
            <div className="flex gap-4  justify-between items-center">
                <Link to="/createsurvey" className="hover:text-gray-300">Create Survey</Link>
                <Link to="/mysurveyforms" className="hover:text-gray-300">My Surveys</Link>
                <Link to="/" className="hover:text-gray-300">Logout</Link>
<p  className='font-serif font-extrabold text-xl'>({name})</p>

            </div>
        </div>
    );
};

export default Navbar;

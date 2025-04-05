import React from 'react';
import { Link } from 'react-router-dom';

const Anavbar = () => {
    return (
        <div className="text-white p-4 flex justify-between items-center" style={{backgroundColor:"#302b63"}}>
            <p className="text-lg font-bold">Survey-Forms</p>
            <div className="flex gap-4">
                <Link to="/ahome" className="hover:text-gray-300">Dashboard</Link>
                <Link to="/users" className="hover:text-gray-300">Users</Link>
                <Link to="/surveyforms" className="hover:text-gray-300">Survey Forms</Link>
                <Link to="/" className="hover:text-gray-300">Logout</Link>
            </div>
        </div>
    );
};

export default Anavbar;

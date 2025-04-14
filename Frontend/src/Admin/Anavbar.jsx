import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Anavbar = () => {
    const navigate = useNavigate();
    
    // Handle logout properly by clearing localStorage
    const handleLogout = () => {
        if (window.confirm('Are you sure you want to log out?')) {
            localStorage.removeItem('user');
            localStorage.removeItem('userType');
            navigate('/alogin');
        }
    };

    return (
        <div className="text-white p-4 flex justify-between items-center" style={{backgroundColor:"#302b63"}}>
            <p className="text-lg font-bold">Survey-Forms Admin</p>
            <div className="flex gap-4">
                <Link to="/ahome" className="hover:text-gray-300">Dashboard</Link>
                <Link to="/users" className="hover:text-gray-300">Users</Link>
                <Link to="/surveyforms" className="hover:text-gray-300">Survey Forms</Link>
                <button 
                    onClick={handleLogout} 
                    className="hover:text-gray-300 cursor-pointer"
                >
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Anavbar;
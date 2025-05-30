import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
    const [userName, setUserName] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();

    // Get user data on component mount
    useEffect(() => {
        const userData = getUserData();
        if (userData && userData.name) {
            setUserName(userData.name);
        }
    }, []);

    const getUserData = () => {
        try {
            const userString = localStorage.getItem('user');
            if (!userString) return null;
        
            const userData = JSON.parse(userString);
            
            // Strict validation
            if (!userData || typeof userData !== 'object') {
                throw new Error('Invalid user data structure');
            }
        
            // Check for required fields (accept either id or _id)
            if (!userData.name || (!userData.id && !userData._id)) {
                throw new Error('Missing required user fields');
            }
        
            return userData;
        } catch (error) {
            console.error('Error retrieving user data:', error);
            localStorage.removeItem('user');
            return null;
        }
    };

    const handleLogout = () => {
        // Show confirmation dialog
        if (window.confirm('Are you sure you want to log out?')) {
            // Clear localStorage
            localStorage.removeItem('user');
            // Navigate to home page
            navigate('/');
        }
    };

    // Toggle mobile menu
    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <nav className="bg-gradient-to-r from-indigo-700 to-purple-800 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo and Brand */}
                    <div className="flex items-center">
                        <div className="flex-shrink-0 flex items-center">
                            <Link to="/" className="text-2xl text-white font-bold">
                                Survey<span className="text-indigo-200">Forms</span>
                            </Link>
                        </div>
                    </div>
                    
                    {/* Desktop Navigation */}
                    <div className="hidden md:flex md:items-center md:ml-6">
                        <div className="flex space-x-4">
                            <Link 
                                to="/createsurvey" 
                                className="px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-indigo-600 transition-colors duration-200"
                            >
                                Create Survey
                            </Link>
                            <Link 
                                to="/mysurveyforms" 
                                className="px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-indigo-600 transition-colors duration-200"
                            >
                                My Surveys
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-indigo-600 transition-colors duration-200"
                            >
                                Logout
                            </button>
                        </div>
                        
                        {/* User Profile */}
                        <div className="ml-4 flex items-center">
                            <div className="flex items-center">
                                {/* User Avatar */}
                                <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-medium">
                                    {userName ? userName.charAt(0).toUpperCase() : 'U'}
                                </div>
                                {/* User Name */}
                                {userName && (
                                    <span className="ml-2 text-sm font-medium text-white">{userName}</span>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    {/* Mobile Menu Button */}
                    <div className="flex md:hidden items-center">
                        <button 
                            onClick={toggleMenu}
                            className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-indigo-600 focus:outline-none"
                            aria-expanded="false"
                        >
                            <span className="sr-only">Open main menu</span>
                            {/* Hamburger Icon */}
                            <svg className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                            {/* Close Icon */}
                            <svg className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
            
            {/* Mobile Menu */}
            <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden`}>
                <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-indigo-900">
                    {/* User Info for Mobile */}
                    <div className="px-3 py-2 rounded-md text-white font-medium border-b border-indigo-700 mb-2 pb-3 flex items-center">
                        <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-medium mr-2">
                            {userName ? userName.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <span>{userName}</span>
                    </div>
                    
                    <Link 
                        to="/createsurvey" 
                        className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-indigo-600"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Create Survey
                    </Link>
                    <Link 
                        to="/mysurveyforms" 
                        className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-indigo-600"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        My Surveys
                    </Link>
                    <button
                        onClick={() => {
                            setIsMenuOpen(false);
                            handleLogout();
                        }}
                        className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white hover:bg-indigo-600"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
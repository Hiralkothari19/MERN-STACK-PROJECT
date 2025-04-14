import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import Anavbar from './Anavbar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const UserEdit = () => {
    const [user, setUser] = useState({
        name: '',
        email: '',
        password: '',
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        // Add endpoint to server.js to get a single user by ID
        const fetchUser = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`http://localhost:5000/api/users/${id}`);
                if (response.data) {
                    setUser(response.data);
                } else {
                    setError("User not found");
                    toast.error("Failed to fetch user data");
                }
                setLoading(false);
            } catch (error) {
                console.error('Error fetching user:', error);
                setError("Error connecting to server");
                toast.error("Network error. Please try again.");
                setLoading(false);
            }
        };

        if (id) {
            fetchUser();
        }
    }, [id]);

    const handleChange = (e) => {
        setUser({ ...user, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Add endpoint to server.js to update a user
            setLoading(true);
            const response = await axios.put(`http://localhost:5000/api/users/${id}`, user);
            
            if (response.data && response.data.status === "Success") {
                toast.success('User updated successfully');
                setTimeout(() => navigate('/users'), 1500);
            } else {
                toast.error(response.data?.message || "Failed to update user");
            }
            setLoading(false);
        } catch (error) {
            console.error('Error updating user:', error);
            toast.error("Server error when updating user");
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div>
                <Anavbar />
                <div className="flex justify-center items-center h-screen">
                    <div className="w-16 h-16 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div>
                <Anavbar />
                <div className="flex justify-center items-center h-screen">
                    <div className="bg-white p-8 rounded-lg shadow-md text-center">
                        <p className="text-red-500 text-xl mb-4">{error}</p>
                        <button 
                            onClick={() => navigate('/users')} 
                            className="px-4 py-2 bg-blue-500 text-white rounded"
                        >
                            Back to Users
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <Anavbar />
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                <div className="mt-8 p-4 border rounded shadow-lg rounded-lg shadow-md" style={{
                    width: "35%",
                    background: "linear-gradient(to left, #009696, #4CAF57)" // Change these colors to your desired gradient
                }}>
                    <h2 className="text-2xl font-semibold mb-4 text-center">Update User</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4" style={{ display: "flex", justifyContent: "center" }}>
                            <div>
                                <label className="block text-white text-center">User Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder='User Name'
                                    value={user.name || ''}
                                    onChange={handleChange}
                                    className="border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    required
                                    style={{ width: "280px" }}
                                />
                            </div>
                        </div>

                        <div className="mb-4" style={{ display: "flex", justifyContent: "center" }}>
                            <div>
                                <label className="block text-white text-center">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder='Email'
                                    value={user.email || ''}
                                    onChange={handleChange}
                                    className="border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    required
                                    style={{ width: "280px" }}
                                />
                            </div>
                        </div>
                        <div className="mb-4" style={{ display: "flex", justifyContent: "center" }}>
                            <div>
                                <label className="block text-white text-center">Password <span className="text-xs">(Leave blank to keep current)</span></label>
                                <input
                                    type="password"
                                    name="password"
                                    placeholder='New Password'
                                    value={user.password || ''}
                                    onChange={handleChange}
                                    className="border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    style={{ width: "280px" }}
                                />
                            </div>
                        </div>

                        <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
                            <button
                                type="submit"
                                className="bg-blue-900 hover:bg-blue-500 text-white font-semibold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                disabled={loading}
                            >
                                {loading ? 'Updating...' : 'Update'}
                            </button>
                            
                            <button
                                type="button"
                                onClick={() => navigate('/users')}
                                className="bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            <ToastContainer
                position="top-center"
                autoClose={2000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                pauseOnHover
            />
        </div>
    );
};

export default UserEdit;
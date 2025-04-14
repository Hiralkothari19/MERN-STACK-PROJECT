import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTrash, FaEdit } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import Anavbar from './Anavbar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'tailwindcss/tailwind.css'; // Import Tailwind CSS

const Users = () => {
  const [users, setUsers] = useState([]);
  const [items, setItems] = useState([]);
  const [showDetails, setShowDetails] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  useEffect(() => {
    // Use the correct API endpoint for fetching users
    axios.get('http://localhost:5000/api/users')
      .then((response) => {
        setUsers(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching users:', error);
        setError("Failed to load users");
        toast.error('Failed to fetch users.');
        setLoading(false);
      });
  }, []);

  const deleteData = (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }
    
    // Use the correct API endpoint for deleting users
    axios.delete(`http://localhost:5000/api/users/${userId}`)
      .then((response) => {
        if (response.data && response.data.status === "Success") {
          toast.success('User deleted successfully.');
          setUsers(users.filter(user => user._id !== userId));
        } else {
          toast.error(response.data?.message || 'Failed to delete user.');
        }
      })
      .catch((error) => {
        console.error('Error deleting user:', error);
        toast.error('Failed to delete user.');
      });
  };

  const fetchUserSurveyForms = (userId) => {
    // Use the correct API endpoint for fetching user surveys
    axios.get(`http://localhost:5000/api/surveys/user/${userId}`)
      .then((response) => {
        if (response.data && response.data.status === "Success") {
          setItems(response.data.data);
          toggleDetails();
        } else {
          toast.info('No surveys found for this user.');
          setItems([]);
          toggleDetails();
        }
      })
      .catch((error) => {
        console.error('Error fetching user surveys:', error);
        toast.error('Error fetching survey forms.');
      });
  };

  if (loading) {
    return (
      <div className="bg-gray-100 min-h-screen">
        <Anavbar />
        <div className="flex justify-center items-center h-screen">
          <div className="w-16 h-16 border-t-4 border-b-4 border-indigo-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <Anavbar />
      <div className="container mx-auto p-5 bg-white shadow-lg rounded-lg w-[1000px] mt-20">
        <h1 className="text-center text-3xl font-bold text-gray-700">Users</h1>
        <table className="min-w-full sm:w-3/4 lg:w-1/2 mx-auto divide-y divide-gray-200 mt-5">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sl/No</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UserId</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Operation</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user, index) => (
              <tr key={user._id}>
                <td className="px-6 py-4 whitespace-nowrap">{index + 1}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user._id}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap flex items-center">
                  <Link to={`/useredit/${user._id}`} className="text-blue-500 hover:text-blue-700 mr-2">
                    <FaEdit />
                  </Link>
                  <button onClick={() => deleteData(user._id)} className="text-red-500 hover:text-red-700 mr-2">
                    <FaTrash />
                  </button>
                  <button onClick={() => fetchUserSurveyForms(user._id)} className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-700">
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showDetails && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-gray-900 bg-opacity-50 absolute inset-0"></div>
          <div className="bg-white p-6 rounded-lg z-10 relative max-h-80vh overflow-y-scroll w-3/4">
            <h1 className="text-center text-blue-600 text-4xl">User Survey Forms</h1>
            <div className="container mx-auto mt-8">
              <div>
                {items.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">No surveys found for this user.</p>
                ) : (
                  items.map((item, index) => (
                    <div key={item._id} className="mb-4 bg-gray-50 p-4 shadow-lg rounded-lg">
                      <div className="flex justify-between">
                        <div>
                          <p>{index + 1}) <span className="font-bold">Title:</span> {item.title}</p>
                          <p><span className="font-bold">Responses:</span> {item.responses ? item.responses.length : 0}</p>
                          <p><span className="font-bold">Created:</span> {new Date(item.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <Link 
                            to={`/adminresponses/${item._id}`}
                            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                          >
                            View Responses
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            <button onClick={toggleDetails} className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
              Close
            </button>
          </div>
        </div>
      )}

      <ToastContainer
        position="top-center"
        autoClose={1500}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default Users;
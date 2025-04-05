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

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  useEffect(() => {
    axios.get('http://localhost:5000/users')
      .then((response) => {
        setUsers(response.data);
      })
      .catch((error) => {
        toast.error('Failed to fetch users.');
      });
  }, []);

  const deleteData = (userId) => {
    axios.delete(`http://localhost:5000/userdelete/${userId}`)
      .then(() => {
        toast.success('User deleted successfully.');
        setUsers(users.filter(user => user._id !== userId));
      })
      .catch((error) => {
        toast.error('Failed to delete user.');
      });
  };

  const fetchUserSurveyForms = (userId) => {
    axios.get(`http://localhost:5000/mysurveyforms/${userId}`)
      .then((response) => {
        setItems(response.data);
        toggleDetails();
      })
      .catch((error) => {
        toast.error('Error fetching survey forms.');
      });
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <Anavbar />
      <div className="container mx-auto  p-5 bg-white shadow-lg rounded-lg w-[1000px] mt-20">
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
                {items.map((item, index) => (
                  <div key={item._id} className="mb-4 bg-gray-50 p-4 shadow-lg rounded-lg">
                    <div className="flex justify-between">
                      <div>
                        <p>{index + 1}) <span className="font-bold">Title:</span> {item.title}</p>
                        <p><span className="font-bold">Responses:</span> {item.responses.length}</p>
                      </div>
                    </div>
                  </div>
                ))}
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

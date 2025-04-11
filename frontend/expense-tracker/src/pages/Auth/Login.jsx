import React, { useContext, useState } from 'react';
import AuthLayout from '../../components/layouts/AuthLayout';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../../components/Inputs/Input';
import { validateEmail } from '../../utils/helper';
import axiosInstance from '../../utils/axiosInstance';
import { API_Paths } from '../../utils/apiPaths';
import { UserContext } from '../../context/userContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ email: '', password: '', general: '' }); // Added 'general' key for API errors
  const {updateUser} = useContext(UserContext);

  const navigate = useNavigate();

  // Handle the Login Form Submit
  const handleLogin = async (e) => {
    e.preventDefault();
    
    let formErrors = { email: '', password: '', general: '' }; // Temporary error object

    if (!validateEmail(email)) {
      formErrors.email = "Please enter a valid email address";
    }

    if (!password) {
      formErrors.password = "Please enter the Password";
    }

    // If there are errors, update the state and stop submission
    if (formErrors.email || formErrors.password) {
      setErrors(formErrors);
      return;
    }

    // If no errors, clear the error state
    setErrors({ email: '', password: '', general: '' });

    // Login API Call
    try {
      const response = await axiosInstance.post(API_Paths.AUTH.LOGIN, {
        email,
        password,
      });
      const { token, user } = response.data;
      
      if (token) {
        localStorage.setItem("token", token);
        updateUser(user);
        navigate('/dashboard');
      } 
    } catch (error) {
      if (error.response && error.response.data.message) {
        setErrors({ ...errors, general: error.response.data.message }); // Corrected error handling
      } else {
        setErrors({ ...errors, general: "Something went wrong. Please try again." });
      }
    }
  };

  return (
    <AuthLayout>
      <div className='lg:w-[70%] h-full flex flex-col justify-center'>
        <div className='mb-6'>
          <h3 className='text-xl font-semibold text-black text-left'>Welcome Back</h3>
          <p className='text-xs text-slate-700 mt-[5px] text-left'>
            Please enter your details to login
          </p>
        </div>

        <form onSubmit={handleLogin}>
          <Input
            value={email}
            onChange={({ target }) => setEmail(target.value)}
            label="Email Address"
            placeholder="popo@example.com"
            type="text"
          />
          {errors.email && <p className='text-red-500 text-xs pb-2.5'>{errors.email}</p>}

          <Input
            value={password}
            onChange={({ target }) => setPassword(target.value)}
            label="Password"
            placeholder="Min 8 characters"
            type="password"
          />
          {errors.password && <p className='text-red-500 text-xs pb-2.5'>{errors.password}</p>}

          {/* Display general API error message */}
          {errors.general && <p className='text-red-500 text-xs pb-2.5'>{errors.general}</p>}

          <button type='submit' className='btn-primary'>
            Login
          </button>

          <p className='text-[13px] text-slate-800 mt-3'>
            Don't have an account?
            <Link className='font-medium text-primary underline' to="/signup">
              Sign Up
            </Link>
          </p>
        </form>
      </div>
    </AuthLayout>
  );
};

export default Login;

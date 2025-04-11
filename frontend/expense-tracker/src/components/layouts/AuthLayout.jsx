import React from 'react'
import CARD_2 from '../../assets/images/card23.jpeg';
import {LuTrendingUpDown} from "react-icons/lu" ;

const AuthLayout = ({ children }) => {
  return (
    <div className='flex'>
      {/* Left Side */}
      <div className='w-screen h-screen md:w-[60vw] px-12 pt-8 pb-12'>
        <h2 className='text-lg font-medium text-black'>Expense Tracker</h2>
        {children}
      </div>

      {/* Right Side */}
      <div className='hidden md:block w-[40vw] h-screen bg-violet-50 bg-auth-bg-img bg-cover bg-no-repeat bg-center overflow-hidden p-8 relative z-0'>
        {/* Positioned Elements */}
        <div className='w-48 h-48 rounded-[40px] bg-purple-600 absolute -top-7 -left-5'></div>
        <div className='w-48 h-56 rounded-[40px] border-[20px] border-purple-600 absolute top-[30%] -right-10'></div>
        <div className='w-48 h-48 rounded-[40px] bg-darkpurple-500 absolute -bottom-7 -left-5'></div>

        <div className='grid grid-cols-1 z-20'>
          <StasInfoCard 
          icon={<LuTrendingUpDown />}
          label="Track Your Income and Expenses "
          value="430,000"
          color="bg-primary"
          />

        </div>


        {/* Image inside the div */}
        <img
          src={CARD_2}
           className='w-64 lg:w-[80%] absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-10 z-10 shadow-lg shadow-blue-400/15'
        />
      </div>
    </div>
  );
};

export default AuthLayout;

const StasInfoCard = ({icon , label ,value , color }) =>{
  return <div className='flex gap-6 bg-white p-4 rounded-xl shadow-md shadow-purple-400/10 border border-gray-200/5 z-10'>
    <div className={`w-12 h-12 flex items-center justify-center text-[26px] text-white ${color} rounded-full drop-shadow-xl`}>
      {icon}
    </div>
    <div>
      <h6 className='text-xs text-gray-500 mb-1'>{label}</h6>
      <span className='text-[20px]'>{value}</span>
    </div>
  </div>
}
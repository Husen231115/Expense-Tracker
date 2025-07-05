import React from 'react'
import {
  BrowserRouter as Router ,
  Routes ,
  Route,
  Navigate ,
} from "react-router-dom" ;
import {Toaster} from 'react-hot-toast';

import Login from "./pages/Auth/Login" ;
import Signup from "./pages/Auth/Signup" ;
import Home from "./pages/Dashboard/Home" ;
import Income from "./pages/Dashboard/Income" ;
import Expense from "./pages/Dashboard/Expense" ;
import Budget from "./pages/Dashboard/Budget" ;
import UserProvider from './context/userContext';
import { BudgetProvider } from './context/BudgetContext';



const App = () => {
  return (
    <UserProvider>
      <BudgetProvider>
        <div>
        <Router >
          <Routes>
            <Route path='/' element={<Root />}  />
            <Route path='/login' exact element={<Login/>} />
            <Route path='/signup' exact element={<Signup/>} />
            <Route path='/dashboard' exact element={<Home/>} />
            <Route path='/income' exact element={<Income/>} />
            <Route path='/expense' exact element={<Expense/>} />
            <Route path='/budgets' exact element={<Budget/>} />


          </Routes>
        </Router>
        </div>
            <Toaster 
            toastOptions={{
              className:"",
              style:{
                fontSize:'13px'
              },
            }}
        
              />  
      </BudgetProvider>
    </UserProvider>
  )
}

export default App ;

const Root  = () => {
  // Check if token exists in localstorage 
  const isAuthenticated = !!localStorage.getItem("token") ;
  //Redirect to Dashboard if Authenticated , OtherWise to Login 
  return isAuthenticated ? (
    <Navigate to='/dashboard' />
  ):(
   < Navigate to='/login' />
  );
}
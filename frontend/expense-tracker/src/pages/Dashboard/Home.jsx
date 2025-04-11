import React, { useState , useEffect} from 'react'
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { useUserAuth } from '../../hooks/useUserAuth';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { API_Paths } from '../../utils/apiPaths';
import InfoCard from '../../components/Cards/InfoCard';
import { LuHandCoins, LuWalletMinimal } from 'react-icons/lu';
import {IoMdCard } from 'react-icons/io' ; 
import {addThousandsSeparator} from '../../utils/helper'
import RecentTransaction from '../../components/DashBoard/RecentTransaction';
import FinanceOverView from '../../components/DashBoard/FinanceOverView';
import ExpenseTransactions from '../../components/DashBoard/ExpenseTransactions';
import Last30DaysExpense from '../../components/DashBoard/Last30DaysExpense';
import RecentIncomeWithChart  from '../../components/DashBoard/RecentIncomeWithChart';
import RecentIncome from '../../components/DashBoard/RecentIncome';
const Home = () => {
  useUserAuth();

  const navigate = useNavigate();
  const [dashboardData , setDashboardData]= useState(null);
  const [loading , setLoading ] = useState(false);

  const fetchDashboardData = async ()=>{
    if(loading) return ;

    setLoading(true);

    try{
      const response = await axiosInstance.get(
        `${API_Paths.DASHBOARD.GET_DATA}`
      );
      if(response.data){
        setDashboardData(response.data);
      }
    }catch(err){
      console.log("Something went wrong .Please try Again ." , err);

    }finally{
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDashboardData();
    return () => {
    }
  },[])
  


  return (
    <DashboardLayout activeMenu="Dashboard">
      <div className='my-5 mx-auto'>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 '>
         <InfoCard  
        icon={<IoMdCard />}
        label="Total Balance "
        value={addThousandsSeparator(dashboardData?.totalBalance || 0)}
        color="bg-primary"
        />
        <InfoCard  
        icon={<LuWalletMinimal/>}
        label="Total Income "
        value={addThousandsSeparator(dashboardData?.totalIncome || 0)}
        color="bg-orange-500"
        />
        <InfoCard  
        icon={<LuHandCoins/>}
        label="Total Expense "
        value={addThousandsSeparator(dashboardData?.totalExpense || 0)}
        color="bg-red-500"
        /> 
      </div>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-6'>
        <RecentTransaction
        transactions={dashboardData?.recentTransactions}
        onSeeMore={()=>navigate("/expense")}
        />

        <FinanceOverView
        totalBalance={dashboardData?.totalBalance || 0 }
        totalIncome={dashboardData?.totalIncome ||0}
        totalExpense={dashboardData?.totalExpense || 0}
        />
        
        <ExpenseTransactions 
        transactions={dashboardData?.last30DaysExpense?.transactions || []}
        onSeeMore={()=>navigate("/expense")}
          />
          <Last30DaysExpense 
          data={dashboardData?.last30DaysExpense?.transactions || []}
          />

          <RecentIncomeWithChart 
          data={dashboardData?.last60DaysIncome?.transactions || [] }
          totalIncome={dashboardData?.last60DaysIncome?.total || 0}
          />

          <RecentIncome 
          transactions={dashboardData?.last60DaysIncome?.transactions?.slice(0,4) || []}
          onSeeMore={()=> navigate("/income")}
      
          />

      </div>
      </div>
    </DashboardLayout>
  )
}

export default Home

Consolas, 'Courier New', monospace
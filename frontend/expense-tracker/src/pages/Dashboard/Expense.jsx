import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layouts/DashboardLayout'
import {useUserAuth} from '../../hooks/useUserAuth' ;
import axiosInstance from '../../utils/axiosInstance';
import { API_Paths } from '../../utils/apiPaths';
import toast, { Toaster } from 'react-hot-toast';
import ExpenseOverview from '../../components/Expense/ExpenseOverview';
import Modal from '../../components/Modal';
import AddExpenseForm from '../../components/Expense/AddExpenseForm';
import ExpenseList from '../../components/Expense/ExpenseList';
import DeleteAlert from '../../components/DeleteAlert';

const Expense = () => {
  useUserAuth();

  const [expenseData , setExpenseData]= useState([]);
  const [loading , setLoading] = useState(false);
  const [openDeleteAlert , setOpenDeleteAlert]=useState({
    show:false , 
    data:null ,
  })


  const [openAddExpenseModal, setOpenAddExpenseModal] = useState(false);


 

  const fetchExpenseDetails = async ()=>{
    if(loading) return ;

    setLoading(true);
    try{
      const response = await axiosInstance.get(
        `${API_Paths.EXPENSE.GET_ALL_EXPENSE}`
      );
      if(response.data){
        setExpenseData(response.data);
      }

    }catch(error){
      console.log("Something Went Wrong  . Please Try Again " , error);
    }finally{
      setLoading(false);
    }

  } 

  
  const handleAddExpense = async (expense) =>{
    const {category , amount , date ,icon} = expense ; 
    
    //Validation Checks 
      if(!category.trim()){
        toast.error('Category is Required ');
        return ;
      }
      if(!amount || isNaN(amount) || Number(amount) <=0)
      {
          toast.error('Amount should be valid  number greater than 0.');
          return ; 
         } 
      if(!date){
        toast.error('Date is Required');
      }

      try{
        await axiosInstance.post(API_Paths.EXPENSE.ADD_EXPENSE,{
          category,
          amount,
          date,
          icon,
        });
        setOpenAddExpenseModal(false);
        toast.success('Expense Added Succesfully');
        fetchExpenseDetails();

      }catch(err){
        console.error(
          "Error adding expense" ,
          err.response?.data?.message || err.message
        )
      }
  }

   
  const deleteExpense = async(id)=>{
    try{
      await axiosInstance.delete(API_Paths.EXPENSE.DELETE_EXPENSE(id));
      setOpenDeleteAlert({show:false, data:null});
      toast.success("Expense Details Deleted Succesfully");
      fetchExpenseDetails();
    }
catch(err){
console.error('Error deleting expense',
  err.response?.data?.message || err.message
)
}

  };

// handle download expense details
  const handleDownloadExpenseDetails = async () =>{
    try{
      const response=await axiosInstance.get(
        API_Paths.EXPENSE.DOWNLOAD_EXPENSE,
        {
          responseType:'blob',
        }
      )
      //Create a Url for the Blob 
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href= url ;
      link.setAttribute('download', 'expense_details.xlsx');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    }catch(error){
      console.error('Error downloading expense details : ' , error);
      toast.error('Failed to download expense details . Please Try Again');
    }

  }


     useEffect(()=>{
    fetchExpenseDetails();

      return ()=>{}

        },[]);

  return (
    <DashboardLayout activeMenu="Expense">
      <div className='my-5 mx-auto '>
        <div className='grid grid-cols-1 gap-6'>
        <div className=''>
        <ExpenseOverview 
        transactions={expenseData}
        onExpenseIncome={()=>setOpenAddExpenseModal(true)}
        />
        </div>
        <ExpenseList 
        transactions={expenseData}
        onDelete={(id)=>{
          setOpenDeleteAlert({
            show:true , 
            data:id,
          })
        }}
        onDownLoad={handleDownloadExpenseDetails}
        
        />

        </div>

        <Modal isopen={openAddExpenseModal} 
        onClose={()=>setOpenAddExpenseModal(false)}
        title='Add Expense'
        >
          <AddExpenseForm  onAddExpense={handleAddExpense} />
        </Modal>
        
  <Modal
  isopen={openDeleteAlert.show}
  onClose={()=>setOpenDeleteAlert({show:false , data:null})}
  title="Delete Expense"
  >
    <DeleteAlert
    content='Are You sure you want to delete this expense detail ?'
    onDelete={()=>deleteExpense(openDeleteAlert.data)} 
    />
    </Modal>
      </div>

    </DashboardLayout>
  )
}

export default Expense ;
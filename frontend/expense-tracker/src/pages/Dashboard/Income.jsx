import React, { useEffect } from 'react' ; 
import { useState } from 'react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import IncomeOverView from '../../components/Income/IncomeOverView';
import axiosInstance from '../../utils/axiosInstance';
import { API_Paths } from '../../utils/apiPaths';
import Modal from '../../components/Modal';
import AddIncomeForm from '../../components/Income/AddIncomeForm';
import { toast } from 'react-hot-toast';
import IncomeList from '../../components/Income/IncomeList';
import { useUserAuth } from '../../hooks/useUserAuth';
import DeleteAlert from '../../components/DeleteAlert';
const Income = () => {
  useUserAuth();
  
  const [incomeData , setIncomeData]= useState([]);
  const [loading , setLoading] = useState(false);
  const [openDeleteAlert , setOpenDeleteAlert]=useState({
    show:false , 
    data:null ,
  })


  const [openAddIncomeModel, setopenAddIncomeModel] = useState(false);

  //Get All Income Details 

    const fetchIncomeDetails = async ()=>{
      if(loading) return ;

      setLoading(true);
      try{
        const response = await axiosInstance.get(
          `${API_Paths.INCOME.GET_ALL_INCOME}`
        );
        if(response.data){
          setIncomeData(response.data);
        }

      }catch(error){
        console.log("Something Went Wrong  . Please Try Again " , error);
      }finally{
        setLoading(false);
      }

    } 

  //Handle Add Income 
    const handleAddIncome = async (income) =>{
      const {source , amount , date ,icon} = income ; 
      
      //Validation Checks 
        if(!source.trim()){
          toast.error('Source is Required ');
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
          await axiosInstance.post(API_Paths.INCOME.ADD_INCOME,{
            source,
            amount,
            date,
            icon,
          });
          setopenAddIncomeModel(false);
          toast.success('Income Added Succesfully');
          fetchIncomeDetails();

        }catch(err){
          console.error(
            "Error adding income" ,
            err.response?.data?.message || err.message
          )
        }
    }

  // Delete Income 
    const deleteIncome = async(id)=>{
      try{
        await axiosInstance.delete(API_Paths.INCOME.DELETE_INCOME(id));
        setOpenDeleteAlert({show:false, data:null});
        toast.success("Income Details Deleted Succesfully");
        fetchIncomeDetails();
      }
catch(err){
  console.error('Error deleting income',
    err.response?.data?.message || err.message
  )
}

    };

  // handle download income details
    const handleDownloadIncomeDetails = async () =>{
      try{
        const response=await axiosInstance.get(
          API_Paths.INCOME.DOWNLOAD_INCOME,
          {
            responseType:'blob',
          }
        )
        //Create a Url for the Blob 
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href= url ;
        link.setAttribute('download', 'income_details.xlsx');
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
      }catch(error){
        console.error('Error downloading income details : ' , error);
        toast.error('Failed to download income details . Please Try Again');
      }
    }

    useEffect(() => {
      fetchIncomeDetails();
    
      return () => {}
    },[])
    

  return (
<DashboardLayout activeMenu="Income">
<div className='my-5 mx-auto'>
  <div className='grid grid-cols-1 gap-6'>
    <div className=''>
      <IncomeOverView
      transactions = {incomeData}
      onAddIncome={()=>setopenAddIncomeModel(true)}
      />
    </div>
    <IncomeList 
    transactions={incomeData}
    onDelete={(id)=>{
      setOpenDeleteAlert({show:true ,data:id});
    }}
    onDownload={handleDownloadIncomeDetails}

    />
  </div>
 
    <Modal isopen={openAddIncomeModel} 
           onClose={()=>setopenAddIncomeModel(false)}
           title="Add Income">
            <AddIncomeForm onAddIncome={handleAddIncome} />
  </Modal>

  <Modal
  isopen={openDeleteAlert.show}
  onClose={()=>setOpenDeleteAlert({show:false , data:null})}
  title="Delete Income"
  >
    <DeleteAlert
    content='Are You sure you want to delete this income detail ?'
    onDelete={()=>deleteIncome(openDeleteAlert.data)} 
    />
    </Modal>
</div>
</DashboardLayout>
  )
}

export default Income;
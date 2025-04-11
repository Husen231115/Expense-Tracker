import { API_Paths } from "./apiPaths";
import axiosInstance from "./axiosInstance";
const uploadImage = async(imageFile)=>{
    const formData =new FormData();
    //Append image file to form data
    formData.append('image' , imageFile);
    try{
        const response = await axiosInstance.post(API_Paths.IMAGE.UPLOAD_IMAGE,formData,{
            headers:{
                'Content-Type':'multipart/form-data' , 
            },
        });
        return response.data 
    }catch(err){
        console.log('Erro upoading the image:' ,err);
        throw err
    }
}
export default uploadImage ;
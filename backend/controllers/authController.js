const User = require("../models/User");
const jwt = require("jsonwebtoken");

//Generate JWT token
const generateToken = (id)=>{
    return jwt.sign({id} , process.env.JWT_SECRET,{expiresIn:"1h"});

};

//Register User 
exports.registerUser =async(req,res)=>{
    const {fullName , email ,password , profileImageUrl }= req.body ; 
    
    //Validation :Check for missing fields 
    if(!fullName || !email || !password){
        return res.status(400).json({message:"All Fields are Required . "});
    }
    try{
        //Check if Email already Exists
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({message:"Email Already in Use . "});
        }
        // Create the User 
        const user =  await User.create({
            fullName,
            email,
            password,
            profileImageUrl,
        });
    res.status(201).json({
       id:user._id,
       user,
        token:generateToken(user._id),
    })

    }catch(err){
        res
        .status(500)
        .json({message:"Error Registering user" , error:err.message});
    }
} ;

//Login User 
exports.loginUser = async(req,res)=>{
    const {email , password} = req.body;
    if(!email || !password){
        return res.status(400).json({message:"All Fields are required . "});
    }
    try{
        const user = await User.findOne({email});
        if(!user || !(await user.comparePassword(password))){
            return res.status(400).json({message:"Invalid Credentials"});   
        }
        res.status(200).json({
            id:user._id , 
            user,
            token:generateToken(user.id),
        });
    }
    catch(err){
        res
        .status(500)
        .json({message:"Error Logging user" , error:err.message});
    }
};

//Get Profile 
exports.getUserInfo = async(req,res)=>{
    try{
        const user = await User.findById(req.user.id).select("-password");
        if(!user){
            return res.status(404).json({message:"User Not Found "});
        }

     res.status(200).json(user);
    
    }catch(err){
        res
        .status(500)
        .json({message:"Error Logging user" , error:err.message});
    }
};

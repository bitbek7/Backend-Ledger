import userModel from "../models/user.model.js";
import emailService from "../services/email.service.js";
import jwt from "jsonwebtoken";
import tokenBlackListModel from "../models/blackList.model.js";
async function registerUser(req,res){
    try{
        const{email,name,password}=req.body;
    const isUserAlreadyExist=await userModel.findOne({
        email:email
    })
    if(isUserAlreadyExist){
        return res.status(422).json({message:"User already exist",status:"failed"})
    }
    const user=await userModel.create({email,name ,password});
    const token =jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:"3d"});
    res.cookie("token",token);
    res.status(201).json({message:"User created successfully",user:{
        _id:user._id,
        email:user.email,
        name:user.name
    },token})
await emailService.userRegistrationMail(user.email,user.name);
}catch(error){
    console.log("Error on new registeration",error.message);
    res.status(400).json({message:"Error on new registeration",error})
}




}
async function loginUser(req,res){
    try{
        const {email,password}=req.body;
    const user=await userModel.findOne({email}).select("+password");
    if(!user){
     return res.status(401).json({message:"User not registered from this mail.."})
    }
    const isPasswordValid=await user.comparePassword(password);
    if(!isPasswordValid){
        res.status(401).json({message:"Incorrect password name or email"})
    }
    const token=jwt.sign({id:user.id},process.env.JWT_SECRET,{expiresIn:"3d"});
    res.cookie("token",token);
    res.status(200).json({
        message:"logged In successfully..",
        user:{
            _id:user._id,
            email:user.email,
            name:user.name
        },token
    })
}catch(error){
    console.log("Error on logging an user ",error.message);
    res.status(400).json({message:"Error on logging an user..."})
}
}


async function logoutUser(req,res){
    try{
const token=req.cokkies || req.headers.authorization?.split(" ")[1];
if(!token){
    return res.status(400).json({message:"you don't have a token"});
}
await tokenBlackListModel.create({
    token:token
})
res.clearCookie("token"); //clear cookies 

res.status(200).json({
    message:"User logged out successfully"
})

    }
    catch(error){
console.log("Error on logging out..",error.message);
    }
}


export default {registerUser,loginUser,logoutUser};
//middleware to check whether the user is logged in or not...

import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import tokenBlackListModel from "../models/blackList.model.js";

//we have to check whether the login token is coming in cookies , headers or not...

async function authMiddleware(req,res,next){
const token=req.cookies.token || req.headers.authorization?.split("")[1];
if(!token){
    return res.status(401).json({
        message:"Unauthorized access, Token is missing "
    })
}
const isBlackListed=await tokenBlackListModel.findOne({token})
if(isBlackListed){
    return res.status(401).json({message:"Unauthorized access, token is unvalid"})
}
try{
const decoded=jwt.verify(token,process.env.JWT_SECRET);
console.log(decoded);
const user=await userModel.findById(decoded.id);
req.user=user;
return next();
}catch(error){
return res.status(401).json({message:"Unauthorized Access,Token is invalid..."});
}
}

async function authSystemMiddleware(req,res,next){
   try{ const token= req.cookies.token || req.headers.authorization?.split(" ")[1];
    if(!token){
        return res.status(401).json({message:"Unauthorized access, token is missing"})
    }  

    const isBlackListed=await tokenBlackListModel.findOne({token});
    if(isBlackListed){
        return res.status(401).json({
            message:"Unauthorized access, token is invlaid"
        })
    }
    const decoded=jwt.verify(token,process.env.JWT_SECRET);
    const user=await userModel.findById(decoded.userId).select("+systemUser");
    if(!user.systemUser){
        return res.status(403).json({message:"Forbidden access, not a system user"})
    }
    req.user=user;
    return next()
}catch(error){
return res.status(401).json({message:"Forbidden Access,Not a system User..."});

}}
export default {authMiddleware,authSystemMiddleware};

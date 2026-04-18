import mongoose from "mongoose";


const tokenBlackListSchema=new mongoose.Schema({
    token:{
    type:String,
    requird:[true,"Token is required to blacklist"],
    unique:[true,"Token is alredy blacklisted"],
    },
},{timestamps:true});
tokenBlackListSchema.index({createdAt:1},{expiresAfterSeconds:60*60*24*3}) //expires at : 3 days

const tokenBlackListModel=mongoose.model("tokenBlackList",tokenBlackListSchema);
export default tokenBlackListModel;
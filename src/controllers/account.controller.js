//to create an account first will see whether the user is logged in and further process of creating an account is performed...
//first we create an middleware which will check whether user is logged in or not...
import accountModel from "../models/account.model.js";
async function createAccount(req,res){
    try {
        const user=req.user; //i need understand this...
        const account=accountModel.create({user:user._id});
        res.status(201).json({account});
    } catch (error) {
        res.status(400).json({message:"Error on creating an new account..."})
    }
}
async function getUserControllerAccount(req,res){
    const accounts =await accountModel.find({user:req.user._id});
    res.status(200).json({
        accounts
    })
}
async function getAccountBalance(req,res){
    const accountId=req.params;
    const account=await accountModel.findOne({_id:accountId,user:req.user._id});
    if(!account){
        return res.status(404).json({
            message:"Account Not Found"
        })
    }
    const balance=await account.getBalance();
    res.status(200).json({
        accountId:account._id,
        balance:balance
    }) 
}
export default {createAccount,getUserControllerAccount,getAccountBalance};
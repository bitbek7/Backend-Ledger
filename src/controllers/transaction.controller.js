/**
 * create a new transaction
 * The 10-steps to transfer flow
    *1.Validate request
    *2.Validate idempotency
    *3.Check account status
    *4.Derive sender balance from ledger
    *5.Create transaction (PENDING)
    *6.Create DEBIT ledger
    *7.Create CREDIT ledger
    *8.Mark transaction COMPLETED 
    *9.Comit MongoDB session
    *10.Send email notification 
 */
import mongoose from "mongoose";
import accountModel from "../models/account.model.js";
import ledgerModel from "../models/ledger.model.js";
import transactionModel from "../models/transaction.model.js";
import emailService from "../services/email.service.js"

//1. Validate request
async function createTransaction(req,res){ 
   try{  const {fromAccount,toAccount,amount,idempotencyKey}=req.body;
    if(!fromAccount || !toAccount || !amount || !idempotencyKey){   //checking whether all the required information for creating an transaction are available or not
        return res.status(400).json({message:"fromAccount,toAccount,amount,idempotency are required"})
    }

    //if Available also then we have to check whether the fromAccount and toAccount are present or not
    const fromUserAccount=await accountModel.findOne({_id:fromAccount});
    const toUserAccount=await accountModel.findOne({_id:toAccount});
    if(!fromUserAccount || !toUserAccount){
        return res.status(400).json({
            message:"Invalid fromAccount or toAccount"
        })
    }
//2.Validate idempotency key
const isTransactionAlreadyExists =await transactionModel.findOne({idempotencyKey:idempotencyKey});
if(isTransactionAlreadyExists){
    if(isTransactionAlreadyExists.status=="COMPLETED"){
    return res.status(200).json({message:"Transaction already processed",transaction:isTransactionAlreadyExists});
    }
    if(isTransactionAlreadyExists.status=="PENDING"){
       return res.status(202).json({message:"Transaction is still in processing...",})
    } 
    if(isTransactionAlreadyExists.status=="Failed"){
       return res.status(500).json({
            message:"Transaction processing failed,Try again..."
        })
    }
    if(isTransactionAlreadyExists.status=="REVERSED"){
       return res.status(500).json({message:"Transaction was reversed,please retry"})
    }
}

//3.Check account status..
if(fromUserAccount.status!="ACTIVE" || toUserAccount.status!="ACTIVE"){
return res.status(400).json({message:"Both fromUserAccount and toUserAccount must be ACTIVE to process the transaction"})    

}

//Derive sender balance from ledger...
const balance =await fromUserAccount.getBalance(); //getBalance is the methods that is defined in the accountModel.js accountSchema
if(balance<amount){
return res.status(400).json({
    message:`Insufficient balance in fromAccount.Current balance is ${balance}.Requested amount is ${amount}`
})
}
let session;
try{
//5.Create transaction(PENDING) //1.create a session 
 session=await mongoose.startSession()
session.startTransaction()
const transaction=(await transactionModel.create([{
    fromAccount,
    toAccount,
    amount,
    idempotencyKey,
    status:"PENDING"
}],{session}))[0]     //session is used yha tho charo complete honge yha tho koi ek bhi nhi hoga


const debitLedgerEntry=await ledgerModel.create([{
    account:fromAccount,
    amount:amount,
    transaction:transaction._id,
    type:"DEBIT"
}],{session})

const creditLedgerEntry= await ledgerModel.create([{
account:toAccount,
amount:amount,
transaction:transaction._id,
type:"CREDIT"
}],{session})



await transactionModel.findOneAndUpdate(
    {_id:transaction._id},
    {status:"COMPLETED"},
    {session}
)

await session.commitTransaction();
session.endSession();
}catch(err){
if(session){
await session.abortTransaction();   // ADD THIS
session.endSession();
}               // KEEP THIS

return res.status(400).json({
message:"Transaction failed, please retry"
});

}
//10.send email notification 
await emailService.sendTransactions(req.user.email,req.user.name,amount,toAccount);
return res.status(201).json({message:"Transaction completed successfully"})
 

}catch(error){
console.log("Error on creating an transaction...");
await emailService.sendTransactionsFailure(req.user.email,req.user.name,amount,toAccount);
res.status(401).json({message:"Error on creating an transaction ",error});
}
}

async function createInitialFundsTransaction(req,res) {
  try{   const {toAccount,amount,idempotencyKey}=req.body;
    if(!toAccount || !amount || !idempotencyKey){
        return res.status(400).json({
            message:"toAccount, amount and idempotancy is required "
        })
    }

    const toUserAccount=await accountModel.findOne({
    _id:toAccount,
    })
    if(!toUserAccount){
        return res.status(400).json({message:"Invalid toAccount"})
    }

    const fromUserAccount=await accountModel.findOne({
        systemUser:true,
         user:req.user._id 
    })
    if(!fromUserAccount){
        return res.status(400).json({message:"System user account not found"})
    }
//now finally we get the system user account
const session=await mongoose.startSession()
session.startTransaction();
const transaction=(await transactionModel.create([{    //client side transaction currently it is not saved in the database only created in server
    fromAccount:fromUserAccount._id,
    toAccount,
    amount,
    idempotencyKey,
    status:"PENDING"
}],{session}))[0];
const debitLedgerEntry=await ledgerModel.create([{
    account:fromUserAccount._id,
    amount:amount,
    transaction:transaction._id,
    type:"DEBIT"                

}],{session})

await new Promise((resolve)=>{
    setTimeout(resolve,1000)  //created after 10 sec
})
const creditLedgerEntry=await ledgerModel.create([{
    account:fromUserAccount._id,
    amount:amount,
    transaction:transaction._id,
    type:"CREDIT"
}],{session})

await transaction.save({session});
await session.commitTransaction();
session.endSession()

return res.status(201).json({
    message:"Initial funds transaction completed successfully",
    transaction:transaction
})
}catch(error){
res.status(400).json({message:"Initial funds transaction unsuccessfull",error});
    }
}
export default {createTransaction,createInitialFundsTransaction};
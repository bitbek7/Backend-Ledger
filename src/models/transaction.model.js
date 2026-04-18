import mongoose from "mongoose";
const transactionSchema=new mongoose.Schema({
    fromAccount:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"accountModel",
        required:[true,"Transaction must be associated with a from Account."],
        index:true
    },
    toAccount:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"accountModel",
        required:[true,"Transaction must be associated with a to Account."],
        index:true
    },
    status:{
        type:String,
        enum:{
            values:["PENDING","COMPLETED","FAILED","REVERSED"],
            messages:"Status can be either PENDING,COMPLETED,FAILED or REVERSED",
        },
        default:"PENDING"
    },
    amount:{
        type:Number,
        required:[true,"Amount is required for creating an transaction"],
        min:[100,"Account must have minimun 100 dollar to create an transaction"]
    },
    idempotencyKey:{
        type:String,
        required:[true,"Idempotency Key is required for creating a transaction "],
        index:true,
        unique:true,

    }
},{timestamps:true});
const transactionModel=mongoose.model("transaction",transactionSchema);
export default transactionModel;
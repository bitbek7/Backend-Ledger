
import mongoose from "mongoose";
import ledgerModel from "./ledger.model.js";
const accountSchema=new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:[true,"Account must be associated with a user"],
        index:true
    },
    status:{
        type:String,
        enum:{values:["ACTIVE","FORZEN","CLOSED"],
              message:"Staus can be either ACTIVE,FORZEN,or CLOSED",
        },
         default:"ACTIVE"
        },
    currency:{
        type:String,
        required:[true,"Currency is required for creating an account"],
        default:"INR"
    }
},{timestamps:true})
accountSchema.index({user:1, staus:1}); 
accountSchema.methods.getBalance=async function(){
    const balanceData=await ledgerModel.aggregate([
        {$match:{account:this._id}},
        {$group:{
            _id:null,  //id is null means one group for all
       TotalDebit:{
                $sum:{$cond:[
                    {$eq:["$type","DEBIT"]},
                    "$amount",0
                ]}
            },
            totalCredit:{
                $sum:{
                    $cond:[
                        {$eq:["type","CREDIT"]},
                        "$amount",0
                    ]
                }
            }
        }},
        {$project:{
            _id:0,
            balance:{$subtract:["$totalCredit","$totalDebit"]}
        }}
    ])

    if(balanceData.length==0){
        return 0;
    }
    return balanceData[0].balance;
}     //compound indexing  
const accountModel=mongoose.model("accountModel",accountSchema);
export default accountModel;
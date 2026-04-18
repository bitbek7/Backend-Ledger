import mongoose from "mongoose";
const ledgerSchema=new mongoose.Schema({
    account:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"accountModel",
        required:[true,"Ledger must be associated with an account"],
        index:true,
        immutable:true
    },
    amount:{
        type:Number,
        required:[true,"Amount is required for creating an ledger entry"],
        immutable:true,
    },
    transaction:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"transaction",
        required:[true,"Ledger must be associated with a transaction collection"],
        index:true,
        immutable:true
    }
},{timestamps:true});

function preventLedgerModification(){
    throw new Error("Ledger entries are immutable and cannot be modified or deleted");
}

ledgerSchema.pre("findOneAndUpdate",preventLedgerModification);
ledgerSchema.pre("updateOne",preventLedgerModification);
ledgerSchema.pre("deleteOne",preventLedgerModification);
ledgerSchema.pre("findOneAndDelete",preventLedgerModification);
ledgerSchema.pre("findOneAndReplace",preventLedgerModification);
ledgerSchema.pre("updateMany",preventLedgerModification);
ledgerSchema.pre("deleteMany",preventLedgerModification);
ledgerSchema.pre("remove",preventLedgerModification);

const ledgerModel=mongoose.model("ledger",ledgerSchema);
export default ledgerModel;

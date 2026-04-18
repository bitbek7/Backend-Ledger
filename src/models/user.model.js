import mongoose from "mongoose";
import bcrypt from "bcryptjs";
const userSchema=new mongoose.Schema({
    email:{
        type:String,
        required:[true,"Email is required for creating an user"],
        trim:true,
        unique:[true,"Email already exists"],
        lowercase:true,
        match:[/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,"Invalid Email..."]

    },
    name:{
        type:String,
        required:[true,"Name is rewuired for creating an account"],
    
    },
    password:{
        type:String,
        required:[true,"Password is required fro creating an account "],
        minLength:[6,"Password must contians atleast 6 character"],
        match:[/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,}$/,"Password must contain atleast one uppercase,lowercase,special character"],
        select:false  //Mongoose will not return this field when fetching data unless ypu explicitly ask for it
    }, //password hidden automatically and how to fetch the hashed password by using this line of code :const user = await userModel
       //.findOne({email})
       //.select("+password"); 

    systemUser:{
        type:Boolean,
        default:false,
        immutable:true,
        select:false
    }
},{timestamps:true})
userSchema.pre("save",async function(){

if(!this.isModified("password")){
    return;
}

const salt=await bcrypt.genSalt(10);

const hash=await bcrypt.hash(this.password,salt);
this.password=hash;
});

userSchema.methods.comparePassword=async function (password){
    return bcrypt.compare(password,this.password)
}
const userModel=mongoose.model("user",userSchema);
export default userModel;
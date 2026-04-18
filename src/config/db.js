import mongoose from "mongoose";
async function connectDb() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Database connected successfully...");
    } catch (error) {
        console.log("Error on connecting the server...",error);
        process.exit(1); // if server is not connected to the Db then it will stop the server because  without db the server can't do many thing
        
    }
}
export default connectDb;
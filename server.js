import "dotenv/config";
import app from "./src/app.js";
import connectDb from "./src/config/db.js";
const port=process.env.PORT||8080;
connectDb()
    .then(()=>{
        app.listen(port,()=>{
            console.log(`Server start on port ${port}`)
        })
    })
    .catch((error)=>{
        console.log("Error on starting the server...")
    })
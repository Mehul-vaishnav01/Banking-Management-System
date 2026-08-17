const mongoose = require('mongoose');

function connectDB()
{
    mongoose.connect(process.env.MONGO_URI)
    .then(()=>{
        console.log("Database connected sucessfully");
    })
    .catch(err =>{
        console.log("error to connect DB",err);
        process.exit(1);
    })
}

module.exports=connectDB;
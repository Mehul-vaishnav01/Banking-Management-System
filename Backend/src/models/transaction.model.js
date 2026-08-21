const mongoose = require('mongoose');

const transactionSchema=new mongoose.Schema({
    fromAccount:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"account",
        required:[true ,"Transaction must be associated with a from account"],
        index:true
    },
    toAccount:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"account",
        required:[true ,"Transaction must be associated with a to account"],
        index:true 
    },
    status:{
        type:String,
        enum:{
            values:["Pending","Completed","Failed","Reversed"],
            message:"Status can be either Pending,Completed,Failed or Reversed "
        },
        default:"Pending"
    },
    amount:{
        type:Number,
        required:[true,"Amount is requried for creating a transaction"],
        min:[0, "Transaction amount cannt be negetive"]
    },
    idempotencykey:{
        type:String,
        required:[true,"Idempotency Key is required for creating a transaction"],
        index:true,
        unique:true
    }
},{
    timestamps:true
})
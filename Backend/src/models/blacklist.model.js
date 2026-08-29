const mongoose = require('mongoose');


const tokenBlacklistSchema=new mongoose.Schema({
    token:{
        type:String,
        required:[true,"token is requried blacklist"],
        unique:[true,"token is already blacklisted"]
    }
},{
    timestamps:true
})

tokenBlacklistSchema.index({createAt:1},{
    expireAfterSeconds:60*60*24*3
})

const tokenBlacklistModel=mongoose.model("tokenBlacklist",tokenBlacklistSchema)
module.exports=tokenBlacklistModel

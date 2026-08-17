const mongoose = require('mongoose');
const bcrypt=require('bcryptjs');
const userSchema= new mongoose.Schema({
    email:{
        type:String,
        required:[true, "Email is required to create the user"],
        trim: true,
        lowercase :true,
        unique:[true,"Email already exist"],
        match:[/^[^\s@]+@[^\s@]+\.[^\s@]+$/,"Invalid email address"]

    },
    name:{
        type:String,
        required:[true, "Username is required"],

    },
    password:{
        type:String,
        required:[true,"password is required"],
        minlength:[6,"password should contain more than 6 charater"],
        select:false
    }
},{
    timestamps:true
})



userSchema.pre("save", async function() {
    if (!this.isModified("password")) {
        return;
    }

    this.password = await bcrypt.hash(this.password, 10);
});


userSchema.methods.comparePassword=async function(password){
    return await bcrypt.compare(password,this.password)
}



const userModel=mongoose.model("user",userSchema)

module.exports=userModel
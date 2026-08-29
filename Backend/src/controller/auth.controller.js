const userModel=require('../models/user.model');
const jwt=require('jsonwebtoken');
const emailService=require('../services/email.service')
const tokenBlacklistModel=require("../models/blacklist.model")


async function userRegisterController(req,res){

    const{ name,email,password }=req.body

    const isExist=await userModel.findOne({
        email:email
    })
    if(isExist){
        return res.status(422).json({
            message:"Email Already exist",
            status:"failed"
        })
    }

    const user=await userModel.create({
        name,email,password
    })

    const token=jwt.sign({userId:user._id},process.env.JWT_SECRET,{expiresIn:"3d"})

    res.cookie("token",token)

    res.status(201).json({
        user:{
            _id:user._id,
            name:user.name,
            email:user.email
        }
    })

    await emailService.sendRegistrationEmail(user.email,user.name)
}


async function userLoginController(req,res) {

    const{email,password}=req.body
    const user= await userModel.findOne({email}).select("+password")
    
    if(!user)
    {
        return res.status(401).json({
            message:"Email or Password is Invalid"
        })
    }

    const isValidPass=await user.comparePassword(password)

    if(!isValidPass)
    {
        return res.status(401).json({
            message:"Email or Password is Invalid"
        })
    }

    const token=jwt.sign({userId:user._id},process.env.JWT_SECRET,{expiresIn:"3d"})

    res.cookie("token",token)

    res.status(200).json({
        user:{
            _id:user._id,
            name:user.name,
            email:user.email
        }
    })

    await emailService.sendLoginEmail(user.email,user.name)
}

async function userLogoutController(req,res) {
    const token=req.cookies.token||req.headers.authorization?.split(" ")[1]

    if(!token)
    {
        return res.status(200).json({
            message:"User Logout Sucessfully"
        })
    }

    
    await tokenBlacklistModel.create({
        token:token
    })
    res.clearCookie("token")

    return res.status(200).json({
        message:"User Logout Sucessfully"
    })
    
}

module.exports={userRegisterController,userLoginController,userLogoutController}
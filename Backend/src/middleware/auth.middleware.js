const userModel=require('../models/user.model')
const jwt=require('jsonwebtoken')
const tokenBlacklistModel=require('../models/blacklist.model')


async function authMiddleware(req,res,next) {
    const token=req.cookies.token||req.headers.authorization?.split(" ")[1]

    if(!token){
        return res.status(401).json({
            message:"Unauthorized acess,token is missing"
        })
    }

    const isBlacklisted=await tokenBlacklistModel.findOne({token})

    if(isBlacklisted)
    {
        return res.status(401).json({
            message:"Unothorized Acess,Token is Invalid"
        })
    }

    try {
        const decoded=jwt.verify(token,process.env.JWT_SECRET)

        const user=await userModel.findById(decoded.userId);

        req.user=user;

        return next()
        
    } catch (error) {
        return res.status(401).json({
            message:"Unauthorized acess,token is invalid"
        })
    }
}

async function authSystemUserMiddleware(req,res,next) {
    const token=req.cookies.token||req.headers.authorization?.split(" ")[1]

    if(!token){
        return res.status(401).json({
            message:"Unauthorized acess,token is missing"
        })
    }
    
    const isBlacklisted=await tokenBlacklistModel.findOne({token})

    if(isBlacklisted)
    {
        return res.status(401).json({
            message:"Unothorized Acess,Token is Invalid"
        })
    }

    try {
        const decoded=jwt.verify(token,process.env.JWT_SECRET)

        const user=await userModel.findById(decoded.userId).select("+systemUser");

        if(!user.systemUser)
            return res.status(403).json({
        message:"Forbidden access,Not a System user"
        })

        req.user=user

        return next()
        
    } catch (error) {
        return res.status(401).json({
            message:"Unauthorized acess,token is invalid"
        })
    }
}

module.exports={authMiddleware,authSystemUserMiddleware}
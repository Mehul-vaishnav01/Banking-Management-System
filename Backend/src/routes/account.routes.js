const express = require('express');
const authMiddleware=require('../middleware/auth.middleware')
const accountController=require('../controller/account.controller')

const router=express.Router()

router.post("/",authMiddleware.authMiddleware,accountController.createAccountController)

router.get("/",authMiddleware.authMiddleware,accountController.getUserAccountsControler)

router.get("/balance/:accountId",authMiddleware.authMiddleware,accountController.getAccountBalanceControler)

module.exports=router
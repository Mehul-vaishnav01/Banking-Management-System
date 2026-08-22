const express = require('express');
const authMiddleware=require('../middleware/auth.middleware')
const transactionController=require('../controller/transaction.controller')
const transactionroutes=express.Router()


transactionroutes.post("/",authMiddleware.authMiddleware,transactionController.createTransaction)
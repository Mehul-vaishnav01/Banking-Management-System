const express = require('express');
const authMiddleware=require('../middleware/auth.middleware')
const transactionroutes=express.Router()


transactionroutes.post("/",authMiddleware.authMiddleware)
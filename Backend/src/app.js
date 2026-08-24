const express = require('express');
const authRouter=require('./routes/auth.routes');
const accountRouter=require('./routes/account.routes');
const transactionroutes=require('./routes/transaction.routes')
const cookieParser=require('cookie-parser');
const app=express();

app.use(express.json());
app.use(cookieParser());
app.use("/api/auth",authRouter);
app.use("/api/accounts",accountRouter)
app.use("/api/transaction",transactionroutes)

module.exports=app;
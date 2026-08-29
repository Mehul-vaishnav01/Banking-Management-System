const express = require('express');
const authRouter=require('./routes/auth.routes');
const accountRouter=require('./routes/account.routes');
const transactionroutes=require('./routes/transaction.routes')
const cookieParser=require('cookie-parser');
const app=express();

app.use(express.json());
app.use(cookieParser());

app.get("/",(req,res) =>{
    res.send("Ledger Service is Up and Running")
})

app.use("/api/auth",authRouter);
app.use("/api/accounts",accountRouter)
app.use("/api/transaction",transactionroutes)

module.exports=app;
const transactionModel=require('../models/transaction.model');
const ledgerModel=require('../models/ledger.model');
const accountModel=require('../models/account.model');
const emailService=require('../services/email.service')
const mongoose = require('mongoose');

/**
 * -Create new transaction
 * The 10 step transfer flow
    1.Validate request
    2.Validate IdempotencyKey
    3.Check Account Status
    4.Derive sender balance from ledger
    5.Create transaction(Pending)
    6.Create Debit Ledger entry
    7.Create Credit Ledger entry
    8.Mark Transaction completed
    9.Commit MongoDB Session
    10.Send Email notification
 */

async function createTransaction(req,res) {
        /**
         * 1.Validate Request
         */

        const{fromAccount,toAccount,amount,IdempotencyKey}=req.body;
        if(!fromAccount||!toAccount||!amount||!IdempotencyKey)
        {
            return res.status(400).json({
                message:"fromAccount, toAccount, amount, IdempotencyKey are requried"
            })
        }
        const fromUserAccount=await accountModel.findOne({
            _id:fromAccount,
        })
        const toUserAccount=await accountModel.findOne({
            _id:toAccount
        })

        if(!fromUserAccount || !toUserAccount)
        {
            return res.status(400).json({
                message:"Invalid fromAccount or toAccount"
            })
        }

        /**
         * 2.Validate IdempotencyKey
         */

        const isTransactionAlreadyExist=await transactionModel.findOne({
            IdempotencyKey:IdempotencyKey
        })

        if(isTransactionAlreadyExist)
        {
            if(isTransactionAlreadyExist.status==='Completed')
            {
                return res.status(200).json({
                    message:"Transaction already processed",
                    transaction:isTransactionAlreadyExist
                })
            }
            if(isTransactionAlreadyExist.status==='Pending')
            {
                return res.status(200).json({
                    message:"Transaction already processing"
                })
            }
            if(isTransactionAlreadyExist.status==='Failed')
            {
                return res.status(500).json({
                    message:"Transaction processing failed , plese retry"
                })
            }
            if(isTransactionAlreadyExist.status==='Reversed')
            {
                return res.status(500).json({
                    message:"Transaction processing reversed , plese retry"
                })
            }
        }

        /**
         * 3.Check Account Status
         */

        if(fromUserAccount.status!=="ACTIVE"||toUserAccount!=="ACTIVE")
        {
            return res.status(400).json({
                message:"Both fromAccount & toAccount must be ACTIVE to process transaction"
            })
        }

        /**
         * 4.Derive Sender Balance From Ledger
         */

        const balance=await fromAccount.getBlance()
        if(balance<amount)
        {
            return res.status(400).json({
                message:`Insufficient balance. Current Balance is ${balance}. Requested amount is ${amount}.`
            })
        }

        /**
         * 5.Create Transaction
         */

        const session=await mongoose.startSession()
        session.startTransaction()

        const transaction=await transactionModel.create({
            fromAccount,
            toAccount,
            amount,
            IdempotencyKey,
            status:"Pending"
        },{session})

        const debitLedgerEntry=await ledgerModel.create({
            account:fromAccount,
            amount:amount,
            transaction:transaction._id,
            type:"Debit"
        },{session})

        const creditLedgerEntry=await ledgerModel.create({
            account:fromAccount,
            amount:amount,
            transaction:transaction._id,
            type:"Credit"
        },{session})

        transaction.status="Completed"
        await transaction.save({session})

        await session.commitTransaction()
        session.endSession()

        /**
         * 10.Send email notification
         */

        await emailService.sendTransactionEmail(req.user.email,req.user.name,amount,toAccount)
            return res.status(201).json({
                message:"Transaction Completed Sucessfully",
                transaction:transaction
            })
}

async function createInitialFundsTransaction(req,res) {
    const{toAccount,amount,IdempotencyKey}=req.body


    if(!toAccount||!amount||!IdempotencyKey)
    {
        return res.status(400).json({
            message:"toAccount,amount and IdempotencyKey are requried"
        })
    }

    const toUserAccount=await accountModel.findOne({
        _id:toAccount
    })

    if(!toUserAccount)
    {
        return res.status(400).json({
            message:"Invalid toAccount"
        })
    }

    const fromUserAccount=await accountModel.findOne({
        systemUser:true,
        user:req.user._id
    })
    
    if(!fromUserAccount)
    {
        return res.status(400).json({
            message:"System user account not found"
        })
    }

    const session=await mongoose.startSession()
    session.startTransaction()

    const transaction=await transactionModel.create({
        fromAccount:fromUserAccount._id,
        toAccount,
        amount,
        IdempotencyKey,
        status:"Pending"

    },{session}) 

    const debitLedgerEntry=await ledgerModel.create({
        account:toAccount,
        amount:amount,
        transaction:transaction._id,
        type:"Credit"
    },{session})
    transaction.status="Completed"
    await transaction.save({session})

    await session.commitTransaction()
    session.endSession()

    return res.status(201).json({
        message:"Initial funds, transaction completed sucessfully",
        transaction:transaction
    })
}

module.exports={
    createTransaction,createInitialFundsTransaction
}
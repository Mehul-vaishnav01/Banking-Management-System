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

        const{fromAccount,toAccount,amount,idempotencyKey}=req.body;
        if(!fromAccount||!toAccount||!amount||!idempotencyKey)
        {
            return res.status(400).json({
                message:"fromAccount, toAccount, amount, idempotencyKey are requried"
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
         * 2.Validate idempotencyKey
         */

        const isTransactionAlreadyExist=await transactionModel.findOne({
            idempotencyKey:idempotencyKey
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
            idempotencyKey,
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

async function createInitialFundsTransaction(req, res) {

    const { toAccount, amount, idempotencyKey } = req.body

    if (!toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({
            message: "toAccount, amount and idempotencyKey are required"
        })
    }
    const existingTransaction = await transactionModel.findOne({
        idempotencyKey
    })

    if (existingTransaction) {
        return res.status(200).json({
            message: "Transaction already processed",
            transaction: existingTransaction
        })
    }

    // Find receiver's account
    const toUserAccount = await accountModel.findOne({
        _id: toAccount
    })

    if (!toUserAccount) {
        return res.status(400).json({
            message: "Invalid toAccount"
        })
    }

    // Find system account
    const fromUserAccount = await accountModel.findOne({
    user: req.user._id,
    status: "ACTIVE"
})

if (!fromUserAccount) {
    return res.status(400).json({
        message: "System user account not found"
    })
}

    const session = await mongoose.startSession()

    try {

        const transactionResult = await transactionModel.create([{
        fromAccount: fromUserAccount._id,
        toAccount: toUserAccount._id,
        amount,
        idempotencyKey,
        status: "Pending"
        }], { session })

const transaction = transactionResult[0]

        // Debit system account
        await ledgerModel.create([{
            account: fromUserAccount._id,
            amount,
            transaction: transaction._id,
            type: "Debit"
        }], { session })

        // Credit receiver's account
        await ledgerModel.create([{
            account: toUserAccount._id,
            amount,
            transaction: transaction._id,
            type: "Credit"
        }], { session })

        transaction.status = "Completed"

        await transaction.save({ session })

        await session.commitTransaction()

        return res.status(201).json({
            message: "Initial funds, transaction completed successfully",
            transaction
        })

    } catch (error) {

        await session.abortTransaction()

        return res.status(500).json({
            message: "Transaction failed",
            error: error.message
        })

    } finally {
        session.endSession()
    }
}
module.exports={
    createTransaction,createInitialFundsTransaction
}
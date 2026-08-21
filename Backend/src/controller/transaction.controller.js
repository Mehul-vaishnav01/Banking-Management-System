const transactionModel=require('../models/transaction.model');
const ledgerModel=require('../models/ledger.model');
const accountModel=require('../models/account.model');
const emailService=require('../services/email.service')

/**
 * -Create new transaction
 * The 10 step transfer flow
    1.Validate request
    2.Validate idempotencykey
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

        
    }
const mongoose = require('mongoose')

const payments = mongoose.Schema({
    UserId:{
        type: String
    },
    ProId:{
        type:String
    },
    Date:{
        type:Date
    },
    Type:{
        type:String
    },
    Fees:{
        type:Number
    },
    Status:{
        type:String
    }
})

module.exports = mongoose.model('payments', payments)
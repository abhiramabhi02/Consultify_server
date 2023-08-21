const mongoose = require('mongoose')

const appointments = mongoose.Schema({
    UserId:{
        type: String
    },
    ProId:{
        type:String
    },
    BookingDate:{
        type:Date
    },
    Date:{
        type:Date
    },
    Time:{
        type:String
    },
    Payment:{
        type:Number
    },
    Status:{
        type:String
    },
    Channel:{
        type:String
    },
    Docs:{
        type:String
    }
})

module.exports = mongoose.model('appointments', appointments)
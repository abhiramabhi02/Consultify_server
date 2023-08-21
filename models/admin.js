const mongoose = require('mongoose')

const admin = mongoose.Schema({
    Name:{
        type:String
    },
    Email:{
        type:String
    },
    Password:{
        type:String
    },
    Token:{
        type:String
    }
})

module.exports = mongoose.model("admin", admin)
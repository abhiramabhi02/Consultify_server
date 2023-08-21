const mongoose = require('mongoose')

const user = mongoose.Schema({
    Name:{
        type:String,
        required: true
    },
    Email:{
        type:String,
        required:true
    },
    Password:{
        type:String,
        required:true
    },
    Premium:{
        type:Boolean,
        default:'false'
    },
    Token:{
        type:String
    },
    Docs:{
        type:Array
    },
    Image:{
        type:String
    },
    Status:{
        type:String,
        default:'Active'
    },
    Verified:{
        type:Boolean,
        default:false
    }
})

module.exports = mongoose.model("user", user)
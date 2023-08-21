const mongoose = require('mongoose')

const professional = mongoose.Schema({
    Name:{
        type:String,
        required: true
    },
    Profession:{
        type: String,
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
    Token:{
        type:String,
        default: ''
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

module.exports = mongoose.model("professional", professional)
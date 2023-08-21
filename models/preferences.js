const mongoose = require('mongoose')

const preferences = mongoose.Schema({
    ProId:{
        type:String
    },
    Availability: {
        Sunday: { timeSlots: [String] },
        Monday: { timeSlots: [String] },
        Tuesday: { timeSlots: [String] },
        Wednesday: { timeSlots: [String] },
        Thursday: { timeSlots: [String] },
        Friday: { timeSlots: [String] },
        Saturday: { timeSlots: [String] }
      }
})

module.exports = mongoose.model('preferences', preferences)
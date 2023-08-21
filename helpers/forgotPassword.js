const Professional = require('../models/professionals')
const User = require('../models/users')

const forgotPassword = async (req,res)=>{
    try {
        const {email,password, role} = req.body

        if(role === 'user'){
            const user = await User.findOneAndUpdate({Email:email},
                {$set:{
                    Password:password
                }})

        }else{
            const professional = await Professional.findOneAndUpdate({Email:email},
                {$set:{
                    Password:password
                }})
        }

    } catch (error) {
        res.send({})
    }
}

module.exports = {
 forgotPassword   
}
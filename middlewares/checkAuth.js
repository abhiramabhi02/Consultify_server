const jwt = require('jsonwebtoken')
require('dotenv').config()

module.exports = (req,res,next)=>{
   try {   
   const token = req.header("Authorization")
    const decode = jwt.verify(token, process.env.jwtSecret)
    console.log('success');
    req.data = decode
    
    next()
   } catch (error) {
    console.log(error.message);
   }
}
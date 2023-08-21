const bcrypt = require("bcrypt");

const securePassword = async (password) => {
    try {
      const passwordHash = await bcrypt.hash(password, 10);
      return passwordHash;
    } catch (error) {
      console.log(error.message);
    }
  };

  const passwordMatch = async(dataPassword, password)=>{
   return await bcrypt.compare(dataPassword, password)
  }

  module.exports = {
    securePassword,
    passwordMatch
  }
const Login = require('../../schema/Employee/userSchema');


const userLogin = async(req,res) => {
    const { officeEmail, enterPassword } = req.body;
  try {
    const user = await Login.findOne({ officeEmail });
    if (!user) {
      return res.status(400).send('please enter valid office email');
    }
    if (enterPassword !== user.enterPassword) {
      return res.status(400).send('please enter valid password');
    }
    res.send({'Login successful': user});
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};



    

module.exports = {
    userLogin: userLogin,

  };
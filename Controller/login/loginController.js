const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const Login = require('../../schema/Employee/userSchema');


// const userLogin = async(req,res) => {
//     const { officeEmail, enterPassword } = req.body;
//   try {
//     const user = await Login.findOne({ officeEmail });
//     if (!user) {
//       return res.status(400).send('please enter valid office email');
//     }
//     if (enterPassword !== user.enterPassword) {
//       return res.status(400).send('please enter valid password');
//     }
//     res.send({'Login successful': user});
//   } catch (err) {
//     console.error(err);
//     res.status(500).send('Server error');
//   }
// };



const userLogin = async (req, res) => {
  const { officeEmail, enterPassword } = req.body;

  // Validate that both officeEmail and enterPassword are provided
  if (!officeEmail) {
    return res.status(400).json({ error: 'Email is required' });
  } if (!enterPassword){
    return res.status(401).json({ error: 'Password is required' });
  };

  try {
    const user = await Login.findOne({ officeEmail });
    if (!user) {
      return res.status(400).send('Please enter a valid office email');
    }
    // console.log(`Comparing passwords: ${enterPassword} with ${user.enterPassword}`);
    if (enterPassword !== user.enterPassword) {
      return res.status(401).json({ error: 'Invalid Credentials', details: 'Please enter a valid password' });
    }

    const token = jwt.sign(
      { _id: user._id, roleName: user.roleName }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1h' } 
    );

    // Set the token in an Http cookie only
    res.cookie('authToken', token, {
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'Strict', 
      maxAge: 3600000, 
    });
    
    res.send({ message: 'Login successful',token: token,
      user: {
          roleName: user.roleName,
          fullName: user.fullName,
          _id: user._id,
      }});
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};



    

module.exports = {
    userLogin: userLogin,

  };

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../../schema/Employee/userSchema'); 
const Role = require('../../schema/Employee/roleSchema');
const Dept = require('../../schema/Employee/departmentSchema');


//post api to add employee info
const createUser = async (req, res) => {
  try {
    // Check if the user with enterCode or officeEmail already exists
  const existingUser = await User.findOne({
    $or: [{ enterCode: req.body.enterCode }, { officeEmail: req.body.officeEmail }],
  });
  if (existingUser) {
    return res.status(400).json({ error: 'User already exists', details: 'Enter code or office email is already in use.' });
  }
  // Validate office email domain
  if (req.body.officeEmail && !req.body.officeEmail.endsWith('@bodhtree.com')) {
    return res.status(400).json({ error: 'Invalid office email', details: 'Office email must end with @bodhtree.com.' });
  }
  // Validate roleId ObjectId
  if (!mongoose.Types.ObjectId.isValid(req.body.roleId)) {
    return res.status(400).json({ error: 'Invalid ObjectId format for roleId' });
  }
  // Find the role by roleId
  const role = await Role.findById(req.body.roleId);
  if (!role) {
    return res.status(404).json({ error: 'Role not found' });
  }
    // const salt = await bcrypt.genSalt(10);
    // const hashedPassword = await bcrypt.hash(req.body.enterPassword, salt);
  // Create new user with roleName
  const newUser = new User({
    ...req.body,
    // enterPassword: hashedPassword,
    roleId: role.roleName ,
    department: req.body.department ? req.body.department.toLowerCase().replace(/[^a-z]/g, '') : undefined,
  });
  const savedUser = await newUser.save();
  // Respond with saved user
  return res.status(200).json(savedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
};

//getall user info exclude password
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}, '-enterPassword');
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
};

//get using _id
const getUser = async (req,res) => {
  try {
    const users = await User.findOne({}, '-enterPassword');
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
};


//post api to add roles for emp
const addRole = async(req,res) => {
  try {
    const { roleName } = req.body;
    const newRole = new Role({ roleName });
    await newRole.save();
    res.status(201).json(newRole);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
};


const getRoles = async(req,res) => {
  try {
    const roles = await Role.find();
    res.status(200).json(roles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
};

//post api to add department for emp
const createDept = async (req, res) => {
  try {
    const { departmentName } = req.body;
    const newDept = new Dept({
      department: departmentName ? departmentName.toLowerCase().replace(/[^a-z]/g, '') : undefined,
    });
    await newDept.save();
    res.status(201).json(newDept);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
};

const getAllDept = async(req,res) => {
  try {
    const dept = await Dept.find();
    res.status(200).json(dept);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
};

const updateEmp = async(req,res) => {
  const employeeId = req.params._id;
  const updateData = req.body;
  console.log(`Received update request for employee ID: ${employeeId}`);
  
  // Exclude fields that should not be updated
  const fieldsToExclude = ['officeEmail', 'enterCode', 'enterPassword'];

  fieldsToExclude.forEach(field => {
    if (updateData.hasOwnProperty(field)) {
      delete updateData[field];
    }
  });

  try {
    const existingEmployee = await User.findById(employeeId);

    if (!existingEmployee) {
      console.log('Employee not found');
      return res.status(404).send({ message: 'Employee not found' });
    }

    // Check if roleId is in the updateData
    if (updateData.roleId) {
      // Validate roleId ObjectId
      if (!mongoose.Types.ObjectId.isValid(updateData.roleId)) {
        return res.status(400).json({ error: 'Invalid ObjectId format for roleId' });
      }

      // Find the role by roleId
      const role = await Role.findById(updateData.roleId);
      if (!role) {
        return res.status(404).json({ error: 'Role not found' });
      }

      // Add roleName to updateData
      updateData.roleId =  role.roleName;
    }

    // Check if the update data is different from existing data
    const isDataSame = Object.keys(updateData).every(key => 
      updateData[key] === existingEmployee[key]?.toString()
    );

    if (isDataSame) {
      console.log('No changes in the update data');
      return res.status(200).send({ message: 'No changes were made. The data is already up to date.' });
    }

    const updatedEmployee = await User.findByIdAndUpdate(employeeId, updateData, { new: true });
    console.log('Update data:', updateData);
    res.status(200).send(updatedEmployee);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
};



module.exports = {
  createUser: createUser,
  getUsers: getUsers,
  getUser: getUser,
  addRole:addRole,
  getRoles:getRoles,
  createDept:createDept,
  getAllDept:getAllDept,
  updateEmp:updateEmp
};




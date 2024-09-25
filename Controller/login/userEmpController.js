
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../../schema/Employee/userSchema'); 
const Role = require('../../schema/Employee/roleSchema');
const Dept = require('../../schema/Employee/departmentSchema');
const Attendance = require('../../schema/Employee/attendenceSchema');
const UplodeImage = require('../../schema/Employee/userPhotoSchema');


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
  // if (!mongoose.Types.ObjectId.isValid(req.body.roleId)) {
  //   return res.status(400).json({ error: 'Invalid ObjectId format for roleId' });
  // }
  // Find the role by roleId
  // const role = await Role.findById(req.body.roleId);
  // if (!role) {
  //   return res.status(404).json({ error: 'Role not found' });
  // }
  //   // const salt = await bcrypt.genSalt(10);
    // const hashedPassword = await bcrypt.hash(req.body.enterPassword, salt);
  // Create new user with roleName
  const newUser = new User({
    ...req.body,
    // enterPassword: hashedPassword,
    // roleId: role.roleName ,
    roleName: req.body.roleName ? req.body.roleName.toLowerCase().replace(/[^a-z]/g, '') : undefined,
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
const getUser = async (req, res) => {
  try {
    // Extract _id from request parameters
    const userId = req.params.id;

    // Fetch the user by _id, excluding the 'enterPassword' field
    const user = await User.findById(userId, '-enterPassword');

    // Check if user exists
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Return the user data
    res.status(200).json(user);
  } catch (error) {
    console.error(error);

    // Return a 500 Internal Server Error with error details
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


// Helper function to format date to IST and in en-US locale

const formatToIST = (date) => {
  if (!date) return 'Not provided';

  // Convert date to IST
  const istDate = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));

  // Format the time in en-US locale
  return istDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
};

const getEmpByManager = async (req, res) => {
  const { managerId, startDate, endDate } = req.params;

  try {
    // Validate managerId
    if (!mongoose.Types.ObjectId.isValid(managerId)) {
      return res.status(400).json({ message: 'Invalid Manager ID' });
    }

    // Validate and parse dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: 'Invalid Date Range. Please use YYYY-MM-DD format.' });
    }

    // Find the manager
    const manager = await User.findById(managerId).select('fullName');
    if (!manager) {
      return res.status(404).json({ message: 'Manager not found' });
    }
    const managerFullName = manager.fullName;

    // Find employees reporting to the manager
    const employees = await User.find({ reportsTo: managerFullName })
      .select('fullName shiftTiming location availability')
      .lean();

    if (employees.length === 0) {
      return res.status(404).json({ message: `No employees found reporting to ${managerFullName}` });
    }

    // Fetch attendance data for the specified date range
    const attendanceRecords = await Attendance.find({
      userId: { $in: employees.map(emp => emp._id) },
      date: {
        $gte: start, // Start of the range
        $lt: end // End of the range (exclusive)
      }
    }).select('userId date signInTime signOutTime status').lean();

    // Combine employee data with attendance data by filtering based on date
    const employeesWithDetails = employees.map(employee => {
      // Filter attendance records by employee and date
      const attendanceForEmployee = attendanceRecords.filter(
        att => att.userId.toString() === employee._id.toString()
      );

      // Prepare attendance details for each day in the date range
      const attendanceDetails = [];
      let currentDate = new Date(start);
      
      while (currentDate <= end) {
        const attendanceRecord = attendanceForEmployee.find(
          att => new Date(att.date).toDateString() === currentDate.toDateString()
        );

        attendanceDetails.push({
          date: currentDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
          signInTiming: attendanceRecord
            ? attendanceRecord.signInTime
              ? formatToIST(new Date(attendanceRecord.signInTime))
              : 'Not provided'
            : 'Not provided',
          signOutTiming: attendanceRecord
            ? attendanceRecord.signOutTime
              ? formatToIST(new Date(attendanceRecord.signOutTime))
              : 'Not provided'
            : 'Not provided',
          status: attendanceRecord ? attendanceRecord.status : 'Not recorded',
        });

        // Move to the next day
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Convert shift timings array to IST
      const shiftTimingDetails = employee.shiftTiming && employee.shiftTiming.length
        ? employee.shiftTiming.map(shift => ({
            startTime:(shift.startTime),
            endTime:(shift.endTime),
          }))
        : [{ startTime: 'Not provided', endTime: 'Not provided' }];

      return {
        name: employee.fullName,
        shiftTiming: shiftTimingDetails,
        location: employee.location || 'Not provided',
        attendanceDetails
      };
    });

    // Send response with combined data
    res.status(200).json({
      message: `Employee information for ${managerFullName} from ${startDate} to ${endDate}`,
      managerName: managerFullName,
      employees: employeesWithDetails,
    });
  } catch (error) {
    console.error('Error fetching employee information:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};





//uplode user profile photo
const uplodePhoto = async(req,res)=>{
  const { userId } = req.params;

    try {
        // Validate the userId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid User ID' });
        }

        // Ensure the file was uploaded
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // get the fullName by userId
        const user = await User.findById(userId); 
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
        const fullName = user.fullName;
        // Store the file path in the database
        const newPhoto = new UplodeImage({
            userId: userId,
            photo: req.file.path 
        });

        await newPhoto.save();

        // Send a success response
        res.status(200).json({
          message: `${fullName}'s profile photo uploaded successfully`,
          filePath: req.file.path
        });

    } catch (error) {
        console.error('Error uploading profile picture:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
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
  updateEmp:updateEmp,
  getEmpByManager:getEmpByManager,
  uplodePhoto:uplodePhoto,
};




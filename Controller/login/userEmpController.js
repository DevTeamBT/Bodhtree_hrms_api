
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
const User = require('../../schema/Employee/userSchema'); 
const Role = require('../../schema/Employee/roleSchema');
const Dept = require('../../schema/Employee/departmentSchema');
const Attendance = require('../../schema/Employee/attendenceSchema');
const UplodeImage = require('../../schema/Employee/userPhotoSchema');


//post api to add employee info
const createUser = async (req, res) => {
  // res.header('Access-Control-Allow-Origin', req.headers.origin); // Set the origin dynamically
  // res.header('Access-Control-Allow-Credentials', 'true'); // Allow credentials (cookies, etc.)
  // Check if the JWT contains the role information 
  const userRole = req.user.roleName; 

  // Authorization check: Only allow userRole with admin
  if (userRole !== 'admin') {
    return res.status(403).json({ error: 'Only HR have permission to add employee records.' });
  }
  try {
    // Check the user with employeeNumber or officeEmail already exists
    const existingUser = await User.findOne({
      $or: [{ employeeNumber: req.body.employeeNumber }, { officeEmail: req.body.officeEmail }],
    });
    if (existingUser) {
      // Check which field is causing the conflict
      if (existingUser.employeeNumber === req.body.employeeNumber) {
        return res.status(404).json({
          error: 'Conflict: Enter code already in use',
          details: 'The enter code is already associated with an existing user.',
        });
      } else if (existingUser.officeEmail === req.body.officeEmail) {
        return res.status(401).json({
          error: 'Conflict: Office email already in use',
          details: 'The office email is already associated with an existing user.',
        });
      }
    }
  
    // Validate office email domain
    if (req.body.officeEmail && !req.body.officeEmail.endsWith('@bodhtree.com')) {
      return res.status(400).json({
        error: 'Invalid office email',
        details: 'Office email must end with @bodhtree.com.',
      });
    }
  
     // Validate and hash the password before saving
    //  const password = req.body.password;
    //  if (!password || password.length < 8) {
    //    return res.status(400).json({
    //      error: 'Invalid password',
    //      details: 'Password must be at least 8 characters long.',
    //    });
    //  }
     
     // Hash the password using bcrypt
    //  const hashedPassword = await bcrypt.hash(password, 10); // num is the salt rounds


    // Get dateOfJoining and probationPeriod from the request
    const dateOfJoining = new Date(req.body.dateOfJoining);
    const probationPeriod = req.body.probationPeriod || 90; //by default 30 days
  
    // Calculate the confirmation date by adding probationPeriod to the dateOfJoining
    const confirmationDate = new Date(dateOfJoining);
    confirmationDate.setDate(dateOfJoining.getDate() + probationPeriod);
  
    // Sanitize roleName and department
    const roleName = req.body.roleName
      ? req.body.roleName.toLowerCase().replace(/[^a-z]/g, '')
      : undefined;
    const department = req.body.department
      ? req.body.department.toLowerCase().replace(/[^a-z]/g, '')
      : undefined;
  
    // Create new user with calculated confirmation date
    const newUser = new User({
      ...req.body,
      password: hashedPassword, //save the hashed password
      roleName,
      department,
      dateOfJoining: dateOfJoining, // Save joining date as is
      confirmationDate: confirmationDate,  // Save the calculated confirmation date
    });
  
    const savedUser = await newUser.save();
  
    // Respond with the saved user data
    return res.status(200).json(savedUser);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Internal Server Error',
      details: error.message,
    });
  }
};

// getall user info exclude password
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}, '-enterPassword');
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
};

// const getUsers = async (req, res) => {
//   try {
//     // Fetch users from the database, excluding the 'enterPassword' field and populating the 'photo' reference
//     const users = await User.find({}, '-enterPassword').populate('photo');

//     // Process each user to construct the response data
//     const usersWithPhotos = await Promise.all(
//       users.map(async (user) => {
//         let photoPath = 'uploads/photo-default.png'; // Default path for photos

//         console.log(`User ID: ${user._id}, Photo Reference: ${user.photo}`);

//         // If the user has a photo reference
//         if (user.photo) {
//           const photo = await UplodeImage.findById(user.photo);
//           console.log(`Photo Found: ${JSON.stringify(photo)}`);

//           // If a photo is found, construct the photo path
//           if (photo && photo.photo) {
//             const filePath = photo.photo;
//             const absolutePath = path.join(__dirname, '../../uploads', filePath);

//             // Check if the photo file exists on the server
//             if (fs.existsSync(absolutePath)) {
//               // Construct the correct photo path with forward slashes for the URL
//               photoPath = filePath.replace(/\\/g, '/'); // Ensure correct format for web URLs
//             } else {
//               console.warn(`Photo file not found at path: ${absolutePath}`);
//             }
//           } else {
//             console.warn(`Photo not found for user: ${user._id}`);
//           }
//         } else {
//           console.warn(`User ${user._id} does not have a photo reference.`);
//         }

//         // Return the user data with the photoPath
//         return {
//           employeeNumber: user.employeeNumber,
//           fullName: user.fullName,
//           photoPath, // The final resolved photo path
//         };
//       })
//     );

//     // Return the constructed user data with their photo paths
//     res.status(200).json(usersWithPhotos);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Internal Server Error', details: error.message });
//   }
// };








//get using _id


const getUser = async (req, res) => {
  try {
    // Extract _id from request parameters
    const userId = req.params.id;

    // Fetch the user by _id, excluding the 'enterPassword' field
    const user = await User.findById(userId);

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

const updateEmp = async (req, res) => {
  const employeeId = req.params._id;  
  const updateData = req.body;        

  // Check if the JWT contains the role information 
  const userRole = req.user.roleName; 

  // Authorization check: Only allow userRole with admin
  if (userRole !== 'admin' && userRole !== 'admin') {
    return res.status(403).json({ error: 'Only HR have permission to update employee records.' });
  }

  console.log(`Received update request for employee ID: ${employeeId.fullName}`);

  try {
    // Fetch the existing employee record
    const existingEmployee = await User.findById(employeeId);

    // Check if the employee exists
    if (!existingEmployee) {
      console.log('Employee not found');
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Update only the fields present in the request body (Partial update)
    Object.keys(updateData).forEach((key) => {
      existingEmployee[key] = updateData[key];
    });

    // Save the updated employee record
    const updatedEmployee = await existingEmployee.save();

    // Return the updated employee information as a response
    res.status(200).json({
      message: 'Employee record updated successfully',
      updatedEmployee,
    });
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
            return res.status(401).json({ message: 'No file uploaded' });
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

const getUserProfile = async(req,res) =>{
  try {
    const photos = await UplodeImage.find();  
    if (photos.length === 0) {
      return res.status(404).json({ message: 'No photos found.' });
    }
    res.status(200).json(photos); 
  } catch (error) {
    console.error('Error retrieving profile pictures:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

const getSinglePhoto = async (req, res) => {
  const { photId } = req.params;

  try {
    // Check if photId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(photId)) {
      return res.status(400).json({ message: 'Invalid photo ID format.' });
    }

    // Find the photo by its _id
    const photo = await UplodeImage.findOne({ _id: photId });

    if (!photo) {
      return res.status(404).json({ message: 'No photo found.' });
    }

    // Get the file path of the image
    const filePath = photo.photo;

    // Check if filePath is valid
    if (!filePath) {
      return res.status(400).json({ message: 'File path not found for this photo.' });
    }

    // Construct the absolute path to the image
    const absolutePath = path.join(__dirname, '../../uploads', path.basename(filePath));

    // Send the image file as a response
    res.sendFile(absolutePath);
  } catch (error) {
    console.error('Error retrieving profile picture:', error);
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
  getUserProfile:getUserProfile,
  getSinglePhoto:getSinglePhoto
};




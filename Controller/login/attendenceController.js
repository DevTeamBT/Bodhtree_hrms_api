const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const Attendence = require('../../schema/Employee/attendenceSchema');
const User = require('../../schema/Employee/userSchema');
const Leave = require('../../schema/Employee/leaveSchema');
const moment = require('moment'); 
const jwt = require('jsonwebtoken');

// const formatToISTWithAmPm = (utcDate) => {
//   const istDate = new Date(utcDate);
//   istDate.setHours(istDate.getHours() + 5, istDate.getMinutes() + 30); // Convert to IST
//   const hours = istDate.getHours();
//   const minutes = istDate.getMinutes().toString().padStart(2, '0');
//   const ampm = hours >= 12 ? 'PM' : 'AM';
//   const formattedHours = hours % 12 || 12; // Converts '0' hour to '12'
//   return `${formattedHours}:${minutes} ${ampm}`;
// };

//Api for SignIn session
const signIn = async (req, res) => {
  try {
    const { userId, status } = req.body;

    // Extract token from the Authorization header
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    let decoded;
    try {
      // Verify the token
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
    // Check if the userId in the token matches the provided userId
    if (!decoded || decoded._id !== userId) {
      return res.status(401).json({ error: 'Unauthorized: Token does not match user' });
    }

    // Additional validations and logic
    if (!userId || !status) {
      return res.status(400).json({ error: 'User ID and status are required' });
    }

    const validStatuses = ['inOffice', 'inClientLocation', 'workFromHome'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status value. Allowed values are: ${validStatuses.join(', ')}` });
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // Check if a sign-in record exists for today
    let attendance = await Attendence.findOne({
      userId,
      date: todayStart,
    });

    const currentISOTime = new Date().toISOString();

    if (attendance) {
      if (attendance.signOutTime) {
        attendance.signInTime = currentISOTime;
        attendance.signOutTime = null; // Clear Time for a new session
        attendance.status = status;
      } else {
        return res.status(400).json({ error: 'Already signed in for today' });
      }
    } else {
      attendance = new Attendence({
        userId,
        date: todayStart,
        signInTime: currentISOTime,
        status,
      });
    }

    await attendance.save();

    const populatedAttendance = await Attendence.findById(attendance._id)
      .populate({ path: 'userId', select: 'fullName' })
      .select('-signOutTime')
      .exec();

    res.status(201).json({message: 'successful signIn', populatedAttendance});
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
};

//Api for SignOut session
const signOut = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // Find today's record for the user with an active sign-in
    const attendance = await Attendence.findOne({
      userId,
      date: todayStart,
      signOutTime: null,
    });

    if (!attendance) {
      return res.status(400).json({ error: 'You need to sign in before signing out' });
    }

    // Set signOutTime to current time
    attendance.signOutTime = new Date().toISOString();

    // Calculate total hours worked for the day
    const totalTimeInMs = new Date(attendance.signOutTime) - new Date(attendance.signInTime);
    const totalHoursWorked = (totalTimeInMs / (1000 * 60 * 60)).toFixed(2);
    attendance.workingHours = totalHoursWorked;

    await attendance.save();

    const populatedAttendance = await Attendence.findById(attendance._id)
      .populate({ path: 'userId', select: 'fullName' })
      .exec();

    res.status(200).json({
      message: 'Sign-out successful',
      attendance: populatedAttendance,
      totalHoursWorked,
    });
  } catch (error) {
    console.error('Error occurred during sign-out:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
};


const applyLeave = async (req, res) => {
  try {
    const { userId, leaveType, startDate, endDate, reason } = req.body;

    // Fetch user details, including leaveBalance
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check leave balance and deduct if enough balance is available
    let remainingLeaveBalance;
    if (leaveType === 'annualLeave' && user.leaveBalance.annualLeave < 1) {
      return res.status(400).json({ message: 'Insufficient annual leave balance' });
    } else if (leaveType === 'casualLeave' && user.leaveBalance.casualLeave < 1) {
      return res.status(400).json({ message: 'Insufficient casual leave balance' });
    } else if (leaveType === 'sickLeave' && user.leaveBalance.sickLeave < 1) {
      return res.status(400).json({ message: 'Insufficient sick leave balance' });
    } else if (leaveType === 'maternityLeave' && user.leaveBalance.maternityLeave < 1) {
      return res.status(400).json({ message: 'Insufficient maternity leave balance' });
    } else if (leaveType === 'paternityLeave' && user.leaveBalance.paternityLeave < 1) {
      return res.status(400).json({ message: 'Insufficient paternity leave balance' });
    }

    // Deduct leave from the corresponding leave balance
    if (leaveType === 'annualLeave') {
      user.leaveBalance.annualLeave -= 1;
      remainingLeaveBalance = user.leaveBalance.annualLeave;
    } else if (leaveType === 'casualLeave') {
      user.leaveBalance.casualLeave -= 1;
      remainingLeaveBalance = user.leaveBalance.casualLeave;
    } else if (leaveType === 'sickLeave') {
      user.leaveBalance.sickLeave -= 1;
      remainingLeaveBalance = user.leaveBalance.sickLeave;
    } else if (leaveType === 'maternityLeave') {
      user.leaveBalance.maternityLeave -= 1;
      remainingLeaveBalance = user.leaveBalance.maternityLeave;
    } else if (leaveType === 'paternityLeave') {
      user.leaveBalance.paternityLeave -= 1;
      remainingLeaveBalance = user.leaveBalance.paternityLeave;
    }

    // Save the updated leave balance
    await user.save();

    // Create the new leave application
    const newLeave = new Leave({
      userId,
      leaveType,
      startDate,
      endDate,
      reason,
      status: 'pending', 
      appliedDate: new Date()
    });

    // Save the leave application
    await newLeave.save();

    // Return the success response with updated leave balance
    return res.status(201).json({
      success: true,
      message: 'Leave applied successfully',
      leave: newLeave,
      remainingLeaveBalance,  
      fullLeaveBalance: user.leaveBalance  
    });
  } catch (error) {
    console.error('Error occurred during leave application:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
};


//Get all Employees Attendence
const getAttendences = async(req,res) =>{
  try {
    // Fetch attendance records and populate related employee info
    const attendanceRecords = await Attendence.find()
      .populate('userId', 'fullName reportsTo')  
      .lean();  

    // Calculate working hours for each attendance record
    attendanceRecords.forEach(record => {
      // Check if userId is populated
      if (record.userId) {
        // If userId exists, set fullName
        record.fullName = record.userId.fullName;
      } else {
        // If userId is null, set fullName to a default value
        record.fullName = 'User not found';
      }

      if (record.signInTime && record.signOutTime) {
        const signIn = new Date(record.signInTime);
        const signOut = new Date(record.signOutTime);
        const diff = signOut - signIn;  
        // Round total hours to the nearest whole number
        record.workingHours = Math.round(diff / (1000 * 60 * 60)); 
      } else {
        record.workingHours = 0; 
      }
    });

    // Return the processed attendance records with full name included
    res.status(200).json({message:'get all attendance records with Names', attendanceRecords});
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
};

//adding leaves for employees
const addLeaves = async (req, res) => {
  try {
    // Verify if req.user exists
    if (!req.user || !req.user.roleName) {
      return res.status(403).json({ message: 'Unauthorized access: User role is not available.' });
    }

    // Verify HR/admin access
    if (req.user.roleName !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Only HR can add leaves.' });
    }

    // Request body for leave counts to be added
    const { casualLeave, sickLeave, annualLeave, maternityLeave, paternityLeave } = req.body;

    // Fetch all employees
    const employees = await User.find({ active: true });

    // Update each employee's leave balance conditionally
    const updatePromises = employees.map(async (employee) => {
      if (employee.status === 'probation') {
        // Employee is on probation, only add casual leave
        employee.leaveBalance.casualLeave += 1; 
      } else {
        // Employee is not on probation, add 1.5 annual leave
        employee.leaveBalance.annualLeave += 1.5; 
      }

      // Optionally, add other leave types from the request body
      employee.leaveBalance.casualLeave += casualLeave || 0;
      employee.leaveBalance.sickLeave += sickLeave || 0;
      employee.leaveBalance.maternityLeave += maternityLeave || 0;
      employee.leaveBalance.paternityLeave += paternityLeave || 0;

      // Save the updated employee document
      return employee.save();
    });

    // Wait for all the updates to complete
    await Promise.all(updatePromises);

    // Send success response
    res.status(200).json({
      success: true,
      message: 'Leave balance updated for all employees',
      leavesAdded: { casualLeave, sickLeave, annualLeave, maternityLeave, paternityLeave }
    });
  } catch (error) {
    console.error('Error adding leaves:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
};

// Schedule task to run on the 1st of every month at midnight
cron.schedule('0 0 1 * *', async () => {
  console.log('Adding monthly leaves...');
  try {
    const casualLeave = 0, sickLeave = 0, annualLeave = 1.5;
    const employees = await User.find({ active: true });

    const updatePromises = employees.map(async (employee) => {
      employee.leaveBalance.casualLeave += casualLeave;
      employee.leaveBalance.sickLeave += sickLeave;
      employee.leaveBalance.annualLeave += annualLeave;

      return employee.save();
    });

    await Promise.all(updatePromises);

    console.log('Monthly leaves added successfully');
  } catch (error) {
    console.error('Error adding monthly leaves:', error);
  }
});


//get all employees pending leaves
const getAllLeaves = async(req,res)=>{
  try {
    // Fetch all active employees
    const employees = await User.find({ active: true });

    // Map the employees to create an array of objects with fullName and leave balances
    const leaveData = employees.map(employee => ({
      fullName: employee.fullName,
      leaveBalance: employee.leaveBalance
    }));

    // Send the leave data as the response
    res.status(200).json({
      message:'get all leaves of employees',
      success: true,
      data: leaveData
    });
  } catch (error) {
    console.error('Error fetching leaves and full names:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
};


//Get One Employee Attendence by objectID
const getAttendenceById = async(req,res) => {
  const { id } = req.params;
    try {
      // Fetch attendance record by ID and populate related employee info
      const attendanceRecord = await Attendence.findById(id)
        .populate('userId', 'fullName reportsTo', { _id: 0 })  
        .lean();

      if (!attendanceRecord) {
        return res.status(404).json({ message: 'Attendance record not found' });
      }

      // Set `fullName` and calculate `workingHours`
      if (attendanceRecord.userId) {
        // If `userId` exists, set `fullName`
        attendanceRecord.fullName = attendanceRecord.userId.fullName;
      } else {
        // If `userId` is null, set `fullName` to a default value
        attendanceRecord.fullName = 'User not found';
      }

      if (attendanceRecord.signInTime && attendanceRecord.signOutTime) {
        const signIn = new Date(attendanceRecord.signInTime);
        const signOut = new Date(attendanceRecord.signOutTime);
        const diff = signOut - signIn;
        // Round total hours to the nearest whole number
        attendanceRecord.workingHours = Math.round(diff / (1000 * 60 * 60));
      } else {
        attendanceRecord.workingHours = 0;
      }
      // Optionally clear `userId` if not needed in the response
      delete attendanceRecord.userId._id;
      // Return the processed attendance record with `fullName` and `workingHours`
      res.status(200).json({message:'get single attendance',attendanceRecord});
    } catch (error) {
      console.error('Error fetching attendance:', error);
      res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
  };


    

module.exports={
    signIn:signIn,
    signOut:signOut,
    applyLeave:applyLeave,
    getAttendences:getAttendences,
    addLeaves:addLeaves,
    getAllLeaves:getAllLeaves,
    getAttendenceById,
}
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const Attendence = require('../../schema/Employee/attendenceSchema');
const User = require('../../schema/Employee/userSchema');
const Leave = require('../../schema/Employee/leaveSchema');


const signIn = async (req, res) => {
  try {
    const { userId, status } = req.body;

    // Check if userId and status are provided
    if (!userId || !status) {
      return res.status(400).json({ error: 'User ID and status are required' });
    }

    // Validate the status value
    const validStatuses = ['inOffice', 'inClientLocation', 'workFromHome'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status value. Allowed values are: ${validStatuses.join(', ')}` });
    }

    // Get the current time in ISO format
    const currentISOTime = new Date().toISOString();

    // Check if there's already an attendance record for today
    let attendance = await Attendence.findOne({
      userId,
      date: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)) // Start of the day
      }
    });

    if (!attendance) {
      // If no attendance record for today, create a new one
      attendance = new Attendence({
        userId,
        date: currentISOTime, // Set the current date
        signInTime: currentISOTime, // Set sign-in time to the current time
        status
      });
    } 
    else {
      // If the user has already signed in today
      if (attendance.signInTime && !attendance.signOutTime) {
        return res.status(400).json({ error: 'Already signed in today.' });
      }
      // Update sign-in time if it was not set previously
      attendance.signInTime = currentISOTime;
      attendance.status = status; // Update status as well
    }

    // Save the attendance record
    await attendance.save();

    // Return the populated attendance record with the user's full name, excluding signOutTime
    const populatedAttendance = await Attendence.findById(attendance._id)
      .populate({ path: 'userId', select: 'fullName' })
      .select('-signOutTime') // Exclude signOutTime from the response
      .exec();

    res.status(201).json(populatedAttendance);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
};


const signOut = async (req, res) => {
  try {
    const { userId } = req.body;

    // Check if userId is provided
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Find the most recent attendance record for today
    const todayStart = new Date().setHours(0, 0, 0, 0); // Start of the day
    let attendance = await Attendence.findOne({
      userId,
      date: { $gte: new Date(todayStart) }
    }).sort({ signInTime: 1 }).limit(4); // Sort by latest sign-in time

    // Check if attendance record exists for today
    if (!attendance) {
      return res.status(400).json({ error: 'No attendance record found for today' });
    }

    // Check if the user has signed in
    if (!attendance.signInTime) {
      return res.status(400).json({ error: 'You need to sign in before signing out' });
    }

    // Check if the user has already signed out for this sign-in
    if (attendance.signOutTime) {
      return res.status(401).json({ error: 'Already signed out for the latest sign-in today' });
    }

    // Set the current time as signOutTime
    attendance.signOutTime = new Date();
    await attendance.save();

    // Calculate the total hours worked (signOutTime - signInTime)
    const totalTimeInMs = attendance.signOutTime - attendance.signInTime;
    const totalHoursWorked = totalTimeInMs / (1000 * 60 * 60); // Convert milliseconds to hours

    // Populate the user's full name
    const populatedAttendance = await Attendence.findById(attendance._id)
      .populate({ path: 'userId', select: 'fullName' })
      .exec();

    // Respond with the attendance data and total hours worked
    res.status(200).json({
      message: 'Sign-out successful',
      attendance: populatedAttendance,
      totalHoursWorked
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






const getAttendences = async(req,res) =>{
  try {
    // Fetch attendance records and populate related employee info
    const attendanceRecords = await Attendence.find()
      .populate('userId', 'fullName reportsTo')  
      .lean();  

    // Calculate working hours for each attendance record
    attendanceRecords.forEach(record => {
      if (record.signInTime && record.signOutTime) {
        const signIn = new Date(record.signInTime);
        const signOut = new Date(record.signOutTime);
        const diff = signOut - signIn;  
        record.workingHours = (diff / (1000 * 60 * 60)).toFixed(2); 
      } else {
        record.workingHours = 0; 
      }
    });

    // Return the processed attendance records
    res.status(200).json(attendanceRecords);
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
      success: true,
      data: leaveData
    });
  } catch (error) {
    console.error('Error fetching leaves and full names:', error);
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
}
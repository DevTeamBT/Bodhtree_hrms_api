const mongoose = require('mongoose');
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



const applyLeave = async(req,res) =>{
  try {
    const { userId, leaveType, startDate, endDate, reason } = req.body;

    // Fetch user details, including fullName
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const fullName = user.fullName;

    // Create the new leave application
    const newLeave = new Leave({
      userId,
      leaveType,
      startDate,
      endDate,
      reason,
      status: 'pending',  // Default status if not provided
      appliedDate: new Date()  // Optional: Add appliedDate field if needed
    });

    // Save the leave application
    await newLeave.save();

    // Return the success response with fullName
    return res.status(201).json({
      success: true,
      message: 'Leave applied successfully',
      leave: newLeave,
      status: 'pending',  
      fullName: fullName
    });
  } catch (error) {
    console.error('Error occurred during sign-out:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
    

module.exports={
    signIn:signIn,
    signOut:signOut,
    applyLeave:applyLeave
}
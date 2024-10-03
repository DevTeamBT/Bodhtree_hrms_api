const { boolean } = require('joi');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: {type:"string", required: true},
  reportsTo: {type:"string"},
  designation: {type:"string", required: true},
  department: {type: mongoose.Schema.Types.String, ref:'empDepartment', required: true},
  attendance: { type: mongoose.Schema.Types.ObjectId, ref: 'Attendance' },
  bloodGroup: {type:"string"},
  dateOfJoining: {type: "string"},
  dateOfBirth: {type: "string"},
  workType: {type:"string"},
  annual_ctc: {type: "string"},
  officeEmail: {type:"string" , required: true, unique: true},
  otp: { type: String, validate: { validator: function(v) { return /^\d{6}$/.test(v); },message: props => `${props.value} is not a valid OTP!`},
  createdAt: {
    type: Date,
    default: Date.now, expires:900}
  },
  workLocation: {type:"string"},
  mobileNo: { type: Number, validate: { validator: function(v) { return /^\d{10}$/.test(v);},message: props => `${props.value} is not a valid 10-digit mobile number!`}},
  personal_Email: {type:"string"},
  gender: {type:"string"},
  native: {type:"string"},
  address: {type:"string"},
  employeeNumber: {type:"string",required: true},
  enterseries: {type: "string", unique: true,},
  enterPassword: {type:"string", required: true, unique: true},
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  // roleId: {type: mongoose.Schema.Types.String, ref:'empRole', required: true},
  roleName:{type: "string"},
  leaveBalance: {
    annualLeave: { type: Number, default: 0 },
    casualLeave: { type: Number, default: 0 },
    sickLeave: { type: Number, default: 0 },
    maternityLeave: { type: Number, default: 0 },
    paternityLeave: { type: Number, default: 0 }
  },
  photo: {type: "string"},
  probationPeriod: {type: Number, default: 90},
  confirmationDate: {type: "string"},
  aadharNumber : {type: "string"},
  emergencyContactNumber: {type: "string"},
  fathersName : {type: "string"},
  status : {type: "string"},
  spouseName: {type: "string"},
  maritalStatus:{type: "string"},
  division :{type: "string"},
  costCenter:{type: "string"},
  physicalChallenged:{type: "string"},
  nationality:{type: "string"},
  grade :{type: "string"},
  location:{type: "string"},
  company:{type: "string"},
  shift:{type: "string"},
  holidayCategory:{type: "string"},
  emergencyContactNumber:{type: "string"},
  emergencyContactName:{type: "string"},
  panNumber:{type: "string"},
  pfNumber:{type: "string"},
  uanNumber:{type: "string"},
  paymentType:{type: "string"},
  bankAccountNumber:{type:"string"},
  bankIfscCode:{type: "string"},
  shiftTiming:[{
    startTime:{type: "string"},
    endTime:{type: "string"},
  }
  ],
  active:{type: Boolean, required: true},
  reasonToResign:{type: String},
});

const User = mongoose.model('User', userSchema);

module.exports = User;

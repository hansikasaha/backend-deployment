import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import { User } from "../models/userSchema.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import { generateToken } from "../utils/jwtToken.js";
import cloudinary from "cloudinary";


/////////// 1. Patient Register
export const patientRegister = catchAsyncErrors(async (req, res, next) => {
  const { 
    firstName,
    lastName, 
    email,
    phone,
    password,
    gender,
    dob, 
    nic, 
    role 
  } = req.body;

 // if any of the above missing
  if (
    !firstName ||
    !lastName ||
    !email ||
    !phone ||
    !password ||
    !gender ||
    !dob ||
    !nic ||
    !role
  ) {

    return next(new ErrorHandler("Please Fill Full Form!", 400));
  }

  let user = await User.findOne({ email });
  if (user) {
    return next(new ErrorHandler("User already Registered!", 400));
  }

  user = await User.create({
    firstName,
    lastName,
    email,
    phone,
    password,
    gender,
    dob,
    nic,
    role: "Patient",
  });
//using the function make the code more modular and reusable
  generateToken(user, "User Registered!", 200, res);

  // res.status(200).json({       //using the res object from a Express server to send a JSON response with a status code of 200 (which indicates a successful request)
  //   success: true,
  //   message: "user Registered!",
  // });

});


////////               2. NOW CREATING LOGIN FUNCTION         ///////////////////
export const login = catchAsyncErrors(async (req, res, next) => {
  const { email, password, confirmPassword, role } = req.body; //destructure

  if (!email || !password || !confirmPassword || !role) {
    return next(new ErrorHandler("Please Provide All Details!", 400));
  }
  if (password !== confirmPassword) {
    return next(
      new ErrorHandler("Password & Confirm Password Do Not Match!", 400));
  }
  //now we check if user already exists in database or not

  const user = await User.findOne({ email }).select("+password");
// mongoose gives you findone
  //finds a user in the database with a specified email and includes the password field in the result. 
  //The await keyword is used to wait for the findOne() method to return the result before continuing execution.
  // The select("+password") method is used to explicitly include the password field in the result.
// +  string
  if (!user) {
    return next(new ErrorHandler("Invalid Email Or Password!", 400));
  }
  
  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    return next(new ErrorHandler("Invalid Email Or Password!", 400));
  }
  if (role !== user.role) {
    return next(new ErrorHandler(`User Not Found With This Role!`, 400));
  }
  generateToken(user, "User Login Successfully!", 200, res);
});





////////////        3.  NEW FUNCTION FOR ADDING NEW ADMIN        //////////

export const addNewAdmin = catchAsyncErrors(async (req, res, next) => {
  const {
    firstName,
    lastName, 
    email,
    phone,
    password,
    gender,
    dob, 
    nic, 

  } = req.body;
  if (
    !firstName ||
    !lastName ||
    !email ||
    !phone ||
    !password ||
    !gender ||
    !dob ||
    !nic 
  ) {

    return next(new ErrorHandler("Please Fill Full Form!", 400));
  }

  const isRegistered = await User.findOne({ email });
  if (isRegistered) {
    return next(new ErrorHandler(`${isRegistered.role}  With This Email Already Exists!`));
  }
  // IF PREVIOUSLY NOT FOUND THEN WE CREATE NEW ADMIN

  const admin = await User.create({
    firstName,
    lastName,
    email,
    phone,
    password,
    gender,
    dob,
    nic,
    role: "Admin",
  });

  res.status(200).json({
    success: true,
    message: "New Admin Registered!",
    admin,
  });
});

////////////           4. Function for getting all doctors          ////////////
export const getAllDoctors = catchAsyncErrors(async (req, res, next) => {
  const doctors = await User.find({ role: "Doctor" });
  res.status(200).json({
    success: true,
    doctors,
  });
});

////////////          5. Function for getting all user details      ////////////////
export const getUserDetails = catchAsyncErrors(async (req, res, next) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    user,
  });
});


 ////////////            6.Logout function for dashboard admin        ///////////////////
 export const logoutAdmin = catchAsyncErrors(async (req, res, next) => {
  res
    .status(200)
    .cookie("adminToken", "", {      //It sets a cookie named adminToken with an empty value 
      httpOnly: true,                   //and an expiration date set to the current time, effectively deleting the cookie.
      expires: new Date(Date.now()),
      secure: true,
      sameSite: "None",
    })
    .json({
      success: true,
      message: "Admin Logged Out Successfully.",
    });
});



//////////////           7. Logout function for  patient                  /////////////////////
export const logoutPatient = catchAsyncErrors(async (req, res, next) => {
  res
    .status(201)
    .cookie("patientToken", "", {
      httpOnly: true,
      expires: new Date(Date.now()),
      secure: true,
      sameSite: "None",
    })
    .json({
      success: true,
      message: "Patient Logged Out Successfully.",
    });
});



//////////////////                8.FUCNTION for ADDING NEW DOC                 ///////////////////////
export const addNewDoctor = catchAsyncErrors(async (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(new ErrorHandler("Doctor Avatar Required!", 400));
  }

  const { docAvatar } = req.files;
  const allowedFormats = ["image/png", "image/jpeg", "image/webp"];
  if (!allowedFormats.includes(docAvatar.mimetype)) {
    //mimetype  means matching extension format
    return next(new ErrorHandler("File Format Not Supported!", 400));
  }
  const {
    firstName,
    lastName,
    email,
    phone,
    password,
    gender,
    dob,
    nic,
    doctorDepartment,
  } = req.body;

  if (
    !firstName ||
    !lastName ||
    !email ||
    !phone ||
    !password ||
    !gender ||
    !dob ||
    !nic ||
    !doctorDepartment ||
    !docAvatar
  ) {
    return next(new ErrorHandler("Please Fill Full Form!", 400));
  }

          //if all data provided  then we find user and if it already exists
  const isRegistered = await User.findOne({ email });
  if (isRegistered) {
    return next(
      new ErrorHandler(`${isRegistered.role} already registered with this email`, 400)
    );
  }


  ///////////////        9. Posting image in cloudinary  //
  const cloudinaryResponse = await cloudinary.uploader.upload(
    docAvatar.tempFilePath
  );
  if (!cloudinaryResponse || cloudinaryResponse.error) {
    console.error(
      "Cloudinary Error:",
      cloudinaryResponse.error || "Unknown Cloudinary error"
    );
    return next(
      new ErrorHandler("Failed To Upload Doctor Avatar To Cloudinary", 500)
    );
  }


  const doctor = await User.create({
    firstName,
    lastName,
    email,
    phone,
    password,
    gender,
    dob,
    nic,
    doctorDepartment,
    role: "Doctor",
    docAvatar: {
      public_id: cloudinaryResponse.public_id,
      url: cloudinaryResponse.secure_url,
    },
  });
  res.status(200).json({
    success: true,
    message: "New Doctor Registered",
    doctor,
  });
});











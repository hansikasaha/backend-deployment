import { User } from "../models/userSchema.js";
import { catchAsyncErrors } from "./catchAsyncErrors.js";
import  ErrorHandler from "./errorMiddleware.js";
import jwt from "jsonwebtoken";

//Middleware to authenticate dashboard users 

//1.retrieve token from cookies
//check for token presence ==>valid token
//verifyy the token using secret key and decoded to fetch user by id and to get role
//if role admin it is authorised




















//******************************************** */




export const isAdminAuthenticated = catchAsyncErrors(
  async (req, res, next) => {
    const token = req.cookies.adminToken;
    // it first retrieves the value of the "adminToken" cookie from the request object "req.cookies.adminToken" and stores it in a variable called "token".
    if (!token) {
      return next(
        new ErrorHandler("Admin Not Authenticated!", 400)
      );//The function checks if the adminToken cookie is present and, if not, throws an error.
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = await User.findById(decoded.id);
    //why id??
    //fetching the user data associated with the ID extracted from the decoded JWT token
    //Allows access to the user details, including their role
    //error 403- forbidden

    if (req.user.role !== "Admin") {
      return next(
        new ErrorHandler(`${req.user.role} not authorized for this resource!`, 403)
      );
    }
    next();
  }
);
//this ensures that even if the token is valid, only users with the proper role can access the resource.

//********************************************** */

// Middleware to authenticate frontend users
export const isPatientAuthenticated = catchAsyncErrors(
  async (req, res, next) => {
    const token = req.cookies.patientToken;
    if (!token) {
      return next(new ErrorHandler("Patient Not Authenticated!", 400));
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = await User.findById(decoded.id);
    if (req.user.role !== "Patient") {
      return next(
        new ErrorHandler(`${req.user.role} not authorized for this resource!`, 403)
      );
    }
    next();
  }
);

export const isAuthorized = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(
          `${req.user.role} not allowed to access this resource!`
        )
      );
    }
    next();
  };
};
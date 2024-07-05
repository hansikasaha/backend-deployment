import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    minLength: [3, "First Name Must Contain At Least 3 Characters!"],
  },
  lastName: {
    type: String,
    required: true, 
    minLength: [3, "Last Name Must Contain At Least 3 Characters!"],
  },
  email: {
    type: String,
    required: true, 
    validate: [validator.isEmail, "Provide A Valid Email!"],
  },
  phone: {
    type: String,
    required: true, 
    minLength: [10, "Phone Number Must Contain Exact 10 Digits!"],
    maxLength: [10, "Phone Number Must Contain Exact 10 Digits!"],
  },
  nic: {
    type: String,
    required: true, 
    minLength: [5, "NIC Must Contain Only 5 Digits!"],
    maxLength: [5, "NIC Must Contain Only 5 Digits!"],
  },
  dob: {
    type: Date,
    required: true, 
  },

  gender: {
    type: String,
    required: true,
    enum: ["Male", "Female","Other"], //the values which will be accepted
  },
  password: {
    type: String,
    required: true, 
    minLength: [8, "Password Must Contain At Least 8 Characters!"],
    select: false,// false becasue when we will get any user ...we will recieve all the details but not the password
  },
  role: {
    type: String,
    required: true, 
    enum: ["Patient", "Doctor", "Admin"],
  },
  doctorDepartment:{
    type: String,
  },
  docAvatar: {
    public_id: String,
    url: String,
  },
});
            // methods need to be created
           //so that as soon as he registers it shows 
          //or if apssword is updated

         //when user registers or update details
         //new password stored in hash form for security

 userSchema.pre("save", async function (next) {
   if (!this.isModified("password")) {
    next();
   }
   
   this.password = await bcrypt.hash(this.password, 10);  //why 10?- sort number
 });

// //
 userSchema.methods.comparePassword = async function (enteredPassword) {
   return await bcrypt.compare(enteredPassword, this.password);
 };
 //this method allows you to verify if a password entered by a user matches the encrypted password stored in the database for a specific user.

userSchema.methods.generateJsonWebToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};



//This method generates a JSON Web Token (JWT) using the user's ID as the payload, the JWT_SECRET_KEY from the environment variables as the secret key, and the JWT_EXPIRES from the environment variables as the expiration time for the token.
// The jwt.sign() function from the jsonwebtoken library is used to create the JWT with the specified payload, secret key, and expiration time.
// Finally, the generated JWT is returned by the method.

//This JWT can be used for authentication and authorization purposes in a Node.js application.




export const User = mongoose.model("User", userSchema);






//This code snippet is for defining a user schema using Mongoose, a Node.js ODM for MongoDB. The schema includes fields such as firstName, lastName, email, phone, nic, dob, gender, password, role, doctorDepartment, and docAvatar. Each field has specific validation rules set using mongoose's schema options.

// - firstName, lastName, email, phone, nic, dob, gender, password, role are required fields with specific validation criteria like minimum length, email format, etc.
// - gender field should be either "Male" or "Female" according to the enum constraint.
// - password field is hashed using bcrypt before saving to the database.
// - There are methods defined on the schema for comparing passwords and generating JSON web tokens (JWT) for authentication purposes.
// - A pre-save hook is used to hash the password before saving to the database.
// - The User model is exported for use in other parts of the application.

// Overall, this code sets up a schema for user data in a MongoDB database, including validation rules and encryption for sensitive data like passwords. It also provides methods for password validation and JWT token generation for user authentication.

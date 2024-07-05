class ErrorHandler extends Error{
    constructor(message,statusCode){
        super(message);
        this.statusCode = statusCode;
    }
}
//class is used instead of function becasuse in javascript there is a class error which is not depriciated


export const errorMiddleware =(err, req, res, next) => {
    err.message = err.message || "Internal Server Error";
    err.statusCode = err.statusCode || 500;
    //if err status code doesnot exist then send 500

    if (err.code === 11000) {
        const message = `Duplicate ${Object.keys(err.keyValue)} Entered`,
          err = new ErrorHandler(message, 400);
      }
      //11000 comes from database when same values occurs for eg : 1 email can be used only by 1 user

      if (err.name === "JsonWebTokenError") {
        const message = `Json Web Token is invalid, Try again!`;
        err = new ErrorHandler(message, 400);
      }
      if (err.name === "JsonWebExpiredError") {
        const message = `Json Web Token is Expired, Try again!`;
        err = new ErrorHandler(message, 400);
      }
      if (err.name === "CastError") {  //occurs when input type is string and you put number
        const message = `Invalid ${err.path}`,
          err = new ErrorHandler(message, 400);
      }

// to make sure only the message in error gets displayed and no extra terms like validation failed etc comes 
      const errorMessage = err.errors  //if exist
    ? Object.values(err.errors)
        .map((error) => error.message)
        .join(" ")
    : err.message; //if no error send original normal msg to be sent





      return res.status(err.statusCode).json({
        success: false,
        // message: err.message,
        message: errorMessage,
      });
};
export default ErrorHandler;


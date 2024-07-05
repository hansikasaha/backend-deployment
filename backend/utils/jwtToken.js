//for cookies
export const generateToken = (user, message, statusCode, res) => {
    const token = user.generateJsonWebToken();

    // Determine the cookie name based on the user's role
    //becasue there are 2 frontend , one for admin and one for patient
    const cookieName = user.role === 'Admin' ? 'adminToken' : 'patientToken';
  
    res
      .status(statusCode)
      .cookie(cookieName, token, {
        expires: new Date(
          Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
          // 7 days x 24 hrs x 60 minutes x 60 secs x 1000 ms
        ),
        httpOnly: true, //
        secure: true,
        sameSite: "None",
      })
      .json({
        success: true,
        message,
        user,
        token,
      });
  };
  
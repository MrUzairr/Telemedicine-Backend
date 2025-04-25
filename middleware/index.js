const authService = require("../services/authService");
const User = require('../model/userModel');
const UserDTO = require('../dto/userDTO');

const auth = async(req,res,next) => {

    try {
        // 1. refresh, access token validation
    const {refreshToken,accessToken} = req.cookies;
    if(!refreshToken || !accessToken){
        const error = {
           status:401,
            message: "Unauthorized"
        }
        return next(error);
    }
    let _id;
    try{
        _id = authService.verifyAccessToken(accessToken);
    }catch(error){
        return next(error);
    }

    let user;
    try {
        user = await User.findOne({_id: _id});
    } catch (error) {
        return next(error);
    }
    const userDto = new UserDTO(user);
    
    req.user = userDto;
    next();
    } catch (error) {
        return next(error);
    }   
}

module.exports = auth;
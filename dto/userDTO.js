class UserDTO{
    constructor(user){
        this._id = user._id;
        this.firstname = user.firstname;
        this.lastname = user.lastname;
        this.email = user.email;
    }
}

module.exports = UserDTO;
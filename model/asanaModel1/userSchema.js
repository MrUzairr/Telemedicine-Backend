// const { Model, DataTypes } = require('sequelize');
// const sequelize = require('../../config/sequelize');

// class User extends Model {}

// User.init({
//   gid: {
//     type: DataTypes.STRING,
//     primaryKey: true,
//   },
//   name: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },
//   email: {
//     type: DataTypes.STRING,
//     unique: true,
//     allowNull: true,
//   },
//   photo: {
//     type: DataTypes.STRING,
//     allowNull: true,
//   },
//   workspace: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },
// }, {
//   sequelize,
//   modelName: 'User',
// });

// module.exports = User;




// // const { DataTypes } = require('sequelize');
// // const sequelize = require('../../config/sequelize'); // import your sequelize instance

// // const User = sequelize.define('User', {
// //     gid: {
// //         type: DataTypes.STRING,
// //         primaryKey: true,
// //         allowNull: false,
// //     },
// //     name: {
// //         type: DataTypes.STRING,
// //         allowNull: false,
// //     },
// //     email: {
// //         type: DataTypes.STRING,
// //         allowNull: true,
// //     },
// //     photo: {
// //         type: DataTypes.STRING,
// //         allowNull: true,
// //     },
// //     workspace: {
// //         type: DataTypes.STRING,
// //         allowNull: true,
// //     },
// // }, {
// //     tableName: 'users',
// //     timestamps: false,
// // });

// // // User.associate = (models) => {
// // //     // A user can have many comments
// // //     User.hasMany(models.Comment, { foreignKey: 'userId', as: 'comments' });
// // // };
// // sequelize.sync();
// // module.exports = User;

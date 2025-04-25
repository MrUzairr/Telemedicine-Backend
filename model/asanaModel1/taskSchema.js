// const { Sequelize, DataTypes, Model } = require('sequelize');
// const sequelize = require('../../config/sequelize'); // Sequelize instance

// class Task extends Model {}

// Task.init({
//   gid: {
//     type: DataTypes.STRING,
//     primaryKey: true,
//   },
//   name: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },
//   due_on: {
//     type: DataTypes.DATE,
//     allowNull: true,
//   },
//   notes: {
//     type: DataTypes.TEXT,
//     allowNull: true,
//   },
// }, {
//   sequelize,
//   modelName: 'Task',  // Model name in the database
// });


// module.exports = Task;




// // const { Sequelize, DataTypes, Model } = require('sequelize');
// // const sequelize = require('../../config/sequelize'); // Your sequelize instance

// // class Task extends Model {}

// // Task.init({
// //   gid: {
// //     type: DataTypes.STRING,
// //     primaryKey: true,
// //   },
// //   name: {
// //     type: DataTypes.STRING,
// //     allowNull: false,
// //   },
// //   due_on: {
// //     type: DataTypes.DATE,
// //     allowNull: true,
// //   },
// //   notes: {
// //     type: DataTypes.TEXT,
// //     allowNull: true,
// //   },
// // }, {
// //   sequelize,
// //   modelName: 'Task',
// // });

// // module.exports = Task;




// // const { Model, DataTypes } = require('sequelize');
// // const sequelize = require('../../config/sequelize');
// // const Comment = require('./commentSchema');
// // const Subtask = require('./subTasksSchema');
// // const User = require('./userSchema');

// // class Task extends Model {}

// // Task.init({
// //   gid: {
// //     type: DataTypes.STRING,
// //     primaryKey: true,
// //   },
// //   name: {
// //     type: DataTypes.STRING,
// //     allowNull: false,
// //   },
// //   due_on: {
// //     type: DataTypes.DATE,
// //   },
// //   notes: {
// //     type: DataTypes.STRING,
// //   },
// // }, {
// //   sequelize,
// //   modelName: 'Task',
// // });

// // Task.hasMany(Comment, { foreignKey: 'taskId', as: 'comments' });
// // Task.hasMany(Subtask, { foreignKey: 'taskId', as: 'subtasks' });
// // Task.belongsTo(User, { foreignKey: 'assigneeId', as: 'assignee' });

// // module.exports = Task;




// // const { DataTypes } = require('sequelize');
// // const sequelize = require('../../config/sequelize'); // import your sequelize instance

// // const Task = sequelize.define('Task', {
// //     gid: {
// //         type: DataTypes.STRING,
// //         primaryKey: true,
// //         allowNull: false,
// //     },
// //     name: {
// //         type: DataTypes.STRING,
// //         allowNull: false,
// //     },
// //     due_on: {
// //         type: DataTypes.DATE,
// //         allowNull: true,
// //     },
// //     notes: {
// //         type: DataTypes.TEXT,
// //         allowNull: true,
// //     },
// // }, {
// //     tableName: 'tasks',
// //     timestamps: false,
// // });

// // Task.associate = (models) => {
// //     // One task can have many subtasks
// //     Task.hasMany(models.Subtask, { foreignKey: 'taskId', as: 'subtasks' });

// //     // One task can have many comments
// //     // Task.hasMany(models.Comment, { foreignKey: 'taskId', as: 'comments' });
// // };

// // module.exports = Task;

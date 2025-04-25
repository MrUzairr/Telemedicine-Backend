// const { Model, DataTypes } = require('sequelize');
// const sequelize = require('../../config/sequelize');
// const Task = require('./taskSchema'); // Import the Task model properly

// class Subtask extends Model {}

// Subtask.init({
//   gid: {
//     type: DataTypes.STRING,
//     primaryKey: true,
//   },
//   name: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },
//   taskId: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },
// }, {
//   modelName: 'Subtask',
// });

// // Association: A subtask belongs to a task
// Subtask.belongsTo(Task, { foreignKey: 'taskId' });

// module.exports = Subtask;










// const { DataTypes } = require('sequelize');
// const sequelize = require('../../config/sequelize'); // import your sequelize instance

// const Subtask = sequelize.define('Subtask', {
//     gid: {
//         type: DataTypes.STRING,
//         primaryKey: true,
//         allowNull: false,
//     },
//     name: {
//         type: DataTypes.STRING,
//         allowNull: false,
//     },
//     taskId: {
//         type: DataTypes.STRING,
//         allowNull: false,
//         references: {
//             model: 'tasks',
//             key: 'gid',
//         },
//     },
//     due_on: {
//         type: DataTypes.DATE,
//         allowNull: true,
//     },
// }, {
//     tableName: 'subtasks',
//     timestamps: false,
// });

// Subtask.associate = (models) => {
//     // A subtask belongs to a task
//     Subtask.belongsTo(models.Task, { foreignKey: 'taskId', as: 'task' });
// };
// sequelize.sync();
// module.exports = Subtask;

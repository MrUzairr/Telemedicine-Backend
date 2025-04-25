const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = require('../../config/sequelize');  // Sequelize instance

class Comment extends Model {}

Comment.init({
  gid: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  text: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  taskId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'Comment',  // Model name in the database
});


module.exports = Comment;










// const { Model, DataTypes } = require('sequelize');
// const sequelize = require('../../config/sequelize');
// const User = require('./userSchema');  // Import the User model correctly

// class Comment extends Model {}

// Comment.init({
//   gid: {
//     type: DataTypes.STRING,
//     primaryKey: true,
//   },
//   text: {
//     type: DataTypes.TEXT,
//     allowNull: false,
//   },
//   created_at: {
//     type: DataTypes.DATE,
//     allowNull: false,
//   },
//   taskId: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },
// }, {
//   sequelize,
//   modelName: 'Comment',
// });

// // Association: A comment belongs to a user (creator of the comment)
// Comment.belongsTo(User, { foreignKey: 'userId' });

// module.exports = Comment;




// const { Model, DataTypes } = require('sequelize');
// const sequelize = require('../../config/sequelize');
// const User = require('./userSchema');
// const Task = require('./taskSchema');

// class Comment extends Model {}

// Comment.init({
//   gid: {
//     type: DataTypes.STRING,
//     primaryKey: true,
//   },
//   text: {
//     type: DataTypes.TEXT,
//     allowNull: false,
//   },
//   created_at: {
//     type: DataTypes.DATE,
//     defaultValue: DataTypes.NOW,
//   },
// }, {
//   sequelize,
//   modelName: 'Comment',
// });

// Comment.belongsTo(Task, { foreignKey: 'taskId', as: 'task' });
// Comment.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// module.exports = Comment;






// // model/asanaModel1/commentModel.js
// const { DataTypes } = require('sequelize');
// const sequelize = require('../../config/sequelize');

// const Comment = sequelize.define('Comment', {
//     id: {
//         type: DataTypes.INTEGER,
//         primaryKey: true,
//         autoIncrement: true,
//     },
//     taskId: {
//         type: DataTypes.STRING,  // Make sure this matches the type of the task's primary key
//         allowNull: false,
//     },
//     content: {
//         type: DataTypes.TEXT,
//         allowNull: true,
//     },
// }, {
//     tableName: 'comments',
//     timestamps: false,
// });

// Comment.associate = (models) => {
//     Comment.belongsTo(models.Task, { foreignKey: 'taskId', as: 'task' });
// };

// module.exports = Comment;





// // const { Sequelize, DataTypes } = require('sequelize');
// // const sequelize = require('../../config/sequelize'); // import your sequelize instance


// // const Comment = sequelize.define('Comment', {
// //     text: {
// //         type: DataTypes.TEXT,
// //         allowNull: false,
// //     },
// //     created_at: {
// //         type: DataTypes.DATE,
// //         allowNull: false,
// //         defaultValue: Sequelize.NOW,
// //     },
// //     taskId: {
// //         type: DataTypes.STRING,
// //         allowNull: false,
// //         references: {
// //             model: 'tasks',
// //             key: 'gid',
// //         },
// //     },
// //     userId: {
// //         type: DataTypes.STRING,
// //         allowNull: false,
// //         references: {
// //             model: 'users',
// //             key: 'gid',
// //         },
// //     },
// // }, {
// //     tableName: 'comments',
// //     timestamps: false,
// // });

// // // Comment.associate = (models) => {
// // //     // A comment belongs to a task
// // //     Comment.belongsTo(models.Task, { foreignKey: 'taskId', as: 'task' });

// // //     // A comment belongs to a user
// // //     Comment.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
// // // };
// // sequelize.sync();

// // module.exports = Comment;

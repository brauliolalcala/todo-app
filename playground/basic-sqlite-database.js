const Sequelize = require('sequelize');
var env = process.env.NODE_ENV || 'development';
var sequelize;

if (env === 'production') {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres'
  })
} else {
  sequelize = new Sequelize(undefined, undefined, undefined, {
    'dialect': 'sqlite',
    'storage': `${__dirname}/basic-sqlite.database.sqlite`
  })
}


var Todo = sequelize.define('todo', {
  description: {
    type: Sequelize.STRING,
    defaultValue: null,
    allowNull: false,
    validate: {
      len: [1, 250]
    }
  },
  completed: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
    allowNull: false
  }
})

module.exports.sequelize = sequelize;
module.exports.Todo = Todo;


// sequelize.sync({
//   force: true
// }).then(() => {
//   console.log('Se ha sincronizado con la base de datos');
//
//   Todo.create({
//     description: 'Una tarea'
//   }).then(() => {
//     return Todo.create({
//       description: 'Otra tarea más'
//     })
//   }).then(() => {
//     return Todo.findAll({
//       where: {
//         description: {
//           $like: '%tarea%'
//         }
//       }
//     })
//   }).then((todos) => {
//     if (todos) {
//       todos.forEach((todo) => {
//         console.log(todo.toJSON());
//       })
//     } else {
//       console.log('No se encontraron datos');
//     }
//   })
// })

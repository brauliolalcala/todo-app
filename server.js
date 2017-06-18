'use strict'

//NPM PACKAGES
const express = require('express');
const bodyParser = require('body-parser');
const _ = require('underscore');
const clc = require('cli-color');

var app = express();
var PORT = process.env.PORT || 3000;

//Base de datos
const db = require('./playground/basic-sqlite-database');

//MIDDLEWARE
// app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.get('/', (req, res) => {
  res.send('TODO API');
});

// GET /todo?=completed=true&q=string
app.get('/todos', (req, res) => {
  var queryParams = req.query;
  var filteredTodos = {};


  switch (queryParams.completed) {
    case 'true':

      if (queryParams.hasOwnProperty('q') && _.isString(queryParams.q)) {
        db.sequelize.sync().then(() => {
          db.Todo.findAll({
            where: {
              completed: true,
              description: {
                $like: '%' + queryParams.q + '%'
              }
            }
          }).then((todos) => {
            filteredTodos = todos;
            res.json(filteredTodos);
          });
        })

        break;

      } else {
        db.sequelize.sync().then(() => {
          db.Todo.findAll({
            where: {
              completed: true
            }
          }).then((todos) => {
            filteredTodos = todos;
            res.json(filteredTodos);
          });
        })

        break;
      }

    case 'false':

      if (queryParams.hasOwnProperty('q') && _.isString(queryParams.q)) {
        db.sequelize.sync().then(() => {
          db.Todo.findAll({
            where: {
              completed: false,
              description: {
                $like: '%' + queryParams.q + '%'
              }
            }
          }).then((todos) => {
            filteredTodos = todos;
            res.json(filteredTodos);
          });
        })

        break;

      } else {
        db.sequelize.sync().then(() => {
          db.Todo.findAll({
            where: {
              completed: false
            }
          }).then((todos) => {
            filteredTodos = todos;
            res.json(filteredTodos);
          });
        })

        break;
      }

    case 'undefined':
      if (queryParams.hasOwnProperty('q') && _.isString(queryParams.q)) {
        db.sequelize.sync().then(() => {
          db.Todo.findAll({
            where: {
              description: {
                $like: '%' + queryParams.q + '%'
              }
            }
          }).then((todos) => {
            filteredTodos = todos;
            res.json(filteredTodos);
          });
        })
        break;

      }

    default:
      db.sequelize.sync().then(() => {
        db.Todo.findAll().then((todos) => {
          filteredTodos = todos;
          res.json(filteredTodos);
        });
      })

  }

});


// GET /todos/:id
app.get('/todos/:id', (req, res) => {
  var todoId = parseInt(req.params.id, 10);
  var matchedTodo = {};
  db.sequelize.sync().then(() => {
    db.Todo.findById(todoId).then((todo) => {
      matchedTodo = todo;

      if (matchedTodo) {
        res.json(matchedTodo);
      } else {
        res
          .status(404)
          .send(`El objeto que está solcitando no existe`);
      }
    });
  })

});



//POST
app.post('/todos', (req, res) => {
  var body = req.body;
  body = _.pick(body, 'description', 'completed');

  if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) {
    res.status(404).send();
  } else {
    db.sequelize.sync().then(() => {
      db.Todo.create({
        description: body.description,
        completed: body.completed
      }).then((todo) => {
        console.log(clc.green(`Se ha creado una nueva entrada`));
        res.json(todo);
      });

    })
  }
});

//Delete
app.delete('/todos/:id', (req, res) => {
  var todoId = parseInt(req.params.id, 10);

  db.sequelize.sync().then(() => {
    db.Todo.findById(todoId).then((todo) => {
      todo.destroy();
      return res.json(todo);
    })
  })


});



//PUT
app.put('/todos/:id', (req, res) => {
  var todoId = parseInt(req.params.id, 10);
  var body = req.body;
  var atributos = {};
  body = _.pick(body, 'description', 'completed');

  if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
    atributos.completed = body.completed;
  } else if (!body.hasOwnProperty('completed')) {
    return res.status(404).send();
  }

  if (body.hasOwnProperty('description') && _.isString(body.description)) {
    atributos.description = body.description;
  } else if (!body.hasOwnProperty('description')) {
    return res.status(404).send();
  }

  db.sequelize.sync().then(() => {
    db.Todo.findById(todoId).then(todo => {
      todo.completed = atributos.completed;
      todo.description = atributos.description;

      todo.save()
          .then( () => {
            console.log(clc.green('Se ha actualizado una entrada'));
            res.json(todo);
          })
          .catch( (e) => {
            console.log(clc.red(e));
            res.status(404).send();
          });
    })
  })

});

app.listen(PORT, () => console.log(`Servidor listo en el puero: ${PORT}!`));

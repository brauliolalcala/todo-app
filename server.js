'use strict'

//NPM PACKAGES
const express = require('express');
const bodyParser = require('body-parser');
const _ = require('underscore');
const clc = require('cli-color');
const bcrypt = require('bcrypt-nodejs');

var app = express();
var PORT = process.env.PORT || 3000;

//Base de datos
const db = require('./db');

//MIDDLEWARE
const middleware = require('./middleware.js')(db);

// app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('TODO API');
});

// GET /todo?completed=true&q=string
app.get('/todos', middleware.requireAuthentication, (req, res) => {
  var queryParams = req.query;
  var where = {
    userId: req.user.get('id')
  };

  if (queryParams.hasOwnProperty('completed') && queryParams.completed == true) {
    where.completed = true;
  } else if (queryParams.hasOwnProperty('completed') && queryParams.completed   == false) {
    where.completed = false;
  }

  if (queryParams.hasOwnProperty('q') && queryParams.q.length > 0) {
    where.description = {
      $like: `%${queryParams.q}%`
    }
  }

  db.Todo.findAll({where: where}).then((todos) => {
    res.json(todos);
  }).catch(() => res.status(500).send());

});

// GET /todos/:id
app.get('/todos/:id', middleware.requireAuthentication, (req, res) => {
  var todoId = parseInt(req.params.id, 10);
  var matchedTodo = {};

  db.Todo.findOne({
    where: {
      userId: req.user.get('id'),
      id: todoId
    }
  }).then((todo) => {
    matchedTodo = todo;

    if (matchedTodo) {
      res.json(matchedTodo);
    } else {
      res.status(404).send(`El objeto que está solcitando no existe`);
    }
  });

});

//POST
app.post('/todos', middleware.requireAuthentication, (req, res) => {
  var body = req.body;
  body = _.pick(body, 'description', 'completed');

  if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) {
    res.status(404).send();
  } else {

    db.Todo.create({description: body.description, completed: body.completed}).then((todo) => {
      req.user.addTodo(todo).then((todo) => {
        return todo.reload();
      })

      console.log(clc.green(`Se ha creado una nueva entrada`));
      res.json(todo);

    }).catch( () => res.status(500).send());
  }
});

//Delete
app.delete('/todos/:id', middleware.requireAuthentication, (req, res) => {
  var todoId = parseInt(req.params.id, 10);

  db.Todo.findOne({
    where: {
      userId: req.user.get('id'),
      id: todoId
    }
  }).then((todo) => {
    todo.destroy();
    return res.json(todo);
  }).catch((e) => {
    res.status(404).send(`El ítem que intenta acceder no existe`);
  })

});

//PUT
app.put('/todos/:id', middleware.requireAuthentication, (req, res) => {
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
  db.Todo.findOne({
    where: {
      userId: req.user.get('id'),
      id: todoId
    }
  }).then(todo => {
    todo.completed = atributos.completed;
    todo.description = atributos.description;

    todo.save().then(() => {
      console.log(clc.green('Se ha actualizado una entrada'));
      res.json(todo);
    }).catch((e) => {
      console.log(clc.red(e));
      res.status(404).send();
    });
  })

});

//USERS REQUESTS

// POST /users
app.post('/users', (req, res) => {
  var body = _.pick(req.body, 'email', 'password', 'username');

  db.user.create(body).then((user) => {
    res.json(user.toPublicJSON());
  }).catch((e) => {
    console.error(e);
    res.status(400).send(e)
  })
})

// POST /users/login
app.post('/users/login', (req, res) => {
  var body = _.pick(req.body, 'email', 'password', 'username');
  var userInstance;

  if (typeof body.email !== 'string' || typeof body.password !== 'string') {
    console.log(`body.email no es string`);
    return res.status(400).send();
  }

  db.user.authenticate(body).then((user) => {
    var token = user.generateToken('authentication');
    userInstance = user;

    return db.token.create({
      token: token
    })

  }).then( (tokenInstance) =>{
    res.header('Auth', tokenInstance.get('token')).json(userInstance.toPublicJSON())
  }).catch((e) => {
    console.error(e);
    res.status(401).send();
  });

})


//DELETE /users/login
app.delete('/users/login', middleware.requireAuthentication, (req, res) => {
  req.token.destroy().then( () =>{
    res.status(204).send();
  }).catch( () => res.status(500).send() );

})

db.sequelize.sync({force: true}).then(() => {
  app.listen(PORT, () => console.log(`Servidor listo en el puero: ${PORT}!`));
})

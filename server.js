'use strict'

//NPM PACKAGES
const express = require('express');
const bodyParser = require('body-parser');
const _ = require('underscore');

var app = express();
var PORT = process.env.PORT || 3000;

var todos = [];

//MIDDLEWARE
// app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.get('/', (req, res) => {
  res.send('TODO API');
});

// GET /todos=completed=true
app.get('/todos', (req, res) => {
    var queryParams = req.query;
    var filteredTodos = todos;

    if ( queryParams.hasOwnProperty('completed') && queryParams.completed === 'true'){
      filteredTodos = _.where( filteredTodos, {completed: true});
    }else if ( queryParams.hasOwnProperty('completed') && queryParams.completed === 'false') {
      filteredTodos = _.where( filteredTodos, {completed: false});
    }

    res.json(filteredTodos);
});

// GET /todos/:id
app.get('/todos/:id', (req, res) => {
  var todoId = parseInt(req.params.id, 10);
  var matchedTodo =  _.findWhere(todos, {id: todoId});

  if(matchedTodo){
    res.json(matchedTodo);
  }else{
    res
      .status(404)
      .send(`El objeto que está solcitando no existe`);
  }
});



//POST
app.post('/todos', (req, res) =>{
  var body = req.body;
  body = _.pick(body, 'description', 'completed');

  if(!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0 ){
    res.status(404).send();
  }else{
    var id = _.size(todos) + 1;
    body.id = id;
    todos.push(body);
    res.json(body);
  }
});

//Delete
app.delete('/todos/:id', (req, res) =>{
  var todoId = parseInt(req.params.id, 10);
  var matchedTodo =  _.findWhere(todos, {id: todoId});

  todos = _.without(todos, matchedTodo);
  return res.json(matchedTodo);
});

//PUT
app.put('/todos/:id', (req, res) =>{
  var todoId = parseInt(req.params.id, 10);
  var body = req.body;
  body = _.pick(body, 'description', 'completed');
  var matchedTodo =  _.findWhere(todos, {id: todoId});
  var atributos = {};

  if(!matchedTodo){
    return res.status(404).send();
  }

  if(body.hasOwnProperty('completed') && _.isBoolean(body.completed)){
    atributos.completed = body.completed;
  }else if (!body.hasOwnProperty('completed')) {
    return res.status(404).send();
  }

  if ( body.hasOwnProperty('description') && _.isString(body.description)) {
    atributos.description = body.description;
  } else if ( !body.hasOwnProperty('description')) {
    return res.status(404).send();
  }

  _.extend( matchedTodo, atributos);

  return res.json(matchedTodo);

});

app.listen(PORT, () => console.log(`Servidor listo en el puero: ${PORT}!`));

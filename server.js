//NPM PACKAGES
const express = require('express');
const bodyParser = require('body-parser');

var app = express();
var PORT = process.env.PORT || 3000;

var todos = [];

//MIDDLEWARE
// app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.get('/', (req, res) => {
  res.send('TODO API');
})

// GET /todos
app.get('/todos', (req, res) => {
  res.json(todos);
})

// GET /todos/:id
app.get('/todos/:id', (req, res) => {
  var matchedTodo;
  todos.forEach((todo) => {
    if (parseInt(req.params.id) === todo.id) {
      matchedTodo = todo;
    }
  });

  if(matchedTodo){
    res.json(matchedTodo);
  }else{
    res
      .status(404)
      .send(`El objeto que está solcitando no existe`);
  }
})

//POST
app.post('/todos', (req, res) =>{
  var body = req.body;
  var id = todos.length + 1;
  body.id = id;

  todos.push(body);
  
  res.json(body);
  console.log(body);
})

app.listen(PORT, () => console.log(`Servidor listo en el puero: ${PORT}!`));

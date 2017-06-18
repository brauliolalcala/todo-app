const express = require('express');
var app = express();
var PORT = process.env.PORT || 3000;

var todos = [{
    id: 1,
    description: 'Ir con mamá para almorzar',
    completed: false
  },
  {
    id: 2,
    description: 'Ir al mercado',
    completed: false
  },
  {
    id: 3,
    description: 'Alimentar a bella',
    completed: false
  }
];


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

app.listen(PORT, () => console.log(`Servidor listo en el puero: ${PORT}!`));

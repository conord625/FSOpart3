const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");
require("dotenv").config();
const Person = require("./models/person");

app.use(cors());
app.use(express.static("dist"));
app.use(express.json());
app.use(morgan("tiny"));

let persons = [
  {
    id: "1",
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: "2",
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: "3",
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: "4",
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

app.get("/api/persons", (request, response) => {
  Person.find({}).then((persons) => {
    response.json(persons);
  });
});

app.get("/info", (request, response) => {
  response.send(
    `<div>Phonebook has info for ${
      persons.length
    } people <br/> ${new Date().toString()}</div>`
  );
});

app.get("/api/persons/:id", (request, response) => {
  const id = request.params.id;
  Person.findById(id).then((person) => {
    if (person) {
      response.json(person);
    } else {
      response.status(404).end();
    }
  });
});

app.delete("/api/persons/:id", (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then((result) => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

app.post("/api/persons", (request, response) => {
  const body = request.body;
  Person.find({ name: body.name }).then((result) => {
    if (!body.name || !body.number) {
      return response.status(400).json({
        error: "name or number missing",
      });
    } else if (result.length > 0) {
      return response.status(400).json({
        error: "name must be unique",
        id: result[0].id,
      });
    } else {
      const person = new Person({
        name: body.name,
        number: body.number,
      });

      person.save().then((result) => {
        console.log(
          `added ${person.name} number ${person.number} to phonebook`
        );
      });
    }
  });
});

app.put("/api/persons/:id", (request, response, next) => {
  const body = request.body;

  const person = {
    name: body.name,
    number: body.number,
    // id: body.id,
  };

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then((updatedPerson) => {
      response.json(updatedPerson);
    })
    .catch((error) => next(error));
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);
const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

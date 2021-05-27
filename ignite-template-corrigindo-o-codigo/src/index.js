const express = require("express");

const { v4: uuid, validate } = require("uuid");

const app = express();

app.use(express.json());

const repositories = [];

app.get("/repositories", (request, response) => {
  return response.json(repositories);
});

app.post("/repositories", (request, response) => {
  const { title, url, techs } = request.body

  // if (!typeof (title) === "string" || !typeof (url) === "string" || !typeof (techs) === "array")
  //   response.status(500).json({ error: "" });
  // const repoExist = repositories.find(rep => rep.title === title || rep.url == url);
  // if (repoExist) return response.status(400).json({ error: "repository já exist" })

  const repository = {
    id: uuid(),
    title,
    url,
    techs,
    likes: 0
  };

  repositories.push(repository);
  return response.status(201).json(repository);
});

app.put("/repositories/:id", (request, response) => {
  const { id } = request.params;
  const updatedRepository = request.body;

  if (!validate(id)) return response.status(404).json({ error: "id not uuid" });

  const repositoryIndex = repositories.findIndex(repo => repo.id === id);

  if (repositoryIndex < 0) {
    return response.status(404).json({ error: "Repository not found" });
  }

  const repository = { ...repositories[repositoryIndex], ...updatedRepository };

  repository.likes = repositories[repositoryIndex].likes;

  repositories[repositoryIndex] = repository;


  return response.status(201).json(repositories[repositoryIndex]);
});

app.delete("/repositories/:id", (request, response) => {
  const { id } = request.params;

  const repositoryIndex = repositories.findIndex(repository => repository.id === id);

  if (repositoryIndex < 0) {
    return response.status(404).json({ error: "Repository not found" });
  }

  repositories.splice(repositoryIndex, 1);

  return response.status(204).json();
});

app.post("/repositories/:id/like", (request, response) => {
  const { id } = request.params;
  if (!validate(id)) return response.status(404).json({ error: "id not uuid" });

  const repositoryIndex = repositories.findIndex(repository => repository.id === id);

  if (repositoryIndex < 0) {
    return response.status(404).json({ error: "Repository not found" });
  }

  repositories[repositoryIndex].likes = parseInt(repositories[repositoryIndex].likes) + 1;
  const likes = repositories[repositoryIndex];


  return response.status(200).json(likes);
});

module.exports = app;

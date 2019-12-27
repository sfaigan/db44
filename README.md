# db44
[![Build Status](https://travis-ci.com/sfaigan/db44.svg?branch=master)](https://travis-ci.com/sfaigan/db44)

***db44*** is an e-commerce platform for buying (with delivery) and selling craft beer.

This is my first MVC-based application, and also my first time using a lot of the tools/technologies used in the project, so if there are any design flaws/bugs, feel free to open an issue or message me so that I can learn from my mistakes! I would love to hear your suggestions for improvement.

Thank you to [Darian Morrison](https://github.com/Darian-Morrison) and [Raunaq Gupta](https://github.com/raunaqg) for their help in the development of this project.

## Demo
The app is running on Heroku. It can be viewed [here](https://db44.herokuapp.com/). Please note that I am using a free account, so the server will sleep after 30 minutes of inactivity. When a request is received, the server will wake up, but this can take up to 60 seconds.

#### Test Accounts:
| Email                | Password        | Role          |
|----------------------|-----------------|---------------|
| johndoe@example.com  | password123     | customer      |
| amanda@vibrewing.com | vibrewing       | supplier      |
| admin@db44.com       | beersbeersbeers | administrator |

Feel free to make more on the demo website, but please clean up after yourself!

# Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

## Installation
```
git clone https://github.com/sfaigan/db44.git
cd db44
```

If you wish to run the app *containerized*, you will need to install [Docker](https://docker.com/). If you are running Windows 10, you must have Pro or higher (Education works).

If you wish to run the app *without a container*, you will need to run `npm install` before proceeding.

## Running Locally
You can run the application with or without Docker. Access it locally at [localhost:3000](http://localhost:3000).

### Docker (containerized)
- **Option 1 (with build):**  
    Build the Docker image and start the application inside a Docker container.
    ```
    docker-compose up --build
    ```

- **Option 2 (without build):**  
    Start the application (inside a Docker container) without building the Docker image.
    ```
    docker pull sfaigan/db44:latest
    docker-compose up
    ```

### No Docker (not containerized)
Start the app without Docker by running `npm run start`. Please note that you must have run `npm install` prior to this step for this to work.

## Running Tests
There are currently 9 test suites (54 tests). All tests are run when building the Docker image, which is done by TravisCI (i.e., anytime there is a push or pull request).

You can run these tests with or without Docker.

### Docker (containerized)
Run the tests inside a Docker container by building the Docker image with `docker build .`

### No Docker (not containerized)
Run the tests outside without a Docker container with `npm run test`. Please note you must have run `npm install` prior to this step for this to work.

## Linter
The linter is run as part of the build process, but it can be run directly with `npm run check`.

If the linter complains, you can run `npm run fix` to fix the issues.

## Tech Stack

The important stuff...
* [Node.js](https://nodejs.org/) - Runtime Environment
* [Express.js](https://expressjs.com/) - Web Framework
* [MongoDB](https://mongodb.com/) - Database
* [Heroku](https://heroku.com/) - App Platform
* [TypeScript](https://typescriptlang.org/) - Language Used (TypeScript -> JavaScript)
* [Google TypeScript Style (gts)](https://github.com/google/gts) - Style Guide + Linter
* [Docker](https://docker.com/) - Containerization Tool
* [DockerHub](https://hub.docker.com/) - Docker Image Host (Repo)
* [Pug](https://pugjs.org/) - View Engine
* [Bootstrap](https://getbootstrap.com/) - Front-end Library

## TravisCI Build Process
1. **Environment setup**  
a) Spin up worker instance for building (TravisCI)  
b) Clone repo  
c) Set environment variables from TravisCI settings (not in repo, stored by TravisCI)  
e) Install Heroku CLI  
2. **Build Docker image**  
a) Install Node  
b) Set container working directory  
c) Copy package.json and package-lock.json  
d) Install dependencies (node modules)  
e) Copy project files (source code and all) into container  
f) Compile source code
g) Run tests  
h) Run linter  
3. **Deployment** (*if on master branch*)  
a) Create .env file (from TravisCI environment variables)  
b) Log in to Heroku  
c) Push the Docker image to DockerHub  
d) Push the Docker image to Heroku  
e) Deploy the Docker image on Heroku
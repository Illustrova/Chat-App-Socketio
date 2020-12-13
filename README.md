# Chat application on Flask and Socket.io

Sample messaging app, built with Flask, Socket.io and Redis. Check it [live on Heroku](https://chat-app-flask-socketio.herokuapp.com/).

## Features

- Authorize user and keep them logged in.
- Detect user location based on IP and/or HTML5 Geolocation services
- Upload user avatar image, directly or through drag-and-drop component
- Allows user to edit personal data, and update it for other users immediately
- Allow to create and participate in public channel or send private message to the user
- Track list of user channels and currently active conversation.
- Components are rendered at the server and being updated at the client instantly

## Built with

### Frontend

- Pug for HTML templating
- SASS for stylesheets
- Babel through Browserify for JS
- [Socket.io library](https://github.com/socketio/socket.io-client) for handling socket connections at the client
- [Twemoji library](https://twemoji.twitter.com/) for nice emoji popover.

### Backend

- Python
- Flask
- Flask-Socketio
- Redis for data storage
- ... and few other useful modules

## Getting Started

First, clone this repo:
`git clone https://github.com/Illustrova/Chat-App-Socketio.git`

### Frontend server - for HTML/CSS/UI scripts development

```shell
cd frontend
npm install
npm start
```

The commands above will run development server at localhost:3000.

Once you done with editing frontend, you have to run `npm run build` in order to build files into backend/ folder.

__Note about HTML templates.__ Frontend development server will be running compiled `src/pug/index.pug` file; it contains mock data for quick frontend testing and development. However, the backend build will process all files located in `src/pug/templates/`. All files located in this folder, contain Jinja2 expressions instead of mock data; this way they are getting compiled directly into Jinja2 templates, which are being served by Flask. Yep, it looks pretty overcomplicated, but that's how this project is built.

### Backend

Prerequisites: Redis should be installed on the machine. First run Redis in separate terminal:
```
redis-server
```
Then run flask server:

```shell
cd backend
pip3 install -r requirements.txt
python3 application.py run
```

There are also management commands available through command line:

__Drop database completely:__

```shell
python3 application.py clear_db
```

__Create database and import starter data from config.yaml:__

```shell
python3 application.py create_db
```

## Project origins

This project was originally started for [CS50 Web Programming with Python and JavaScript](https://courses.edx.org/courses/course-v1:HarvardX+CS50W+Web/course/) course, and built according course requirements, listed [here](https://docs.cs50.net/ocw/web/projects/2/project2.html). However the final app functionality was significantly expanded.

## Authors

- **[Irina Illustrova](https://github.com/Illustrova)**
- **UI Kit by [Spline.one](http://spline.one/)**

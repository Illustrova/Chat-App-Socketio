""" Chat application backend """
import os
import yaml
from flask import Flask, render_template, session, request, redirect, jsonify, Response, make_response
from flask_socketio import SocketIO, send, emit, join_room, leave_room, rooms
from flask_session import Session
from redis import Redis
from .redisdb import RedisDB


db = RedisDB()  # connect to server
ttl = 31104000  # one year

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
app.config['SESSION_TYPE'] = 'redis'
app.config['SESSION_REDIS'] = Redis.from_url(
    os.environ.get("REDIS_URL"))
socketio = SocketIO(app, manage_session=False)
Session(app)


config_path = "./config.yaml"
with open(config_path) as f:
    try:
        config = yaml.load(f, Loader=yaml.FullLoader)
    except yaml.YAMLError as exception:
        print("Error loading YAML file : {0}".format(exception))

default_channels = set(config['data']['default_channels'])

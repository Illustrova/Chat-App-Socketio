# coding=utf-8
# https: // github.com/miguelgrinberg/flack/blob/master/manage.py
from chat import chat, users, message, channel, routes, profile, socket
import os
from chat import db, config, app, socketio
from flask_script import Manager
import eventlet
eventlet.monkey_patch()
# from flask_socketio import SocketIO, send, emit, join_room, leave_room, rooms
# from flask import Flask, render_template, session, request, redirect, jsonify, Response, make_response
# import flask


manager = Manager(app)


UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = os.path.join(app.root_path, UPLOAD_FOLDER)


@manager.command
def clear_db():
    """ Drop database """
    db.clear()


@manager.command
def create_db(clear_first=False):
    """Create database and load data"""
    if clear_first:
        db.clear()
    # Loading starter data from config.yaml
    db.load_set("channels", set(config['data']['default_channels']))
    db.load_dict("channel_members", config['data']['channel_members'])
    db.load_dict("user_in_channels", config['data']['user_in_channels'])
    db.load_dict("users", config['data']['users'])
    db.load_dict_to_lists("message:", config['data']['messages'])


@manager.command
def refresh_db():
    create_db(True)
# class Server(_Server):
#     help = description = 'Runs the Socket.IO web server'

#     def get_options(self):
#         options = (
#             Option('-h', '--host',
#                    dest='host',
#                    default=self.host),

#             Option('-p', '--port',
#                    dest='port',
#                    type=int,
#                    default=self.port),

#             Option('-d', '--debug',
#                    action='store_true',
#                    dest='use_debugger',
#                    help=('enable the Werkzeug debugger (DO NOT use in '
#                          'production code)'),
#                    default=self.use_debugger),
#             Option('-D', '--no-debug',
#                    action='store_false',
#                    dest='use_debugger',
#                    help='disable the Werkzeug debugger',
#                    default=self.use_debugger),

#             Option('-r', '--reload',
#                    action='store_true',
#                    dest='use_reloader',
#                    help=('monitor Python files for changes (not 100%% safe '
#                          'for production use)'),
#                    default=self.use_reloader),
#             Option('-R', '--no-reload',
#                    action='store_false',
#                    dest='use_reloader',
#                    help='do not monitor Python files for changes',
#                    default=self.use_reloader),
#         )
#         return options

#     def __call__(self, app, host, port, use_debugger, use_reloader):
#         # override the default runserver command to start a Socket.IO server
#         # if use_debugger is None:
#         #     use_debugger = app.debug
#         #     if use_debugger is None:
#         #         use_debugger = True
#         # if use_reloader is None:
#         #     use_reloader = app.debug
#         print("call")
#         create_db(True)

#         socketio.run(app,
#                      host=host,
#                      port=port,
#                      debug=use_debugger,
#                      use_reloader=use_reloader,
#                      **self.server_options
#                      )


# manager.add_command("runserver", Server())


@manager.command
def run():
    socketio.run(app)


if __name__ == '__main__':
    manager.run()

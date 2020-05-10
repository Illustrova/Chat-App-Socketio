""" Base socket signal handlers """
from flask import session, request
from dotmap import DotMap

from . import db, socketio, default_channels, config
from .helpers import emit_self
from .channel import update_channels, add_to_channel
from .profile import update_userdata
from .helpers import authenticated_only

SIGNAL = DotMap(config['variables']['socketio'])


@socketio.on("disconnect")
@authenticated_only
def disconnect():
    """ Change status to offline if client is disconnected """
    if session.get('username'):
        update_userdata("status", "offline")


@socketio.on("connect")
@authenticated_only
def connect():
    """ Setup user data on connect """
    # Save socketio session id
    if session.get('username'):
        session['sid'] = request.sid
        db.update_user(session.get("username"), "sid", request.sid)

        if not session.get('user_channels'):
            session['user_channels'] = set()
            for channel in default_channels:
                add_to_channel(channel)
                socketio.server.enter_room(session.get("sid"), channel)
            update_channels()
        else:
            for channel in session['user_channels']:
                socketio.server.enter_room(session.get("sid"), channel)

        emit_self(SIGNAL.APP.LOADED)

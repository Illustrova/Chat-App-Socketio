""" Profile signal handlers """
from flask import session
from dotmap import DotMap
from . import socketio, config, db
from .helpers import emit_self
from .templates import template


SIGNAL = DotMap(config['variables']['socketio'])


@socketio.on(SIGNAL.PROFILE.LOAD)
def view_profile(name, slf):
    ''' Render and emit HTML for user/channel profile '''
    if slf:
        emit_self(SIGNAL.PROFILE.HTML, template(
            'profile_user', username=session.get("username"), slf=slf))
    elif name.startswith("user:"):
        emit_self(SIGNAL.PROFILE.HTML, template(
            'profile_user', username=name[5:], slf=slf))
    else:
        emit_self(SIGNAL.PROFILE.HTML, template(
            'profile_channel', channel=name))


@socketio.on(SIGNAL.USERDATA.UPDATE)
def update_userdata(key, value):
    ''' Receive user data update and save in db and session '''
    # Update session
    session[key] = value
    session.modified = True
    # Update db
    db.update_user(session.get('username'), key[5:], value)

    if key == "user_status":
        socketio.emit(SIGNAL.USERDATA.STATUS.UPDATED, {"username": session.get(
            "username"), "status": value}, broadcast=True)

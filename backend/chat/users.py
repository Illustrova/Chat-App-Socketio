""" Users signal handlers """
from flask import session
from dotmap import DotMap
from . import socketio, config
from .helpers import emit_self
from .templates import template

SIGNAL = DotMap(config['variables']['socketio'])


@socketio.on(SIGNAL.USERS.UPDATE.REQUEST)
def update_users():
    """ Send HTML with users list """
    emit_self(SIGNAL.USERS.UPDATE.HTML, template(
        'users', username=session.get('username')), broadcast=True)


def announce_update_users():
    """ Announce update to all clients """
    socketio.emit(SIGNAL.USERS.UPDATE.ANNOUNCE, broadcast=True, namespace="/")

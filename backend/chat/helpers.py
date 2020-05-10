''' Shared helper functions '''
import functools
from flask import redirect, session
from flask_socketio import disconnect
from . import db, socketio


def emit_self(event, *args, **kwargs):
    """ Emit signal only for client which requested it """
    return socketio.emit(event, *args, room=session.get('sid'), **kwargs)


def authenticated_only(f):
    """ Disconnect socket if user is not authenticated """
    @functools.wraps(f)
    def wrapped(*args, **kwargs):
        if session.get("username") is None or not db.has_user(session.get("username")):
            disconnect()
            return redirect("/login")
        else:
            return f(*args, **kwargs)
    return wrapped


def login_required(f):
    """
    Decorate routes to require login.
    http://flask.pocoo.org/docs/1.0/patterns/viewdecorators/
    """
    @functools.wraps(f)
    def decorated_function(*args, **kwargs):
        if session.get("username") is None or not db.has_user(session.get("username")):
            return redirect("/login")
        return f(*args, **kwargs)
    return decorated_function

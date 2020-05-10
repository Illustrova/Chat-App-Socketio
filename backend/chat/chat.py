""" Chat signal handlers """
from flask import session
from dotmap import DotMap
from . import socketio, config
from .helpers import emit_self
from .templates import template

SIGNAL = DotMap(config['variables']['socketio'])


@socketio.on(SIGNAL.CHAT.LOAD)
def load_chat(chatname):
    """ Send HTML with chat messages """
    set_current_chat(chatname)
    emit_self(SIGNAL.CHAT.HTML, {"chat": chatname, "html": template(
        "messages", channel=chatname)})


@socketio.on(SIGNAL.CURRENT_CHAT.UPDATED)
def set_current_chat(chatname):
    """ Set current chat """
    session['current_chat'] = chatname
    session.modified = True

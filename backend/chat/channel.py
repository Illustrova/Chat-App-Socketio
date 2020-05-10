""" Channel signal handlers """
from flask import session
from flask_socketio import emit, join_room
from dotmap import DotMap
from . import db, socketio, config
from .helpers import emit_self
from .templates import template

SIGNAL = DotMap(config['variables']['socketio'])


@socketio.on(SIGNAL.CHANNELS.CREATE.NEW)
def create_channel(channel):
    """ Create a channel and join it """
    # Validate the name is unique
    if channel in db.get_all_channels():
        emit_self(SIGNAL.CHANNELS.CREATE.ERROR,
                  "Channel with this name already exists")
    else:
        # Add channel to database
        db.add_channel(channel)
        # Emit success to the creator only
        emit_self(SIGNAL.CHANNELS.CREATE.SUCCESS, channel)
        # The creator of the channel should join it automatically
        join(channel)
        # Announce update to other clients
        emit(SIGNAL.CHANNELS.UPDATE.ANNOUNCE,
             broadcast=True, include_self=False)


@socketio.on(SIGNAL.CHANNELS.JOIN)
def join(channel):
    """ Join the channel """
    join_room(channel)
    add_to_channel(channel)
    update_channels()


def add_to_channel(channel):
    """ Add user to channel. 
    This method is called without user interaction on the client) 
    """
    session['user_channels'].add(channel)
    session.modified = True
    db.add_user_to_channel(session.get('username'), channel)


@socketio.on(SIGNAL.CHANNELS.UPDATE.REQUEST)
def update_channels():
    """ Send HTML with the channels list """
    # Send data on request
    emit_self(SIGNAL.CHANNELS.UPDATE.HTML, template("channels"))

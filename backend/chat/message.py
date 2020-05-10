""" Message signal handlers """
from flask import session
from flask_socketio import emit
from dotmap import DotMap
from . import db, socketio, config

SIGNAL = DotMap(config['variables']['socketio'])


@socketio.on(SIGNAL.MESSAGE.SEND)
def send_msg(chat, msg, timestamp):
    ''' Receive message and broadcast to the channel/send to the user '''

    sender = session.get('username')
    if chat.startswith("user:"):
        recipient = chat[5:]
        chatname = "user:" + sender
        chatname_db = "user:" + recipient
        room = db.get_user(chat[5:])['sid']
    else:
        # Broadcast only to users on the same channel.
        room = chat
        chatname = chat
        chatname_db = chat

    message = {'sender': sender,
               'timestamp': timestamp,
               'message': msg}
    db.add_message(chatname_db, message)
    emit(SIGNAL.MESSAGE.RECEIVED, {
        "chat": chatname, "message": message}, include_self=False, room=room)

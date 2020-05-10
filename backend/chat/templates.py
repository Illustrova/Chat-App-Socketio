""" Template helper function to resolve template arguments """
from inspect import signature
from flask import session, render_template
from dotmap import DotMap
from . import db, config
T = DotMap(config['variables']['template'])


def current_chat():
    """ Resolve current chat name, returns chatname as string """
    if session.get('current_chat'):
        if session.get('current_chat').startswith("user:"):
            return session.get('current_chat')[5:]
        else:
            return session.get('current_chat')
    else:
        return None


def current_chat_data():
    """ Returns userdata as dict if current chat is 
    private chat with user, otherwise returns None 
    """
    if session.get('current_chat'):
        if session.get('current_chat').startswith("user:"):
            return db.get_user(session.get('current_chat')[5:])
        else:
            return None
    else:
        return None


TEMPLATES = {
    "channels": {
        T.CHANNELS.ALL: db.get_all_channels,
        T.CHANNELS.SELF: lambda: session.get("user_channels"),
        T.USERS.SELF.CURRENT_CHAT: lambda: session.get('current_chat'),

    },
    "messages": {
        T.USERS.SELF.NAME: lambda: session.get('username'),
        T.USERS.ALL.DATA: db.get_all_users_data,
        T.MESSAGES.CHANNEL: db.get_all_messages,
    },
    "members": {
        T.USERS.ALL.DATA: db.get_all_users_data,
        T.CHANNELS.ONE.MEMBERS: db.get_channel_members
    },
    "profile_user": {
        T.USERS.ONE.DATA: db.get_user,
        T.USERS.ONE.CHANNELS: db.get_user_in_channels,
    },
    "profile_channel": {
        T.CHANNELS.ONE.MEMBERS: db.get_channel_members,
        T.USERS.ALL.DATA: db.get_all_users_data
    },
    "users": {
        T.USERS.ALL.DATA: db.get_all_users_data,
        T.USERS.SELF.CURRENT_CHAT: lambda: session.get('current_chat')[5:],

    },
    "index": {
        T.CHANNELS.ALL: db.get_all_channels,
        T.CHANNELS.SELF: lambda: session.get("user_channels"),
        T.USERS.SELF.NAME: lambda: session.get('username'),
        T.USERS.SELF.CURRENT_CHAT: current_chat,
        T.USERS.SELF.CURRENT_CHAT_DATA: current_chat_data,
        T.USERS.ALL.DATA: db.get_all_users_data,
        T.MESSAGES.CHANNEL: db.get_all_messages,
    }
}


def template(name, **kwargs):
    """ Wrapper for render_template method of Flask
    All necessary arguments for template are taken from 
    TEMPLATES, according to template name
    """
    context = dict()
    for key, val in TEMPLATES.get(name).items():
        params = [i for i in signature(val).parameters.keys()]
        context[key] = val(
            *list({k: kwargs.get(k) for k in params}.values()))

    return render_template(name+".html", **context, **kwargs)

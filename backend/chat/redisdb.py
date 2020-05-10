""" Methods for storing data in Redis instance """
import json
import os
from redis import Redis
from flask import session


class RedisDB(object):
    """ Redis wrapper """

    def __init__(self):
        self.r = Redis.from_url(
            os.environ.get("REDIS_URL"), decode_responses=True)

    def _set(self, hashname, key, val):
        """ Set wrapper for loading hashed dict """
        return self.r.hset(hashname, key, json.dumps(val))

    def _get(self, hashname, key):
        """ Get wrapper for loading hashed dict """
        try:
            res = json.loads(self.r.hget(hashname, key))
            return res
        except:
            return None

    def clear(self):
        """ Clear all data in database """
        return self.r.flushall()

    def load_dict(self, hashname, dic):
        """ Load nested dict to hash with serialized data """
        for key in dic.keys():
            self._set(hashname, key, dic[key])

    def load_dict_to_lists(self, prefix, dictionary):
        """ Load dict with nested lists as values """
        for item in dictionary.items():
            if item[1]:
                for i in item[1]:
                    self.r.rpush(prefix + item[0], json.dumps(i))

    def load_set(self, name, items):
        """ Load set """
        return self.r.sadd(name, *items)

    def get_user(self, username):
        """ Get userdata from users table """
        return self._get("users", username)

    def update_user(self, username, key, value):
        """ Updates dict of userdata with provided key and value """
        data = self.get_user(username)
        data.update({key: value})
        return self._set("users", username, data)

    def get_all_users(self):
        """ Returns set of usernames of all users """
        return self.r.hkeys("users")

    def has_user(self, username):
        """ Check if username exists in db already """
        return self.r.hexists("users", username)

    def get_all_users_data(self):
        """ Returns nested dict of all existing users data """
        return {k: json.loads(v) for k, v in self.r.hgetall("users").items()}

    def get_all_channels(self):
        """ Returns set of all channel names """
        return self.r.smembers("channels")

    def get_channel_members(self, channel):
        """ Returns set of channel members of a requested channel """
        return self._get("channel_members", channel)

    def get_user_in_channels(self, username):
        """ Returns set of channel names where selected user belongs """
        return self._get("user_in_channels", username)

    def add_user(self, username, data):
        """ Add new user to all necessary tables """
        self._set("users", username, data)
        self._set("user_in_channels", username, [])

    def add_channel(self, name):
        """ Add new channel to all necessary tables """
        self._set("channel_members", name, [])
        self._set("messages", name, [])
        self.r.sadd("channels", name)

    def add_user_to_channel(self, user, channel):
        """ Add user to channel and adjust data in tables """
        channel_members = set(self._get("channel_members", channel))
        user_in_channels = set(self._get("user_in_channels", user))
        channel_members.add(user)
        user_in_channels.add(channel)
        self._set("channel_members", channel, list(channel_members))
        self._set("user_in_channels", user, list(user_in_channels))

    def add_message(self, channel, message):
        """ Add new message to messages:{channel} table """
        self.r.rpush("message:" + self.resolve_chat_name(channel),
                     json.dumps(message))

    def get_all_messages(self, channel):
        """ Get all messages in a chat """
        if channel:
            return [json.loads(n) for n in self.r.lrange("message:" + self.resolve_chat_name(channel), 0, -1)]
        else:
            return None

    def resolve_chat_name(self, chatname):
        """ Resolves to proper chat name as stored in db """
        if chatname.startswith("user:"):
            res = [chatname[5:], session.get("username")]
            res.sort()
            return ":".join(res)
        else:
            return chatname

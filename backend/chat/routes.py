""" App routes """
import os
from flask import render_template, session, request, make_response, send_from_directory
from dotmap import DotMap
from . import db, app, config
from .helpers import login_required
from .users import announce_update_users
from .templates import template

SIGNAL = DotMap(config['variables']['socketio'])
BLANK_PIXEL = config['assets']['BLANK_PIXEL']


@app.route("/")
@login_required
def index():
    """ Load index page with custom user data """
    return template("index", channel=session.get("current_chat"))


@app.route('/login', methods=['GET', 'POST'])
def login():
    """ Load login page """
    print("login route")
    if request.method == "POST":
        session.clear()
        print(request)
        print(request.form.get('user_location'))
        f = request.files.get('file')
        avatar_path = BLANK_PIXEL
        if f.filename != "mockfile":
            avatar_path = f.filename
            f.save(os.path.join(app.config['UPLOAD_FOLDER'], avatar_path))

        username = request.form.get('user_name')
        # If username already exists
        if db.has_user(username):
            return make_response("Username already exists", 409)

        # If username not provided
        if len(username) < 1 or username is '':
            return make_response("Invalid username", 422)

        userdata = {"avatar": avatar_path,
                    "location": request.form.get('user_location'),
                    "status": request.form.get('user_status')
                    }
        session['username'] = username
        session['user_avatar'] = userdata['avatar']
        session['user_location'] = userdata['location']
        session['user_status'] = userdata['status']
        session['current_chat'] = "General"
        session.modified = True
        announce_update_users()

        response = make_response("User logged in", 200)
        db.add_user(username, userdata)
        return response

    elif request.method == "GET":
        return render_template("login.html")


@app.route('/upload', methods=["POST"])
def file_upload():
    """ Upload image """
    f = request.files.get('file')
    avatar_path = BLANK_PIXEL
    if f.filename != "mockfile":
        avatar_path = f.filename
        f.save(os.path.join(app.config['UPLOAD_FOLDER'], avatar_path))
    response = make_response("File uploaded", 200)
    return response


@app.route('/<filename>')
def uploaded_file(filename):
    """ Serve images """
    return send_from_directory(app.config['UPLOAD_FOLDER'],
                               filename)

import os
from flask import request, Flask, render_template
from config import app, mail
from flask_mail import Mail, Message


@app.route("/")
def index():
    image_list = os.listdir(os.path.join(app.static_folder, "images/view"))
    return render_template("index.html", image_list=image_list)


@app.route("/rsvp", methods=("GET", "POST"))
def send_rsvp():
    if request.method == "POST":
        mail_message = Message(
            "Hello!",
            recipients=["pinnewaert@gmail.com"],
        )
        mail_message.body = "This is a test"
        mail.send(mail_message)
        return "Mail has sent"

    return render_template("rsvp.html")

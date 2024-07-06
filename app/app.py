from flask import render_template
from config import app, mail
from flask_mail import Mail, Message


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/send-rsvp")
def send_rsvp():
    mail_message = Message(
        "Hello!",
        recipients=["pinnewaert@gmail.com"],
    )
    mail_message.body = "This is a test"
    mail.send(mail_message)
    return "Mail has sent"

import os
from flask import request, Flask, render_template, send_from_directory, abort
from config import app, mail
from flask_mail import Mail, Message
from csv import writer
SECRET_KEY='lisa-marino'

@app.route("/")
def index():
    image_list = os.listdir(os.path.join(app.static_folder, "images/view"))
    return render_template("index.html", image_list=image_list)


@app.route("/rsvp", methods=("GET", "POST"))
def send_rsvp():
    if request.method == "POST":
        data = request.form.to_dict()
        print(data)
        FIELDS = ['name', 'first-name', 'email', 'attend', 'count', 'food-everything', 'food-vegi', 'food-algergy', 'remarks' ]
        csv_file = 'app/static/guest-list.csv'

        if not os.path.exists(csv_file):
            with open(csv_file, 'w', newline='') as f_object:
                writer_object = writer(f_object)
                writer_object.writerow(FIELDS)  # Write the headers

        new_row = []
        for field in FIELDS:
            new_row.append(data.get(field) or '')
        
        with open(csv_file, 'a') as f_object:
            writer_object = writer(f_object)
            writer_object.writerow(new_row)


        mail_message = Message(
            f"{data.get('name')} {data.get('first-name')} - {data.get('attend')} - {data.get('count')}",
            recipients=[os.getenv("MAIL_USERNAME")],
        )
        mail_message.body = f"""
            {data.get('name')} {data.get('first-name')}
            {"Komt niet" if data.get('attend') == 'niet' else f'komt naar {data.get('attend')} met {data.get('count')}'}
            Alles: {data.get('food-everything', 'Nee')} - Vegi:{data.get('food-everything', 'Nee')} - Alergie: {data.get('food-algergy', 'Nee')}
            Opmerkingen: {data.get('remarks')}
        """
        mail.send(mail_message)
        return render_template("succes.html")

    return render_template("rsvp.html")

@app.route("/download", methods=["GET"])
def download_file():
    key = request.args.get('key')
    if key != SECRET_KEY:
        abort(403, description="Forbidden: Invalid token")

    return send_from_directory(directory='static', path='guest-list.csv', as_attachment=True)

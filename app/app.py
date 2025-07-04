import os
import time
from PIL import Image, ImageOps
from flask import request, Flask, render_template, send_from_directory, abort, send_file
from app.config import app, mail
from flask_mail import Mail, Message
from csv import writer
SECRET_KEY='lisa-marino'

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

@app.route("/")
def index():
    return render_template("index.html")


@app.route("/rsvp", methods=("GET", "POST"))
def send_rsvp():
    if request.method == "POST":
        data = request.form.to_dict()
        print(data)
        FIELDS = ['name', 'first-name', 'email', 'attend', 'count', 'food-everything', 'food-vegi', 'food-algergy', 'remarks' ]
        csv_file = 'static/guest-list.csv'

        if not os.path.exists(csv_file):
            os.makedirs(os.path.dirname(csv_file), exist_ok=True)
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
            {"Komt niet" if data.get('attend') == 'niet' else f"komt naar {data.get('attend')} met {data.get('count')}"}
            Alles: {data.get('food-everything', 'Nee')} - Vegi:{data.get('food-vegi', 'Nee')} - Alergie: {data.get('food-algergy', 'Nee')}
            Opmerkingen: {data.get('remarks')}
        """
        mail.send(mail_message)
        return render_template("succes.html")

    return render_template("rsvp.html")

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route("/fotos", methods=("GET", "POST", "DELETE"))
def fotos():
    file_upload_path = os.path.join(app.static_folder, "images/upload")
    if not os.path.exists(file_upload_path):
        os.makedirs(file_upload_path)

    if request.method == "POST":
        files = request.files.getlist('files')
        print(files)
        if not files or all(f.filename == '' for f in files):
            abort(404, description="No files given")
 
        uploaded = []
        for file in files:
            if file.filename != '' and allowed_file(file.filename):
                save_file_name = str(time.time()) + file.filename
                uploaded.append(file.filename)
                img = Image.open(file)
                img = ImageOps.exif_transpose(img)
                webp_filename = save_file_name.rsplit('.', 1)[0] + '.webp'
                webp_path = os.path.join(file_upload_path, webp_filename)
                img.save(webp_path, 'WEBP')

        print(uploaded)
        image_list = os.listdir(file_upload_path)
        image_list.sort()
        image_list.reverse()
        return render_template("fotos.html", image_list=image_list, show_upload=False)

    if request.method == "DELETE":
        data = request.form.to_dict()
        image_url = data.get('imageUrl') # Get the 'imageUrl' key from the JSON data
        image_name = image_url.split('/')[-1]
        print(image_name)
        os.remove(f'{file_upload_path}/{image_name}')
        return  ('', 204)

    show_upload = bool(request.args.get('upload'))
    admin = bool(request.args.get('admin-hihi'))
    print(show_upload)

    image_list = os.listdir(file_upload_path)
    image_list.sort()
    image_list.reverse()

    print(image_list)
    return render_template("fotos.html", image_list=image_list, show_upload=show_upload, admin=admin)


@app.route("/download", methods=["GET"])
def download_file():
    key = request.args.get('key')
    if key != SECRET_KEY:
        abort(403, description="Forbidden: Invalid token")

    csv_file = 'static/guest-list.csv'
    FIELDS = ['name', 'first-name', 'email', 'attend', 'count', 'food-everything', 'food-vegi', 'food-algergy', 'remarks' ]

    if not os.path.exists(csv_file):
        os.makedirs(os.path.dirname(csv_file), exist_ok=True)
        with open(csv_file, 'w', newline='') as f_object:
            writer_object = writer(f_object)
            writer_object.writerow(FIELDS)  # Write the headers

    return send_file('/app/static/guest-list.csv')

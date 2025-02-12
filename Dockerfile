FROM python:slim-buster

WORKDIR /app

COPY . .
RUN pip install -r requirements.txt

ENV FLASK_APP="app"

EXPOSE 8080

# replace APP_NAME with module name
CMD ["gunicorn", "-b", "0.0.0.0:8080", "app.wsgi:app"]
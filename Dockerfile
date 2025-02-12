FROM python:slim-buster

WORKDIR /app

COPY . .
RUN pip install -r requirements.txt

ENV FLASK_APP="app"

EXPOSE 8080

# Bind to both IPv4 and IPv6
ENV GUNICORN_CMD_ARGS="--bind=[::]:8080 --workers=2"

# replace APP_NAME with module name
CMD ["gunicorn", "app.wsgi:app"]
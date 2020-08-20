# Connect to db
sudo docker run -it --link postgis:postgres --rm postgres \
    sh -c 'exec psql -h "$POSTGRES_PORT_5432_TCP_ADDR" -p "$POSTGRES_PORT_5432_TCP_PORT" -U test' 
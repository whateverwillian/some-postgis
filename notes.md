# PostGIS Docker
sudo docker run --name some-postgis -e POSTGRES_PASSWORD=test -e POSTGRES_DB=test -e POSTGRES_USER=test -d postgis/postgis -p 5432:5432
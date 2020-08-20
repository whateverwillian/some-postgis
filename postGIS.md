# Tutorial

PostGIS é uma "3rd party extension for postgres" e nós podemos adicionar essa extensão com:

    >> create extension postgis;

Quando nós trabalhamos com geolocalização onde você vai estar basicamente lidando com distâncias, postGIS nos recomenda utilizar uma column do tipo "geography"

o tipo "geography" é menor que o tipo "geometry" e tem menos funções, mas ele não necessita que tenhamos conhecimento de projeções e "planar coordinate systems" 

Vamos adicionar uma coluna geography e ver como podemos trabalhar com os dados (supondo que temos uma table addresses com vários registros):

    >> alter table addresses add column geolocation geography()

geography aceita dois argumentos

    The first argument is an optional type modifier, which can be used to restrict the kinds of shapes and dimensions allowed for the column. 
    
    Since we are going to be using latitude and longitude coordinates, we can pass point as our type modifier.

    >> geography(point)

    The second argument is an optional spatial resource identifier, or SRID. If the SRID option is omitted, the geography column will default to a value of 4326, which is the SRID for WGS 84, the World Geodetic System of 1984, and the standard for the Global Positioning System.

Agora, com a nossa nova geography column, a gente pode começar à a adicionar os dados, existem algumas formas de fazer isso:

    1) The first is to use strings, so we'll update addresses and set geolocation to a string in a specific format, which PostGIS refers to as a Well-Known Text representation, or WKT. In this case, our WKT starts with the type of data we're inserting, which is point, followed by parentheses and the two coordinate values. PostGIS points follow the same rules as Postgres points when it comes to latitude and longitude coordinates; they both expect longitude first, followed by latitude.

    >> update addresses set geolocation = 'point(-81 30)' where id=1;

    PostGIS points funcionam como os Postgres points em relação à coordenadas lag/lng, os dois esperam longitude primeiro, e latitude depois (x, y)

    2) The second way to update our geolocation column is to use the PostGIS ST_MakePoint function. This function accepts as arguments our longitude and latitude coordinates, again with longitude first, and saves them as a point in the database. 

    >> update addresses set geolocation = ST_MakePoint(long, lat);

    A thing to note on the ST_MakePoint function is that it doesn't automatically know the SRID we're looking for. In our last example, because we're inserting into the database and the column has the SRID set, we're covered. 

    However, if we were trying to compare or select an arbitrary point value with ST_MakePoint, the SRID would be unknown.

    In such cases, we would need to wrap our ST_MakePoint function up in an ST_SetSRID function, and explicitly tell PostGIS the SRID we're intending to use.

    >> update addresses set geolocation = ST_SetSRID(ST_MakePoint(long, lat), 4326);
    
With our geolocation column populated, we can now start comparing the distances between our addresses.
    
We're going to look at two distance queries. The first is determining the distance between addresses. The second is finding addresses within a certain radius of another address.

    1) Let's start with calculating the distance between two addresses.

    >> select name
    >> from adresses a,
    >> lateral (
    >>   select id, geolocation from adresses where name = "hash" 
    >> ) as hr_jax
    >> where a.id <> hr_jax.id
    >> order by distance;

    To calculate the distance between the Hashrocket Jacksonville office and all of the other addresses in our table, we're going to select from addresses and do a lateral join to get the Hashrocket Jacksonville address as a location to compare the other locations to. 

    >> select name, ST_Distance(a.geolocation, hr_jax.geolocation) as distance
    >> from adresses a,
    >> lateral (
    >>   select id, geolocation from adresses where name = "hash" 
    >> ) as hr_jax
    >> where a.id <> hr_jax.id
    >> order by distance;

    With that set up, we can complete our select statement to determine the distance between the Hashrocket Jacksonville geolocation and our other geolocations, using the "ST_Distance" function provided to us by the PostGIS module. This function expects to be given two points to compare, and returns the distance in meters between the two points.
     
    >> select name, ST_Distance(a.geolocation, hr_jax.geolocation) as distance
    >> from adresses a,
    >> lateral (
    >>   select id, geolocation from adresses where name = "hash" 
    >> ) as hr_jax
    >> where a.id <> hr_jax.id and ST_Distance(a.geolocation, hr_jax.geolocation) < 1000
    >> order by distance;
    
    To only find addresses within a certain distance of the Jacksonville office, we can make a quick modification to our existing query. Since we already know how to get the distance between our two points, we can reuse the same logic passing it now as part of our where clause, and using it in an inequality to check that the distance between the addresses is less than a specific value, say 1 kilometer, or 1000 meters.


# Full tutorial transcription


Hey everyone, today we're going to look at how to use the PostGIS extension to work with geolocations in Postgres.

PostGIS is a third party extension for Postgres, and can be added by using the Postgres "create extension" command.

When working with geolocations, where you're typically dealing with distance measurements, PostGIS recommends using the "geography" column type. This type is slower than the "geometry" type and has fewer functions available, but it doesn't require us to have knowledge of projections and planar coordinate systems.

Let's add a geography column to a table and see how we can work with the data.

In this example, we have a table called addresses, with a few existing entries. 

We're going to use the alter table command to add a column name geolocation of type geography. The geography type can receive up to two arguments. 

The first argument is an optional type modifier, which can be used to restrict the kinds of shapes and dimensions allowed for the column. Since we are going to be using latitude and longitude coordinates, we can pass point as our type modifier. 

The second argument is an optional spatial resource identifier, or SRID. If the SRID option is omitted, the geography column will default to a value of 4326, which is the SRID for WGS 84, the World Geodetic System of 1984, and the standard for the Global Positioning System.

By inspecting our table again, we can see the new geography column added, with 4326 as the SRID option.

With our new geography column in place, we now need to start adding data. There are a few ways we can do this.

The first is to use strings, so we'll update addresses and set geolocation to a string in a specific format, which PostGIS refers to as a Well-Known Text representation, or WKT. In this case, our WKT starts with the type of data we're inserting, which is point, followed by parentheses and the two coordinate values. PostGIS points follow the same rules as Postgres points when it comes to latitude and longitude coordinates; they both expect longitude first, followed by latitude.

We can now read from our table, looking for the row we just tried to update, and see that there is a value for the geolocation.

The second way to update our geolocation column is to use the PostGIS ST_MakePoint function. This function accepts as arguments our longitude and latitude coordinates, again with longitude first, and saves them as a point in the database. 

A thing to note on the ST_MakePoint function is that it doesn't automatically know the SRID we're looking for. In our last example, because we're inserting into the database and the column has the SRID set, we're covered. 

However, if we were trying to compare or select an arbitrary point value with ST_MakePoint, the SRID would be unknown.

In such cases, we would need to wrap our ST_MakePoint function up in an ST_SetSRID function, and explicitly tell PostGIS the SRID we're intending to use.

With our geolocation column populated, we can now start comparing the distances between our addresses.
We're going to look at two distance queries. The first is determining the distance between addresses. The second is finding addresses within a certain radius of another address.

Let's start with calculating the distance between two addresses.

To calculate the distance between the Hashrocket Jacksonville office and all of the other addresses in our table, we're going to select from addresses and do a lateral join to get the Hashrocket Jacksonville address as a location to compare the other locations to. With that set up, we can complete our select statement to determine the distance between the Hashrocket Jacksonville geolocation and our other geolocations, using the "ST_Distance" function provided to us by the PostGIS module. This function expects to be given two points to compare, and returns the distance in meters between the two points.

We can see from our output that we now have the distance of each address from the Hashrocket Jacksonville office. 

To only find addresses within a certain distance of the Jacksonville office, we can make a quick modification to our existing query. Since we already know how to get the distance between our two points, we can reuse the same logic passing it now as part of our where clause, and using it in an inequality to check that the distance between the addresses is less than a specific value, say 1 kilometer, or 1000 meters.

With that change, we can see from our output that we are now only including addresses that are up to a kilometer from our Hashrocket Jacksonville address.
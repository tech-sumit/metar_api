# **METAR API** for **HARMONIZE HQ** Backend Developer Assignment
## Prerequisits
    Docker version 19+
    docker-compose version 1.27+
## Required .env vals
    REDIS_HOST=redis
    REDIS_PORT=6379
    PORT=8080
    REFRESH_INTERVAL=5
    NODE_ENV=<developement/production> 
## RUN
    $ docker-compose up
## cURL
    $ curl --location --request GET 'http://localhost:8080/metar/info?scode=KHUL'

## Sample output

    redis    | 1:M 28 Oct 2020 07:53:26.882 * Ready to accept connections
    metar    | INIT - Locating METAR Stations...
    metar    | 10714
    redis    | 1:M 28 Oct 2020 07:53:39.761 * DB saved on disk
    metar    | INIT: OK
    metar    | Server started on port: 8080

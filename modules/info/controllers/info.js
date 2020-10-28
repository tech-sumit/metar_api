var metar = require('metar')
const req = require('request')
const cheerio = require('cheerio')

//REDIS INIT
const redis = require('../../../connections/redis');

var stations = [];
const METAR_URL = 'https://tgftp.nws.noaa.gov/data/observations/metar/stations/'
const KEY_EXPIRY = process.env.REFRESH_INTERVAL * 60 * 1000

// GET - /metar/info?scode=<STATION_NAME>
module.exports.get = (request, response) => {
    if (!request.query.scode) {
        console.log('scode not found')
        response.status(204).end()
    } else {
        if (stations.find(e => e == request.query.scode) == undefined) {
            response.status(204).send({ reason: "Invalid scode" })
        } else {
            var station = request.query.scode.toUpperCase()
            if (request.headers['nocache'] == undefined) {
                redis.getData(request.query.scode.toUpperCase(), data => {
                    console.log(data)
                    if (!data) {
                        getOne(station, data => {
                            if (data) {
                                redis.setDataWithEX(station, JSON.stringify(data), KEY_EXPIRY, status => console.log(station + '=>' + status))
                                response.status(200).send(data)
                            } else {
                                response.status(204).end()
                            }
                        })
                    } else {
                        try {
                            response.status(200).send(JSON.parse(data))
                        } catch (error) {
                            console.log(error)
                            response.status(204).end()
                        }
                    }
                })
            } else {
                getOne(station, data => {
                    if (data) {
                        redis.setDataWithEX(station, JSON.stringify(data), KEY_EXPIRY, status => console.log(station + '=>' + status))
                        response.status(200).send(data)
                    } else {
                        response.status(204).end()
                    }
                })
            }
        }
    }
}

getOne = (station, callback) => {
    req(METAR_URL + station + ".TXT", (err, res, body) => {
        if (res.statusCode == 200) {
            try {
                var timestamp = body.split('\n')[0]
                var data = metar(body.split('\n')[1])
                var direction = ['N', 'E', 'S', 'W', 'N']
                data = {
                    station: station,
                    last_observation: ('' + timestamp).replace(' ', ' at ') + ' GMT',
                    temperature: data.temperature ? `${data.temperature} C (${Math.round((data.temperature - 32) * 5 / 9)} F)` : "Not Spacified",
                    wind: data.wind.speed ? `${direction[Math.round(data.wind.direction / 90)]} at ${Math.round(data.wind.speed * 1.609344)} mph (${data.wind.speed} knots)` : 'Not Spacified'
                }
                callback(data)
            } catch (error) {
                console.log('Cant cache ' + station)
                callback()
            }
        } else {
            callback()
        }
    });
}

// INIT STATIONS LIST
module.exports.init = (callback) => {
    console.log('INIT - Locating METAR Stations...')
    req(METAR_URL, (err, res, body) => {
        $ = cheerio.load(body);
        stations.length = 0
        $('tr').children('td').children('a').filter((i, elem) => {
            stations.push(('' + elem.children[0].data).split('.')[0])
        })
        stations = stations.slice(1, stations.length)

        console.log(stations.length)

        redis.flushAll(status => {
            console.log('INIT: ' + status)
            callback(true)
        })
        // ****** Uncommenting following block will start caching all stations ****** 
        // ****** Commented because of performance issues ****** 
        // let workerFarm = require('worker-farm')
        // var worker = workerFarm(require.resolve('./refresh'))
        // worker({ url: METAR_URL, stations: stations }, (err, status) => {
        //     console.log(err)
        //     console.log(data)
        //     console.log('***************Returned to master******************')
        //     workerFarm.end(worker)
        // })
    })
}

// SET CRON FOR RE-INIT AT EACH REFRESH_INTERVALs
var CronJob = require("cron").CronJob;
var time = require('cron-time-generator').every(parseInt(process.env.REFRESH_INTERVAL)).minutes()
new CronJob(
    time,
    () => this.init(status => console.log('Stations refreshed')),
    null,
    true,
    "Asia/Kolkata"
);

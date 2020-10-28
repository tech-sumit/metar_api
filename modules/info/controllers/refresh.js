require("dotenv").config();
var metar = require('metar')
const redis = require('../../../connections/redis');
const req = require('request')
const KEY_EXPIRY = process.env.REFRESH_INTERVAL * 60 * 1000

module.exports = (data, callback) => {
    console.log(data)
    var counter = 0
    var length = data.stations.length
    data.stations.map((station) => {
        req(data.url + station + ".TXT", (err, res, body) => {
            console.log(err)
            if (res && res.statusCode && res.statusCode == 200) {
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
                    console.log(data)
                    redis.setDataWithEX(station, JSON.stringify(data), KEY_EXPIRY, status => console.log(station + '=>' + status))
                } catch (error) {
                    console.log(error)
                    console.log('Cant cache ' + station)
                }
            }
            counter++
            if (counter == length) {
                console.log('***************Completed refresh******************')
                callback(true)
            }
        });
    })
}

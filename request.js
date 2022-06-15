const http = require("http")
const CacheableLookup = require("cacheable-lookup")
const cacheable = new CacheableLookup()

const TIMEOUT_IN_MILLISECONDS = 30 * 1000
const NS_PER_SEC = 1e9
const MS_PER_NS = 1e6
cacheable.install(http.globalAgent)

const request = ({ method = "GET", protocol, hostname, port, path, headers = {}, body } = {}, callback) => {
    const eventTimes = {
        // use process.hrtime() as it's not a subject of clock drift
        startAt: process.hrtime(),
        dnsLookupAt: undefined,
        tcpConnectionAt: undefined,
        tlsHandshakeAt: undefined,
        firstByteAt: undefined,
        endAt: undefined,
    }

    // Making request
    const _request = http.request(
        {
            protocol,
            method,
            hostname,
            port,
            path,
            headers,
        },
        (response) => {
            let responseBody = ""

            _request.setTimeout(TIMEOUT_IN_MILLISECONDS)

            // Response events
            response.once("readable", () => {
                eventTimes.firstByteAt = process.hrtime()
            })
            response.on("data", (chunk) => {
                responseBody += chunk
            })

            // End event is not emitted when stream is not consumed fully
            // in our case we consume it see: response.on('data')
            response.on("end", () => {
                eventTimes.endAt = process.hrtime()

                callback(null, {
                    headers: response.headers,
                    timings: getTimings(eventTimes),
                    body: responseBody,
                })
            })
        },
    )

    // Request events
    _request.on("socket", (socket) => {
        socket.on("lookup", () => {
            eventTimes.dnsLookupAt = process.hrtime()
        })
        socket.on("connect", () => {
            eventTimes.tcpConnectionAt = process.hrtime()
        })
        socket.on("secureConnect", () => {
            eventTimes.tlsHandshakeAt = process.hrtime()
        })
        socket.on("timeout", () => {
            _request.destroy()

            const err = new Error("ETIMEDOUT")
            err.code = "ETIMEDOUT"
            callback(err)
        })
    })
    _request.on("error", callback)

    // Sending body
    if (body) {
        _request.write(body)
    }

    _request.end()
}

const getTimings = (eventTimes) => {
    return {
        // There is no DNS lookup with IP address
        dnsLookup:
            eventTimes.dnsLookupAt !== undefined
                ? getHrTimeDurationInMs(eventTimes.startAt, eventTimes.dnsLookupAt)
                : undefined,
        tcpConnection: getHrTimeDurationInMs(eventTimes.dnsLookupAt || eventTimes.startAt, eventTimes.tcpConnectionAt),
        tlsHandshake:
            eventTimes.tlsHandshakeAt !== undefined
                ? getHrTimeDurationInMs(eventTimes.tcpConnectionAt, eventTimes.tlsHandshakeAt)
                : undefined,
        firstByte: getHrTimeDurationInMs(
            eventTimes.tlsHandshakeAt || eventTimes.tcpConnectionAt,
            eventTimes.firstByteAt,
        ),
        contentTransfer: getHrTimeDurationInMs(eventTimes.firstByteAt, eventTimes.endAt),
        total: getHrTimeDurationInMs(eventTimes.startAt, eventTimes.endAt),
    }
}

const getHrTimeDurationInMs = (startTime, endTime) => {
    const secondDiff = endTime[0] - startTime[0]
    const nanoSecondDiff = endTime[1] - startTime[1]
    const diffInNanoSecond = secondDiff * NS_PER_SEC + nanoSecondDiff

    return diffInNanoSecond / MS_PER_NS
}

module.exports = request

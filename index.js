const url = require("url")
const http = require("http")
const request = require("./request")

const responseHeader = {
    contentType: { "Content-Type": "application/json" },
}

const requestListener = (req, serverResponse) => {
    const { query } = url.parse(req.url, true)
    const getValuefor = query["key"] || ""

    request(
        Object.assign(
            url.parse(
                `http://${process.env.URL_LOCAL_DB}/_fabric/_system/_api/kv/${process.env.COLLECTION_KV_NAME}/value/${getValuefor}`,
            ),
            {
                headers: {
                    Authorization: `apikey ${process.env.API_KEY}`,
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
            },
        ),
        (error, response) => {
            if (error) {
                serverResponse.writeHead(500, responseHeader.contentType)
                serverResponse.end(JSON.stringify(error))
                return
            }

            serverResponse.writeHead(200, responseHeader.contentType)
            serverResponse.end(JSON.stringify({ ...JSON.parse(response.body), latency: response.timings }))
        },
    )
}

const server = http.createServer(requestListener)
server.listen(8080)
console.log("Server running on port 8080")

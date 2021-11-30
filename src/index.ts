import express from "express";
import http from "http";
import { router as route_api } from "./routes/api";
import { router as route_client } from "./routes/client";
import path from "path";
import { TagService, SocketService } from "./shared";
import { RedisTag } from "./services/tag";


const app = express()
const webserver = http.createServer(app)
const sock = SocketService
const tagDB = TagService

// Render using Template engine (EJS)
app.set('views', path.join(__dirname, "views"))
app.set("view engine", "ejs")

// Functional routes
app.use("/api/", route_api)
app.use("/client/", route_client)

// Serve static files
app.use(express.static("static"))

// Bind socket to http server
sock.listen(webserver)

sock.on("connection", (client) => {
	console.log(`Client '...${client.id.slice(14)}' connected.`)
	client.on("tag", (data: string) => {
		tagDB.getAllTags().then((allTags: Array<RedisTag>) => {
			if (allTags.some((itag) => { return (itag.name == data) })) {
				client.join(data)
			} else {
				console.log(`Client ${client.id} requested non-existant tag ${data}`)
			}
		})
	})
})

webserver.listen(Number(process.env.HTTP_PORT) | 8080, () => {
	console.log('listening on *:8080');
})

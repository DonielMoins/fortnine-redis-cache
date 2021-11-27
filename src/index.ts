import express from "express";
import http from "http";
import socketSrv from "./services/socket";
import { router } from "./routes/api";


const app = express()
const webserver = http.createServer(app)
const sock = new socketSrv.sock(webserver)

app.use("/api/", router)

webserver.listen(Number(process.env.HTTP_PORT) | 8080, () => {
	console.log('listening on *:8080');
})

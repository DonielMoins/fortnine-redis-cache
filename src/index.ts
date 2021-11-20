import express from "express";
import http from "http";
import bluebird from "bluebird";
import { router } from "./routes/api";

const app = express()
const webserver = http.createServer(app)

app.use("/api/", router)

webserver.listen(Number(process.env.HTTP_PORT) | 8080, () => {
	console.log('listening on *:8080');
})

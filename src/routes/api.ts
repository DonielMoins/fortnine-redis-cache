import express from "express";
import { CLIPool } from "../services/redis";

var router = express.Router()

// middleware that is specific to this router
router.use(function timeLog(_req: express.Request, _res: express.Response, next) {
	console.log('API: Time: ', Date.now())
	next()
})
// define the home page route
router.get('/', (req: express.Request, res: express.Response) => {
	res.send("use Options")
})

router.options('/', (req: express.Request, res: express.Response) => {
	res.send("WIP ;p")
})

router.get("/key/{:key}", (req: express.Request, res: express.Response) => {

});


export { router };

import express from "express";
var router = express.Router()

// middleware that is specific to this router
router.use(function timeLog(_req: express.Request, _res: express.Response, next) {
    console.log('API: Time: ', Date.now())
    next()
})
// define the home page route
router.options('/', (req: express.Request, res: express.Response) => {
    res.send("404")
})


export { router };

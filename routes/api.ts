import express from "express";
var router = express.Router()

// middleware that is specific to this router
router.use(function timeLog(req, res, next) {
    console.log('API: Time: ', Date.now())
    next()
})
// define the home page route
router.get('/', function (req: express.Request, res: express.Response) {
    if (req.params["force"]) {
        redis_data = await redis
    }
})
// define the about route
router.get('/about', function (req, res) {
    res.send('About birds')
})

module.exports = router
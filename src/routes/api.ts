import express from "express";
import { RedisTag } from "../services/tag";
import { RedCLIPool as CLIPool, TagService as srv } from "../shared";

var router = express.Router()

// middleware that is specific to this router
router.use(function timeLog(_req: express.Request, _res: express.Response, next) {
    console.log('API: Time: ', Date.now())
    next()
})
// define the home page route
// router.get('/', (req: express.Request, res: express.Response) => {
// 	res.send("fetch using options")
// })

router.options('/', (req: express.Request, res: express.Response) => {
    let data = "HELLO";
    router.stack.forEach((layer) => data.concat((typeof layer.route != "undefined") ? layer.route.path : "No Path"))
    res.send(data)
})

// TESTING ONLY !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^6
router.get('/', (req: express.Request, res: express.Response) => {
    let data = "<h1>Routes:</h1>";
    router.stack.forEach((layer) => {
        let route = "<p>" + ((typeof layer.route != "undefined") ? JSON.stringify(layer.route) : "No Path") + "</p>"
        data += route
    })
    res.send(data)
})

router.get("/key/:key", (req: express.Request, res: express.Response) => {
    CLIPool.getKey(req.params["key"]).then((data) => {
        console.log(data)
        res.send(data);
    })
});


router.get("/tag/:tag", (req: express.Request, res: express.Response) => {
    var redtag = srv.getTag(req.params["tag"])
    if (redtag) {
        var data = srv.fetchAllTagRedis(redtag, CLIPool)
        res.send(data)
    } else {
        res.sendStatus(404)
    }

})

export { router };

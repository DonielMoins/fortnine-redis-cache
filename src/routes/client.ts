import express from "express";
import path from "path";

var router = express.Router()

router.get("/:tag", (req, res) => {
	res.render('client', { tag: req.params["tag"] })
})

export { router };
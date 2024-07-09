const express = require('express');

const { getAllTestMsg } = require('../controllers/testController');

const router = express.Router();


router.get("/", getAllTestMsg);


module.exports = router;
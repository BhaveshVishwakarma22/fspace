const express = require('express');

const { getAllMasterUsers, createMasterUser, loginMaster } = require('../controllers/masterUserController');
const { constants } = require('../constants');

const router = express.Router();


router.get("/", getAllMasterUsers);

router.post("/", createMasterUser);

router.post("/login", loginMaster);

















router.use("/profile", express.static("upload/images/master"));


module.exports = router;
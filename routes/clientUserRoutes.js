const express = require('express');
const router = express.Router();

const { constants } = require('../constants');
const { getAllClients, deleteClient, updateClient, createClient, getSingleClientById, getIDClientByEmail, loginClient } = require('../controllers/clientController');



router.get("/", getAllClients);

router.get("/id", getSingleClientById);

router.get("/email", getIDClientByEmail);

router.post("/", createClient);

router.post("/login", loginClient);

router.put("/", updateClient);

router.delete("/", deleteClient);


router.use("/profile", express.static("upload/images/master"));


module.exports = router;

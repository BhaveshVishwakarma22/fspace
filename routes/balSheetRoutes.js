const express = require('express');
const router = express.Router();

const { 
    getAllBalSheet,
    getAllBalSheetByPid,
    getBalSheetById,
    createBalSheetItem,
    updateBalSheetItem,
    deleteBalSheetItem
} = require('../controllers/balanceSheetController');



router.get("/", getAllBalSheet);

router.get("/id", getBalSheetById);

router.get("/project", getAllBalSheetByPid);

router.post("/", createBalSheetItem);

router.put("/", updateBalSheetItem);

router.delete("/", deleteBalSheetItem);





module.exports = router;

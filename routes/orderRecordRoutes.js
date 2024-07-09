const express = require('express');
const router = express.Router();

const { 
    getAllOrderRecord,
    createOrderRecord,
    updateOrderRecord,
    deleteOrderRecord,
    getOrderRecordById,
    getAllOrderRecordByProjectID
} = require('../controllers/orderByController');



router.get("/", getAllOrderRecord);

router.get("/id", getOrderRecordById);

router.get("/project", getAllOrderRecordByProjectID);

router.post("/", createOrderRecord);

router.put("/", updateOrderRecord);

router.delete("/", deleteOrderRecord);





module.exports = router;

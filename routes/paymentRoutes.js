const express = require('express');
const router = express.Router();

const { 
    getAllPayment,
    createPayment,
    updatePayment,
    deletePayment,
    getPaymentById,
    getAllPaymentByProjectID
} = require('../controllers/paymentController');



router.get("/", getAllPayment);

router.get("/id", getPaymentById);

router.get("/project", getAllPaymentByProjectID);

router.post("/", createPayment);

router.put("/", updatePayment);

router.delete("/", deletePayment);





module.exports = router;

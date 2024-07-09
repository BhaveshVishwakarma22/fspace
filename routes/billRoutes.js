const express = require('express');
const router = express.Router();

const { 
    getAllBillByPid,
    createBill,
    deleteBill,
} = require('../controllers/billController');



router.get("/project", getAllBillByPid);

router.post("/", createBill);

router.delete("/", deleteBill);





module.exports = router;

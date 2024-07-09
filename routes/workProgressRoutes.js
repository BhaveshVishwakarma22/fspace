const express = require('express');
const router = express.Router();

const { 
    getAllWorkprogress,
    getAllWorkProgressByPid,
    getWorkProgressById,
    createWorkProgress,
    updateWorkProgress,
    deleteWorkProgress
} = require('../controllers/workProgressController');



router.get("/", getAllWorkprogress);

router.get("/id", getWorkProgressById);

router.get("/project", getAllWorkProgressByPid);

router.post("/", createWorkProgress);

router.put("/", updateWorkProgress);

router.delete("/", deleteWorkProgress);





module.exports = router;

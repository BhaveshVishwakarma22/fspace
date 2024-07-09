const express = require('express');
const router = express.Router();

const { 
    getAllDesign,
    getAllDesignByPid,
    getDesignById,
    createDesign,
    updateDesign,
    deleteDesign
} = require('../controllers/designController');



router.get("/", getAllDesign);

router.get("/id", getDesignById);

router.get("/project", getAllDesignByPid);

router.post("/", createDesign);

router.put("/", updateDesign);

router.delete("/", deleteDesign);





module.exports = router;

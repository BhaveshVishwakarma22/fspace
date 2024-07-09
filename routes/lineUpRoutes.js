const express = require('express');
const router = express.Router();

const { 
    getAllLineUP,
    createLineUp,
    updateLineUp,
    deleteLineUp,
    getLineUpById,
    getAllLineUpByProjectID
} = require('../controllers/lineUpController');



router.get("/", getAllLineUP);

router.get("/id", getLineUpById);

router.get("/project", getAllLineUpByProjectID);

router.post("/", createLineUp);

router.put("/", updateLineUp);

router.delete("/", deleteLineUp);





module.exports = router;

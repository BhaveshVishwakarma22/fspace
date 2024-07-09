const express = require('express');
const router = express.Router();

const { 
    getAllFeedback,
    createFeedback,
    updateFeedback,
    deleteFeedback,
    getFeedbackById,
    getAllFeedbackByProjectID
} = require('../controllers/feedbackController');



router.get("/", getAllFeedback);

router.get("/id", getFeedbackById);

router.get("/project", getAllFeedbackByProjectID);

router.post("/", createFeedback);

router.put("/", updateFeedback);

router.delete("/", deleteFeedback);





module.exports = router;

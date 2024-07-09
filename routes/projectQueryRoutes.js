const express = require('express');
const router = express.Router();

const { getAllQuestions,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    getQuestionById } = require('../controllers/projectQueryController');



router.get("/", getAllQuestions);

router.get("/id", getQuestionById);

router.post("/", createQuestion);

router.put("/", updateQuestion);

router.delete("/", deleteQuestion);


module.exports = router;

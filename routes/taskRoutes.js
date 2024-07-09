const express = require('express');
const router = express.Router();

const { getAllTask,
    createTask,
    updateTask,
    deleteTask,
    getTaskById,
    getAllTaskAllotedToTeamMember,
    updateTaskStatus,
    getAllTaskBasedOnStatus,
    getAllTaskBasedOnType
 } = require('../controllers/taskController');



router.get("/", getAllTask);

router.get("/team", getAllTaskAllotedToTeamMember);

router.get("/id", getTaskById);

router.get("/status", getAllTaskBasedOnStatus);

router.get("/type", getAllTaskBasedOnType);

router.post("/", createTask);

router.put("/", updateTask);

router.put("/status", updateTaskStatus);

router.delete("/", deleteTask);


module.exports = router;

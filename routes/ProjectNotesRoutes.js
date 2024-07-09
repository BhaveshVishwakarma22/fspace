const express = require('express');
const router = express.Router();

const { 
    getAllProjectNote,
    createProjectNote,
    updateProjectNote,
    deleteProjectNote,
    getProjectNoteById,
    getAllProjectNoteByProjectID
} = require('../controllers/projectNoteController');



router.get("/", getAllProjectNote);

router.get("/id", getProjectNoteById);

router.get("/project", getAllProjectNoteByProjectID);

router.post("/", createProjectNote);

router.put("/", updateProjectNote);

router.delete("/", deleteProjectNote);





module.exports = router;

const express = require('express');
const router = express.Router();

const { 
    getAllProject,
    createProject,
    updateProjectStatusOrArea,
    deleteProject,
    getProjectById,
    getAllProjectByStatus,

    uploadMaterialQuestionnare,
    uploadOptimizeSpaceQuestionnare
} = require('../controllers/projectController');



router.get("/", getAllProject);

router.get("/id", getProjectById);

router.get("/status", getAllProjectByStatus);

router.post("/", createProject);

router.put("/", updateProjectStatusOrArea);

router.delete("/del", deleteProject);


router.put("/material_query_questionare", uploadMaterialQuestionnare);

router.put("/optimize_space_questionare", uploadOptimizeSpaceQuestionnare);







module.exports = router;

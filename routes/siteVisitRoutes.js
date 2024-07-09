const express = require('express');
const router = express.Router();

const { 
    getAllSiteVisit,
    getAllSiteVisitByPid,
    getSiteVisitById,
    createSiteVisit,
    updateSiteVisit,
    deleteSiteVisit
} = require('../controllers/siteVisitController');



router.get("/", getAllSiteVisit);

router.get("/id", getSiteVisitById);

router.get("/project", getAllSiteVisitByPid);

router.post("/", createSiteVisit);

router.put("/", updateSiteVisit);

router.delete("/", deleteSiteVisit);





module.exports = router;

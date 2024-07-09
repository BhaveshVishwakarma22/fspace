const express = require('express');
const router = express.Router();

const { getAllTeamMember,
    createTeamMember,
    updateTeamMember,
    deleteTeamMember,
    getSingleTeamMemberById,
    getIDTeamMemberByEmail,
    loginTeam, } = require('../controllers/teamController');



router.get("/", getAllTeamMember);

router.get("/id", getSingleTeamMemberById);

router.get("/email", getIDTeamMemberByEmail);

router.post("/", createTeamMember);

router.put("/", updateTeamMember);

router.delete("/", deleteTeamMember);

router.post("/login", loginTeam);


router.use("/profile", express.static("upload/images/master"));


module.exports = router;

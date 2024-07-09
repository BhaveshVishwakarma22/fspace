const express = require('express');
const router = express.Router();

const { 
    getAllNotification,
    getNotificationById,
    getAllNotificationByPid,
    createNotification,
    deleteNotification
} = require('../controllers/notificationController');



router.get("/", getAllNotification);

router.get("/id", getNotificationById);

router.get("/project", getAllNotificationByPid);

router.post("/", createNotification);

router.delete("/", deleteNotification);





module.exports = router;

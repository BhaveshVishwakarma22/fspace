const connection = require('../database');

const asyncHandler = require("express-async-handler");
const { constants } = require("../constants");

const multer = require('multer');
const fs = require('fs');
const path = require('path');



function parseJsonFromRespone(input){
    var jsonResponse = JSON.stringify(input);
    var jsonResponse = JSON.parse(jsonResponse);

    return jsonResponse;
}


// Upload

const storage = multer.diskStorage({
	destination: './upload/images/notification',
	filename: (req, file, cb)=>{
		return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
	}
})

const upload = multer({
	storage: storage,
	limits: {
		fileSize: 104857600 	// File Size limit to 100 mb as 00*1024*1024
	}
});



const ports = process.env.PORT || 3000;






//@desc GET all notification
//@route GET /api/notification/
//@access public
const getAllNotification = asyncHandler (async (req, res, next) =>{
    
    let que = `SELECT * FROM notification ORDER BY uploaded_on DESC;`;
    
    connection.query(que, (err, response)=>{
        if(err){
            res.status(constants.VALIDATION_ERROR);
            throw new Error(err.message);
        }

        res.status(constants.GET_SUCCESS).json(response);
        console.log(parseJsonFromRespone(response));
    });
});





//@desc GET single notification by id
//@route GET /api/notification/id
//@access public
const getNotificationById = asyncHandler (async (req, res, next) =>{

    let {id} = req.body;
    if(!id){
        res.status(constants.VALIDATION_ERROR);
        next(new Error("Id required!"));
    }

    if(id != undefined){
        let que = `SELECT * FROM notification WHERE id = ${id} ORDER BY uploaded_on DESC;`;
    
        connection.query(que, (err, response)=>{
            if(err){
                res.status(constants.VALIDATION_ERROR);
                throw new Error(err.message);
            }
    
            const parsedRes = parseJsonFromRespone(response);
            console.log(parsedRes.length);
            if(!parsedRes.length){
                console.log("No available data for this id");
                res.status(constants.VALIDATION_ERROR);
                next(new Error("No available data for this id!"));
            }else{
                res.status(constants.GET_SUCCESS).json(response);
                console.log(parsedRes);
            }
        });
    }else{
        res.status(constants.VALIDATION_ERROR);
        next(new Error("Id undefined!"));
    }
    
});




//@desc GET single notification by id
//@route GET /api/notification/project
//@access public
const getAllNotificationByPid = asyncHandler (async (req, res, next) =>{

    let {pid} = req.body;
    if(!pid){
        res.status(constants.VALIDATION_ERROR);
        next(new Error("pId required!"));
    }

    if(pid != undefined){
        let que = `SELECT * FROM notification WHERE pid = ${pid} ORDER BY uploaded_on DESC;`;
    
        connection.query(que, (err, response)=>{
            if(err){
                res.status(constants.VALIDATION_ERROR);
                throw new Error(err.message);
            }
    
            const parsedRes = parseJsonFromRespone(response);
            console.log(parsedRes.length);
            if(!parsedRes.length){
                console.log("No available data for this project");
                res.status(constants.VALIDATION_ERROR);
                next(new Error("No available data for this project!"));
            }else{
                res.status(constants.GET_SUCCESS).json(response);
                console.log(parsedRes);
            }
        });
    }else{
        res.status(constants.VALIDATION_ERROR);
        next(new Error("pId undefined!"));
    }
    
});




//@desc Create notification
//@route POST /api/notification/
//@access public
const createNotification = async (req, res, next)=>{

    upload.single('image')(req, res, function(err){

        const { pid, message, title } = req.body;

       
        if (!title || !message || !pid) {
            res.status(constants.VALIDATION_ERROR);
            next(new Error("All Fields are Mandatory!"));
        }

        let insertQuery  = "";

        if (!req.file) {

            insertQuery = `INSERT INTO notification (id, pid, message, file, uploaded_on, title) VALUES (NULL, ${pid}, '${message}', NULL, current_timestamp(), '${title}');`;

        }else{

            var profileUrl = `http://localhost:${ports}/notification/${req.file.filename}`;
    
            insertQuery = `INSERT INTO notification (id, pid, message, file, uploaded_on, title) VALUES (NULL, ${pid}, '${message}', '${profileUrl}', current_timestamp(), '${title}');`;
            
        }

        connection.query(insertQuery, (err3, response2) => {
            if (err3) {

                res.status(constants.VALIDATION_ERROR);
                next(new Error(err3.message));
            }
            
            console.log("Notification Uploaded!");
            res.status(201).json({
                profile_url: profileUrl,
                msg: 'Notification Uploaded',
            });
        });

    });
            
}






//@desc Delete notification item
//@route DELETE /api/notification
//@access public
const deleteNotification  = asyncHandler (async (req, res, next) =>{
    
    let {id} = req.body;
    
    if(id == undefined){
        res.status(constants.VALIDATION_ERROR);
        next(new Error("All Fields are Mandatory!"));
    }

    if(!id){
        res.status(constants.VALIDATION_ERROR);
        next(new Error("All Fields are Mandatory!"));
    }

    

    // Get the existing file URL from the database
    const selectQuery = `SELECT file FROM notification WHERE id = ?`;
    connection.query(selectQuery, [id], (err1, result) => {
    if (err1) {
        res.status(500).json({
        title: "Database Error!",
        message: err1.message,
        stackTrace: err1.stack
        });
        return;
    }

    if (result.length > 0) {
        if(result[0].file == "NULL"){
                // Proceed with deleting the record from the database
                const deleteQuery = `DELETE FROM notification WHERE id = ?`;
                connection.query(deleteQuery, [id], (err3, response2) => {
                    if (err3) {
                    res.status(500).json({
                        title: "Database Error!",
                        message: err3.message,
                        stackTrace: err3.stack
                    });
                    return;
                    }

                    console.log("Notification Deleted!");
                    res.status(200).json({
                    msg: 'Notification Deleted Successfully',
                    });
                });
        }else{
            const fileUrl = result[0].file;
            const filePath = path.join(__dirname, '..', 'upload', 'image', 'notification' , path.basename(fileUrl));

            // Delete the file from the server
            fs.unlink(filePath, (err2) => {
            if (err2) {
                console.log(err2.message);
                console.error(`Failed to delete file: ${filePath}`);
            } else {
                console.log(`File deleted: ${filePath}`);
            }

            // Proceed with deleting the record from the database
            const deleteQuery = `DELETE FROM notification WHERE id = ?`;
            connection.query(deleteQuery, [id], (err3, response2) => {
                    if (err3) {
                    res.status(500).json({
                        title: "Database Error!",
                        message: err3.message,
                        stackTrace: err3.stack
                    });
                    return;
                    }

                    console.log("Notification Deleted!");
                    res.status(200).json({
                    msg: 'Notification Deleted Successfully',
                    });
                });
            });
        }
        
    } else {
        res.status(constants.NOT_FOUND);
        next(new Error("Notification not found!"));
    }
    });
});






module.exports = { 
    getAllNotification,
    getNotificationById,
    getAllNotificationByPid,
    createNotification,
    deleteNotification
};
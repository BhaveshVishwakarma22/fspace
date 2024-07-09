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
	destination: './upload/projects/progress',
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



//@desc GET all work progress
//@route GET /api/progress/
//@access public
const getAllWorkprogress = asyncHandler (async (req, res, next) =>{
    
    let que = `SELECT work_progress.*, team.name AS team_name, team.email AS team_email, team.role AS team_role, team.phone AS team_phone, client_user.name AS client_name, client_user.email AS client_email, client_user.location AS client_location, client_user.phone AS client_phone FROM work_progress LEFT JOIN team ON work_progress.uploaded_by_team = team.id LEFT JOIN client_user ON work_progress.uploaded_by_client = client_user.id ORDER BY work_progress.uploaded_on DESC;`;
    
    connection.query(que, (err, response)=>{
        if(err){
            res.status(constants.VALIDATION_ERROR);
            throw new Error(err.message);
        }

        res.status(constants.GET_SUCCESS).json(response);
        console.log(parseJsonFromRespone(response));
    });
});





//@desc GET single work progress by id
//@route GET /api/progress/id
//@access public
const getWorkProgressById = asyncHandler (async (req, res, next) =>{

    let {id} = req.body;
    if(!id){
        res.status(constants.VALIDATION_ERROR);
        next(new Error("Id required!"));
    }

    if(id != undefined){
        let que = `SELECT work_progress.*, team.name AS team_name, team.email AS team_email, team.role AS team_role, team.phone AS team_phone, client_user.name AS client_name, client_user.email AS client_email, client_user.location AS client_location, client_user.phone AS client_phone FROM work_progress LEFT JOIN team ON work_progress.uploaded_by_team = team.id LEFT JOIN client_user ON work_progress.uploaded_by_client = client_user.id  WHERE work_progress.id = ${id} ORDER BY work_progress.uploaded_on;`;
    
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
                res.status(constants.GET_SUCCESS).json(response[0]);
                console.log(parsedRes);
            }
        });
    }else{
        res.status(constants.VALIDATION_ERROR);
        next(new Error("Id undefined!"));
    }
    
});





//@desc GET single work progress by id
//@route GET /api/progress/project
//@access public
const getAllWorkProgressByPid = asyncHandler (async (req, res, next) =>{

    let {pid} = req.body;
    if(!pid){
        res.status(constants.VALIDATION_ERROR);
        next(new Error("project id required!"));
    }

    if(pid != undefined){
        let que = `SELECT work_progress.*, team.name AS team_name, team.email AS team_email, team.role AS team_role, team.phone AS team_phone, client_user.name AS client_name, client_user.email AS client_email, client_user.location AS client_location, client_user.phone AS client_phone FROM work_progress LEFT JOIN team ON work_progress.uploaded_by_team = team.id LEFT JOIN client_user ON work_progress.uploaded_by_client = client_user.id  WHERE work_progress.pid = ${pid} ORDER BY work_progress.uploaded_on;`;
    
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







//@desc Create site_visit
//@route POST /api/progress/
//@access public
const createWorkProgress = async (req, res, next) => {
    upload.single('image')(req, res, function(err) {
        if (err) {
            res.status(500).json({
                title: "File Upload Error!",
                message: err.message,
                stackTrace: err.stack
            });
            return;
        }
        
        console.log(req.file);

        const { pid, uploaded_by_team, uploaded_by_client, message } = req.body;

        // Validation for mandatory fields
        if (!pid || (!uploaded_by_team && !uploaded_by_client) || !message) {
            res.status(constants.VALIDATION_ERROR);
            next(new Error("All Fields are Mandatory!"));
            return;
        }

        // Default profileUrl if no file is uploaded
        let profileUrl = 'NULL';
        if (req.file) {
            profileUrl = `/progress/${req.file.filename}`;
        }

        const insertQuery = `
            INSERT INTO work_progress (id, photo, uploaded_by_team, uploaded_by_client, message, pid, uploaded_on) 
            VALUES 
            (NULL, '${profileUrl}', ${uploaded_by_team ? `'${uploaded_by_team}'` : 'NULL'}, ${uploaded_by_client ? `'${uploaded_by_client}'` : 'NULL'}, '${message}', '${pid}', current_timestamp());
        `;
        
        connection.query(insertQuery, (err3, response2) => {
            if (err3) {
                res.status(constants.VALIDATION_ERROR);
                next(new Error(err3.message));
                return;
            }
            
            console.log("Work Progress Uploaded!");
            res.status(201).json({
                profile_url: profileUrl,
                msg: 'Work Progress Uploaded',
            });
        });
    });
};




            

//@desc Update work_progress item
//@route PUT /api/progress
//@access public
const updateWorkProgress = async (req, res, next) => {
    upload.single('image')(req, res, function(err) {
        if (err) {
            res.status(500).json({
                title: "File Upload Error!",
                message: err.message,
                stackTrace: err.stack
            });
            return;
        }

        const { id, uploaded_by_team, uploaded_by_client, message, pid } = req.body;

        // Validation for mandatory fields
        if (!id || !message || !pid || (!uploaded_by_team && !uploaded_by_client)) {
            res.status(constants.VALIDATION_ERROR);
            next(new Error("All Fields are Mandatory!"));
            return;
        }

        // Check if a new file is uploaded
        let profileUrl = `NULL`;

        if (req.file) {
            profileUrl = `/progress/${req.file.filename}`;
        }

        // Base update query
        let updateQuery = `UPDATE work_progress SET photo = '${profileUrl}', uploaded_by_team = ${uploaded_by_team ? `'${uploaded_by_team}'` : 'NULL'}, uploaded_by_client = ${uploaded_by_client ? `'${uploaded_by_client}'` : 'NULL'}, message = '${message}', pid = '${pid}' WHERE id = '${id}';`;
        
        // Get the existing file URL from the database
        const selectQuery = `SELECT photo FROM work_progress WHERE id = ?`;
        connection.query(selectQuery, [id], (err1, result) => {
            if (err1) {
                res.status(500).json({
                    title: "Validation Error!",
                    message: "Database Error",
                    stackTrace: "Database Error"
                });
                return;
            }

            try {
                if (result.length > 0 && result[0].photo != "NULL") {
                    const oldFileUrl = result[0].photo;
                    console.log(oldFileUrl);

                    const oldFilePath = path.join(__dirname, '..', 'upload', 'projects', 'progress', path.basename(oldFileUrl));
                    console.log(oldFilePath);

                    // Delete the old file from the server
                    fs.unlink(oldFilePath, (err2) => {
                        if (err2) {
                            console.error(`Failed to delete old file: ${oldFilePath}`);
                        } else {
                            console.log(`Old file deleted: ${oldFilePath}`);
                        }

                        // Proceed with the update query
                        executeUpdateQuery(updateQuery, res, next, profileUrl);
                    });

                } else {
                    executeUpdateQuery(updateQuery, res, next, profileUrl);
                }
            } catch (e) {
                executeUpdateQuery(updateQuery, res, next, profileUrl);
            }
        });
    });
};

const executeUpdateQuery = (updateQuery, res, next, profileUrl) => {
    connection.query(updateQuery, (err3, response2) => {
        if (err3) {
            res.status(constants.VALIDATION_ERROR);
            next(new Error(err3.message));
            return;
        }

        console.log("Work Progress Updated!");
        res.status(200).json({
            profile_url: profileUrl,
            msg: 'Work Progress Updated',
        });
    });
};






//@desc Delete work_progress item
//@route DELETE /api/progress
//@access public
const deleteWorkProgress = asyncHandler(async (req, res, next) => {
    let { id } = req.body;

    if (id === undefined || !id) {
        res.status(constants.VALIDATION_ERROR);
        next(new Error("All Fields are Mandatory!"));
        return;
    }

    // Get the existing file URL from the database
    const selectQuery = `SELECT photo FROM work_progress WHERE id = ?`;
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
            const fileUrl = result[0].photo;
            const filePath = path.join(__dirname, '..', 'upload', 'projects', 'progress', path.basename(fileUrl));

            // Delete the file from the server
            fs.unlink(filePath, (err2) => {
                if (err2) {
                    console.log(err2.message);
                    console.error(`Failed to delete file: ${filePath}`);
                } else {
                    console.log(`File deleted: ${filePath}`);
                }

                // Proceed with deleting the record from the database
                const deleteQuery = `DELETE FROM work_progress WHERE id = ?`;
                connection.query(deleteQuery, [id], (err3, response2) => {
                    if (err3) {
                        res.status(500).json({
                            title: "Database Error!",
                            message: err3.message,
                            stackTrace: err3.stack
                        });
                        return;
                    }

                    console.log("Work Progress Deleted!");
                    res.status(200).json({
                        msg: 'Work Progress Deleted Successfully',
                    });
                });
            });
        } else {
            res.status(constants.NOT_FOUND);
            next(new Error("Work Progress not found!"));
        }
    });
});





module.exports = { 
    getAllWorkprogress,
    getAllWorkProgressByPid,
    getWorkProgressById,
    createWorkProgress,
    updateWorkProgress,
    deleteWorkProgress
};
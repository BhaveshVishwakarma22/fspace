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
	destination: './upload/projects/pdf',
	filename: (req, file, cb)=>{
		return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
	}
})

const upload = multer({
	storage: storage,
	limits: {
		fileSize: 524288000 	// File Size limit to 500 mb as 500*1024*1024
	}
});


const ports = process.env.PORT || 3000;




//@desc GET all design
//@route GET /api/design/
//@access public
const getAllDesign = asyncHandler (async (req, res, next) =>{
    
    let que = `SELECT * FROM design ORDER BY designed_on DESC;`;
    
    connection.query(que, (err, response)=>{
        if(err){
            res.status(constants.VALIDATION_ERROR);
            throw new Error(err.message);
        }

        res.status(constants.GET_SUCCESS).json(response);
        console.log(parseJsonFromRespone(response));
    });
});





//@desc GET single design by id
//@route GET /api/design/id
//@access public
const getDesignById = asyncHandler (async (req, res, next) =>{

    let {id} = req.body;
    if(!id){
        res.status(constants.VALIDATION_ERROR);
        next(new Error("Id required!"));
    }

    if(id != undefined){
        let que = `SELECT * FROM design WHERE id = ${id} ORDER BY designed_on DESC;`;
    
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





//@desc GET single design by id
//@route GET /api/design/project
//@access public
const getAllDesignByPid = asyncHandler (async (req, res, next) =>{

    let {pid} = req.body;
    if(!pid){
        res.status(constants.VALIDATION_ERROR);
        next(new Error("pId required!"));
    }

    if(pid != undefined){
        let que = `SELECT design.*, team.name FROM design JOIN team ON design.designed_by = team.id WHERE pid = ${pid} ORDER BY designed_on DESC;`;
    
        connection.query(que, (err, response)=>{
            if(err){
                res.status(constants.VALIDATION_ERROR);
                throw new Error(err.message);
            }
    
            const parsedRes = parseJsonFromRespone(response);
            console.log(parsedRes.length);
            if(!parsedRes.length){
                // console.log("No available data for this project");
                // res.status(constants.VALIDATION_ERROR);
                res.status(constants.GET_SUCCESS).json([]);
                // next(new Error("No available data for this project!"));
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





//@desc Create User
//@route POST /api/design/
//@access public
const createDesign = async (req, res, next)=>{

    upload.single('design')(req, res, function(err){
        // Check if req.file is undefined, indicating no file was provided

        if(req.file == undefined){
            res.status(constants.VALIDATION_ERROR);
            res.json({
                title:"Validation Error!",
                message: "Design File is mandatory",
                stackTrace: "'design' field is not added in the request!"
            });
        }

        const { note, designed_by, pid, cid, client_visible, title } = req.body;

       
        if (!note || !designed_by || !pid || !cid || !client_visible || !title) {
            res.status(constants.VALIDATION_ERROR);
            next(new Error("All Fields are Mandatory!"));
        }

        var profileUrl = `/design/${req.file.filename}`;
    

        const insertQuery = `INSERT INTO design (id, file, note, designed_by, designed_on, pid, cid, client_visible, title) VALUES (NULL, '${profileUrl}', '${note}', ${designed_by}, current_timestamp(), ${pid}, ${cid}, '${client_visible}', '${title}');`;
        connection.query(insertQuery, (err3, response2) => {
            if (err3) {

                res.status(constants.VALIDATION_ERROR);
                next(new Error(err3.message));
            }
            
            console.log("Design Uploaded!");
            res.status(201).json({
                profile_url: profileUrl,
                msg: 'Design Uploaded',
            });
        });

    });
            
}






//@desc Update balance sheet item
//@route PUT /api/design
//@access public
// Update Design Function
const updateDesign = async (req, res, next) => {

    upload.single('design')(req, res, function(err) {
        if (err) {
            return res.status(500).json({
                title: "File Upload Error!",
                message: err.message,
                stackTrace: err.stack
            });
        }

        const { id, note, designed_by, pid, cid, client_visible, title } = req.body;

        // Validate input fields
        if (!id || !note || !designed_by || !pid || !cid || !client_visible || !title) {
            return res.status(constants.VALIDATION_ERROR).json({ error: "All Fields are Mandatory!" });
        }

        // Check if a new file is uploaded
        if (req.file) {
            const profileUrl = `/design/${req.file.filename}`;

            // Base update query
            const updateQuery = `UPDATE design SET note = ?, designed_by = ?, pid = ?, cid = ?, client_visible = ?, title = ?, file = ? WHERE id = ?`;

            // Get the existing file URL from the database
            const selectQuery = `SELECT file FROM design WHERE id = ?`;
            connection.query(selectQuery, [id], (err1, result) => {
                if (err1) {
                    return res.status(500).json({
                        title: "Database Error!",
                        message: "Error fetching existing file URL",
                        stackTrace: err1.stack
                    });
                }

                if (result.length > 0) {
                    const oldFileUrl = result[0].file;
                    const oldFilePath = path.join(__dirname, '..', 'upload', 'projects', 'pdf', path.basename(oldFileUrl));

                    // Delete the old file from the server
                    fs.unlink(oldFilePath, (err2) => {
                        if (err2) {
                            console.error(`Failed to delete old file: ${oldFilePath}`);
                        } else {
                            console.log(`Old file deleted: ${oldFilePath}`);
                        }

                        // Proceed with the update query
                        connection.query(updateQuery, [note, designed_by, pid, cid, client_visible, title, profileUrl, id], (err3, result) => {
                            if (err3) {
                                return res.status(500).json({
                                    title: "Database Error!",
                                    message: "Error updating design record",
                                    stackTrace: err3.stack
                                });
                            }

                            res.status(200).json({ message: "Design updated successfully" });
                        });
                    });

                } else {
                    return res.status(404).json({ error: "Record not found" });
                }
            });

        } else {
            return res.status(constants.VALIDATION_ERROR).json({ error: "File is required" });
        }
    });

};

  


// Helper function to execute the update query
const executeUpdateQuery = (updateQuery, res, next, profileUrl) => {
connection.query(updateQuery, (err3, response2) => {
    if (err3) {
    res.status(constants.VALIDATION_ERROR);
    next(new Error(err3));
    return;
    }

    console.log("Design Updated!");
    res.status(200).json({
    msg: 'Design Updated Successfully',
    profile_url: profileUrl || undefined,
    });
});
};

  













//@desc Delete balance sheet item
//@route DELETE /api/design
//@access public
const deleteDesign  = asyncHandler (async (req, res, next) =>{
    
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
    const selectQuery = `SELECT file FROM design WHERE id = ?`;
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
        const fileUrl = result[0].file;
        const filePath = path.join(__dirname, '..', 'upload', 'projects', 'pdf' , path.basename(fileUrl));

        // Delete the file from the server
        fs.unlink(filePath, (err2) => {
        if (err2) {
            console.log(err2.message);
            console.error(`Failed to delete file: ${filePath}`);
        } else {
            console.log(`File deleted: ${filePath}`);
        }

        // Proceed with deleting the record from the database
        const deleteQuery = `DELETE FROM design WHERE id = ?`;
        connection.query(deleteQuery, [id], (err3, response2) => {
            if (err3) {
            res.status(500).json({
                title: "Database Error!",
                message: err3.message,
                stackTrace: err3.stack
            });
            return;
            }

            console.log("Design Deleted!");
            res.status(200).json({
            msg: 'Design Deleted Successfully',
            });
        });
        });
    } else {
        res.status(constants.NOT_FOUND);
        next(new Error("Design not found!"));
    }
    });
});






module.exports = { 
    getAllDesign,
    getAllDesignByPid,
    getDesignById,
    createDesign,
    updateDesign,
    deleteDesign
};
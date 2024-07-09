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


// Upload Material Query Questionnare
const material_query_storage = multer.diskStorage({
	destination: './upload/projects/material_query_questionare',
	filename: (req, file, cb)=>{
		return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
	}
})

const material_query_upload = multer({
	storage: material_query_storage,
	limits: {
		fileSize: 524288000 	// File Size limit to 500 mb as 500*1024*1024
	}
});


// Upload Optimize Space Questionnare
const optimize_space_storage = multer.diskStorage({
	destination: './upload/projects/optimize_space_questionare',
	filename: (req, file, cb)=>{
		return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
	}
})

const optimize_space_upload = multer({
	storage: optimize_space_storage,
	limits: {
		fileSize: 524288000 	// File Size limit to 500 mb as 500*1024*1024
	}
});




const ports = process.env.PORT || 3000;



//@desc GET all projects
//@route GET /api/project/
//@access public
const getAllProject = asyncHandler (async (req, res, next) =>{
    
    let que = `SELECT 
                projects.id, projects.code, projects.cid, projects.area, projects.pdf1, projects.pdf2, projects.status, 
                client_user.name, client_user.email, client_user.phone, client_user.address, client_user.pass, client_user.photo, client_user.location, client_user.created_at,
                client_user.account_no
                FROM projects
                JOIN client_user ON projects.cid = client_user.id ORDER BY client_user.created_at DESC;`;
    
    connection.query(que, (err, response)=>{
        if(err){
            res.status(constants.VALIDATION_ERROR);
            throw new Error(err.message);
        }

        res.status(constants.GET_SUCCESS).json(response);
        console.log(parseJsonFromRespone(response));
    });
});






// status = 0 for Active, 1 for on-hold, 2 for completed
//@desc GET all project by status
//@route GET /api/project/status
//@access public
const getAllProjectByStatus = asyncHandler (async (req, res, next) =>{
    

    let {status} = req.body;
    if(!status){
        res.status(constants.VALIDATION_ERROR);
        next(new Error("status required!"));
    }

    if(status != undefined){

        let que = `SELECT 
                projects.id, projects.code, projects.cid, projects.area, projects.pdf1, projects.pdf2, projects.status, 
                client_user.name, client_user.email, client_user.phone, client_user.address, client_user.pass, client_user.photo, client_user.location, client_user.created_at,
                client_user.account_no, balance_sheet.bal_amount
        
                FROM projects
                
                LEFT JOIN balance_sheet ON projects.id = balance_sheet.pid

                JOIN client_user ON projects.cid = client_user.id 
                WHERE projects.status = ${status} 
                ORDER BY client_user.created_at DESC;`;
        
        connection.query(que, (err, response)=>{
            if(err){
                res.status(constants.VALIDATION_ERROR);
                throw new Error(err.message);
            }

            res.status(constants.GET_SUCCESS).json(response);
            console.log(parseJsonFromRespone(response));
        });

    }else{
        res.status(constants.VALIDATION_ERROR);
        next(new Error("status undefined!"));
    }

});









//@desc GET single feedback by id
//@route GET /api/feedback/id
//@access public
const getProjectById = asyncHandler (async (req, res, next) =>{

    let {id} = req.body;
    if(!id){
        res.status(constants.VALIDATION_ERROR);
        next(new Error("Id required!"));
    }

    if(id != undefined){
        let que = `SELECT 
                projects.id, projects.cid, projects.area, projects.pdf1, projects.pdf2, projects.status, 
                client_user.name, client_user.email, client_user.phone, client_user.address, client_user.pass, client_user.photo, client_user.location, client_user.created_at,
                client_user.account_no
                FROM projects
                JOIN client_user ON projects.cid = client_user.id 
                WHERE projects.id = ${id};`;
    
        connection.query(que, (err, response)=>{
            if(err){
                res.status(constants.VALIDATION_ERROR);
                throw new Error(err.message);
            }
    
            const parsedRes = parseJsonFromRespone(response);
            console.log(parsedRes.length);
            if(!parsedRes.length){
                console.log("No available feedback for this id");
                res.status(constants.VALIDATION_ERROR);
                next(new Error("No available feedback for this id!"));
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





//@desc Create project
//@route POST /api/project/
//@access public
const createProject = async (req, res, next) => {
        let { name, email, pass, phone, address, location, area, code } = req.body;
    
        // Validate all required fields
        if (!name || !email || !pass || !phone || !address || !location || !area || !code) {
            res.status(constants.VALIDATION_ERROR);
            next(new Error("All Fields are Mandatory!"));
            return;
        }

        console.log(name);
        console.log(email);
        console.log(pass);
        console.log(phone);
        console.log(address);
        console.log(location);
        console.log(area);
        console.log(code);
    


        // Check if the client already exists
        const checkQuery = `SELECT id FROM client_user WHERE email = '${email}' LIMIT 1;`;
        connection.query(checkQuery, async (err2, response) => {
            if (err2) {
                res.status(constants.VALIDATION_ERROR);
                next(new Error("Error 2: " + err2.message));
                return;
            }
    
            const parsedRes = parseJsonFromRespone(response);
    
            if (parsedRes.length == 0) {
                // Client does not exist, insert new client
                const insertClientQuery = `
                    INSERT INTO client_user (id, name, email, pass, phone, address, location, photo, created_at, is_login) 
                    VALUES (NULL, '${name}', '${email}', '${pass}', '${phone}', '${address}', '${location}', '${constants.DEAFULT_PROFILE_IMAGE_PATH}', current_timestamp(), '0');
                `;
    
                connection.query(insertClientQuery, (err3, response2) => {
                    if (err3) {
                        res.status(constants.VALIDATION_ERROR);
                        next(new Error("Error 3: " + err3.message));
                        return;
                    }
    
                    console.log("Client Registered!");
    
                    // Get the newly created client ID
                    const clientId = response2.insertId;
    
                    // Insert project
                    insertProject(clientId, area, code, res, next);
                });
            } else {
                // Client exists, get the client ID
                const clientId = parsedRes[0].id;
                console.log("User exists with ID: ", clientId);
    
                // Insert project
                insertProject(clientId, area, code, res, next);
            }
        });
};

    
const insertProject = (clientId, area, code, res, next) => {
    const insertProjectQuery = `
        INSERT INTO projects (id, cid, area, pdf1, pdf2, status, code) 
        VALUES (NULL, '${clientId}', '${area}', NULL, NULL, 0, '${code}');
    `;

    connection.query(insertProjectQuery, (err4, response3) => {
        if (err4) {
            res.status(constants.VALIDATION_ERROR);
            next(new Error("Error 4: " + err4.message));
            return;
        }

        console.log("Project Added! response: ");

        // Get the inserted project ID
        const insertedProjectId = response3.insertId;

        let que = `SELECT 
                projects.id, projects.code, projects.cid, projects.area, projects.pdf1, projects.pdf2, projects.status, 
                client_user.name, client_user.email, client_user.phone, client_user.address, client_user.pass, client_user.photo, client_user.location, client_user.created_at
                FROM projects
                JOIN client_user ON projects.cid = client_user.id 
                WHERE projects.id = ${insertedProjectId};`;
    
        connection.query(que, (err, response)=>{
            if(err){
                res.status(constants.VALIDATION_ERROR);
                return next(new Error(err.message));
            }
    
            const parsedRes = parseJsonFromRespone(response);
            console.log(parsedRes.length);
            if(!parsedRes.length){
                console.log("No available data for this id");
                res.status(constants.VALIDATION_ERROR);
                return next(new Error("No available data for this id!"));
            }else{
                return res.status(201).json(response[0]);
                console.log(parsedRes);
            }
        });

        // console.log();


        // return res.status(400).json({
        //     error: 'Error in creating project!',
        // });
    });
};





//@desc update feedback
//@route PUT /api/project/
//@access public
const updateProjectStatusOrArea = asyncHandler (async (req, res, next) =>{
    
    const { id, area, status } = req.body;

    // Validate the presence of the project ID
    if (!id) {
        res.status(constants.VALIDATION_ERROR);
        next(new Error("Project ID is Mandatory!"));
        return;
    }

    // Build the update query based on the provided fields
    let updateFields = [];
    if (area !== undefined) {
        updateFields.push(`area = '${area}'`);
    }
    if (status !== undefined) {
        updateFields.push(`status = '${status}'`);
    }

    // If no fields to update, return an error
    if (updateFields.length === 0) {
        res.status(constants.VALIDATION_ERROR);
        next(new Error("At least one field (area or status) is required to update!"));
        return;
    }

    const updateQuery = `UPDATE projects SET ${updateFields.join(", ")} WHERE id = '${id}';`;

    connection.query(updateQuery, (err, response) => {
        if (err) {
            res.status(constants.VALIDATION_ERROR);
            next(new Error("Error: " + err.message));
            return;
        }

        console.log("Project Updated!");
        res.status(200).json({
            msg: 'Project Updated Successfully',
        });
    });

});




//@desc DELETE project
//@route DELETE /api/project/del
//@access public
const deleteProject = asyncHandler (async (req, res, next) =>{
    
    try{
        let {id} = req.body;
    
        if(id == undefined){
            res.status(constants.VALIDATION_ERROR);
            next(new Error("All Fields are Mandatory!"));
        }
    
        if(!id){
            res.status(constants.VALIDATION_ERROR);
            next(new Error("All Fields are Mandatory!"));
        }
    
    
        //Check if exist
        const checkQuery = `SELECT id FROM projects WHERE id = ${id};`
        connection.query(checkQuery, async (err2, response)=>{
            if(err2) {
                res.status(constants.VALIDATION_ERROR);
                next(new Error("Error 2: " + err2.message));
            }
    
            const parsedRes = parseJsonFromRespone(response);
            console.log(parsedRes.length);
    
            if(parsedRes.length==1){
    
                const deleteQuery =`DELETE FROM projects WHERE id = ${id}`;
    
                connection.query(deleteQuery, (err3, response2) => {
                    if (err3) {
                        res.status(constants.VALIDATION_ERROR);
                        next(new Error("Error 3: " +err3.message));
                    }
                    
                    console.log("Project Deleted!");
                    return res.status(201).json({
                        msg: 'Project Deleted Successfully',
                    });
                }); 
    
    
            }else{
                console.log("Project not found!");
                res.status(constants.VALIDATION_ERROR);
                next(new Error("Project not found!"));
            }
        });
    }catch(e){
        console.log(e);
        console.log("Project not found!");
        res.status(constants.VALIDATION_ERROR);
        next(new Error("Project not found!"));
    }
    
});





// material_query_questionare

//@desc upload material_query_questionare
//@route PUT /api/project/material_query_questionare
//@access public
// Update Design Function
const uploadMaterialQuestionnare = async (req, res, next) => {
    material_query_upload.single('material_query_questionare')(req, res, function(err) {
        if (err) {
            return res.status(500).json({
                title: "File Upload Error!",
                message: err.message,
                stackTrace: err.stack
            });
        }

        const { id } = req.body;

        // Validate input fields
        if (!id) {
            return res.status(constants.VALIDATION_ERROR).json({ error: "Project id is Mandatory!" });
        }

        // Check if a new file is uploaded
        if (req.file) {
            const profileUrl = `/material_query_questionare/${req.file.filename}`;

            // Base update query
            const updateQuery = `UPDATE projects SET pdf1 = ? WHERE id = ?`;

            // Get the existing file URL from the database
            const selectQuery = `SELECT pdf1 FROM projects WHERE id = ?`;
            connection.query(selectQuery, [id], (err1, result) => {
                if (err1) {
                    console.error(err1.message);
                    return res.status(500).json({
                        title: "Database Error!",
                        message: "Error fetching existing file URL",
                        stackTrace: err1.stack
                    });
                }

                if (result.length > 0) {
                    const oldFileUrl = result[0].pdf1;
                    if (oldFileUrl) {
                        const oldFilePath = path.join(__dirname, '..', 'upload', 'projects', 'material_query_questionare', path.basename(oldFileUrl));

                        // Delete the old file from the server
                        fs.unlink(oldFilePath, (err2) => {
                            if (err2) {
                                console.error(`Failed to delete old file: ${oldFilePath}`);
                            } else {
                                console.log(`Old file deleted: ${oldFilePath}`);
                            }

                            // Proceed with the update query
                            connection.query(updateQuery, [profileUrl, id], (err3, result) => {
                                if (err3) {
                                    return res.status(500).json({
                                        title: "Database Error!",
                                        message: "Error updating project record",
                                        stackTrace: err3.stack
                                    });
                                }

                                res.status(200).json({ message: "Project updated successfully" });
                            });
                        });
                    } else {
                        // If no old file existed, simply update with the new file URL
                        connection.query(updateQuery, [profileUrl, id], (err3, result) => {
                            if (err3) {
                                return res.status(500).json({
                                    title: "Database Error!",
                                    message: "Error updating project record",
                                    stackTrace: err3.stack
                                });
                            }

                            res.status(200).json({ message: "Project updated successfully" });
                        });
                    }
                } else {
                    return res.status(404).json({ error: "Project not found" });
                }
            });
        } else {
            return res.status(constants.VALIDATION_ERROR).json({ error: "File is required" });
        }
    });
};

  
// optimize_space_questionare
//@desc upload optimize_space_questionare
//@route PUT /api/project/optimize_space_questionare
//@access public
// Update Design Function
const uploadOptimizeSpaceQuestionnare = async (req, res, next) => {
    optimize_space_upload.single('optimize_space_questionare')(req, res, function(err) {
        if (err) {
            return res.status(500).json({
                title: "File Upload Error!",
                message: err.message,
                stackTrace: err.stack
            });
        }

        const { id } = req.body;

        // Validate input fields
        if (!id) {
            return res.status(constants.VALIDATION_ERROR).json({ error: "Project id is Mandatory!" });
        }

        // Check if a new file is uploaded
        if (req.file) {
            const profileUrl = `/optimize_space_questionare/${req.file.filename}`;

            // Base update query
            const updateQuery = `UPDATE projects SET pdf2 = ? WHERE id = ?`;

            // Get the existing file URL from the database
            const selectQuery = `SELECT pdf2 FROM projects WHERE id = ?`;
            connection.query(selectQuery, [id], (err1, result) => {
                if (err1) {
                    console.error(err1.message);
                    return res.status(500).json({
                        title: "Database Error!",
                        message: "Error fetching existing file URL",
                        stackTrace: err1.stack
                    });
                }

                if (result.length > 0) {
                    const oldFileUrl = result[0].pdf2;
                    if (oldFileUrl) {
                        const oldFilePath = path.join(__dirname, '..', 'upload', 'projects', 'optimize_space_questionare', path.basename(oldFileUrl));

                        // Delete the old file from the server
                        fs.unlink(oldFilePath, (err2) => {
                            if (err2) {
                                console.error(`Failed to delete old file: ${oldFilePath}`);
                            } else {
                                console.log(`Old file deleted: ${oldFilePath}`);
                            }

                            // Proceed with the update query
                            connection.query(updateQuery, [profileUrl, id], (err3, result) => {
                                if (err3) {
                                    return res.status(500).json({
                                        title: "Database Error!",
                                        message: "Error updating project record",
                                        stackTrace: err3.stack
                                    });
                                }

                                res.status(200).json({ message: "Project updated successfully" });
                            });
                        });
                    } else {
                        // If no old file existed, simply update with the new file URL
                        connection.query(updateQuery, [profileUrl, id], (err3, result) => {
                            if (err3) {
                                return res.status(500).json({
                                    title: "Database Error!",
                                    message: "Error updating project record",
                                    stackTrace: err3.stack
                                });
                            }

                            res.status(200).json({ message: "Project updated successfully" });
                        });
                    }
                } else {
                    return res.status(404).json({ error: "Project not found" });
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





module.exports = {
    getAllProject,
    createProject,
    updateProjectStatusOrArea,
    deleteProject,
    getProjectById,
    getAllProjectByStatus,

    uploadMaterialQuestionnare,
    uploadOptimizeSpaceQuestionnare
};


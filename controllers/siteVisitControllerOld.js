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
	destination: './upload/projects/site_visit',
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



//@desc GET all site_visit
//@route GET /api/site_visit/
//@access public
const getAllSiteVisit = asyncHandler (async (req, res, next) =>{
    
    let que = `SELECT * FROM site_visit ORDER BY date DESC;`;
    
    connection.query(que, (err, response)=>{
        if(err){
            res.status(constants.VALIDATION_ERROR);
            throw new Error(err.message);
        }

        res.status(constants.GET_SUCCESS).json(response);
        console.log(parseJsonFromRespone(response));
    });
});





//@desc GET single site_visit by id
//@route GET /api/site_visit/id
//@access public
const getSiteVisitById = asyncHandler (async (req, res, next) =>{

    let {id} = req.body;
    if(!id){
        res.status(constants.VALIDATION_ERROR);
        next(new Error("Id required!"));
    }

    if(id != undefined){
        let que = `SELECT * FROM site_visit WHERE id = ${id} ORDER BY date DESC;`;
    
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





//@desc GET single site_visit by id
//@route GET /api/site_visit/project
//@access public
const getAllSiteVisitByPid = asyncHandler (async (req, res, next) =>{

    let {pid} = req.body;
    if(!pid){
        res.status(constants.VALIDATION_ERROR);
        next(new Error("pId required!"));
    }

    if(pid != undefined){
        let que = `SELECT * FROM site_visit WHERE pid = ${pid} ORDER BY date DESC;`;
    
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
//@route POST /api/site_visit/
//@access public
const createSiteVisit = async (req, res, next)=>{

    upload.single('image')(req, res, function(err){

        if (err) {
            res.status(500).json({
            title: "File Upload Error!",
            message: err.message,
            stackTrace: err.stack
            });
            return;
        }
            
        console.log(req.file);


        const { pid, visited_by, check_list, civil_detail, window, door, notes, date } = req.body;

       
        if (!pid || !visited_by || !check_list  || !civil_detail || !window || !door || !notes || !date) {
            res.status(constants.VALIDATION_ERROR);
            next(new Error("All Fields are Mandatory!"));
        }

        var profileUrl = ``;



        if(req.file){
            profileUrl = `/site_visit/${req.file.filename}`;
        }else{
            profileUrl = `NULL`;
        }
        
        // '2024-03-05 19:54:53'

        
        const insertQuery = `INSERT INTO site_visit (id, pid, visited_by, check_list, design_file, civil_detail, window, door, notes, date, uploaded_on) VALUES (NULL, '${pid}', '${visited_by}', '${check_list}', '${profileUrl}', '${civil_detail}', '${window}', '${door}', '${notes}', '${date}', current_timestamp());`;
        
        connection.query(insertQuery, (err3, response2) => {
            if (err3) {

                res.status(constants.VALIDATION_ERROR);
                next(new Error(err3.message));
            }
            
            console.log("Site Visit Uploaded!");
            res.status(201).json({
                profile_url: profileUrl,
                msg: 'Site Visit Uploaded',
            });
        });


    });

}



            





//@desc Update site_visit item
//@route PUT /api/site_visit
//@access public
// Update SiteVisit Function
const updateSiteVisit = async (req, res, next) => {

    upload.single('image')(req, res, function(err) {
        if (err) {
            res.status(500).json({
            title: "File Upload Error!",
            message: err.message,
            stackTrace: err.stack
            });
            return;
        }
    
        const { id, pid, visited_by, check_list, civil_detail, window, door, notes, date } = req.body;

       
        if ( !id || !pid || !visited_by || !check_list  || !civil_detail || !window || !door || !notes || !date ) {
            res.status(constants.VALIDATION_ERROR);
            next(new Error("All Fields are Mandatory!"));
        }


        // Check if a new file is uploaded
        var profileUrl = ``;

        if(req.file == undefined){
            profileUrl = `NULL`;
        }else{
            profileUrl = `/site_visit/${req.file.filename}`;
        }


        // Base update query
        let updateQuery = `UPDATE site_visit SET pid = '${pid}', visited_by = '${visited_by}', check_list = '${check_list}', design_file = '${profileUrl}' , civil_detail = '${civil_detail}', window = '${window}', door = '${door}', notes = '${notes}', date = '${date}' WHERE id = '${id}';`;
        
        // Get the existing file URL from the database
        const selectQuery = `SELECT design_file FROM site_visit WHERE id = ?`;
        connection.query(selectQuery, [id], (err1, result) => {
            if (err1) {
                res.status(500).json({
                    title: "Validation Error!",
                    message: "Database Error",
                    stackTrace: "Database Error"
                });
                return;
            }

            try{
                if (result.length > 0 && result[0].design_file!="NULL") {

                    const oldFileUrl = result[0].design_file;
                    console.log(oldFileUrl);

                    const oldFilePath = path.join(__dirname, '..', 'upload', 'projects', 'site_visit' , path.basename(oldFileUrl));
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
            }catch(e){
                executeUpdateQuery(updateQuery, res, next, profileUrl);
            }
        });

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

    console.log("Site Visit Updated!");
    res.status(200).json({
    msg: 'Site Visit Updated Successfully',
    profile_url: profileUrl || undefined,
    });
});
};

  



//@desc Delete site_visit item
//@route DELETE /api/site_visit
//@access public
const deleteSiteVisit  = asyncHandler (async (req, res, next) =>{
    
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
    const selectQuery = `SELECT design_file FROM site_visit WHERE id = ?`;
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
        const fileUrl = result[0].design_file;
        const filePath = path.join(__dirname, '..', 'upload', 'projects', 'images' , path.basename(fileUrl));

        // Delete the file from the server
        fs.unlink(filePath, (err2) => {
        if (err2) {
            console.log(err2.message);
            console.error(`Failed to delete file: ${filePath}`);
        } else {
            console.log(`File deleted: ${filePath}`);
        }

        // Proceed with deleting the record from the database
        const deleteQuery = `DELETE FROM site_visit WHERE id = ?`;
        connection.query(deleteQuery, [id], (err3, response2) => {
            if (err3) {
            res.status(500).json({
                title: "Database Error!",
                message: err3.message,
                stackTrace: err3.stack
            });
            return;
            }

            console.log("Site Visit Deleted!");
            res.status(200).json({
            msg: 'SiteVisit Deleted Successfully',
            });
        });
        });
    } else {
        res.status(constants.NOT_FOUND);
        next(new Error("Site Visit not found!"));
    }
    });
});






module.exports = { 
    getAllSiteVisit,
    getAllSiteVisitByPid,
    getSiteVisitById,
    createSiteVisit,
    updateSiteVisit,
    deleteSiteVisit
};
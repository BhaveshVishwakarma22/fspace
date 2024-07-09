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
	destination: './upload/projects/bill',
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




//@desc GET single design by id
//@route GET /api/bill/project
//@access public
const getAllBillByPid = asyncHandler (async (req, res, next) =>{

    let {pid} = req.body;
    if(!pid){
        res.status(constants.VALIDATION_ERROR);
        next(new Error("pId required!"));
    }

    if(pid != undefined){
        let que = `SELECT bill FROM bill WHERE pid = ${pid} LIMIT 1;`;
    
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
                res.status(constants.GET_SUCCESS).json(response[0]);
                console.log(parsedRes);
            }
        });
    }else{
        res.status(constants.VALIDATION_ERROR);
        next(new Error("pId undefined!"));
    }
    
});





//@desc Create User
//@route POST /api/bill/
//@access public
const createBill = async (req, res, next)=>{

    upload.single('bill')(req, res, function(err){
        // Check if req.file is undefined, indicating no file was provided

        if(req.file == undefined){
            res.status(constants.VALIDATION_ERROR);
            res.json({
                title:"Validation Error!",
                message: "Bill File is mandatory",
                stackTrace: "'bill' field is not added in the request!"
            });
        }

        const { pid } = req.body;

       
        if (!pid) {
            res.status(constants.VALIDATION_ERROR);
            next(new Error("All Fields are Mandatory!"));
        }

        var profileUrl = `/bill/${req.file.filename}`;
    

        const insertQuery = `INSERT INTO bill (id, pid, bill, uploaded_on) VALUES (NULL, '${pid}', '${profileUrl}', current_timestamp());`;
        connection.query(insertQuery, (err3, response2) => {
            if (err3) {

                res.status(constants.VALIDATION_ERROR);
                next(new Error(err3.message));
            }
            
            console.log("Design Uploaded!");
            res.status(201).json({
                profile_url: profileUrl,
                msg: 'Bill Uploaded',
            });
        });

    });
            
}




//@desc Delete balance sheet item
//@route DELETE /api/design
//@access public
const deleteBill  = asyncHandler (async (req, res, next) =>{
    
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
    const selectQuery = `SELECT * FROM bill WHERE id = ?`;
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
        
        
        const fileUrl = result[0].bill;
        const filePath = path.join(__dirname, '..', 'upload', 'projects', 'bill' , path.basename(fileUrl));


        // Delete the file from the server
        fs.unlink(filePath, (err2) => {
        if (err2) {
            console.log(err2.message);
            console.error(`Failed to delete file: ${filePath}`);
        } else {
            console.log(`File deleted: ${filePath}`);
        }

        // Proceed with deleting the record from the database
        const deleteQuery = `DELETE FROM bill WHERE id = ?`;
        connection.query(deleteQuery, [id], (err3, response2) => {
            if (err3) {
            res.status(500).json({
                title: "Database Error!",
                message: err3.message,
                stackTrace: err3.stack
            });
            return;
            }

            console.log("Bill Deleted!");
            res.status(200).json({
            msg: 'Bill Deleted Successfully',
            });
        });
        });
    } else {
        res.status(constants.NOT_FOUND);
        next(new Error("Bill not found!"));
    }
    });
});






module.exports = { 
    getAllBillByPid,
    createBill,
    deleteBill,
};
const connection = require('../database');

const asyncHandler = require("express-async-handler");
// const connection = require("../dbConnection/connectMySQL");
// const { response } = require("express");
const { constants } = require("../constants");
const multer = require('multer');
const path = require('path');

const ports = process.env.PORT || 3000;

function parseJsonFromRespone(input){
    var jsonResponse = JSON.stringify(input);
    var jsonResponse = JSON.parse(jsonResponse);

    return jsonResponse;
}


// Image Upload
const storage = multer.diskStorage({
	destination: './upload/images/master',
	filename: (req, file, cb)=>{
		return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
	}
})

const upload = multer({
	storage: storage,
	limits: {
		fileSize: 104857600 	// File Size limit to 100 mb as 100*1024*1024
	}
});




//@desc GET all master user
//@route GET /api/master/
//@access private
const getAllMasterUsers = asyncHandler (async (req, res, next) =>{
    
    let que = `SELECT * FROM master_users;`;
    
    connection.query(que, (err, response)=>{
        if(err){
            res.status(constants.VALIDATION_ERROR);
            throw new Error(err.message);
        }

        res.status(constants.GET_SUCCESS).json(response);
        console.log(parseJsonFromRespone(response));
    });
});




//@desc Create User
//@route POST /api/master/
//@access public
const createMasterUser = async (req, res, next)=>{

    upload.single('profile')(req, res, function(err){
        // Check if req.file is undefined, indicating no file was provided
        let {name, email, pass, phone, address} = req.body;
       
        if(!name || !address || !email || !pass || !phone){
            res.status(constants.VALIDATION_ERROR);
            next(new Error("All Fields are Mandatory!"));
        }

        if (!req.file) {
            // If image not given

            //Check if exist
            const checkQuery = `SELECT * FROM master_users WHERE email = '${email}' LIMIT 1;`
            connection.query(checkQuery, async (err2, response)=>{
                if(err2) {
                    res.status(constants.VALIDATION_ERROR);
                    next(new Error("Error 2: " + err2.message));
                }
        
                const parsedRes = parseJsonFromRespone(response);
                console.log(parsedRes.length);
        
                if(parsedRes.length==0){

                    var profileUrl = constants.DEAFULT_PROFILE_IMAGE_PATH;
                    
                    const insertQuery = "INSERT INTO master_users (id, name, email, phone, address, pass, photo, created_at, last_login) VALUES (NULL, '"+name+"', '"+email+"', '"+phone+"', '"+address+"', '"+pass+"', '"+constants.DEAFULT_PROFILE_IMAGE_PATH+"', current_timestamp(), NULL);";
                    connection.query(insertQuery, (err3, response2) => {
                        if (err3) {
                            res.status(constants.VALIDATION_ERROR);
                            next(new Error("Error 3: " +err3.message));
                        }
                        
                        console.log("Master User Registered!");
                        return res.status(201).json({
                            profile_url: profileUrl,
                            msg: 'User Created Successfully',
                        });
                    });


                }else{
                    console.log("User exists!");
                    res.status(constants.VALIDATION_ERROR);
                    next(new Error("User exists!"));
                }
            });
            
        }else{
            // If image given

            //Check if exist
            const checkQuery = `SELECT * FROM master_users WHERE email = '${email}' LIMIT 1;`
            connection.query(checkQuery, async (err2, response)=>{
                    if(err2) {
                        res.status(constants.VALIDATION_ERROR);
                        next(new Error(err.message));
                    }

                    const parsedRes = parseJsonFromRespone(response);
                    console.log(parsedRes.length);

                    if(parsedRes.length==0){

                        var profileUrl = `http://localhost:${ports}/profile/user/${req.file.filename}`;
                    
                        const insertQuery = "INSERT INTO master_users (id, name, email, phone, address, pass, photo, created_at, last_login) VALUES (NULL, '"+name+"', '"+email+"', '"+phone+"', '"+address+"', '"+pass+"', '"+constants.DEAFULT_PROFILE_IMAGE_PATH+"', current_timestamp(), NULL);";
                        connection.query(insertQuery, (err3, response2) => {
                            if (err3) {
                                res.status(constants.VALIDATION_ERROR);
                                next(new Error(err3.message));
                            }
                            
                            console.log("Master User Registered!");
                            res.status(201).json({
                                profile_url: profileUrl,
                                msg: 'User Created Successfully',
                            });
                        });

                    }else{
                        console.log("User exists!");
                        res.status(constants.VALIDATION_ERROR);
                        next(new Error("User exists!"));
                    }
            });
        }
        
    });
            
}




//@desc Login Maser User
//@route POST /api/master/
//@access public
const loginMaster = async (req, res, next)=>{

    let {email, pass} = req.body;

    if(!email || !pass){
        res.status(constants.VALIDATION_ERROR);
        next(new Error("All Fields are Mandatory!"));
    }

    const checkQuery = `SELECT * FROM master_users WHERE email = '${email}' LIMIT 1;`

    connection.query(checkQuery, async (err2, response)=>{
       if(err2){
            res.status(constants.VALIDATION_ERROR);
            next(new Error(err2.message));
       }
    
       if(response[0].pass === pass){
            return res.status(201).json(response[0]); 
       }else{
            res.status(constants.VALIDATION_ERROR);
            next(new Error("Invalid Password"));
       }
    });
}













module.exports = {
    getAllMasterUsers,
    createMasterUser,
    loginMaster
};
const connection = require('../database');

const asyncHandler = require("express-async-handler");
const { constants } = require("../constants");



function parseJsonFromRespone(input){
    var jsonResponse = JSON.stringify(input);
    var jsonResponse = JSON.parse(jsonResponse);

    return jsonResponse;
}





//@desc GET all client user
//@route GET /api/client/
//@access public
const getAllClients = asyncHandler (async (req, res, next) =>{
    
    let que = `SELECT * FROM client_user;`;
    
    connection.query(que, (err, response)=>{
        if(err){
            res.status(constants.VALIDATION_ERROR);
            throw new Error(err.message);
        }

        res.status(constants.GET_SUCCESS).json(response);
        console.log(parseJsonFromRespone(response));
    });
});



//@desc GET id client user email
//@route GET /api/client/email
//@access public
const getIDClientByEmail = asyncHandler (async (req, res, next) =>{

    let {email} = req.body;
    if(!email){
        res.status(constants.VALIDATION_ERROR);
        next(new Error("email required!"));
    }

    if(email != undefined){
        let que = `SELECT id FROM client_user WHERE email = '${email}';`;
    
        connection.query(que, (err, response)=>{
            if(err){
                res.status(constants.VALIDATION_ERROR);
                throw new Error(err.message);
            }
    
            const parsedRes = parseJsonFromRespone(response);
            console.log(parsedRes.length);
            if(!parsedRes.length){
                console.log("No available client for this email");
                res.status(constants.VALIDATION_ERROR);
                next(new Error("No available client for this email!"));
            }else{
                res.status(constants.GET_SUCCESS).json(response);
                console.log(parsedRes);
            }
        });
    }else{
        res.status(constants.VALIDATION_ERROR);
        next(new Error("email undefined!"));
    }
    
});




//@desc GET single client user by id
//@route GET /api/client/id
//@access public
const getSingleClientById = asyncHandler (async (req, res, next) =>{

    let {id} = req.body;
    if(!id){
        res.status(constants.VALIDATION_ERROR);
        next(new Error("Id required!"));
    }

    if(id != undefined){
        let que = `SELECT * FROM client_user WHERE id = ${id};`;
    
        connection.query(que, (err, response)=>{
            if(err){
                res.status(constants.VALIDATION_ERROR);
                throw new Error(err.message);
            }
    
            const parsedRes = parseJsonFromRespone(response);
            console.log(parsedRes.length);
            if(!parsedRes.length){
                console.log("Client not found");
                res.status(constants.VALIDATION_ERROR);
                next(new Error("Client not found"));
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







//@desc Create User
//@route POST /api/client/
//@access public
const createClient = async (req, res, next)=>{

    let {name, email, pass, phone, address, location} = req.body;
    
    if(name == undefined || address == undefined || email == undefined || pass == undefined || phone == undefined || location == undefined){
        res.status(constants.VALIDATION_ERROR);
        next(new Error("All Fields are Mandatory!"));
    }

    if(!name || !address || !email || !pass || !phone || !location){
        res.status(constants.VALIDATION_ERROR);
        next(new Error("All Fields are Mandatory!"));
    }

    

    //Check if exist
    const checkQuery = `SELECT * FROM client_user WHERE email = '${email}' AND location = '${location}' LIMIT 1;`
    connection.query(checkQuery, async (err2, response)=>{
        if(err2) {
            res.status(constants.VALIDATION_ERROR);
            next(new Error("Error 2: " + err2.message));
        }

        const parsedRes = parseJsonFromRespone(response);
        console.log(parsedRes.length);

        

        if(parsedRes.length==0){



            var profileUrl = constants.DEAFULT_PROFILE_IMAGE_PATH;
            
            const insertQuery =`INSERT INTO client_user (id, name, email, pass, phone, address, location, photo, created_at, is_login) VALUES (NULL, '${name}', '${email}', '${pass}', '${phone}', '${address}', '${location}', 'http://localhost:3000/api/master/profile/deafult_profile.png', current_timestamp(), '0');`;

            connection.query(insertQuery, (err3, response2) => {
                if (err3) {
                    res.status(constants.VALIDATION_ERROR);
                    next(new Error("Error 3: " +err3.message));
                }
                
                console.log("Client Registered!");
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
        
}





//@desc update client user
//@route PUT /api/client/
//@access public
const updateClient = asyncHandler (async (req, res, next) =>{
    

    let {id, name, email, pass, phone, address, location, photo, account_no} = req.body;
    
    if(id == undefined || name == undefined || address == undefined || email == undefined || pass == undefined || phone == undefined || location == undefined || photo == undefined){
        res.status(constants.VALIDATION_ERROR);
        next(new Error("All Fields are Mandatory!"));
    }

    if(!id || !name || !address || !email || !pass || !phone || !location || !photo){
        res.status(constants.VALIDATION_ERROR);
        next(new Error("All Fields are Mandatory!"));
    }

    

    //Check if exist
    const checkQuery = `SELECT * FROM client_user WHERE id = '${id}' LIMIT 1;`
    connection.query(checkQuery, async (err2, response)=>{
        if(err2) {
            res.status(constants.VALIDATION_ERROR);
            next(new Error("Error 2: " + err2.message));
        }

        const parsedRes = parseJsonFromRespone(response);
        console.log(parsedRes.length);

        

        if(parsedRes.length==1){



            var profileUrl = constants.DEAFULT_PROFILE_IMAGE_PATH;
            


            let updateQuery =`UPDATE client_user SET name = '${name}', email  = '${email}',  pass  = '${pass}',  phone  = '${phone}',  address  = '${address}',  location  = '${location}',  photo  = '${photo}' WHERE  client_user.id  = ${id};`;
            
            if(account_no){
                updateQuery =`UPDATE client_user SET name = '${name}', email  = '${email}',  pass  = '${pass}',  phone  = '${phone}',  address  = '${address}',  location  = '${location}',  photo  = '${photo}', account_no = '${account_no}' WHERE  client_user.id  = ${id};`;
            }

            connection.query(updateQuery, (err3, response2) => {
                if (err3) {
                    res.status(constants.VALIDATION_ERROR);
                    next(new Error("Error 3: " +err3.message));
                }
                
                console.log("Client Update!");
                return res.status(201).json({
                    profile_url: profileUrl,
                    msg: 'User Update Successfully',
                });
            }); 


        }else{
            console.log("User not found!");
            res.status(constants.VALIDATION_ERROR);
            next(new Error("User not found!"));
        }
    });
        
});





//@desc DELETE client user
//@route DELETE /api/client/
//@access public
const deleteClient = asyncHandler (async (req, res, next) =>{
    
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
    const checkQuery = `SELECT email FROM client_user WHERE id = '${id}';`
    connection.query(checkQuery, async (err2, response)=>{
        if(err2) {
            res.status(constants.VALIDATION_ERROR);
            next(new Error("Error 2: " + err2.message));
        }

        const parsedRes = parseJsonFromRespone(response);
        console.log(parsedRes.length);

        

        if(parsedRes.length==1){


            const deleteQuery =`DELETE FROM client_user WHERE client_user.id = ${id}`;

            connection.query(deleteQuery, (err3, response2) => {
                if (err3) {
                    res.status(constants.VALIDATION_ERROR);
                    next(new Error("Error 3: " +err3.message));
                }
                
                console.log("Client Deleted!");
                return res.status(201).json({
                    msg: 'User Deleted Successfully',
                });
            }); 


        }else{
            console.log("User not found!");
            res.status(constants.VALIDATION_ERROR);
            next(new Error("User not found!"));
        }
    });
});






//@desc Login Maser User
//@route POST /api/client/login
//@access public
const loginClient = async (req, res, next)=>{

    let {email, pass} = req.body;

    if(!email || !pass){
        res.status(constants.VALIDATION_ERROR);
        next(new Error("All Fields are Mandatory!"));
    }

    const checkQuery = `SELECT * FROM client_user WHERE email = '${email}' LIMIT 1;`

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
    getAllClients,
    createClient,
    updateClient,
    deleteClient,
    getSingleClientById,
    getIDClientByEmail,
    loginClient,
};
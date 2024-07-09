const connection = require('../database');

const asyncHandler = require("express-async-handler");
const { constants } = require("../constants");



function parseJsonFromRespone(input){
    var jsonResponse = JSON.stringify(input);
    var jsonResponse = JSON.parse(jsonResponse);

    return jsonResponse;
}





//@desc GET all team user
//@route GET /api/team/
//@access public
const getAllTeamMember = asyncHandler (async (req, res, next) =>{
    
    let que = `SELECT * FROM team;`;
    
    connection.query(que, (err, response)=>{
        if(err){
            res.status(constants.VALIDATION_ERROR);
            throw new Error(err.message);
        }

        res.status(constants.GET_SUCCESS).json(response);
        console.log(parseJsonFromRespone(response));
    });
});



//@desc GET id team user email
//@route GET /api/team/email
//@access public
const getIDTeamMemberByEmail = asyncHandler (async (req, res, next) =>{

    let {email} = req.body;
    if(!email){
        res.status(constants.VALIDATION_ERROR);
        next(new Error("email required!"));
    }

    if(email != undefined){
        let que = `SELECT id FROM team WHERE email = '${email}';`;
    
        connection.query(que, (err, response)=>{
            if(err){
                res.status(constants.VALIDATION_ERROR);
                throw new Error(err.message);
            }
    
            const parsedRes = parseJsonFromRespone(response);
            console.log(parsedRes.length);
            if(!parsedRes.length){
                console.log("No available team member for this email");
                res.status(constants.VALIDATION_ERROR);
                next(new Error("No available team member for this email!"));
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




//@desc GET single team user by id
//@route GET /api/team/id
//@access public
const getSingleTeamMemberById = asyncHandler (async (req, res, next) =>{

    let {id} = req.body;
    if(!id){
        res.status(constants.VALIDATION_ERROR);
        next(new Error("Id required!"));
    }

    if(id != undefined){
        let que = `SELECT * FROM team WHERE id = ${id};`;
    
        connection.query(que, (err, response)=>{
            if(err){
                res.status(constants.VALIDATION_ERROR);
                throw new Error(err.message);
            }
    
            const parsedRes = parseJsonFromRespone(response);
            console.log(parsedRes.length);
            if(!parsedRes.length){
                console.log("No available team member for this user");
                res.status(constants.VALIDATION_ERROR);
                next(new Error("No available team member for this user!"));
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
//@route POST /api/team/
//@access public
const createTeamMember = async (req, res, next)=>{

    let {name, email, pass, phone, address, role} = req.body;
    
    if(name == undefined || address == undefined || email == undefined || pass == undefined || phone == undefined || role == undefined){
        res.status(constants.VALIDATION_ERROR);
        next(new Error("All Fields are Mandatory!"));
    }

    if(!name || !address || !email || !pass || !phone || !role){
        res.status(constants.VALIDATION_ERROR);
        next(new Error("All Fields are Mandatory!"));
    }

    

    //Check if exist
    const checkQuery = `SELECT * FROM team WHERE email = '${email}' LIMIT 1;`
    connection.query(checkQuery, async (err2, response)=>{
        if(err2) {
            res.status(constants.VALIDATION_ERROR);
            next(new Error("Error 2: " + err2.message));
        }

        const parsedRes = parseJsonFromRespone(response);
        console.log(parsedRes.length);

        

        if(parsedRes.length==0){



            var profileUrl = constants.DEAFULT_PROFILE_IMAGE_PATH;
            
            const insertQuery =`INSERT INTO team (id, name, email, pass, phone, address, role, photo, created_at, is_login) VALUES (NULL, '${name}', '${email}', '${pass}', '${phone}', '${address}', '${role}', 'http://localhost:3000/api/master/profile/deafult_profile.png', current_timestamp(), '0');`;

            connection.query(insertQuery, (err3, response2) => {
                if (err3) {
                    res.status(constants.VALIDATION_ERROR);
                    next(new Error("Error 3: " +err3.message));
                }
                
                console.log("Clien Registered!");
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





//@desc update team user
//@route PUT /api/team/
//@access public
const updateTeamMember = asyncHandler (async (req, res, next) =>{
    

    let {id, name, email, pass, phone, address, role, photo} = req.body;
    


    if(id == undefined || name == undefined || address == undefined || email == undefined || pass == undefined || phone == undefined || role == undefined || photo == undefined){
        res.status(constants.VALIDATION_ERROR);
        next(new Error("All Fields are Mandatory!"));
    }

    

    if(!id || !name || !address || !email || !pass || !phone || !role || !photo){
        res.status(constants.VALIDATION_ERROR);
        next(new Error("All Fields are Mandatory!"));
    }

    

    //Check if exist
    const checkQuery = `SELECT * FROM team WHERE id = '${id}' LIMIT 1;`
    connection.query(checkQuery, async (err2, response)=>{
        if(err2) {
            res.status(constants.VALIDATION_ERROR);
            next(new Error("Error 2: " + err2.message));
        }

        const parsedRes = parseJsonFromRespone(response);
        console.log(parsedRes.length);

        

        if(parsedRes.length==1){



            var profileUrl = constants.DEAFULT_PROFILE_IMAGE_PATH;
            


            const updateQuery =`UPDATE team SET name = '${name}', email  = '${email}',  pass  = '${pass}',  phone  = '${phone}',  address  = '${address}',  role  = '${role}',  photo  = '${photo}' WHERE  id  = ${id};`;

            connection.query(updateQuery, (err3, response2) => {
                if (err3) {
                    res.status(constants.VALIDATION_ERROR);
                    next(new Error("Error 3: " +err3.message));
                }
                
                console.log("TeamMember Update!");
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





//@desc DELETE team user
//@route DELETE /api/team/
//@access public
const deleteTeamMember = asyncHandler (async (req, res, next) =>{
    
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
    const checkQuery = `SELECT email FROM team WHERE id = '${id}';`
    connection.query(checkQuery, async (err2, response)=>{
        if(err2) {
            res.status(constants.VALIDATION_ERROR);
            next(new Error("Error 2: " + err2.message));
        }

        const parsedRes = parseJsonFromRespone(response);
        console.log(parsedRes.length);

        

        if(parsedRes.length==1){


            const deleteQuery =`DELETE FROM team WHERE id = ${id}`;

            connection.query(deleteQuery, (err3, response2) => {
                if (err3) {
                    res.status(constants.VALIDATION_ERROR);
                    next(new Error("Error 3: " +err3.message));
                }
                
                console.log("TeamMember Deleted!");
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
//@route POST /api/team/login
//@access public
const loginTeam = async (req, res, next)=>{

    let {email, pass} = req.body;

    if(!email || !pass){
        res.status(constants.VALIDATION_ERROR);
        next(new Error("All Fields are Mandatory!"));
    }

    const checkQuery = `SELECT * FROM team WHERE email = '${email}' LIMIT 1;`

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
    getAllTeamMember,
    createTeamMember,
    updateTeamMember,
    deleteTeamMember,
    getSingleTeamMemberById,
    getIDTeamMemberByEmail,
    loginTeam,
};
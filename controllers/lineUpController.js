const connection = require('../database');

const asyncHandler = require("express-async-handler");
const { constants } = require("../constants");



function parseJsonFromRespone(input){
    var jsonResponse = JSON.stringify(input);
    var jsonResponse = JSON.parse(jsonResponse);

    return jsonResponse;
}





//@desc GET all line up
//@route GET /api/line_up/
//@access public
const getAllLineUP = asyncHandler (async (req, res, next) =>{
    
    let que = `SELECT * FROM  line_up ORDER BY uploaded_on DESC;`;
    
    connection.query(que, (err, response)=>{
        if(err){
            res.status(constants.VALIDATION_ERROR);
            throw new Error(err.message);
        }

        res.status(constants.GET_SUCCESS).json(response);
        console.log(parseJsonFromRespone(response));
    });
});






//@desc GET all line up from a project
//@route GET /api/line_up/project
//@access public
const getAllLineUpByProjectID = asyncHandler (async (req, res, next) =>{
    

    let {pid} = req.body;
    if(!pid){
        res.status(constants.VALIDATION_ERROR);
        next(new Error("pid required!"));
    }

    if(pid != undefined){

        let que = `SELECT line_up.*, team.name 
                    FROM line_up 
                    LEFT JOIN team ON line_up.lineup_by = team.id 
                    WHERE line_up.pid = ${pid} 
                    ORDER BY line_up.uploaded_on DESC;`;
        
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
        next(new Error("pid undefined!"));
    }

});







//@desc GET single line up by id
//@route GET /api/line_up/id
//@access public
const getLineUpById = asyncHandler (async (req, res, next) =>{

    let {id} = req.body;
    if(!id){
        res.status(constants.VALIDATION_ERROR);
        next(new Error("Id required!"));
    }

    if(id != undefined){
        let que = `SELECT * FROM line_up WHERE id = ${id} ORDER BY uploaded_on DESC;`;
    
        connection.query(que, (err, response)=>{
            if(err){
                res.status(constants.VALIDATION_ERROR);
                throw new Error(err.message);
            }
    
            const parsedRes = parseJsonFromRespone(response);
            console.log(parsedRes.length);
            if(!parsedRes.length){
                console.log("No available line up for this id");
                res.status(constants.VALIDATION_ERROR);
                next(new Error("No available line up for this id!"));
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





//@desc Create line up
//@route POST /api/line_up/
//@access public
const createLineUp = async (req, res, next)=>{

    const { pid, lineup_by, purpose } = req.body;
    
    if(pid == undefined || lineup_by == undefined || purpose == undefined){
        res.status(constants.VALIDATION_ERROR);
        next(new Error("All Fields are Mandatory!"));
    }

    if(!pid || !lineup_by || !purpose){
        res.status(constants.VALIDATION_ERROR);
        next(new Error("All Fields are Mandatory!"));
    }


    const insertQuery = `INSERT INTO line_up (id, pid, lineup_by, purpose, uploaded_on) VALUES (NULL, ${pid}, ${lineup_by}, '${purpose}', current_timestamp());`;

    connection.query(insertQuery, (err3, response2) => {
        if (err3) {
            res.status(constants.VALIDATION_ERROR);
            next(new Error("Error 3: " +err3.message));
        }
        
        console.log("Line up Added!");
        return res.status(201).json({
            msg: 'Line up Added Successfully',
        });
    }); 

            
}





//@desc update line up
//@route PUT /api/line_up/
//@access public
const updateLineUp = asyncHandler (async (req, res, next) =>{
    
    const { pid, lineup_by, purpose, id } = req.body;
        
    if(id == undefined || pid == undefined || lineup_by == undefined || purpose == undefined){
        res.status(constants.VALIDATION_ERROR);
        next(new Error("All Fields are Mandatory!"));
    }

    if(!id || !pid || !lineup_by || !purpose){
        res.status(constants.VALIDATION_ERROR);
        next(new Error("All Fields are Mandatory!"));
    }


   
    //Check if feedback exist
    const checkQuery = `SELECT id FROM line_up WHERE id = ${id};`
    connection.query(checkQuery, async (err2, response)=>{
        if(err2) {
            res.status(constants.VALIDATION_ERROR);
            next(new Error("Error 2: " + err2.message));
        }

        const parsedRes = parseJsonFromRespone(response);
        console.log(parsedRes.length);

        if(parsedRes.length!=0){

            const updateQuery =`UPDATE line_up SET pid = '${pid}', lineup_by = '${lineup_by}', purpose = '${purpose}' WHERE id = ${id};`;
 
            connection.query(updateQuery, (err3, response2) => {
                if (err3) {
                    res.status(constants.VALIDATION_ERROR);
                    next(new Error("Error 3: " +err3.message));
                }
                
                console.log("Line up Updated!");
                return res.status(201).json({
                    msg: 'Line up Updated Successfully',
                });
            }); 

        }else{
            console.log("Line up not found!");
            res.status(constants.VALIDATION_ERROR);
            next(new Error("Line up not found!"));
        }
    });


});





//@desc DELETE line up
//@route DELETE /api/line_up/
//@access public
const deleteLineUp = asyncHandler (async (req, res, next) =>{
    
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
    const checkQuery = `SELECT id FROM line_up WHERE id = ${id};`
    connection.query(checkQuery, async (err2, response)=>{
        if(err2) {
            res.status(constants.VALIDATION_ERROR);
            next(new Error("Error 2: " + err2.message));
        }

        const parsedRes = parseJsonFromRespone(response);
        console.log(parsedRes.length);

        if(parsedRes.length==1){

            const deleteQuery =`DELETE FROM line_up WHERE id = ${id}`;

            connection.query(deleteQuery, (err3, response2) => {
                if (err3) {
                    res.status(constants.VALIDATION_ERROR);
                    next(new Error("Error 3: " +err3.message));
                }
                
                console.log("Line up Deleted!");
                return res.status(201).json({
                    msg: 'Line up Deleted Successfully',
                });
            }); 


        }else{
            console.log("Line up not found!");
            res.status(constants.VALIDATION_ERROR);
            next(new Error("Line up not found!"));
        }
    });
});






module.exports = {
    getAllLineUP,
    createLineUp,
    updateLineUp,
    deleteLineUp,
    getLineUpById,
    getAllLineUpByProjectID
};
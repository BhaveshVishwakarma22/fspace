const connection = require('../database');

const asyncHandler = require("express-async-handler");
const { constants } = require("../constants");



function parseJsonFromRespone(input){
    var jsonResponse = JSON.stringify(input);
    var jsonResponse = JSON.parse(jsonResponse);

    return jsonResponse;
}





//@desc GET all feedback
//@route GET /api/feedback/
//@access public
const getAllFeedback = asyncHandler (async (req, res, next) =>{
    
    let que = `SELECT * FROM  feedback ORDER BY uploaded_on DESC;`;
    
    connection.query(que, (err, response)=>{
        if(err){
            res.status(constants.VALIDATION_ERROR);
            throw new Error(err.message);
        }

        res.status(constants.GET_SUCCESS).json(response);
        console.log(parseJsonFromRespone(response));
    });
});






//@desc GET all feedback from a project
//@route GET /api/feedback/project
//@access public
const getAllFeedbackByProjectID = asyncHandler (async (req, res, next) =>{
    

    let {pid} = req.body;
    if(!pid){
        res.status(constants.VALIDATION_ERROR);
        next(new Error("pid required!"));
    }

    if(pid != undefined){

        let que = `SELECT * FROM feedback WHERE pid = ${pid} ORDER BY uploaded_on DESC;`;
        
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







//@desc GET single feedback by id
//@route GET /api/feedback/id
//@access public
const getFeedbackById = asyncHandler (async (req, res, next) =>{

    let {id} = req.body;
    if(!id){
        res.status(constants.VALIDATION_ERROR);
        next(new Error("Id required!"));
    }

    if(id != undefined){
        let que = `SELECT * FROM feedback WHERE id = ${id} ORDER BY uploaded_on DESC;`;
    
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
                res.status(constants.GET_SUCCESS).json(response);
                console.log(parsedRes);
            }
        });
    }else{
        res.status(constants.VALIDATION_ERROR);
        next(new Error("Id undefined!"));
    }
    
});





//@desc Create feedback
//@route POST /api/feedback/
//@access public
const createFeedback = async (req, res, next)=>{

    let {pid, given_by, content} = req.body;
    
    if(pid == undefined || given_by == undefined || content == undefined){
        res.status(constants.VALIDATION_ERROR);
        next(new Error("All Fields are Mandatory!"));
    }

    if(!pid || !given_by || !content){
        res.status(constants.VALIDATION_ERROR);
        next(new Error("All Fields are Mandatory!"));
    }
    //Check if feedback exist
    const checkQuery = `SELECT id FROM feedback WHERE pid = ${pid} AND content = '${content}';`
    connection.query(checkQuery, async (err2, response)=>{
        if(err2) {
            res.status(constants.VALIDATION_ERROR);
            next(new Error("Error 2: " + err2.message));
        }

        const parsedRes = parseJsonFromRespone(response);
        console.log(parsedRes.length);

        if(parsedRes.length==0){


            const insertQuery = `INSERT INTO feedback (id, pid, given_by, content, uploaded_on) VALUES (NULL, ${pid}, '${given_by}', '${content}', current_timestamp());`;

            connection.query(insertQuery, (err3, response2) => {
                if (err3) {
                    res.status(constants.VALIDATION_ERROR);
                    next(new Error("Error 3: " +err3.message));
                }
                
                console.log("Feedback Added!");
                return res.status(201).json({
                    msg: 'Feedback Added Successfully',
                });
            }); 

        }else{
            console.log("Feedback already exist!");
            res.status(constants.VALIDATION_ERROR);
            next(new Error("Feedback already exist!"));
        }
    });
            
}





//@desc update feedback
//@route PUT /api/feedback/
//@access public
const updateFeedback = asyncHandler (async (req, res, next) =>{
    

    let {pid, given_by, content, id} = req.body;
    
    if(pid == undefined || given_by == undefined || content == undefined || id == undefined){
        res.status(constants.VALIDATION_ERROR);
        next(new Error("All Fields are Mandatory!"));
    }

    if(!pid || !given_by || !content || !id){
        res.status(constants.VALIDATION_ERROR);
        next(new Error("All Fields are Mandatory!"));
    }


   
    //Check if feedback exist
    const checkQuery = `SELECT id FROM feedback WHERE id = '${id}';`
    connection.query(checkQuery, async (err2, response)=>{
        if(err2) {
            res.status(constants.VALIDATION_ERROR);
            next(new Error("Error 2: " + err2.message));
        }

        const parsedRes = parseJsonFromRespone(response);
        console.log(parsedRes.length);

        if(parsedRes.length!=0){

            const updateQuery =`UPDATE feedback SET pid = '${pid}', given_by = '${given_by}', content = '${content}' WHERE id = ${id};`;
 
            connection.query(updateQuery, (err3, response2) => {
                if (err3) {
                    res.status(constants.VALIDATION_ERROR);
                    next(new Error("Error 3: " +err3.message));
                }
                
                console.log("feedback Updated!");
                return res.status(201).json({
                    msg: 'Feedback Updated Successfully',
                });
            }); 

        }else{
            console.log("feedback not found!");
            res.status(constants.VALIDATION_ERROR);
            next(new Error("Feedback not found!"));
        }
    });


});





//@desc DELETE feedback
//@route DELETE /api/feedback/
//@access public
const deleteFeedback = asyncHandler (async (req, res, next) =>{
    
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
    const checkQuery = `SELECT id FROM feedback WHERE id = ${id};`
    connection.query(checkQuery, async (err2, response)=>{
        if(err2) {
            res.status(constants.VALIDATION_ERROR);
            next(new Error("Error 2: " + err2.message));
        }

        const parsedRes = parseJsonFromRespone(response);
        console.log(parsedRes.length);

        if(parsedRes.length==1){

            const deleteQuery =`DELETE FROM feedback WHERE id = ${id}`;

            connection.query(deleteQuery, (err3, response2) => {
                if (err3) {
                    res.status(constants.VALIDATION_ERROR);
                    next(new Error("Error 3: " +err3.message));
                }
                
                console.log("Feedback Deleted!");
                return res.status(201).json({
                    msg: 'Feedback Deleted Successfully',
                });
            }); 


        }else{
            console.log("Feedback not found!");
            res.status(constants.VALIDATION_ERROR);
            next(new Error("Feedback not found!"));
        }
    });
});






module.exports = {
    getAllFeedback,
    createFeedback,
    updateFeedback,
    deleteFeedback,
    getFeedbackById,
    getAllFeedbackByProjectID
};
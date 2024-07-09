const connection = require('../database');

const asyncHandler = require("express-async-handler");
const { constants } = require("../constants");



function parseJsonFromRespone(input){
    var jsonResponse = JSON.stringify(input);
    var jsonResponse = JSON.parse(jsonResponse);

    return jsonResponse;
}





//@desc GET all question
//@route GET /api/query/
//@access public
const getAllQuestions = asyncHandler (async (req, res, next) =>{
    
    let que = `SELECT * FROM project_query;`;
    
    connection.query(que, (err, response)=>{
        if(err){
            res.status(constants.VALIDATION_ERROR);
            throw new Error(err.message);
        }

        res.status(constants.GET_SUCCESS).json(response);
        console.log(parseJsonFromRespone(response));
    });
});






//@desc GET single question by id
//@route GET /api/question/id
//@access public
const getQuestionById = asyncHandler (async (req, res, next) =>{

    let {id} = req.body;
    if(!id){
        res.status(constants.VALIDATION_ERROR);
        next(new Error("Id required!"));
    }

    if(id != undefined){
        let que = `SELECT * FROM project_query WHERE id = ${id};`;
    
        connection.query(que, (err, response)=>{
            if(err){
                res.status(constants.VALIDATION_ERROR);
                throw new Error(err.message);
            }
    
            const parsedRes = parseJsonFromRespone(response);
            console.log(parsedRes.length);
            if(!parsedRes.length){
                console.log("No available question for this id");
                res.status(constants.VALIDATION_ERROR);
                next(new Error("No available question for this id!"));
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







//@desc Create question
//@route POST /api/question/
//@access public
const createQuestion = async (req, res, next)=>{

    let {question} = req.body;
    
    if(question == undefined){
        res.status(constants.VALIDATION_ERROR);
        next(new Error("All Fields are Mandatory!"));
    }

    if(!question){
        res.status(constants.VALIDATION_ERROR);
        next(new Error("All Fields are Mandatory!"));
    }


    //Check if exist
    const checkQuery = `SELECT * FROM project_query WHERE question = '${question}' LIMIT 1;`
    connection.query(checkQuery, async (err2, response)=>{
        if(err2) {
            res.status(constants.VALIDATION_ERROR);
            next(new Error("Error 2: " + err2.message));
        }

        const parsedRes = parseJsonFromRespone(response);
        console.log(parsedRes.length);

        if(parsedRes.length==0){

            
            const insertQuery =`INSERT INTO project_query (id, question) VALUES (NULL, '${question}');`;

            connection.query(insertQuery, (err3, response2) => {
                if (err3) {
                    res.status(constants.VALIDATION_ERROR);
                    next(new Error("Error 3: " +err3.message));
                }
                
                console.log("Question Added!");
                return res.status(201).json({
                    msg: 'Question Added Successfully',
                });
            }); 


        }else{
            console.log("Question exists!");
            res.status(constants.VALIDATION_ERROR);
            next(new Error("Question exists!"));
        }
    });
        
}





//@desc update question
//@route PUT /api/question/
//@access public
const updateQuestion = asyncHandler (async (req, res, next) =>{
    

    let {question, id} = req.body;
    
    if(question == undefined || id == undefined){
        res.status(constants.VALIDATION_ERROR);
        next(new Error("All Fields are Mandatory!"));
    }

    if(!question || !id){
        res.status(constants.VALIDATION_ERROR);
        next(new Error("All Fields are Mandatory!"));
    }


    //Check if exist
    const checkQuery = `SELECT * FROM project_query WHERE id = ${id} LIMIT 1;`
    connection.query(checkQuery, async (err2, response)=>{
        if(err2) {
            res.status(constants.VALIDATION_ERROR);
            next(new Error("Error 2: " + err2.message));
        }

        const parsedRes = parseJsonFromRespone(response);
        console.log(parsedRes.length);

        

        if(parsedRes.length==1){

            const updateQuery =`UPDATE project_query SET question = '${question}' WHERE  id  = ${id};`;

            connection.query(updateQuery, (err3, response2) => {
                if (err3) {
                    res.status(constants.VALIDATION_ERROR);
                    next(new Error("Error 3: " +err3.message));
                }
                
                console.log("Question Update!");
                return res.status(201).json({
                    msg: 'Question Update Successfully',
                });
            }); 


        }else{
            console.log("Question not found!");
            res.status(constants.VALIDATION_ERROR);
            next(new Error("Question not found!"));
        }
    });
        
});





//@desc DELETE question
//@route DELETE /api/question/
//@access public
const deleteQuestion = asyncHandler (async (req, res, next) =>{
    
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
    const checkQuery = `SELECT question FROM project_query WHERE id = ${id};`
    connection.query(checkQuery, async (err2, response)=>{
        if(err2) {
            res.status(constants.VALIDATION_ERROR);
            next(new Error("Error 2: " + err2.message));
        }

        const parsedRes = parseJsonFromRespone(response);
        console.log(parsedRes.length);

        

        if(parsedRes.length==1){


            const deleteQuery =`DELETE FROM project_query WHERE id = ${id}`;

            connection.query(deleteQuery, (err3, response2) => {
                if (err3) {
                    res.status(constants.VALIDATION_ERROR);
                    next(new Error("Error 3: " +err3.message));
                }
                
                console.log("Question Deleted!");
                return res.status(201).json({
                    msg: 'Question Deleted Successfully',
                });
            }); 


        }else{
            console.log("Question not found!");
            res.status(constants.VALIDATION_ERROR);
            next(new Error("Question not found!"));
        }
    });
});






module.exports = {
    getAllQuestions,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    getQuestionById,
};
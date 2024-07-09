const connection = require('../database');

const asyncHandler = require("express-async-handler");
// const connection = require("../dbConnection/connectMySQL");
const { response } = require("express");
const { constants } = require("../constants");


function parseJsonFromRespone(input){
    var jsonResponse = JSON.stringify(input);
    var jsonResponse = JSON.parse(jsonResponse);

    return jsonResponse;
}

//@desc GET all contacts
//@route GET /api/contacts
//@access private
const getAllTestMsg = asyncHandler (async (req, res, next) =>{
    
    let que = `SELECT * FROM test;`;
    
    connection.query(que, (err, response)=>{
        if(err){
            res.status(constants.VALIDATION_ERROR);
            throw new Error(err.message);
        }

        res.status(constants.GET_SUCCESS).json(response);
        console.log(parseJsonFromRespone(response));
    });
});



module.exports = {
    getAllTestMsg
};
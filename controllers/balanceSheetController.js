const connection = require('../database');

const asyncHandler = require("express-async-handler");
const { constants } = require("../constants");




function parseJsonFromRespone(input){
    var jsonResponse = JSON.stringify(input);
    var jsonResponse = JSON.parse(jsonResponse);

    return jsonResponse;
}





//@desc GET all question
//@route GET /api/balsheet/
//@access public
const getAllBalSheet = asyncHandler (async (req, res, next) =>{
    
    let que = `SELECT * FROM balance_sheet;`;
    
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
//@route GET /api/balsheet/id
//@access public
const getBalSheetById = asyncHandler (async (req, res, next) =>{

    let {id} = req.body;
    if(!id){
        res.status(constants.VALIDATION_ERROR);
        next(new Error("Id required!"));
    }

    if(id != undefined){
        let que = `SELECT * FROM balance_sheet WHERE id = ${id};`;
    
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





//@desc GET single question by id
//@route GET /api/balsheet/id
//@access public
const getAllBalSheetByPid = asyncHandler (async (req, res, next) =>{

    let {pid} = req.body;
    if(!pid){
        res.status(constants.VALIDATION_ERROR);
        next(new Error("pId required!"));
    }

    if(pid != undefined){
        let que = `SELECT * FROM balance_sheet WHERE pid = ${pid} ORDER BY paid_on DESC LIMIT 1;`;
    
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





//@desc Create question
//@route POST /api/balsheet/
//@access public
const createBalSheetItem = async (req, res, next)=>{

    const { pid, total_amount, bal_amount, paid_amount } = req.body;
    
    if(pid == undefined || total_amount == undefined || bal_amount == undefined || paid_amount == undefined){
        res.status(constants.VALIDATION_ERROR);
        next(new Error("All Fields are Mandatory!"));
    }

    if (!pid || !total_amount || !bal_amount || !paid_amount) {
        res.status(constants.VALIDATION_ERROR);
        return next(new Error("All fields are mandatory!"));
      }


    //Check if exist
    const checkQuery = `SELECT * FROM projects WHERE id = ${pid} LIMIT 1;`
    connection.query(checkQuery, async (err2, response)=>{
        if(err2) {
            res.status(constants.VALIDATION_ERROR);
            next(new Error("Error 2: " + err2.message));
        }

        const parsedRes = parseJsonFromRespone(response);
        console.log(parsedRes.length);

        if(parsedRes.length!=0){

            
            const insertQuery =`INSERT INTO balance_sheet (id, pid, paid_on, total_amount, bal_amount, paid_amount) VALUES (NULL, ${pid}, current_timestamp(), '${total_amount}', '${bal_amount}', '${paid_amount}');`;

            connection.query(insertQuery, (err3, response2) => {
                if (err3) {
                    res.status(constants.VALIDATION_ERROR);
                    next(new Error("Error 3: " +err3.message));
                }
                
                console.log("Item Added!");
                return res.status(201).json({
                    msg: 'Item Added Successfully',
                });
            }); 


        }else{
            console.log("Project not found exists!");
            res.status(constants.VALIDATION_ERROR);
            next(new Error("Project not found exists!"));
        }
    });
        
}





//@desc Update balance sheet item
//@route PUT /api/balsheet/id
//@access public
const updateBalSheetItem = async (req, res, next) => {
    const {pid, total_amount, bal_amount, paid_amount } = req.body;
  
    if (!pid || !total_amount || !bal_amount || !paid_amount) {
      res.status(constants.VALIDATION_ERROR);
      return next(new Error("All fields are mandatory!"));
    }
  
    // Check if the balance sheet item exists
    const checkQuery = `SELECT * FROM balance_sheet WHERE pid = ${pid} LIMIT 1;`;
    connection.query(checkQuery, async (err, response) => {
      if (err) {
        res.status(500);
        return next(new Error("Error checking existence: " + err.message));
      }
  
      const parsedRes = JSON.parse(JSON.stringify(response)); // Ensure the response is properly parsed
  
      if (parsedRes.length !== 0) {
        // Update the balance sheet item
        const updateQuery = `
          UPDATE balance_sheet 
          SET  total_amount = ?, bal_amount = ?, paid_amount = ?
          WHERE pid = ?;
        `;
        const queryParams = [total_amount, bal_amount, paid_amount, pid];
  
        connection.query(updateQuery, queryParams, (err2, response2) => {
          if (err2) {
            res.status(500);
            return next(new Error("Error updating item: " + err2.message));
          }
  
          console.log("Item Updated!");
          return res.status(200).json({
            msg: 'Item updated successfully',
          });
        });
      } else {
        console.log("Balance sheet item not found!");
        res.status(404);
        return next(new Error("Balance sheet item not found!"));
      }
    });
};


  

//@desc Delete balance sheet item
//@route DELETE /api/balsheet/id
//@access public
const deleteBalSheetItem  = asyncHandler (async (req, res, next) =>{
    
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
    const checkQuery = `SELECT id FROM balance_sheet WHERE id = ${id};`
    connection.query(checkQuery, async (err2, response)=>{
        if(err2) {
            res.status(constants.VALIDATION_ERROR);
            next(new Error("Error 2: " + err2.message));
        }

        const parsedRes = parseJsonFromRespone(response);
        console.log(parsedRes.length);

        

        if(parsedRes.length==1){


            const deleteQuery =`DELETE FROM balance_sheet WHERE id = ${id}`;

            connection.query(deleteQuery, (err3, response2) => {
                if (err3) {
                    res.status(constants.VALIDATION_ERROR);
                    next(new Error("Error 3: " +err3.message));
                }
                
                console.log("Item Deleted!");
                return res.status(201).json({
                    msg: 'Item Deleted Successfully',
                });
            }); 


        }else{
            console.log("Item not found!");
            res.status(constants.VALIDATION_ERROR);
            next(new Error("Item not found!"));
        }
    });
});






module.exports = { 
    getAllBalSheet,
    getAllBalSheetByPid,
    getBalSheetById,
    createBalSheetItem,
    updateBalSheetItem,
    deleteBalSheetItem
};
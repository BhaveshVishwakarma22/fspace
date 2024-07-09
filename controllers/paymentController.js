const connection = require('../database');

const asyncHandler = require("express-async-handler");
const { constants } = require("../constants");



function parseJsonFromRespone(input){
    var jsonResponse = JSON.stringify(input);
    var jsonResponse = JSON.parse(jsonResponse);

    return jsonResponse;
}





//@desc GET all payment
//@route GET /api/payment/
//@access public
const getAllPayment = asyncHandler (async (req, res, next) =>{
    
    let que = `SELECT * FROM  payment ORDER BY uploaded_on DESC;`;
    
    connection.query(que, (err, response)=>{
        if(err){
            res.status(constants.VALIDATION_ERROR);
            throw new Error(err.message);
        }

        res.status(constants.GET_SUCCESS).json(response);
        console.log(parseJsonFromRespone(response));
    });
});






//@desc GET all payment from a project
//@route GET /api/payment/project
//@access public
const getAllPaymentByProjectID = asyncHandler (async (req, res, next) =>{
    

    let {pid} = req.body;
    if(!pid){
        res.status(constants.VALIDATION_ERROR);
        next(new Error("pid required!"));
    }

    if(pid != undefined){

        let que = `SELECT * FROM payment WHERE pid = ${pid} ORDER BY uploaded_on DESC;`;
        
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







//@desc GET single payment by id
//@route GET /api/payment/id
//@access public
const getPaymentById = asyncHandler (async (req, res, next) =>{

    let {id} = req.body;
    if(!id){
        res.status(constants.VALIDATION_ERROR);
        next(new Error("Id required!"));
    }

    if(id != undefined){
        let que = `SELECT * FROM payment WHERE id = ${id} ORDER BY uploaded_on DESC;`;
    
        connection.query(que, (err, response)=>{
            if(err){
                res.status(constants.VALIDATION_ERROR);
                throw new Error(err.message);
            }
    
            const parsedRes = parseJsonFromRespone(response);
            console.log(parsedRes.length);
            if(!parsedRes.length){
                console.log("No available payment for this id");
                res.status(constants.VALIDATION_ERROR);
                next(new Error("No available payment for this id!"));
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





//@desc Create payment
//@route POST /api/payment/
//@access public
const createPayment = async (req, res, next)=>{

    const { pid, item, amount, type } = req.body;
    
    if(pid == undefined || item == undefined || amount == undefined || type == undefined){
        res.status(constants.VALIDATION_ERROR);
        next(new Error("All Fields are Mandatory!"));
    }

    if(!pid || !item || !amount || !type){
        res.status(constants.VALIDATION_ERROR);
        next(new Error("All Fields are Mandatory!"));
    }


    const insertQuery = `INSERT INTO payment (id, pid, item, amount, uploaded_on, type) VALUES (NULL, ${pid},' ${item}', '${amount}', current_timestamp(), ${type});`;

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

            
}





//@desc update payment
//@route PUT /api/payment/
//@access public
const updatePayment = asyncHandler (async (req, res, next) =>{
    
    const { id, pid, item, amount} = req.body;
        
    if(id == undefined || pid == undefined || item == undefined || amount == undefined){
        res.status(constants.VALIDATION_ERROR);
        next(new Error("All Fields are Mandatory!"));
    }

    if(!id || !pid || !item || !amount){
        res.status(constants.VALIDATION_ERROR);
        next(new Error("All Fields are Mandatory!"));
    }

   
    //Check if feedback exist
    const checkQuery = `SELECT id FROM payment WHERE id = ${id};`
    connection.query(checkQuery, async (err2, response)=>{
        if(err2) {
            res.status(constants.VALIDATION_ERROR);
            next(new Error("Error 2: " + err2.message));
        }

        const parsedRes = parseJsonFromRespone(response);
        console.log(parsedRes.length);

        if(parsedRes.length!=0){

            const updateQuery =`UPDATE payment SET pid = ${pid}, item = '${item}', amount = '${amount}' WHERE id = ${id};`;
 
            connection.query(updateQuery, (err3, response2) => {
                if (err3) {
                    res.status(constants.VALIDATION_ERROR);
                    next(new Error("Error 3: " +err3.message));
                }
                
                console.log("Item Updated!");
                return res.status(201).json({
                    msg: 'Item Updated Successfully',
                });
            }); 

        }else{
            console.log("Item not found!");
            res.status(constants.VALIDATION_ERROR);
            next(new Error("Item not found!"));
        }
    });


});





//@desc DELETE payment
//@route DELETE /api/payment/
//@access public
const deletePayment = asyncHandler (async (req, res, next) =>{
    
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
    const checkQuery = `SELECT id FROM payment WHERE id = ${id};`
    connection.query(checkQuery, async (err2, response)=>{
        if(err2) {
            res.status(constants.VALIDATION_ERROR);
            next(new Error("Error 2: " + err2.message));
        }

        const parsedRes = parseJsonFromRespone(response);
        console.log(parsedRes.length);

        if(parsedRes.length==1){

            const deleteQuery =`DELETE FROM payment WHERE id = ${id}`;

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
    getAllPayment,
    createPayment,
    updatePayment,
    deletePayment,
    getPaymentById,
    getAllPaymentByProjectID
};
const connection = require('../database');

const asyncHandler = require("express-async-handler");
const { constants } = require("../constants");



function parseJsonFromRespone(input){
    var jsonResponse = JSON.stringify(input);
    var jsonResponse = JSON.parse(jsonResponse);

    return jsonResponse;
}





//@desc GET all order record
//@route GET /api/order/
//@access public
const getAllOrderRecord = asyncHandler (async (req, res, next) =>{
    
    let que = `SELECT * FROM  order_record ORDER BY uploaded_on DESC;`;
    
    connection.query(que, (err, response)=>{
        if(err){
            res.status(constants.VALIDATION_ERROR);
            throw new Error(err.message);
        }

        res.status(constants.GET_SUCCESS).json(response);
        console.log(parseJsonFromRespone(response));
    });
});





//@desc GET all order record from a project
//@route GET /api/order/project
//@access public
const getAllOrderRecordByProjectID = asyncHandler (async (req, res, next) =>{
    

    let {pid} = req.body;
    if(!pid){
        res.status(constants.VALIDATION_ERROR);
        next(new Error("pid required!"));
    }

    if(pid != undefined){

        let que = `SELECT * FROM order_record WHERE pid = ${pid} ORDER BY uploaded_on DESC;`;
        
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






//@desc GET single order record by id
//@route GET /api/order/id
//@access public
const getOrderRecordById = asyncHandler (async (req, res, next) =>{

    let {id} = req.body;
    if(!id){
        res.status(constants.VALIDATION_ERROR);
        next(new Error("Id required!"));
    }

    if(id != undefined){
        let que = `SELECT * FROM order_record WHERE id = ${id} ORDER BY uploaded_on DESC;`;
    
        connection.query(que, (err, response)=>{
            if(err){
                res.status(constants.VALIDATION_ERROR);
                throw new Error(err.message);
            }
    
            const parsedRes = parseJsonFromRespone(response);
            console.log(parsedRes.length);
            if(!parsedRes.length){
                console.log("No available order record for this id");
                res.status(constants.VALIDATION_ERROR);
                next(new Error("No available order record for this id!"));
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





//@desc Create order record
//@route POST /api/order/
//@access public
const createOrderRecord = async (req, res, next)=>{

    const { pid, quantity, from_d, order_no, product, date } = req.body;

    
    if(date == undefined || pid == undefined || quantity == undefined || from_d == undefined || order_no == undefined || product == undefined){
        res.status(constants.VALIDATION_ERROR);
        next(new Error("All Fields are Mandatory!"));
    }

    if (!date || !pid || !quantity || !from_d || !order_no || !product) {
        res.status(constants.VALIDATION_ERROR);
        next(new Error("All Fields are Mandatory!"));
    }


    const insertQuery = `INSERT INTO order_record (id, pid, quantity, order_no, from_d, product, uploaded_on) VALUES (NULL, ${pid}, '${quantity}', '${order_no}', '${from_d}', '${product}', '${date}');`;

    connection.query(insertQuery, (err3, response2) => {
        if (err3) {
            res.status(constants.VALIDATION_ERROR);
            next(new Error("Error 3: " +err3.message));
        }
        
        console.log("Order Record Added!");
        return res.status(201).json({
            msg: 'Order Record Added Successfully',
        });
    }); 

            
}





//@desc update order record
//@route PUT /api/order/
//@access public
const updateOrderRecord = asyncHandler (async (req, res, next) =>{
    
    const { id, pid, quantity, from_d, order_no, product, date } = req.body;

        
    if(date == undefined || id == undefined || pid == undefined || quantity == undefined || from_d == undefined || order_no == undefined || product == undefined){
        res.status(constants.VALIDATION_ERROR);
        next(new Error("All Fields are Mandatory!"));
    }

    if (!date || !id || !pid || !quantity || !from_d || !order_no || !product) {
        res.status(constants.VALIDATION_ERROR);
        next(new Error("All Fields are Mandatory!"));
    }


   
    //Check if feedback exist
    const checkQuery = `SELECT id FROM order_record WHERE id = ${id};`
    connection.query(checkQuery, async (err2, response)=>{
        if(err2) {
            res.status(constants.VALIDATION_ERROR);
            next(new Error("Error 2: " + err2.message));
        }

        const parsedRes = parseJsonFromRespone(response);
        console.log(parsedRes.length);

        if(parsedRes.length!=0){

            const updateQuery = `UPDATE order_record SET quantity = '${quantity}', order_no = '${order_no}', from_d = '${from_d}', product = '${product}', pid = ${pid}, uploaded_on = '${date}' WHERE id = ${id};`;

 
            connection.query(updateQuery, (err3, response2) => {
                if (err3) {
                    res.status(constants.VALIDATION_ERROR);
                    next(new Error("Error 3: " +err3.message));
                }
                
                console.log("Order Record Updated!");
                return res.status(201).json({
                    msg: 'Order Record Updated Successfully',
                });
            }); 

        }else{
            console.log("Order Record not found!");
            res.status(constants.VALIDATION_ERROR);
            next(new Error("Order Record not found!"));
        }
    });


});





//@desc DELETE order record
//@route DELETE /api/order/
//@access public
const deleteOrderRecord = asyncHandler (async (req, res, next) =>{
    
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
    const checkQuery = `SELECT id FROM order_record WHERE id = ${id};`
    connection.query(checkQuery, async (err2, response)=>{
        if(err2) {
            res.status(constants.VALIDATION_ERROR);
            next(new Error("Error 2: " + err2.message));
        }

        const parsedRes = parseJsonFromRespone(response);
        console.log(parsedRes.length);

        if(parsedRes.length==1){

            const deleteQuery =`DELETE FROM order_record WHERE id = ${id}`;

            connection.query(deleteQuery, (err3, response2) => {
                if (err3) {
                    res.status(constants.VALIDATION_ERROR);
                    next(new Error("Error 3: " +err3.message));
                }
                
                console.log("Order Record Deleted!");
                return res.status(201).json({
                    msg: 'Order Record Deleted Successfully',
                });
            }); 


        }else{
            console.log("Order Record not found!");
            res.status(constants.VALIDATION_ERROR);
            next(new Error("Order Record not found!"));
        }
    });
});






module.exports = {
    getAllOrderRecord,
    createOrderRecord,
    updateOrderRecord,
    deleteOrderRecord,
    getOrderRecordById,
    getAllOrderRecordByProjectID
};
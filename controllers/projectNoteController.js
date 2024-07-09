const connection = require('../database');

const asyncHandler = require("express-async-handler");
const { constants } = require("../constants");



function parseJsonFromRespone(input){
    var jsonResponse = JSON.stringify(input);
    var jsonResponse = JSON.parse(jsonResponse);

    return jsonResponse;
}





//@desc GET all project_note
//@route GET /api/project_note/
//@access public
const getAllProjectNote = asyncHandler (async (req, res, next) =>{
    
    let que = `SELECT project_note.*, team.name FROM  project_note LEFT JOIN team ON project_note.added_by = team.id  ORDER BY project_note.uploaded_on DESC;`;
    
    connection.query(que, (err, response)=>{
        if(err){
            res.status(constants.VALIDATION_ERROR);
            throw new Error(err.message);
        }

        res.status(constants.GET_SUCCESS).json(response);
        console.log(parseJsonFromRespone(response));
    });
});






//@desc GET all project_note from a project
//@route GET /api/project_note/project
//@access public
const getAllProjectNoteByProjectID = asyncHandler (async (req, res, next) =>{
    

    let {pid} = req.body;
    if(!pid){
        res.status(constants.VALIDATION_ERROR);
        next(new Error("pid required!"));
    }

    if(pid != undefined){

        let que = `SELECT project_note.*, team.name FROM  project_note LEFT JOIN team ON project_note.added_by = team.id WHERE pid = ${pid} ORDER BY uploaded_on DESC;`;
        
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







//@desc GET single project_note by id
//@route GET /api/project_note/id
//@access public
const getProjectNoteById = asyncHandler (async (req, res, next) =>{

    let {id} = req.body;
    if(!id){
        res.status(constants.VALIDATION_ERROR);
        next(new Error("Id required!"));
    }

    if(id != undefined){
        let que = `SELECT * FROM project_note WHERE id = ${id} ORDER BY uploaded_on DESC;`;
    
        connection.query(que, (err, response)=>{
            if(err){
                res.status(constants.VALIDATION_ERROR);
                throw new Error(err.message);
            }
    
            const parsedRes = parseJsonFromRespone(response);
            console.log(parsedRes.length);
            if(!parsedRes.length){
                console.log("No available note for this id");
                res.status(constants.VALIDATION_ERROR);
                next(new Error("No available note for this id!"));
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





//@desc Create project_note
//@route POST /api/project_note/
//@access public
const createProjectNote = async (req, res, next)=>{

    const { pid, added_by, note} = req.body;
        
    if(pid == undefined || note == undefined || added_by == undefined){
        res.status(constants.VALIDATION_ERROR);
        next(new Error("All Fields are Mandatory!"));
    }

    if(!pid || !added_by || !note){
        res.status(constants.VALIDATION_ERROR);
        next(new Error("All Fields are Mandatory!"));
    }



    const insertQuery = `INSERT INTO project_note (id, pid, added_by, note, uploaded_on) VALUES (NULL, ${pid}, ${added_by}, '${note}', current_timestamp());`;

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





//@desc update project_note
//@route PUT /api/project_note/
//@access public
const updateProjectNote = asyncHandler (async (req, res, next) =>{
    
    const { id, pid, added_by, note} = req.body;
        
    if(id == undefined || pid == undefined || note == undefined || added_by == undefined){
        res.status(constants.VALIDATION_ERROR);
        next(new Error("All Fields are Mandatory!"));
    }

    if(!id || !pid || !added_by || !note){
        res.status(constants.VALIDATION_ERROR);
        next(new Error("All Fields are Mandatory!"));
    }

   
    //Check if feedback exist
    const checkQuery = `SELECT id FROM project_note WHERE id = ${id};`
    connection.query(checkQuery, async (err2, response)=>{
        if(err2) {
            res.status(constants.VALIDATION_ERROR);
            next(new Error("Error 2: " + err2.message));
        }

        const parsedRes = parseJsonFromRespone(response);
        console.log(parsedRes.length);

        if(parsedRes.length!=0){

            const updateQuery =`UPDATE project_note SET pid = ${pid}, added_by = ${added_by}, note = '${note}' WHERE id = ${id};`;
 
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





//@desc DELETE project_note
//@route DELETE /api/project_note/
//@access public
const deleteProjectNote = asyncHandler (async (req, res, next) =>{
    
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
    const checkQuery = `SELECT id FROM project_note WHERE id = ${id};`
    connection.query(checkQuery, async (err2, response)=>{
        if(err2) {
            res.status(constants.VALIDATION_ERROR);
            next(new Error("Error 2: " + err2.message));
        }

        const parsedRes = parseJsonFromRespone(response);
        console.log(parsedRes.length);

        if(parsedRes.length==1){

            const deleteQuery =`DELETE FROM project_note WHERE id = ${id}`;

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
    getAllProjectNote,
    createProjectNote,
    updateProjectNote,
    deleteProjectNote,
    getProjectNoteById,
    getAllProjectNoteByProjectID
};
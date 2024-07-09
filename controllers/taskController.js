const connection = require('../database');

const asyncHandler = require("express-async-handler");
const { constants } = require("../constants");



function parseJsonFromRespone(input){
    var jsonResponse = JSON.stringify(input);
    var jsonResponse = JSON.parse(jsonResponse);

    return jsonResponse;
} 




//@desc GET all task
//@route GET /api/task/
//@access public
const getAllTask = asyncHandler (async (req, res, next) =>{
    
    let que = `SELECT task.*, team.name FROM  task  LEFT JOIN  team  ON  task . alloted_to = team . id;`;
    
    connection.query(que, (err, response)=>{
        if(err){
            res.status(constants.VALIDATION_ERROR);
            throw new Error(err.message);
        }

        res.status(constants.GET_SUCCESS).json(response);
        console.log(parseJsonFromRespone(response));
    });
});





//@desc GET all task alloted to team member by team.id
//@route GET /api/task/team
//@access public
const getAllTaskAllotedToTeamMember = asyncHandler (async (req, res, next) =>{
    

    let {id} = req.body;
    if(!id){
        res.status(constants.VALIDATION_ERROR);
        next(new Error("Id required!"));
    }

    if(id != undefined){

        let que = `SELECT task.*, projects.code, team.name FROM  task  LEFT JOIN  team  ON  task . alloted_to = team . id  LEFT JOIN projects ON task.pid = projects.id WHERE team.id = ${id};`;
        
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
        next(new Error("Id undefined!"));
    }

});






//@desc GET all task alloted to team member by team.id
//@route GET /api/task/status
//@access public
const getAllTaskBasedOnStatus = asyncHandler (async (req, res, next) =>{
    

    let {status} = req.body;
    if(!status){
        res.status(constants.VALIDATION_ERROR);
        next(new Error("Status required!"));
    }

    if(status != undefined){

        let que = `SELECT task.*, team.name FROM  task  LEFT JOIN  team  ON  task . alloted_to = team . id WHERE task.status = ${status};`;
        
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
        next(new Error("Status undefined!"));
    }

});







//@desc GET all task alloted to team member by team.type
//@route GET /api/task/type
//@access public
const getAllTaskBasedOnType = asyncHandler (async (req, res, next) =>{
    

    let {type, pid} = req.body;
    if(!type, !pid){
        res.status(constants.VALIDATION_ERROR);
        next(new Error("Type required!"));
    }

    if(type != undefined, pid != undefined){

        let que = `SELECT task.*, projects.code, team.name FROM  task  
        LEFT JOIN projects ON task.pid = projects.id
        LEFT JOIN  team  ON  task . alloted_to = team . id WHERE task.type = ${type} AND task.pid = ${pid};`;
        
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
        next(new Error("Type undefined!"));
    }

});








//@desc GET single task by id
//@route GET /api/task/id
//@access public
const getTaskById = asyncHandler (async (req, res, next) =>{

    let {id} = req.body;
    if(!id){
        res.status(constants.VALIDATION_ERROR);
        next(new Error("Id required!"));
    }

    if(id != undefined){
        let que = `SELECT task.*, team.name FROM  task  LEFT JOIN  team  ON  task.alloted_to = team.id WHERE task.id = ${id};`;
    
        connection.query(que, (err, response)=>{
            if(err){
                res.status(constants.VALIDATION_ERROR);
                throw new Error(err.message);
            }
    
            const parsedRes = parseJsonFromRespone(response);
            console.log(parsedRes.length);
            if(!parsedRes.length){
                console.log("No available task for this id");
                res.status(constants.VALIDATION_ERROR);
                next(new Error("No available task for this id!"));
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





//@desc Create task
//@route POST /api/task/
//@access public
const createTask = async (req, res, next)=>{

    let {item, alloted_to, type, pid} = req.body;
    
    if(type == null){
        type = 0;
    }
    
    if(item == undefined || alloted_to == undefined || pid == undefined){
        res.status(constants.VALIDATION_ERROR);
        next(new Error("All Fields are Mandatory!"));
    }

    if(!item || !alloted_to || !pid){
        res.status(constants.VALIDATION_ERROR);
        next(new Error("All Fields are Mandatory!"));
    }


    // Check if User exist
    const checkQuery = `SELECT name FROM team WHERE id = ${alloted_to} LIMIT 1;`
    connection.query(checkQuery, async (err2, response)=>{
        if(err2) {
            res.status(constants.VALIDATION_ERROR);
            next(new Error("Error 2: " + err2.message));
        }

        const parsedRes = parseJsonFromRespone(response);
        console.log(parsedRes.length);


        if(parsedRes.length!=0){

                    const insertQuery =`INSERT INTO task (id, item, alloted_to, time, type, pid) VALUES (NULL, '${item}', ${alloted_to}, current_timestamp(), ${type}, ${pid});`;

                    connection.query(insertQuery, (err3, response2) => {
                        if (err3) {
                            res.status(constants.VALIDATION_ERROR);
                            next(new Error("Error 3: " +err3.message));
                        }
                        
                        console.log("Task Added!");
                        return res.status(201).json({
                            msg: 'Task Added Successfully',
                        });
                    }); 
        }else{
            console.log("Team member not found!");
            res.status(constants.VALIDATION_ERROR);
            next(new Error("Team member not found!"));
        }
    });
        
}




//@desc update task
//@route PUT /api/task/
//@access public
const updateTask = asyncHandler (async (req, res, next) =>{
    

    let {item, alloted_to, id, pid} = req.body;
    
    if(id == undefined || item == undefined || alloted_to == undefined || pid == undefined){
        res.status(constants.VALIDATION_ERROR);
        next(new Error("All Fields are Mandatory!"));
    }

    if(!item || !alloted_to || !id || !pid){
        res.status(constants.VALIDATION_ERROR);
        next(new Error("All Fields are Mandatory!"));
    }


    // Check if User exist
    const checkQuery = `SELECT name FROM team WHERE id = ${alloted_to} LIMIT 1;`
    connection.query(checkQuery, async (err2, response)=>{
        if(err2) {
            res.status(constants.VALIDATION_ERROR);
            next(new Error("Error 2: " + err2.message));
        }

        const parsedRes = parseJsonFromRespone(response);
        console.log(parsedRes.length);


        if(parsedRes.length!=0){

            //Check if task exist
            const checkQuery = `SELECT * FROM task WHERE id = '${id}' LIMIT 1;`
            connection.query(checkQuery, async (err2, response)=>{
                if(err2) {
                    res.status(constants.VALIDATION_ERROR);
                    next(new Error("Error 2: " + err2.message));
                }

                const parsedRes = parseJsonFromRespone(response);
                console.log(parsedRes.length);

                if(parsedRes.length!=0){

                    const updateQuery =`UPDATE task SET item = '${item}', alloted_to  = ${alloted_to}, pid = ${pid} WHERE  id  = ${id};`;

                    connection.query(updateQuery, (err3, response2) => {
                        if (err3) {
                            res.status(constants.VALIDATION_ERROR);
                            next(new Error("Error 3: " +err3.message));
                        }
                        
                        console.log("Task Updated!");
                        return res.status(201).json({
                            msg: 'Task Update Successfully',
                        });
                    }); 

                }else{
                    console.log("Task not found!");
                    res.status(constants.VALIDATION_ERROR);
                    next(new Error("Task not found!"));
                }
            });


        }else{
            console.log("Team member not found!");
            res.status(constants.VALIDATION_ERROR);
            next(new Error("Team member not found!"));
        }
    });
        
});





//@desc update task status
//@route PUT /api/task/status/
//@access public
const updateTaskStatus = asyncHandler (async (req, res, next) =>{
    

    let {status, id} = req.body;

    console.log(req.body.status);

    
    if(id == undefined || status == undefined){
        res.status(constants.VALIDATION_ERROR);
        next(new Error("All Fields are Mandatory!"));
    }

    if(!status || !id){
        res.status(constants.VALIDATION_ERROR);
        next(new Error("All Fields are Mandatory!"));
    }


    //Check if task exist
    const checkQuery = `SELECT * FROM task WHERE id = ${id} LIMIT 1;`
    connection.query(checkQuery, async (err2, response)=>{
        if(err2) {
            res.status(constants.VALIDATION_ERROR);
            next(new Error("Error 2: " + err2.message));
        }

        const parsedRes = parseJsonFromRespone(response);
        console.log(parsedRes.length);

        if(parsedRes.length!=0){

            var updateQuery = "";

            if(status == '1')
                updateQuery =`UPDATE task SET status = ${status}, completed_on  = current_timestamp() WHERE  id  = ${id};`;
            else
                updateQuery =`UPDATE task SET status = ${status}, completed_on  = NULL WHERE  id  = ${id};`;


            connection.query(updateQuery, (err3, response2) => {
                if (err3) {
                    res.status(constants.VALIDATION_ERROR);
                    next(new Error("Error 3: " +err3.message));
                }
                
                console.log("Task Updated!");
                return res.status(201).json({
                    msg: 'Task Update Successfully',
                });
            }); 

        }else{
            console.log("Task not found!");
            res.status(constants.VALIDATION_ERROR);
            next(new Error("Task not found!"));
        }
    });
        
});






//@desc DELETE task
//@route DELETE /api/task/
//@access public
const deleteTask = asyncHandler (async (req, res, next) =>{
    
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
    const checkQuery = `SELECT id FROM task WHERE id = ${id};`
    connection.query(checkQuery, async (err2, response)=>{
        if(err2) {
            res.status(constants.VALIDATION_ERROR);
            next(new Error("Error 2: " + err2.message));
        }

        const parsedRes = parseJsonFromRespone(response);
        console.log(parsedRes.length);

        

        if(parsedRes.length==1){


            const deleteQuery =`DELETE FROM task WHERE id = ${id}`;

            connection.query(deleteQuery, (err3, response2) => {
                if (err3) {
                    res.status(constants.VALIDATION_ERROR);
                    next(new Error("Error 3: " +err3.message));
                }
                
                console.log("Task Deleted!");
                return res.status(201).json({
                    msg: 'Task Deleted Successfully',
                });
            }); 


        }else{
            console.log("Task not found!");
            res.status(constants.VALIDATION_ERROR);
            next(new Error("Task not found!"));
        }
    });
});






module.exports = {
    getAllTask,
    createTask,
    updateTask,
    deleteTask,
    getTaskById,
    getAllTaskAllotedToTeamMember,
    updateTaskStatus,
    getAllTaskBasedOnStatus,
    getAllTaskBasedOnType
};
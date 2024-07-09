const express = require('express');
const app = express();
// var router = express.Router();
require('dotenv').config();

const asyncHandler = require('express-async-handler');
const errorHandler = require("./middleware/errorHandler");
const multer = require('multer');
const path = require('path');
const bodyParser = require('body-parser');
var multiparty = require('multiparty');

const ports = process.env.PORT || 3000;


const storage = multer.diskStorage({
	destination: './upload/images',
	filename: (req, file, cb)=>{
		return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
	}
})

const upload = multer({
	storage: storage,
	limits: {
		fileSize: 104857600 	// File Size limit to 100 mb as 100*1024*1024
	}
});

app.use(
    bodyParser.urlencoded({
      extended: true,
    })
);

// app.use(express.json());
// for parsing application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true })); 

// app.use(bodyParser.urlencoded());
app.use(bodyParser.json());


app.use('/profile', express.static('upload/images'));
app.use('/profile/user', express.static('upload/images/master'));
// app.post('/upload', upload.single('profile'), (req, res)=>{
// 	// if(err) res.send("Error");
// 	// console.log(req.fields);
// 	console.log(req.body.gh);
// 	res.json({
// 		success: 1,
// 		profile_url: `http://localhost:${ports}/profile/${req.file.filename}`,
// 	});
// });


app.post('/upload', upload.single('profile'), (req, res) => {
	// Check if req.file is undefined, indicating no file was provided
	if (!req.file) {
		console.log(req.body.gh);
	  return res.status(400).json({ error: 'No file uploaded' });
	}else{

		console.log(req.body.gh);

		// res.send("http://localhost:"+ ports +"/profile/"+ req.file.filename);
		res.status(201).json({
			success: 1,
			profile_url: `http://localhost:${ports}/profile/${req.file.filename}`,
		});
		// If req.file exists, it means a file was uploaded successfully
		// return res.json({
		// 	success: 1,
		// 	profile_url: `http://localhost:${port}/profile/${req.file.filename}`,
		// });
	}
  
	// console.log();

	
});
  



app.get("/",  asyncHandler(async (req, res, next) => {
	res.send("Welcome");
}));


app.use('/api/test',  require("./routes/testRoutes"));



// Master Portal

app.use('/api/master', require("./routes/masterUserRoutes"));


app.use("/api/client", require("./routes/clientUserRoutes"));


app.use("/api/team", require("./routes/teamUserRoutes"));


app.use("/api/question", require("./routes/questionOptimizeSpaceRoutes"));


app.use("/api/query", require("./routes/projectQueryRoutes"));


app.use("/api/task", require("./routes/taskRoutes"));



// --------------------------------------------------------------
// Routes for project


app.use('/design', express.static('upload/projects/pdf'));

app.use('/site_visit', express.static('upload/projects/site_visit'));

app.use('/progress', express.static('upload/projects/progress'));

app.use('/notification', express.static('upload/images/notification'));

app.use('/material_query_questionare', express.static('upload/projects/material_query_questionare'));

app.use('/optimize_space_questionare', express.static('upload/projects/optimize_space_questionare'));

app.use('/bill', express.static('upload/projects/bill'));




app.use("/api/balsheet", require("./routes/balSheetRoutes"));

app.use("/api/design", require("./routes/designRoutes"));

app.use("/api/feedback", require("./routes/feedbackRoutes"));

app.use("/api/line_up", require("./routes/lineUpRoutes"));

app.use("/api/notification", require("./routes/notificationRoutes"));

app.use("/api/order", require("./routes/orderRecordRoutes"));

app.use("/api/payment", require("./routes/paymentRoutes"));

app.use("/api/project_note", require("./routes/ProjectNotesRoutes"));

app.use("/api/site_visit", require("./routes/siteVisitRoutes"));

app.use("/api/progress", require("./routes/workProgressRoutes"));


app.use("/api/project", require("./routes/projectRoutes"));


app.use("/api/bill", require("./routes/billRoutes"));









// ---------------------------------------------------------------


app.post('/test', asyncHandler(async (req, res, next)=>{
	


	res.send(
		"Success"
	);

}));






app.use(errorHandler);


app.listen(ports, () => console.log(`Listening on port: ${ports}`));
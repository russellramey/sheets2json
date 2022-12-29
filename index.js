/************************************
*
* Dependencies
*
************************************/
const express = require("express");
const GoggleController = require('./controllers/google');
const FileController = require('./controllers/file');

/************************************
*
* Config
*
************************************/
// Initial express app
const app = express();
// Here we are configuring express to use body-parser as middle-ware.
app.use([
    express.urlencoded({ extended: false }),
    express.json()
]);

/************************************
*
* App Routes
*
************************************/
// Google doc/sheetid
app.get("/v1/doc/:sheetid/", GoggleController.GoogleRequest_v1);
// File url (xlsx, csv)
app.get("/v1/file", FileController.FileRequest_v1);

/************************************
*
* App run
*
************************************/
app.listen(3030, () => {
    console.log("Server running on port 3030");
});
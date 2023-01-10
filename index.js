/************************************
*
* Dependencies
*
************************************/
const express = require("express");
const cors = require("cors");
const GoggleController = require('./controllers/google');
const FileController = require('./controllers/file');
const utilities = require('./modules/utilities');

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
    express.json(),
    cors()
]);

/************************************
*
* App Routes
*
************************************/
// Get Document
app.get("/v1/doc", (request, response) => {

    // If no url parameter
    let url = request.query.url;
    if(!url) return response.status(400).json({ error: true, message: '[url] parameter with full path to remote document required.' });

    try{

        // Parse url parameter
        url = utilities.parseUrl(request.query.url);
        if(!url) return response.status(400).json({ error: true, message: 'Valid url required for [url] parameter.' });

        // If url host is Google
        if(url.host.includes('docs.google.com')){
            // Request document via Google Controller
            GoggleController.getDocument_v1(request, response);
        } 
        else {
            // Request document via File Controller
            FileController.getDocument_v1(request, response)
        }
        
    }
    catch (e){

        // Return error
        return response.status(400).json({ error: true, message: e.message }); 

    }

});

/************************************
*
* App run
*
************************************/
app.listen(33033, () => {
    console.log("Server running on port 33033");
});
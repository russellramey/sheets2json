/************************************
*
* Dependencies
*
************************************/
const https = require("https");
const express = require("express");

/************************************
*
* Config
*
************************************/
// Initial express app
const app = express();
// Here we are configuring express to use body-parser as middle-ware.
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

/************************************
*
* Utilities
*
************************************/
/**
 * Convert to JSON
 * Attempt to parse string as json
 * @param String
 * @return Object | Boolean
 */
const toJson = function(str){
    // If no data 
    if(!str) return false;
    // Try to convert string to json
    try{
        // Split sting at new lines
        str = str.split('\n')[1]
        // Remove uneeded characters from string
        str = str.replace('google.visualization.Query.setResponse(', '').slice(0, -2);
        // Parse string as json
        str = JSON.parse(str);
        // Return 
        return str;
    } 
    // Catch any errors
    catch (e){
        // Return error
        return false; 
    }
}
/**
 * Create columns array
 * Sperate and prepare column values from data object
 * @param Object
 * @return Array | Boolean
 */
const parseColumns = function(data){
    // If no data 
    if(!data || !data.table) return false;
    // Column array
    let cols;
    // If parsed headers
    if(data.table.parsedNumHeaders){
        cols = data.table.cols.map((col, index) => {
            return (col.label) ? col.label.replace(/ /g, '_').replace(/-/g, '_') : col.id
        });
    } else {
        // If no rows array
        if(!data.table.rows) return false;
        // Map first element of rows array as columns
        cols = data.table.rows[0].c.map((col, index) => {
            return (col.v) ? col.v.replace(/ /g, '_').replace(/-/g, '_') : index
        });
    }
    // Return cols array
    return cols; 
}
/**
 * Parse rows array
 * Sperate and prepare row values from data object
 * @param Object
 * @return Array | Boolean
 */
const parseRows = function(data){
    // If no data 
    if(!data || !data.table) return false;
    // Parse rows to new array
    let rows = data.table.rows.map((row) => row.c );
    // If no parsed headers from data
    if(!data.table.parsedNumHeaders){
        // Remove first element in rows array
        rows.shift();
    }
    // Return rows array
    return rows;
}
/**
 * Create JSON
 * Create new json object using rows and columns array
 * Columns as json keys, Rows as json values
 * @param Array - cols 
 * @param Array - rows
 * @return Array | Boolean
 */
const createJson = function(cols, rows){
    // If missing arguments 
    if(!cols || !rows) return false;
    // new array 
    let arr = [];
    // For each row
    rows.forEach(row => {
        // Create new object
        let obj = {}
        // For each column
        cols.forEach((col, index) => {
            // If row is not null
            if(row[index]){
                // Add column label to object
                // Set value to row[index] value
                obj[col] = row[index].v
            } else {
                obj[col] = null
            }
        })
        // Push to json
        arr.push(obj)
    })
    // Return data
    return arr;
}
/**
 * Parse Data
 * Main parsing utility wrapper
 * @param String - data 
 * @return JSON
 */
const parseData = function(data){
    // If no data 
    if(!data) return false;
    // Try to parse data
    try{
        // Split sting at new lines
        data = toJson(data);
        // Get seperate arrays for columsn/rows
        cols = parseColumns(data);
        rows = parseRows(data);
        // Return data
        return createJson(cols, rows);        
    } 
    // Catch any errors
    catch (e){
        // Return error
        return { error: true, message: e.message };
    }
}
/**
 * Sort data
 * Sort data array based on provided params
 * @param Object - obj
 * @param String - key
 * @param Boolean - reverse 
 * @return Object
 */
const sortJson = function(obj, key, reverse=false){
    // If key exists
    if(key){
       // Sort object by key 
        obj.sort((a, b) => {
            if(a[key] > b[key]) return 1;
            if(a[key] < b[key]) return -1;
            return 0;
        })
    }
    // If reverse is true
    if(reverse){
        // Reverse object order
        obj.reverse();
    }
    // Return object
    return obj;
}

/************************************
*
* App Routes
*
************************************/
app.get("/json/:sheetid/", (request, response, next) => {
    
    // If no sheet id
    if(!request.params.sheetid ) return response.status(400).json({ error: true, message: 'Valid publicly accessible Sheet ID required.' });

    // Set url, with request parameters
    let url = `https://docs.google.com/spreadsheets/d/${request.params.sheetid}/gviz/tq?tqx=out:json&sheet=${(request.query.sheet ? request.query.sheet : 0)}`
    
    // Make http request to google docs
    https.get(url, (resp) => {

        // Set data variable
        let data = '';
      
        // A chunk of data has been received.
        resp.on('data', (chunk) => {
            data += chunk;
        });
      
        // The whole response has been received.
        // Return the response
        resp.on('end', () => {

            // If response is not successfull
            if(resp.statusCode !== 200) return response.status(400).json({ error: true, message: 'Valid publicly accessible Sheet ID required.' }); 

            // Parse data string
            data = parseData(data)
            
            // If order query params exist
            if(request.query.orderby || request.query.order){
                // Reverse variable
                let reverse;
                if(!request.query.order) reverse = false;
                if(request.query.order === 'asc') reverse = false;
                if(request.query.order === 'desc') reverse = true;
                // Sort data based off params
                data = sortJson(data, request.query.orderby, reverse);
            }

            // If data has error
            if(data.error) return response.status(400).json(data);

            // Return new respones
            return response.status(200).json(data);

        });
      
      })
      // Http Error
      .on("error", (err) => {

        // Return error
        return response.status(400).json({error: true, message: err.message});

      });
});

/************************************
*
* App run
*
************************************/
app.listen(3000, () => {
    console.log("Server running on port 3000");
});
/**
 * Dependencies
 */
const https = require("https");
const utilities = require('../modules/utilities');

/**
 * Convert to JSON
 * Attempt to parse string as json
 * @param String
 * @return Object | Boolean
 */
 const strToJson = (str) => {
    // Arguments exists and valid
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
        return e.message; 
    }
}
/**
 * Create JSON
 * Create new json object using rows and columns array
 * Columns as json keys, Rows as json values
 * @param Array - cols 
 * @param Array - rows
 * @return Array
 */
 const createJson = (cols, rows) => {
    // Arguments exists and valid
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
    // Return array
    return arr;
}
/**
 * Create columns array
 * Sperate and prepare column values from data object
 * @param Object
 * @return Array | Boolean
 */
const parseColumns = (data) => {
    // Arguments exists and valid
    if(!data || !data.table) return false;
    // Column array
    let cols;
    // If parsed headers
    if(data.table.parsedNumHeaders){
        // Map table columns to new array
        cols = data.table.cols.map((col, index) => {
            return (col.label) ? String(col.label).replace(/ /g, '_').replace(/-/g, '_') : "Column_" + (index+1)
        });
    } else {
        // If no rows array
        if(!data.table.rows) return false;
        // Map first element of table rows array to new array
        cols = data.table.rows[0].c.map((col, index) => {
            //return (col && col.v) ? String(col.v).replace(/ /g, '_').replace(/-/g, '_') : "Column_" + (index+1)
            return "column_" + (index+1)
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
const parseRows = (data) => {
    // Arguments exists and valid
    if(!data || !data.table) return false;
    // Parse rows to new array
    let rows = data.table.rows.map((row) => row.c );
    // If no parsed headers from data
    if(data.table.parsedNumHeaders < 0){
        // Remove first element in rows array
        rows.shift();
    }
    // Return rows array
    return rows;
}

/**
 * Google Request v1
 * Main controller function to handle api requests
 * @param Object - request
 * @param Object - response
 * @return response
 */
 const GoogleRequest_v1 = (request, response) => {
    
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

            // Try to parse data
            try{
                // Split sting at new lines
                data = strToJson(data);
                
                // Parse headers parameter as columns
                let headers = request.query.headers;
                if(headers && headers !== '1') {
                    headers = utilities.parseHeaders(headers);
                } else {
                    headers = parseColumns(data);
                }
                
                // Parse rows array
                let rows = parseRows(data);
                
                // Return new json object
                data = createJson(headers, rows);     
                
                // If order query params exist
                if(request.query.orderby || request.query.order){
                    // Reverse variable
                    let reverse;
                    if(!request.query.order) reverse = false;
                    if(request.query.order === 'asc') reverse = false;
                    if(request.query.order === 'desc') reverse = true;
                    // Sort data based off params
                    data = utilities.sortData(data, request.query.orderby, reverse);
                }

                // Return new respones
                return response.status(200).json(data);
            } 
            // Catch any errors
            catch (e){
                // Return error
                console.log(e.body)
                return response.status(400).json({ error: true, message: e.message });
            }            

        });
      
      })
      // Http Error
      .on("error", (err) => {

        // Return error
        return response.status(400).json({ error: true, message: err.message });

      });
}

/**
 * Export module
 */
 module.exports = {
    GoogleRequest_v1
}
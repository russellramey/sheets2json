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
 * Create columns array
 * Sperate and prepare column values from data object
 * @param Object
 * @return Array | Boolean
 */
const parseColumns = (data) => {
    // Arguments exists and valid
    if(!data || !data.table) return false;
    // Column array
    let cols = [];
    // If parsed headers
    if(data.table.parsedNumHeaders){
        // Map table columns to new array
        cols = data.table.cols.map((col, index) => {
            return (col.label) ? String(col.label).replace(/ /g, '_').replace(/-/g, '_') : "Column_" + (index+1)
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
    // Map new rows array
    rows = rows.map(row => {
        row = row.map((obj) => (obj ? obj.v : null));
        return row;
    })
    // Return rows array
    return rows;
}
/**
 * Build Google Url
 * Create Google Doc endpoint for provided sheet
 * @param String - url
 * @return String
 */
const createUrl = (url) => {
    // Attempt to get sheet ID from provided url
    let sheetID = url.split('https://docs.google.com/spreadsheets/d/')[1].split('/edit')[0]; 
    // Build new endpoint with sheet ID for json resource   
    let endpoint = `https://docs.google.com/spreadsheets/d/${sheetID}/gviz/tq?tqx=out:json`;
    // Return endpoint
    return endpoint;
}

/**
 * Google Request v1
 * Main controller function to handle api requests for google document url.
 * @param Object - request
 * @param Object - response
 * @return response
 */
 const getDocument_v1 = (request, response) => {

    // Set url, with request parameters
    let url = createUrl(request.query.url) + '&sheet=' + (request.query.sheet ? request.query.sheet : 0);
    
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
            if(resp.statusCode !== 200) return response.status(400).json({ error: true, message: 'Valid publicly accessible Google Sheet required.' }); 

            // Try to parse data
            try{
                // Split sting at new lines
                data = strToJson(data);
                
                // Parse rows array
                let rows = parseRows(data);
                // Parse cols array
                let cols = parseColumns(data);
                // Combine cols and rows into new data array
                data = (cols.length > 0 ? [cols, ...rows] : rows);

                // Parse headers parameter as columns
                let headers = request.query.headers;
                if(headers && headers == '1') {
                    headers = data[0];
                    data.shift()
                }
                else if(headers) {
                    headers = utilities.parseHeaders(headers);
                }
                
                // Return new json object
                data = utilities.createJson(data, headers);     
                
                // Order/sort data
                data = utilities.orderData(data, {
                    order: request.query.order,
                    orderby: request.query.orderby
                })

                // Return new respones
                return response.status(200).json(data);
            } 
            // Catch any errors
            catch (e){
                // Return error
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
    getDocument_v1
}
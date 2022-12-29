/**
 * Dependencies
 */
 const https = require("https");
 const XLSX = require('xlsx');
 const utilities = require('../modules/utilities');

 /**
 * Parse file
 * Attempt to pars array as file buffer for XLSX
 * @param Array - data
 * @param String - target
 * @return Array
 */
const parseFile = (data, target=null) => {
    // Create buffer from data
    let buffer = Buffer.concat(data);
    // Read buffer
    data = XLSX.read(buffer, { type: 'buffer' })

    // If no target, set default
    if(!target) target = data.SheetNames[0];

    // Parse data to json from buffer
    data = XLSX.utils.sheet_to_json(data.Sheets[target], {
        header: 1,
        blankRows: false,
    });
    // Return data
    return data;
}

/**
 * Create Json
 * Build json array from data array
 * @param Array - data
 * @param Array - headers
 * @return Array
 */
const createJson = (data, headers=null) => {
    // Json body
    let json = []
    // Foreach item in data array
    data.forEach((item) => {
        // If item is not empty
        if(item.length > 0){
            // If headers exists
            if(headers){
                 // New item object
                let newItem = {}
                // For each header in array
                headers.forEach((header, index) => {
                    // Format header
                    header = header.replace(' ', '_').replace('-', '_').toLowerCase();
                    // Create new item with header value and item value
                    newItem[header] = (item[index] ? item[index] : null)
                })
                // Push new item to json body
                json.push(newItem);
            } else {
                json.push(item);
            }
        }
    });
    // Return json
    return json;
}

/**
 * File Request v1
 * Main controller function to handle api requests
 * @param Object - request
 * @param Object - response
 * @return response
 */
  const FileRequest_v1 = (request, response) => {

    // If no url parameter
    let url = request.query.url;
    if(!url) return response.status(400).json({ error: true, message: '[url] parameter required.' });

    // Request url
    https.get(url, (resp) => {

        // Set data variable
        let data = [];

        // A chunk of data has been received.
        resp.on('data', (chunk) => {
            data.push(chunk);
        });

        resp.on('end', () => {

            // If response is not successfull
            if(resp.statusCode !== 200) return response.status(400).json({ error: true, message: 'Error trying to retrieve data from provided url.' }); 

            try{
                // Parse file data
                data = parseFile(data, request.query.sheet);

                // Parse headers parameter
                let headers = request.query.headers;
                if(headers && headers == '1') {
                    headers = data[0];
                    data.shift()
                }
                else if(headers) {
                    headers = utilities.parseHeaders(headers);
                }

                // Build custom json object
                data = createJson(data, headers);

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
                
                // Return response
                return response.status(200).json(data);
            }
            catch (e) {
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
};

 /**
  * Export module
  */
  module.exports = {
    FileRequest_v1
 }
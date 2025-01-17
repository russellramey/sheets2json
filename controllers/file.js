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
 * File Request v1
 * Main controller function to handle api requests for remote file url.
 * @param Object - request
 * @param Object - response
 * @return response
 */
  const getDocument_v1 = (request, response) => {

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
                data = utilities.createJson(data, headers);     

                // Order/sort data
                data = utilities.orderData(data, {
                    order: request.query.order,
                    orderby: request.query.orderby
                })
                
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
    getDocument_v1
 }
/**
 * Dependencies
 */
const https = require("https");
const URL = require('url');

/**
 * Create Json
 * Build json array from data and header array
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
                    header = parseHeaders(String(header));
                    // Create new item with header value and item value
                    newItem[header] = (item[index] ? item[index] : null)
                })
                // Push new item to json body
                json.push(newItem);
            } else {
                // Push raw item to json body
                json.push(item);
            }
        }
    });
    // Return json
    return json;
}

/**
 * Sort Array
 * Sort array based on provided params of data array, and key
 * @param Array - data
 * @param String - key
 * @param Boolean - reverse 
 * @return Object
 */
 const sortArray = (data, key, reverse=false) => {
    if(key){
       // Sort object by key 
       data.sort((a, b) => {
            if(a[key] > b[key]) return 1;
            if(a[key] < b[key]) return -1;
            return 0;
        })
    }
    // If reverse is true
    if(reverse) data.reverse();
    // Return data
    return data;
}

/**
 * Order data
 * Order data array based on provided params
 * @param Array - data
 * @param Object - options
 * @return Object
 */
const orderData = (data, options) => {
    // If no data
    if(!data) return false;
    // If order query params exist
    if(options.orderby || options.order){
        // Reverse variable
        let reverse;
        // Parse provided params, set reversse accordingly
        if(!options.order) reverse = false;
        if(options.order === 'asc') reverse = false;
        if(options.order === 'desc') reverse = true;
        // Sort data based off params
        data = sortArray(data, options.orderby, reverse);
    }
    // Return data
    return data;
}

/**
 * Parse headers
 * Parse headers url parameter
 * @param String - headers
 * @return String
 */
const parseHeaders = (headers) => {
    return String(headers).toLocaleLowerCase().replace(/ /g, '_').replace(/-/g, '_').replace(/(<([^>]+)>)/gi, "").split(',');
}

/**
 * Parse url
 * Parse url to determin the domain host and other url properties.
 * @param String - url
 * @return Object
 */
const parseUrl = (url) => {
    // If no url return false
    if(!url) return false;
    // Parse url
    let urlObj = URL.parse(url);
    // Return data
    return (urlObj.host ? urlObj : false);
}

/**
 * Export module
 */
module.exports = {
    createJson,
    orderData,
    parseHeaders,
    parseUrl
}
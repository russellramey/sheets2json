/**
 * Dependencies
 */
const https = require("https");
const URL = require('url');

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
 * @param Object - params
 * @return Object
 */
const orderData = (data, params) => {
    // If no data
    if(!data) return false;
    // If order query params exist
    if(params.orderby || params.order){
        // Reverse variable
        let reverse;
        // Parse provided params, set reversse accordingly
        if(!params.order) reverse = false;
        if(params.order === 'asc') reverse = false;
        if(params.order === 'desc') reverse = true;
        // Sort data based off params
        data = sortArray(data, params.orderby, reverse);
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
    return headers.replace(/ /g, '_').replace(/-/g, '_').replace(/(<([^>]+)>)/gi, "").split(',');
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
    orderData,
    parseHeaders,
    parseUrl
}
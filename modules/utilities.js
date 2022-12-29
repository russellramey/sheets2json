/**
 * Dependencies
 */
const https = require("https");

/**
 * Sort data
 * Sort data array based on provided params
 * @param Array - data
 * @param String - key
 * @param Boolean - reverse 
 * @return Object
 */
 const sortData = (data, key, reverse=false) => {
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

const parseHeaders = (headers) => {
    return headers.replace(/ /g, '_').replace(/-/g, '_').replace(/(<([^>]+)>)/gi, "").split(',');
}


/**
 * Export module
 */
module.exports = {
    sortData,
    parseHeaders
}
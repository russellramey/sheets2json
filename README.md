# SheetsProxy
Simple application that provides a read-only REST endpoint for any publicly accessible Google Sheet, .xlsx/.xls, or .csv document. This api will attempt to return the provided Sheet data in structured JSON.

## Requirements 
- Node
- Docker

## Setup
- Clone repository & move to repo directory
- Run `npm install`
- Run `docker compose up`

## Documentation
This api servie consists of a single supported endpoint and is read-only. You can pass in specific query parameters that can be used to modify the JSON responses, for example adding custom `headers` (column names or keys) to override the remote documents. You can also us `order` and `orderby` to sort the JSON object in the response.  Lastly, for documents that have multiple workbooks/sheets, you can pass in a `sheet` parameter and the name of the desired Sheet to return. By default the first sheet in the document will always be returned.

### Endpoint
`{domain}/v1/doc/?url=REMOTE_DOC_URL`

Make a GET request to this endpoint where `url` is a valid publicly accessible xlsx, xls, csv, or Google Sheet link. The  `url` parameter is the only required parameter that needs to be present on every request. Additional supported query parameters can be found below, and can be used to customize or mutate the response from the api.

Below are two examples for what the api would be expecting:
- Self-Hosted CSV: `https://yourdomain.com/path/to/file.csv`
- Self-Hosted XLS: `https://yourdomain.com/path/to/file.xlsx`
- Google Doc: `https://docs.google.com/spreadsheets/d/SHEET_ID_WILL_BE_HERE/edit`

__NOTE__ Again, it is important that the documents are publiclly accessible to the internet. For Google Docs, that means the Doc is open to anyone to view it with public viewer link.

#### Supported Parameters 
There are five(5) supported query parameters for the above endpoint:
- `url`: Required. Full url to document (see above for examples).
- `headers`: Can be a boolean(1), or list of keywords sperated by a comma. This option will let you customize the JSON keys without the need to update the remote document. Any spaces or hypens in the keywords will be automatically replaced with underscores (`_`) .
- `orderby`: Sort results by provided object key.
- `order`: Supports `asc`(default) and `desc`. Order results in ascending or descending order.
- `sheet`: Sheet name of desired sheet in the document. If no `sheet` specified, the first sheet in the document will be used.

### Response
Returns JSON array of rows in the document. Each item in the array is an array with the values of each row from the document. To return an array of rows with `key`/`value` objects, you can pass in the `headers` parameter. By default, with `headers` set to `1`, the first item in the array will be used as the  `keys` for all other items in the array.
```JSON
// Default response
[
    [
        "row 1 value 1",
        "row 1 value 2",
        "row 1 value 3",
        ...
    ],
    [
        "row 2 value 1",
        "row 2 value 2",
        "row 2 value 3",
        ...
    ],
    ...
]

// Response with [headers=1]
[
    {
        "row_1_value_1":"row 2 value 1",
        "row_1_value_2":"row 2 value 2",
        "row_1_value_3":"row 2 value 3",
        ...
    },
    {
        "row_1_value_1":"row 3 value 1",
        "row_1_value_2":"row 3 value 2",
        "row_1_value_3":"row 3 value 3",
        ...
    }
    ...
]

// Response with [headers=key1,key2,key3]
[
    {
        "key1":"row 1 value 1",
        "key2":"row 1 value 2",
        "key3":"row 1 value 3",
        ...
    },
    {
        "key1":"row 2 value 1",
        "key2":"row 2 value 2",
        "key3":"row 2 value 3",
        ...
    }
    ...
]
```

## Disclaimer
This service requires the target spreadsheet documents to be publicly accessible, meaning the data contained within the document could be exposed to the internet without requiring user authentication to access. If you want to keep the document data private, __DO NOT USE__ it with this service. A future version may include a way to pass in API keys or basic HTTP auth with each request.
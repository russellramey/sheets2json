# SheetsProxy
Simple application that provides a read-only REST endpoint for any publicly accessible Google Sheet, .xlsx, or .csv document. This api will attempt to return the provided Sheet data in structured JSON.

## Requirements 
- Node
- Docker

## Setup
- Clone repository & move to repo directory
- Run `npm install`
- Run `docker compose up`

## Documentation
There are 2 endpoints that are supported. One endpoint for accessing Google Sheet documents, and another endpoint for accessing xls/csv files from a remote url. Both endpoints take in specific query parameters that can be used to modify the JSON responses, for example adding custom `headers` (column names or keys) to override the remote documents. You can also us `order` and `orderby` to sort the JSON object in the response.  Lastly, for documents that have multiple workbooks/sheets, you can pass in a `sheet` parameters and the name of the desired Sheet to return. By default the first sheet will always be returned.

### Supported Parameters
### Google Sheet
`{domain}/v1/doc/SHEET_ID`
Make a get request to the endpoint where `SHEET_ID` is a valid publicly accessible Google Sheet ID (typically a long alphanumeric string of characters). It is important that the Sheet is publicly readable, there is no authentication or Google API keys supported at this time.

The `SHEET_ID` needed for this API can be found within any valid Google Sheet edit or share url in the format:
`https://docs.google.com/spreadsheets/d/{_SHEET_ID_WILL_BE_HERE_}/edit`

#### Options 
There are three(3) supported query parameters for the above endpoint:
- `headers`: Can be a boolean(1), or list of keywords sperated by a comma. This option will let you customize the JSON keys without physically updating the remote file.
- `orderby`: sort results by provided object key.
- `order`: supports `asc`(default) and `desc`. Order results in ascending or descending order.
- `sheet`: sheet name of desired sheet in Google Sheet document. If no `sheet` specified, the first sheet in the document will be used.

### Remote File
`{domain}/v1/file/?url=REMOTE_URL_TO_FILE`
Make a get request to the endpoint where `REMOTE_URL_TO_FILE` is a valid publicly accessible url to the hosted xls/csv file. The file can be hosted at any address as long as it is reachable via the open internet. 

#### Options 
There are three(3) supported query parameters for the above endpoint:
- `url`: Required. Full url to remote file (ex. https://yourdomain.com/path/to/file.csv)
- `headers`: Can be a boolean(1), or list of keywords sperated by a comma. Setting to `1` will use the first row as the document headers.
- `orderby`: sort results by provided object key.
- `order`: supports `asc`(default) and `desc`. Order results in ascending or descending order.
- `sheet`: sheet name of desired sheet in Google Sheet document. If no `sheet` specified, the first sheet in the document will be used.

### Responses
Returns JSON array of rows in the document. Each item in the array is a single row with `key` / `value` pairs. Keys can be set directly in the document as the first row, or by passing a list of keys, seperated by a comma, via the `headers` parameter.
```JSON
[
    {
        "column_label_1":"row 1 value 1",
        "column_label_2":"row 1 value 2",
        "column_label_3":"row 1 value 3",
        ...
    },
    {
        "column_label_1":"row 2 value 1",
        "column_label_2":"row 2 value 2",
        "column_label_3":"row 2 value 3",
        ...
    }
    ...
]
```

## Disclaimer
This service requires the target spreadsheet documents to be publicly accessible, meaning the data contained within the document could be exposed to the internet without requiring user authentication to access. If you want to keep the document data private, DO NOT USE it with this service. 
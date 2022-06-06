# SheetsProxy
Simple application that provides a read-only REST endpoint for any publicly accessible Google Sheet document. The endpoint returns the provided Sheet data in structured JSON.

## Requirements 
- Node
- Docker

## Setup
- Clone repository & move to repo directory
- Run `npm install`
- Run `docker compose up`

## Documentation
### Endpoint
`{domain}/sheet/SHEET_ID`

Make a get request to the endpoint where `SHEET_ID` is a valid publicly accessible Google Sheet ID (typically a long alphanumeric string of characters). It is important that the Sheet is publicly readable, there is no authentication or Google API keys supported at this time.

### Options 
There are three(3) supported query parameters for the above endpoint:
- `orderby`: sort results by provided object key.
- `order`: supports `asc`(default) and `desc`. Order results in ascending or descending order.
- `sheet`: sheet name of desired sheet in Google Sheet document. If no `sheet` specified, the first sheet in the document will be used.

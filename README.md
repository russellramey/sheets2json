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
`{domain}/doc/SHEET_ID`

Make a get request to the endpoint where `SHEET_ID` is a valid publicly accessible Google Sheet ID (typically a long alphanumeric string of characters). It is important that the Sheet is publicly readable, there is no authentication or Google API keys supported at this time.

The `SHEET_ID` needed for this API can be found within any valid Google Sheet edit or share url in the format:
`https://docs.google.com/spreadsheets/d/{_SHEET_ID_WILL_BE_HERE_}/edit`

### Options 
There are three(3) supported query parameters for the above endpoint:
- `orderby`: sort results by provided object key.
- `order`: supports `asc`(default) and `desc`. Order results in ascending or descending order.
- `sheet`: sheet name of desired sheet in Google Sheet document. If no `sheet` specified, the first sheet in the document will be used.

## Disclaimer
This service requires the target Google Sheet document be publicly accessible, meaning the data contained within the document, as well as the document ID, could be exposed to the internet without requiring user authentication to access. If you want to keep the Google Sheet data private, DO NOT USE it with this service. 
# Pubsie

A JavaScript package for parsing EPUB files and extracting their contents. This package provides a convenient way to extract metadata, chapters, and other resources from EPUB files in your JavaScript applications.


## Usage/Examples

```javascript
const pubsie = require("pubsie");

let pub = new pubsie('path/to/epub');

pub.on("error", (err) => {
  console.log(err.message);

  if (err.data.name == "NoNcxError") {
    // ... process error
  };
});

pub.parse(); // always call after event listener

pub.buildCache('path/to/write/location') // build a cache of parsed data

console.log(pub.epub) // .epub property stores parsed data
```


## Installation

Install pubsie with npm

```bash
  npm i pubsie
```
    
## Running Tests

To run tests, run the following command

in tests directory, create a data directory and place epub files inside

```bash
tests
├───data
│   ├───moby-dick.epub
│   └───dracula.epub
└───global
```

```bash
  npm run test
```


# Important

all epubs for testing are derived from [Project Gutenberg](https://www.gutenberg.org/)


## License

Pubsie is provided under the [MIT](https://choosealicense.com/licenses/mit/) license


## Author

- Arad Fadaei [@downmoto](https://github.com/Downmoto)


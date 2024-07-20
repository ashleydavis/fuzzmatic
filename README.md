# fuzzer

Generates sets of data for fuzz testing.

[Click here to support my work](https://www.codecapers.com.au/about#support-my-work)

## Features

- Generates sets of valid and invalid data that can be used to test JavaScript/TypeScript functions and REST APIs.
- Input a JSON schema in JSON or YAML format.
- Outputs JSON format.

## CLI usage

Install it:

```bash
npm install -g fuzzer
```

Run it on a JSON schema:

```bash
fuzzer a-json-schema.json
```
Run it on a JSON schema in YAML format:

```bash
fuzzer a-json-schema.yaml
```

Generated data is output to the console.

## API usage

Install it in your project:

```bash
npm install fuzzer
```

Required it in your code:

```javascript
const fuzzer = require("fuzzer");
```

Load your JSON schema and generate data from it:

```javascript
const fs = require("fs");

const schema = JSON.parse(fs.readFileSync("a-json-schema.json", "utf-8"));
const data = fuzzer.generateData(schema);
console.log(data);
```

If you want to load your JSON schema from a YAML file you need to instal the YANL parser:

```bash
npm install yaml
```

Then load and parser the YAML file, before generating data from it:

```javascript
const fs = require("fs");
const yaml = require("yaml");

const schema = yaml.parse(fs.readFileSync("a-json-schema.yaml", "utf-8"));
const data = fuzzer.generateData(schema);
console.log(data);
```

# Development

## Geting the code

Clone it from GitHub:

```bash
git clone git@github.com:ashleydavis/fuzzer.git
```

## Compiling the TypeScript code

Open folder in Visual Studio Code and hit Ctrl+Shift+B

Or

```bash
cd fuzzer
npm run compile
```

## Debugging

- Open in Visual Studio Code.
- Select 'Main' debug configuration.
- Select the 'Test All' or 'Test Current' debug configuration to debug all tests or the current test file.
- Set your breakpoints.
- Hit F5 to run.

## Build and run

Compile the application:

```bash
npm run compile
```

The run the compiled JavaScript:

```bash
npm start
```

## Running without building

Run the command line app directly:

```bash
npm run start:dev
```

## Running the tests

Run tests directly:

```bash
npm test
```

Or:

```bash
npm run test:watch
```

See package.json for more scripts!

import { generateData } from "./index";
import minimist from "minimist";
import fs from "fs";
import yaml from "yaml";

async function main() {
    const argv = minimist(process.argv.slice(2));
    if (argv._.length !== 1) {
        console.error("Usage: fuzzer <schema>");
        process.exit(1);
    }

    const filePath = argv._[0];
    let schema;
    if (filePath.endsWith(".json")) {
        schema = JSON.parse(fs.readFileSync(filePath, "utf-8"));        
    }
    else if (filePath.endsWith(".yaml")) {
        schema = yaml.parse(fs.readFileSync(filePath, "utf-8"));       
    }
    else {
        console.error(`Tried to load ${filePath}, but schema must be a JSON or YAML file`);
        process.exit(1);    
    }

    const data = generateData(schema);
    console.log(JSON.stringify(data, null, 2)); 
}

main()
    .catch(err => {
        console.error(`Something went wrong: ${err.message}`);
        console.error(err.stack || err);
        process.exit(1);
    })
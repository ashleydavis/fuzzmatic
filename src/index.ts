//
// Definition of a JSON schema.
//
export interface ISchema {
    //
    // The data type being defined.
    //
    type: string;

    //
    // Minimum value.
    //
    minimum?: number;

    //
    // Maximum value.
    //
    maximum?: number;

    //
    // Properties of an object.
    //
    properties?: {
        [field: string]: ISchema;
    };
}

//
// Represents generated data.
//
export interface IGeneratedData {
    //
    // Set of valid data items.
    //
    valid: any[];

    //
    // Set of invalid data items.
    //
    invalid: any[];
}

//
// Generates valid and invalid options for a number.
//
function number(schema: ISchema): IGeneratedData {
    let minValue = schema.minimum !== undefined
        ? schema.minimum
        : -Number.MAX_VALUE;
    let maxValue = schema.maximum !== undefined
        ? schema.maximum
        : Number.MAX_VALUE;

    const valid: any[] = [];
    const invalid: any[] = [];

    //
    // Adds a value to the valid or invalid set depending on whether it is within the range.
    //
    function addValue(value: number) {
        if (minValue <= value && value <= maxValue) {
            if (!valid.includes(value)) {
                valid.push(value);
            }
        }
        else {
            if (!invalid.includes(value)) {
                invalid.push(value);
            }
        }
    }

    if (minValue > -Number.MAX_VALUE) {
        addValue(minValue - 1); // Invalid: outside range.
    }

    if (maxValue < Number.MAX_VALUE) {
        addValue(maxValue + 1); // Invalid: outside range.
    }

    addValue(minValue);
    addValue(-100);
    addValue(-10);
    addValue(-1);
    addValue(0);
    addValue(1);
    addValue(10);
    addValue(100);
    addValue(maxValue);

    invalid.push(undefined);
    invalid.push(null);
    invalid.push(Number.NaN);
    invalid.push(Number.NEGATIVE_INFINITY);
    invalid.push(Number.POSITIVE_INFINITY);
    invalid.push("a");
    invalid.push(true);
    invalid.push({});

    // Default set.
    return {
        valid,
        invalid,
    };
}

//
// Generates valid and invalid options for a string.
//
function string(schema: ISchema): IGeneratedData {

    const valid: any[] = [];
    const invalid: any[] = [];

    valid.push("");
    valid.push("a");

    invalid.push(undefined);
    invalid.push(null);
    invalid.push(42);
    invalid.push(true);
    invalid.push({});

    return { valid, invalid };
}

//
// Generate valid and invalid combination of the set of fields.
//
function generateCombinations(fields: { name: string, data: IGeneratedData }[]): IGeneratedData {
    const valid: any[] = [];
    const invalid: any[] = [];

    //
    // Build the canoncial valid object.
    //
    const validObject: any = {};    
    for (const { name, data } of fields) {
        validObject[name] = data.valid[0];  
    }

    valid.push(validObject);

    //
    // Start with the valid object and vary each of the fields across valid values.
    //
    for (const { name, data } of fields) {
        for (const value of data.valid.slice(1)) {
            valid.push({ 
                ...validObject,
                [name]: value,
            });
        }
    }

    //
    // Start with the valid object and vary each of the fields across invalid values.
    //
    for (const { name, data } of fields) {
        for (const value of data.invalid) {
            invalid.push({ 
                ...validObject,
                [name]: value,
            });
        }
    }

    return { valid, invalid };
}

//
// Generates valid and invalid options for an object.
//
function object(schema: ISchema): IGeneratedData {
    const fields = [];
    if (schema.properties) {
        for (const [field, fieldSchema] of Object.entries(schema.properties)) {
            fields.push({
                name: field,
                data: generateData(fieldSchema),
            });
        }

        return generateCombinations(fields);
    }
    else {
        return { valid: [], invalid: [] };
    }
}

const types: any = {
    number,
    string,
    object,
};

//
// Generate sets of valid and invalid data for a given schema.
//
export function generateData(schema: ISchema): IGeneratedData {
    const typeHandler = types[schema.type];
    if (!typeHandler) {
        throw new Error(`Unknown type: ${schema.type}`);
    }

    return typeHandler(schema);
}


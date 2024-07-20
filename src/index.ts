//
// Definition of a JSON schema.
//
export interface ISchema {
    //
    // The data type being defined.
    //
    type: string;
}

//
// Definition of a number schema.
//
export interface INumberSchema extends ISchema {
    //
    // The data type being defined.
    //
    type: "number";

    //
    // Minimum value.
    //
    minimum?: number;

    //
    // Maximum value.
    //
    maximum?: number;
}

//
// Definition of a string schema.
//
export interface IStringSchema extends ISchema {
    //
    // The data type being defined.
    //
    type: "string";
}

//
// Definition of a boolean schema.
//
export interface IBooleanSchema extends ISchema {
    //
    // The data type being defined.
    //
    type: "boolean";
}

//
// Definition of a number schema.
//
export interface IObjectSchema extends ISchema {
    //
    // The data type being defined.
    //
    type: "object";

    //
    // Properties of an object.
    //
    properties?: {
        [field: string]: ISchema;
    };
}

//
// Definition of an array schema.
//
export interface IArraySchema extends ISchema {
    //
    // The data type being defined.
    //
    type: "array";

    //
    // Nested schema for each item in the array.
    //
    items?: ISchema;
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
function number(schema: INumberSchema): IGeneratedData {
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
function string(schema: IStringSchema): IGeneratedData {

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
// Generates valid and invalid options for a boolean.
//
function boolean(schema: IBooleanSchema): IGeneratedData {

    const valid: any[] = [];
    const invalid: any[] = [];

    valid.push(true);
    valid.push(false);

    invalid.push(undefined);
    invalid.push(null);
    invalid.push(42);
    invalid.push("a");
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
function object(schema: IObjectSchema): IGeneratedData {
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

//
// Generates valid and invalid options for an array.
//
function array(schema: IArraySchema): IGeneratedData {

    if (!schema.items) {
        throw new Error("Array schema must have items defined.");
    }

    const itemsData = generateData(schema.items);

    const valid: any[] = [];
    const invalid: any[] = [];

    valid.push([]);
    for (const validItem of itemsData.valid) {
        valid.push([validItem]);
    }
    valid.push([itemsData.valid[0], itemsData.valid[0]]);

    for (const invalidItem of itemsData.invalid) {
        invalid.push([invalidItem]);
    }   

    invalid.push(undefined);
    invalid.push(null);
    invalid.push(42);
    invalid.push("a");
    invalid.push(true);
    invalid.push({});

    return { valid, invalid };
}

interface ISchemaTypeMap {
    [type: string]: (schema: ISchema) => IGeneratedData;
}

const schemaTypeMap = {
    number,
    string,
    boolean,
    object,
    array,
};

//
// Generate sets of valid and invalid data for a given schema.
//
export function generateData(schema: ISchema): IGeneratedData {
    const typeHandler = (schemaTypeMap as ISchemaTypeMap)[schema.type];
    if (!typeHandler) {
        throw new Error(`Unknown type: ${schema.type}`);
    }

    return typeHandler(schema);
}


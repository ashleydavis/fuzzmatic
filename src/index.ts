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

    //
    // The names of fields that must be present.
    // All other fields are optional.
    //
    required?: string[];
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
// A named field of an object.
//
interface IField {
    //
    // The name of the field.
    //
    name: string;

    //
    // Data for the field.
    //
    data: IGeneratedData;

    //
    // Set to true when field is required or false otherwise.
    //
    required: boolean;
}

//
// Generate valid and invalid combination of the set of fields.
//
function generateCombinations(fields: IField[]): IGeneratedData {

    const valid: any[] = [];
    const invalid: any[] = [];

    //
    // Build the minimal valid object.
    //
    const minimalValidObject: any = {};    
    for (const { name, data, required } of fields) {
        if (required) {
            minimalValidObject[name] = data.valid[0];  
        }
    }

    valid.push(minimalValidObject); // Note: this could be an empty object if no properties are actually required.

    if (Object.keys(minimalValidObject).length > 0) {
        //
        // If the minimal valid object is not empty, then the empty object is an invalid value.
        //
        invalid.push({});
    }

    //
    // Start with the minimal valid object and vary each of the fields across valid values.
    //
    for (const { name, data, required } of fields) {
        if (required) {
            for (const value of data.valid.slice(1)) {
                valid.push({ 
                    ...minimalValidObject,
                    [name]: value,
                });
            }
        }
    }

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
    for (const { name, data, required } of fields) {
        for (const value of data.invalid) {
            if (value === undefined) {
                if (!required) {
                    // An undefined value is only invalid if the field is required.
                    continue;
                }
            }
            invalid.push({ 
                ...validObject,
                [name]: value,
            });
        }
    }

    invalid.push(undefined);
    invalid.push(null);
    invalid.push(42);
    invalid.push("a");
    invalid.push(true);

    return { valid, invalid };
}

//
// Generates valid and invalid options for an object.
//
function object(schema: IObjectSchema): IGeneratedData {
    const fields = [];
    if (schema.properties) {
        const requiredFieldSet = new Set(schema.required || []);

        for (const [field, fieldSchema] of Object.entries(schema.properties)) {
            fields.push({
                name: field,
                data: generateData(fieldSchema),
                required: requiredFieldSet.has(field),
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


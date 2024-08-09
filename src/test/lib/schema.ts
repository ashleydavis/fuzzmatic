import Ajv, { AnySchema } from "ajv/dist/2020"

//
// Expects that the value matches the schema.
//
export function expectMatchesSchema(value: any, schema: AnySchema): void {
    const ajv = new Ajv({
        verbose: true,
        strict: true,
    }); 
    const validate = ajv.compile(schema);
    const valid = validate(value)
    if (!valid) {
        throw new Error(
            `Expected to match schema\n` +
            validate.errors?.map(e => e.message).join("\n") + "\n" +
            `Value: ${value}\n` +
            `Schema: \n${JSON.stringify(schema, null, 2)}`
        );
    }
}

//
// Expects that the value doesn't match the schema.
//
export function expectNotMatchesSchema(value: any, schema: AnySchema): void {
    const ajv = new Ajv({
        verbose: true,
        strict: true,
    }); 
    const validate = ajv.compile(schema);
    const valid = validate(value);
    if (valid) {
        throw new Error(
            `Expected not to match schema\n` +
            `Value: ${value}\n` +
            `Schema: \n${JSON.stringify(schema, null, 2)}`
        );
    }    
}

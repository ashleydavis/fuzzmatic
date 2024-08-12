import { generateData } from "..";
import { expectMatchesSchema, expectNotMatchesSchema } from "./lib/schema";

describe("generate data", () => {

    const nonSchemaValues = [
        undefined,
        NaN,
        -Infinity,
        Infinity,
    ]

    //
    // Returns true if the value is not valid in a JSON schema.
    //
    function isNonSchemaValue(value: any): boolean {
        return nonSchemaValues.includes(value);
    }

    //
    // Returns true if an array contains a value that is not valid in a JSON schema.
    //
    function arrayContainsNonSchemaValue(array: any[]): boolean {
        for (const item of array) {
            if (isNonSchemaValue(item)) {
                return true;
            }
        }

        return false;
    }

    //
    // Makes data from a schema and then checks if that data matches the schema.
    //
    function makeData(schema: any) {
        const data = generateData(schema);

        for (const validItem of data.valid) {
            if (nonSchemaValues.includes(validItem)) {
                // Don't test values that aren't valid against a JSON schema.
                continue;
            }

            expectMatchesSchema(validItem, schema);
        }

        for (const invalidItem of data.invalid) {
            if (isNonSchemaValue(invalidItem)) {
                // Don't test values that aren't valid in a JSON schema.
                continue;
            }

            if (schema.type === "array") {
                if (schema.prefixItems) {
                    if (Array.isArray(invalidItem) && invalidItem.length === 0) {
                        // This seems is be allowed by a schema with prefixItems even
                        // through fuzzmatic considers it invalid.
                        continue;
                    }
                }

                if (Array.isArray(invalidItem)) {
                    if (arrayContainsNonSchemaValue(invalidItem)) {
                        // Don't test values that aren't valid in a JSON schema.
                        continue;
                    }
                }
            }

            expectNotMatchesSchema(invalidItem, schema);
        }

        return data;
    }

    test("simple schema test", () => {
        expectNotMatchesSchema(null, { type: "boolean" });
    });

    test("simple schema test", () => {
        expectNotMatchesSchema([null, 5], {
            type: "array",
            prefixItems: [
                { type: "boolean" },
                { type: "number" },
            ],
            minItems: 2,
            maxItems: 2,
        });
    });

    test("simple number", () => {
        const schema = {
            type: "number",
        };
        expect(makeData(schema)).toEqual({
            valid: [
                -Number.MAX_VALUE,
                -100,
                -10,
                -1,
                0,
                1,
                10,
                100,
                Number.MAX_VALUE,
            ],
            invalid: [
                undefined,
                null,
                NaN,
                -Infinity,
                Infinity,
                "a",
                true,
                {},
            ],
        });
    });

    test("positive number range", () => {
        const schema = {
            type: "number",
            minimum: 5,
            maximum: 10,
        };
        expect(makeData(schema)).toEqual({
            valid: [
                5,
                10,
            ],
            invalid: [
                4,
                11,
                -100,
                -10,
                -1,
                0,
                1,
                100,
                undefined,
                null,
                NaN,
                -Infinity,
                Infinity,
                "a",
                true,
                {},
            ],
        });
    });

    test("negative number range", () => {
        const schema = {
            type: "number",
            minimum: -20,
            maximum: -12,
        };
        expect(makeData(schema)).toEqual({
            valid: [
                -20,
                -12
            ],
            invalid: [
                -21,
                -11,
                -100,
                -10,
                -1,
                0,
                1,
                10,
                100,
                undefined,
                null,
                NaN,
                -Infinity,
                Infinity,
                "a",
                true,
                {},
            ],
        });
    });

    test("number range around zero", () => {
        const schema = {
            type: "number",
            minimum: -11,
            maximum: 11,
        };
        expect(makeData(schema)).toEqual({
            valid: [
                -11,
                -10,
                -1,
                0,
                1,
                10,
                11,
            ],
            invalid: [
                -12,
                12,
                -100,
                100,
                undefined,
                null,
                NaN,
                -Infinity,
                Infinity,
                "a",
                true,
                {},
            ],
        });
    });

    test("simple string", () => {
        const schema = {
            type: "string",
        };
        expect(makeData(schema)).toEqual({
            valid: [
                "",
                "a",
            ],
            invalid: [
                undefined,
                null,
                42,
                true,
                {},
            ],
        });
    });

    test("string with minLength", () => {
        const schema = {
            type: "string",
            minLength: 1,
        };
        expect(makeData(schema)).toEqual({
            valid: [
                "a",
            ],
            invalid: [
                "",
                undefined,
                null,
                42,
                true,
                {},
            ],
        });
    });    

    test("string with maxLength", () => {
        const schema = {
            type: "string",
            maxLength: 3,
        };
        expect(makeData(schema)).toEqual({
            valid: [
                "",
                "a",
                "aaa",
            ],
            invalid: [
                "aaaa",
                undefined,
                null,
                42,
                true,
                {},
            ],
        });
    });    

    test("string with minLength and maxLength", () => {
        const schema = {
            type: "string",
            minLength: 2,
            maxLength: 6,
        };
        expect(makeData(schema)).toEqual({
            valid: [
                "aa",
                "aaaaaa",
            ],
            invalid: [
                "",
                "a",
                "aaaaaaa",
                undefined,
                null,
                42,
                true,
                {},
            ],
        });
    });    

    test("boolean", () => {
        const schema = {
            type: "boolean",
        };
        expect(makeData(schema)).toEqual({
            valid: [
                true,
                false,
            ],
            invalid: [
                undefined,
                null,
                42,
                "a",
                {},
            ],
        });
    });

    test("object with no required values", () => {
        const schema = {
            type: "object",
            properties: {
                a: {
                    type: "boolean",
                },
                b: {
                    type: "string",
                },
            },
        };
        expect(makeData(schema)).toEqual({
            valid: [
                {},
                { a: true, b: '' },
                { a: false, b: '' },
                { a: true, b: 'a' },
            ],
            invalid: [
                { a: null, b: '' },
                { a: 42, b: '' },
                { a: 'a', b: '' },
                { a: {}, b: '' },
                { a: true, b: null },
                { a: true, b: 42 },
                { a: true, b: true },
                { a: true, b: {} },
                undefined,
                null,
                42,
                'a',
                true,
            ],
        },
        );
    });

    test("object with 1st value required", () => {
        const schema = {
            type: "object",
            properties: {
                a: {
                    type: "boolean",
                },
                b: {
                    type: "string",
                },
            },
            required: ["a"],
        };
        expect(makeData(schema)).toEqual({
            valid: [
                { a: true },
                { a: false },
                { a: true, b: '' },
                { a: false, b: '' },
                { a: true, b: 'a' },
            ],
            invalid: [
                {},
                { a: undefined, b: '' },
                { a: null, b: '' },
                { a: 42, b: '' },
                { a: 'a', b: '' },
                { a: {}, b: '' },
                { a: true, b: null },
                { a: true, b: 42 },
                { a: true, b: true },
                { a: true, b: {} },
                undefined,
                null,
                42,
                'a',
                true,
            ],
        });
    });

    test("object with a 2nd value required", () => {
        const schema = {
            type: "object",
            properties: {
                a: {
                    type: "boolean",
                },
                b: {
                    type: "string",
                },
            },
            required: ["b"],
        };
        expect(makeData(schema)).toEqual({
            valid: [
                { b: '' },
                { b: 'a' },
                { a: true, b: '' },
                { a: false, b: '' },
                { a: true, b: 'a' },
            ],
            invalid: [
                {},
                { a: null, b: '' },
                { a: 42, b: '' },
                { a: 'a', b: '' },
                { a: {}, b: '' },
                { a: true, b: undefined },
                { a: true, b: null },
                { a: true, b: 42 },
                { a: true, b: true },
                { a: true, b: {} },
                undefined,
                null,
                42,
                'a',
                true,
            ],
        })
    });

    test("object with both values required", () => {
        const schema = {
            type: "object",
            properties: {
                a: {
                    type: "boolean",
                },
                b: {
                    type: "string",
                },
            },
            required: ["a", "b"],
        };
        
        expect(makeData(schema)).toEqual({
            valid: [
                { a: true, b: '' },
                { a: false, b: '' },
                { a: true, b: 'a' },
                { a: true, b: '' },
                { a: false, b: '' },
                { a: true, b: 'a' }
            ],
            invalid: [
                //todo: want to include both of these as invalid
                // { a: true }
                // { b: '' }
                {},
                { a: undefined, b: '' },
                { a: null, b: '' },
                { a: 42, b: '' },
                { a: 'a', b: '' },
                { a: {}, b: '' },
                { a: true, b: undefined },
                { a: true, b: null },
                { a: true, b: 42 },
                { a: true, b: true },
                { a: true, b: {} },
                undefined,
                null,
                42,
                'a',
                true
            ]
        });
    });

    test("array", () => {
        const schema = {
            type: "array",
            items: {
                type: "boolean",
            },
        };

        expect(makeData(schema)).toEqual({
            valid: [
                [],
                [true],
                [false],
                [true, true],
                [false, true],
                [true, false]
            ],
            invalid: [
                [undefined],
                [null],
                [42],
                ['a'],
                [{}],
                [undefined, true],
                [null, true],
                [42, true],
                ['a', true],
                [{}, true],
                [true, undefined],
                [true, null],
                [true, 42],
                [true, 'a'],
                [true, {}],
                undefined,
                null,
                42,
                'a',
                true,
                {}
            ]
        });
    });

    test("array with minItems", () => {
        const schema = {
            type: "array",
            items: {
                type: "boolean",
            },
            minItems: 2,
        };

        expect(makeData(schema)).toEqual({
            valid: [
                [true, true],
                [false, true],
                [true, false],
                [true, true, true],
                [false, true, true],
                [true, false, true],
                [true, true, false]
            ],
            invalid: [
                [],
                [undefined, true],
                [null, true],
                [42, true],
                ['a', true],
                [{}, true],
                [true, undefined],
                [true, null],
                [true, 42],
                [true, 'a'],
                [true, {}],
                [undefined, true, true],
                [null, true, true],
                [42, true, true],
                ['a', true, true],
                [{}, true, true],
                [true, undefined, true],
                [true, null, true],
                [true, 42, true],
                [true, 'a', true],
                [true, {}, true],
                [true, true, undefined],
                [true, true, null],
                [true, true, 42],
                [true, true, 'a'],
                [true, true, {}],
                [true],
                undefined,
                null,
                42,
                'a',
                true,
                {}
            ]
        });
    });

    test("array with maxItems", () => {
        const schema = {
            type: "array",
            items: {
                type: "boolean",
            },
            maxItems: 2,
        };

        expect(makeData(schema)).toEqual({
            valid: [
                [],
                [true],
                [false],
                [true, true],
                [false, true],
                [true, false]
            ],
            invalid: [
                [undefined],
                [null],
                [42],
                ['a'],
                [{}],
                [undefined, true],
                [null, true],
                [42, true],
                ['a', true],
                [{}, true],
                [true, undefined],
                [true, null],
                [true, 42],
                [true, 'a'],
                [true, {}],
                [true, true, true],
                undefined,
                null,
                42,
                'a',
                true,
                {}
            ]
        });
    });

    test("array with minItems and maxItems", () => {
        const schema = {
            type: "array",
            items: {
                type: "boolean",
            },
            minItems: 2,
            maxItems: 3,
        };

        expect(makeData(schema)).toEqual({
            valid: [
                [true, true],
                [false, true],
                [true, false],
                [true, true, true],
                [false, true, true],
                [true, false, true],
                [true, true, false]
            ],
            invalid: [
                [],
                [undefined, true],
                [null, true],
                [42, true],
                ['a', true],
                [{}, true],
                [true, undefined],
                [true, null],
                [true, 42],
                [true, 'a'],
                [true, {}],
                [undefined, true, true],
                [null, true, true],
                [42, true, true],
                ['a', true, true],
                [{}, true, true],
                [true, undefined, true],
                [true, null, true],
                [true, 42, true],
                [true, 'a', true],
                [true, {}, true],
                [true, true, undefined],
                [true, true, null],
                [true, true, 42],
                [true, true, 'a'],
                [true, true, {}],
                [true],
                [true, true, true, true],
                undefined,
                null,
                42,
                'a',
                true,
                {}
            ]
        });
    });

    test("tuple", () => {
        const schema = {
            type: "array",
            prefixItems: [
                {
                    type: "boolean",
                },
                {
                    type: "number",
                },
            ],
            minItems: 2,
            maxItems: 2,
        };

        expect(makeData(schema)).toEqual({
            valid: [
                [true, -1.7976931348623157e+308],
                [false, -1.7976931348623157e+308],
                [true, -100],
                [true, -10],
                [true, -1],
                [true, 0],
                [true, 1],
                [true, 10],
                [true, 100],
                [true, 1.7976931348623157e+308]
            ],
            invalid: [
                [],
                [undefined, -1.7976931348623157e+308],
                [null, -1.7976931348623157e+308],
                [42, -1.7976931348623157e+308],
                ['a', -1.7976931348623157e+308],
                [{}, -1.7976931348623157e+308],
                [true, undefined],
                [true, null],
                [true, NaN],
                [true, -Infinity],
                [true, Infinity],
                [true, 'a'],
                [true, true],
                [true, {}],
                [true],
                [true, -1.7976931348623157e+308, -1.7976931348623157e+308],
                undefined,
                null,
                42,
                'a',
                true,
                {}
            ]
        });  
    });      
});

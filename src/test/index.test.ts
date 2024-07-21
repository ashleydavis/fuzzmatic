import { generateData } from "..";

import { matchersWithOptions } from "jest-json-schema";
expect.extend(matchersWithOptions({
    verbose: true
}));

describe("generate data", () => {
    
    const nonSchemaValues = [
        NaN,
        -Infinity,
        Infinity,
    ]

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

            expect(validItem).toMatchSchema(schema);
        }

        for (const invalidItem of data.invalid) {
            if (nonSchemaValues.includes(invalidItem)) {
                // Don't test values that aren't valid against a JSON schema.
                continue;
            }

            expect(invalidItem).not.toMatchSchema(schema);
        }

        return data;
    }

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

    test("object with a both values required", () => {
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
            ],
            invalid: [
                [undefined],
                [null],
                [42],
                ['a'],
                [{}],
                undefined,
                null,
                42,
                'a',
                true,
                {},
            ],
        });
    });
});

import { generateData } from "..";

describe("generate data", () => {

    test("simple number", () => {
        const schema = {
            type: "number",
        };
        expect(generateData(schema)).toEqual({
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
        expect(generateData(schema)).toEqual({
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
        expect(generateData(schema)).toEqual({
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
        expect(generateData(schema)).toEqual({
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
        expect(generateData(schema)).toEqual({
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

    test("object", () => {
        const schema = {
            type: "object",
            properties: {
                height: {
                    type: "number",
                    minimum: 2,
                    maximum: 10,
                },
                age: {
                    type: "number",
                    minimum: 18,
                    maximum: 100,
                },
            },
        };
        expect(generateData(schema)).toEqual({
            valid: [
                { height: 2, age: 18 },
                { height: 10, age: 18 },
                { height: 2, age: 100 },
            ],
            invalid: [
                { height: 1, age: 18 },
                { height: 11, age: 18 },
                { height: -100, age: 18 },
                { height: -10, age: 18 },
                { height: -1, age: 18 },
                { height: 0, age: 18 },
                { height: 100, age: 18 },
                { height: undefined, age: 18 },
                { height: null, age: 18 },
                { height: NaN, age: 18 },
                { height: -Infinity, age: 18 },
                { height: Infinity, age: 18 },
                { height: 'a', age: 18 },
                { height: true, age: 18 },
                { height: {}, age: 18 },
                { height: 2, age: 17 },
                { height: 2, age: 101 },
                { height: 2, age: -100 },
                { height: 2, age: -10 },
                { height: 2, age: -1 },
                { height: 2, age: 0 },
                { height: 2, age: 1 },
                { height: 2, age: 10 },
                { height: 2, age: undefined },
                { height: 2, age: null },
                { height: 2, age: NaN },
                { height: 2, age: -Infinity },
                { height: 2, age: Infinity },
                { height: 2, age: 'a' },
                { height: 2, age: true },
                { height: 2, age: {} },
            ],
        });
    });
});

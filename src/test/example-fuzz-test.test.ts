import { generateData } from "..";
import { getTopStudents } from "./example-code";
import { expectMatchesSchema, expectNotMatchesSchema } from "./lib/schema";

describe("example fuzz test", () => {

    const studentSchema = {
        type: "object",
        additionalProperties: false,
        properties: {
            name: {
                type: "string",
            },
            grades: {
                type: "object",
                additionalProperties: {
                    type: "number",
                },
            },
        },
        required: [
            "name",
            "grades"
        ],
    };

    const studentArraySchema = {
        type: "array",
        items: studentSchema,
    };

    const schema = {
        type: "array",
        prefixItems: [
            studentArraySchema,
            { 
                type: "number",
            },
            {
                type: "array",
                items: { type: "string" },
            },
        ],
        minItems: 3,
        maxItems: 3,
    };

    const generatedInputs = generateData(schema);

    test.each(generatedInputs.valid)('VALID: getTopStudents %#', (students, minGrade, subjects) => {
        const result = getTopStudents(students, minGrade, subjects);
        expectMatchesSchema(result, studentArraySchema);
    });

    const invalidArgs = generatedInputs.invalid.filter(invalidArgs => Array.isArray(invalidArgs) && invalidArgs.length === 3);

    test.each(invalidArgs)('INVALID: getTopStudents %#', (students, minGrade, subjects) => {
        expect(getTopStudents(students, minGrade, subjects)).toEqual([]);
    });

});
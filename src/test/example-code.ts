export interface IStudent {
    name: string;
    grades: {
        [subject: string]: number;
    };
}

export function getTopStudents(students: IStudent[], minGrade: number, subjects: string[]): IStudent[] {
    if (!students || !Array.isArray(students)) { 
        return [];
    }

    return students
        .map(student => {
            const total = subjects.reduce((acc, subject) => acc + (student.grades[subject] || 0), 0);
            const average = total / subjects.length;
            return { student, average };
        })
        .filter(result => result.average >= minGrade)
        .map(student => student.student);
}

// // Example usage:
// const students = [
//     { name: "Alice", grades: { math: 90, science: 85, english: 88 } },
//     { name: "Bob", grades: { math: 70, science: 60, english: 65 } },
//     { name: "Charlie", grades: { math: 85, science: 95, english: 92 } },
// ];

// const minGrade = 80;
// const subjects = ["math", "science", "english"];

// console.log(getTopStudents(students, minGrade, subjects)); // ["Alice", "Charlie"]

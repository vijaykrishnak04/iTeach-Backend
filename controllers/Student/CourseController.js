import Course from "../../Models/CourseSchema.js";
import Student from "../../Models/StudentSchema.js";

export const getCourses = async (req, res, next) => {
    try {
        const studentId = req.params.id;

        const student = await Student.findById(studentId, 'courses');
        if (!student) {
            return res.status(404).json('Student not found');
        }

        const courses = await Course.find({
            _id: { $nin: student.courses },
            isHidden: false
        });

        if (!courses || courses.length === 0) {
            return res.status(204).json('No data found');
        }

        return res.status(200).json(courses);

    } catch (err) {
        console.log(err);
        return res.status(500).json('Internal server error');
    }
};


export const getPurchasedCourses = async (req, res, next) => {
    try {
        const studentId = req.params.id;


        const student = await Student.findById(studentId).populate({
            path: 'courses'
        });

        if (!student) {
            return res.status(404).json('Student not found');
        }

        const courses = student.courses;

        if (!courses || courses.length === 0) {
            return res.status(204).json('No data found');
        }

        return res.status(200).json(courses);

    } catch (err) {
        console.log(err);
        return res.status(500).json('Internal server error');
    }
};



export const getCourse = async (req, res, next) => {
    try {
        const id = req.params.id
        const course = await Course.findOne({ _id: id }, { isHidden: false });
        if (!course) {
            return res.status(204).json('no course data found');
        } else {
            return res.status(200).json(course);
        }

    } catch (err) {
        console.log(err);
        return res.status(500).json('internal server error');
    }
}

export const purchaseCourse = async (studentId, courseId) => {
    try {
        const [updatedStudent, course] = await Promise.all([
            Student.findOneAndUpdate(
                { _id: studentId },
                { $addToSet: { courses: courseId } },
                { new: true, runValidators: true }
            ),
            Course.findById(courseId)
        ]);

        if (!updatedStudent) {
            throw new Error('Student not found');
        }

        if (!course) {
            throw new Error('Course not found');
        }

        return course;

    } catch (err) {
        console.log(err);
        throw new Error('Internal server error');
    }
};





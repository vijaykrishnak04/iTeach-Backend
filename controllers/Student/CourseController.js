import Course from "../../Models/CourseSchema.js";

export const getCourses = async (req, res, next) => {
    try {
        const courses = await Course.find({ isHidden: false });
        if (!courses || courses.length === 0) {
            return res.status(409).json('no data found');
        } else {
            return res.status(200).json(courses);
        }

    } catch (err) {
        console.log(err);
        return res.status(500).json('internal server error');
    }
}

export const getCourse = async (req, res, next) => {
    try {
        const id = req.params.id
        const course = await Course.findOne({ _id: id }, { isHidden: false });
        if (!course) {
            return res.status(409).json('no course data found');
        } else {
            return res.status(200).json(course);
        }

    } catch (err) {
        console.log(err);
        return res.status(500).json('internal server error');
    }
}
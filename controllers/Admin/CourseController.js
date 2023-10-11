import Course from "../../Models/CourseSchema.js";
import path from 'path';
import xss from 'xss';
import validator from 'validator';
import Student from "../../Models/StudentSchema.js";
import { deleteFiles } from "../../config/cloudinary.js";

export const addCourse = async (req, res, next) => {
    try {
        let { courseTitle, courseDescription, lessons, coursePrice } = req.body;

        // Input sanitization and validation
        courseTitle = xss(courseTitle);
        courseDescription = xss(courseDescription);

        const parsedCoursePrice = parseFloat(coursePrice);

        if (isNaN(parsedCoursePrice)) {
            return res.status(400).json("Price should be a number");
        }

        if (!Array.isArray(lessons) || !lessons.every(lesson => typeof lesson === 'object')) {
            return res.status(400).json("Invalid lessons format");
        }

        // Sanitize each lesson
        lessons = lessons.map(lesson => {
            return {
                lessonTitle: xss(lesson.lessonTitle),
                lessonDescription: xss(lesson.lessonDescription),
                videoURL: xss(lesson.videoURL)
            };
        });

        if (!req.files || req.files.length === 0) {
            return res.status(400).json("No files provided");
        }

        // Extract thumbnail details from the first file
        const thumbnailFile = req.files[0];
        const sanitizedFilename = xss(thumbnailFile.filename);


        const thumbnail = {
            public_id: sanitizedFilename,
            url: thumbnailFile.path
        };


        for (let i = 1; i < req.files.length; i++) {

            if (lessons[i - 1]) {
                lessons[i - 1].pdfNotes = {
                    url: req.files[i].path,
                    public_id: xss(req.files[i].filename)
                };
            }
        }

        // Check if a course with the same title already exists
        const courseExist = await Course.findOne({ title: courseTitle });
        if (courseExist) {
            return res.status(409).json("Course with this title already exists");
        }

        // Create a new course object using the Course model
        const newCourse = new Course({
            title: courseTitle,
            description: courseDescription,
            price: coursePrice,
            thumbnail: thumbnail,
            lessons: lessons
        });

        // Save the new course record to the database
        const savedCourse = await newCourse.save();
        return res.status(200).json(savedCourse);

    } catch (err) {
        console.error(err);
        res.status(500).json("Internal server error");
    }
};



export const getAllCourses = async (req, res, next) => {
    try {
        // Retrieve all courses from the database
        const courses = await Course.find();

        if (!courses || courses.length === 0) {
            return res.status(404).json("No courses found");
        }

        res.status(200).json(courses);

    } catch (err) {
        console.error(err);
        res.status(500).json("Internal server error");
    }
};

export const hideCourse = async (req, res, next) => {
    try {
        const Id = req.params.id.trim();
        if (!validator.isMongoId(Id)) {
            return res.status(400).json("Invalid Id");
        }
        await Course.findByIdAndUpdate({ _id: Id }, { isHidden: true });
        const updatedCourseList = await Course.find();
        return res.status(200).json(updatedCourseList);
    } catch (err) {
        console.error(err);
        res.status(500).json("Internal server error");
    }
};

export const unhideCourse = async (req, res, next) => {
    try {
        const Id = req.params.id.trim();
        if (!validator.isMongoId(Id)) {
            return res.status(400).json("Invalid Id");
        }
        await Course.findByIdAndUpdate({ _id: Id }, { isHidden: false });
        const updatedCourseList = await Course.find();
        return res.status(200).json(updatedCourseList);
    } catch (err) {
        console.error(err);
        res.status(500).json("Internal server error");
    }
};

export const deleteCourse = async (req, res, next) => {
    try {
        const Id = req.params.id.trim();
        if (!validator.isMongoId(Id)) {
            return res.status(400).json("Invalid Id");
        }
        // First, find the course to get the public IDs of the files
        const courseToDelete = await Course.findById({ _id: Id });
        if (!courseToDelete) {
            return res.status(404).json("Course not found");
        }

        // Extract the public IDs
        const publicIds = [courseToDelete.thumbnail.public_id, ...courseToDelete.lessons.map(lesson => lesson.pdfNotes.public_id)];

        // Call your deleteFiles function (which you will need to define) with the array of public IDs
        console.log(publicIds);
        await deleteFiles(publicIds);
        await Student.updateMany(
            { 'courses': Id },
            { '$pull': { 'courses': Id } }
        );

        // Then delete the course from the database
        await Course.findByIdAndDelete({ _id: Id });
        const updatedCourseList = await Course.find();
        return res.status(200).json(updatedCourseList);
    } catch (err) {
        console.error(err);
        res.status(500).json("Internal server error");
    }
};



export const editCourse = async (req, res, next) => {
    try {
        let { courseTitle, courseDescription, coursePrice, lessons } = req.body;
        // Sanitization and Validation
        if (courseTitle) courseTitle = xss(courseTitle);
        if (coursePrice) coursePrice = xss(coursePrice);
        if (courseDescription) courseDescription = xss(courseDescription);
        if (lessons) {
            lessons = lessons.map(lesson => {
                return {
                    lessonTitle: xss(lesson.lessonTitle),
                    lessonDescription: xss(lesson.lessonDescription),
                    videoURL: xss(lesson.videoURL)
                };
            });
        }


        const courseId = req.params.id;
        if (!validator.isMongoId(courseId)) {
            return res.status(400).json("Invalid Id");
        }

        let updateFields = {};

        if (courseTitle) updateFields.title = courseTitle;
        if (coursePrice) updateFields.price = coursePrice;
        if (courseDescription) updateFields.description = courseDescription;
        if (lessons) updateFields.lessons = lessons;

        if (req.files && req.files.length > 0) {
            const thumbnailFile = req.files[0];
            const sanitizedFilename = xss(thumbnailFile.filename);

            updateFields.thumbnail = {
                public_id: sanitizedFilename,
                url: thumbnailFile.path
            };
        }

        // Use findOneAndUpdate to get the updated document back
        const updatedCourse = await Course.findOneAndUpdate(
            { _id: courseId },
            { $set: updateFields },
            { new: true }
        );

        if (!updatedCourse) {
            return res.status(404).json("No course was updated, possibly because the course was not found.");
        }

        res.status(200).json(updatedCourse);  // Return the updated course data

    } catch (err) {
        console.error(err);
        res.status(500).json("Internal server error");
    }
};

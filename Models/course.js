import mongoose from "mongoose";

// Lesson schema
const lessonSchema = new mongoose.Schema({
    lessonTitle: {
        type: String,
        required: true,
        trim: true
    },
    videoURL: {
        type: String,
        required: true
    },
    lessonDescription: {
        type: String,
        trim: true
    },
    pdfNotes: {
        type: Buffer // storing the actual PDF file in the database. Alternatively, you could store a link to where the PDF is hosted.
    }
});

// Course schema
const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    thumbnail: {
        public_id: {
            type: String,
            required: true
          },
          url: {
            type: String,
            required: true
          },
    },
    isHidden: {
        type: Boolean,
        default: false,
    },
    lessons: [lessonSchema] // Embedded sub-document
});

const Course = mongoose.model('Course', courseSchema);

export default Course;

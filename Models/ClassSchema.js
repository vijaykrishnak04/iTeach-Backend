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
        public_id: {
            type: String,

        },
        url: {
            type: String,
        },
    }
});

// Chapter schema
const chapterSchema = new mongoose.Schema({
    chapterTitle: {
        type: String,
        required: true,
        trim: true,
        uppercase: true,
    },
    lessons: [lessonSchema] // Embed lessons inside chapter
});

// Subject schema
const subjectSchema = new mongoose.Schema({
    subjectName: {
        type: String,
        required: true,
        trim: true,
        uppercase: true,

    },
    chapters: [chapterSchema] // Embed chapters inside subject
});

const classSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        uppercase: true
    },

    subjects: [subjectSchema],  // Embed subjects inside class

    price: {
        type: Number,
        required: true,
        min: [1, 'Price should be greater than 0']  // Ensuring price is positive and greater than zero.
    },
    description: {
        type: String,
        required: true
    },
    thumbnail: {
        public_id: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        }
    },
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    }],
    exams: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exam'
    }],
    schedules: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Schedule'
    }]
});


const Class = mongoose.model('Class', classSchema);

export default Class;

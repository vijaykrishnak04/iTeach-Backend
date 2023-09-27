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
            required: true
        },
        url: {
            type: String,
            required: true
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
        uppercase: true
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


// Compound Index for ensuring unique subject names within a class
classSchema.index({ 'name': 1, 'subjects.subjectName': 1 }, { unique: true });
// Compound Index for ensuring unique lesson titles within a chapter
chapterSchema.index({ 'chapterTitle': 1, 'lessons.lessonTitle': 1 }, { unique: true });
// Ensure unique chapter titles within a subject
subjectSchema.index({ 'subjectName': 1, 'chapters.chapterTitle': 1 }, { unique: true });


const Class = mongoose.model('Class', classSchema);

export default Class;

import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
        trim: true
    },
    image: {
        public_id: {
            type: String,
        },
        url: {
            type: String,
        },
    },
    answers: [{
        type: String,
        required: true,
        trim: true
    }],
    correctAnswer: {
        type: Number,
        required: true,
        validate: {
            validator: Number.isInteger,
            message: '{VALUE} is not an integer value'
        }
    }
});

const examSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    duration: {
        type: Number,
        required: true,
        min: 1
    },
    date: {
        type: Date,
        required: true
    },
    class: {
        classId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Class'
        },
        className: {
            type: String,
            required: true
        },
        subjectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Class'
        },
        subjectName: {
            type: String,
            required: true
        },
    },
    questions: [questionSchema]  // Embed the questions directly into the exam document.
});

const Exam = mongoose.model('Exam', examSchema);

export default Exam;

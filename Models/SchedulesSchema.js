import mongoose from "mongoose";

const ScheduleSchema = new mongoose.Schema({
    class: {
        classId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Class',
            required:true
        },
        className: {
            type: String,
            required: true
        },
        subjectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Class',
            required: true
        },
        subjectName: {
            type: String,
            required: true
        },
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        reuired: true
    },
    Link: {
        type: String,
    },
    time: {
        type: Date,
    },
    type: {
        type: String,
    }
})

const Schedule = mongoose.model('Schedule', ScheduleSchema)

export default Schedule;
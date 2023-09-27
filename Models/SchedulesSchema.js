import mongoose from "mongoose";

const ScheduleSchema = new mongoose.Schema({
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
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        reuired: true
    },
    time: {
        type: Date,
        required: true
    },
    type: {
        type: String,
        required: true
    }
})

const Schedule = mongoose.model('Schedule', ScheduleSchema)

export default Schedule;
import Class from "../../Models/ClassSchema.js";
import Schedule from "../../Models/SchedulesSchema.js";
import validator from 'validator';
import xss from 'xss';

export const getSchedules = async (req, res, next) => {
    try {
        const schedules = await Schedule.find()
        if (!schedules) {
            return res.status(404).json("No schedules found")
        } else {
            return res.status(200).json(schedules)
        }
    } catch (err) {
        console.log(err);
        return res.status(500).json('Internal server error');
    }
}

export const addSchedule = async (req, res, next) => {
    try {
        let { title, description, time, classType, selectedClassAndSubject, link } = req.body;

        // Input Validation
        if (validator.isEmpty(title) || validator.isEmpty(description) || validator.isEmpty(time) ||
            validator.isEmpty(classType) || !selectedClassAndSubject || validator.isEmpty(link)) {
            return res.status(400).json("All fields are required");
        }

        // Prevent XSS attacks by sanitizing inputs
        title = xss(title);
        description = xss(description);
        time = xss(time);
        classType = xss(classType);
        link = xss(link);

        // Create and Save Schedule, and also update the Class in one atomic operation
        const newSchedule = new Schedule({
            title, description, time, type: classType, Link: link, class: selectedClassAndSubject
        });

        const savedSchedule = await newSchedule.save();

        const updatedClass = await Class.findByIdAndUpdate(
            selectedClassAndSubject.classId,
            { $addToSet: { schedules: savedSchedule._id } }, // $addToSet will only add if it doesn't already exist
            { new: true, useFindAndModify: false, upsert: true }
        );

        if (!updatedClass) {
            return res.status(404).json("Class not found or failed to update");
        }

        return res.status(200).json(savedSchedule);

    } catch (err) {
        console.log(err);
        return res.status(500).json('Internal server error');
    }
};


export const deleteSchedule = async (req, res, next) => {
    try {
        const id = req.params.id;

        // 1. Find the schedule that needs to be deleted.
        const scheduleToDelete = await Schedule.findById(id);

        // If the schedule is not found, send a response and exit.
        if (!scheduleToDelete) {
            return res.status(404).json("Schedule not found");
        }

        // 2. Remove the schedule's ID from the `schedules` array in the related class.
        if (scheduleToDelete.class && scheduleToDelete.class.classId) {
            await Class.findByIdAndUpdate(
                scheduleToDelete.class.classId,
                { $pull: { schedules: id } },
                { new: true, useFindAndModify: false }
            );
        }

        // 3. Delete the actual schedule.
        await Schedule.findByIdAndDelete(id);

        return res.status(200).json(id);

    } catch (err) {
        console.log(err);
        return res.status(500).json('Internal server error');
    }
};


export const getTodaySchedule = async (req, res, next) => {
    try {
        // 1. Getting today's date
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

        // 2. Querying the database
        const todaySchedules = await Schedule.find({
            time: {
                $gte: startOfDay,
                $lt: endOfDay
            }
        }).sort({ time: 1 });  // Sorting in ascending order based on time

        return res.status(200).json(todaySchedules);
    } catch (err) {

    }

};
import Class from "../../Models/ClassSchema.js";
import Schedule from "../../Models/SchedulesSchema.js";

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
        const { title, description, time, classType, selectedClassAndSubject } = req.body;

        // Check if an schedule with the same title already exists
        const scheduleExist = await Schedule.findOne({ title: title });
        if (scheduleExist) {
            return res.status(409).json("Schedule with this title already exists");
        }

        // Create a new schedule object using the schedule model
        const newSchedule = new Schedule({
            title: title,
            description: description,
            time: time,
            type: classType,
            class: selectedClassAndSubject
        });

        // Save the new exam record to the database
        const savedSchedule = await newSchedule.save();

        // Update the Class collection by appending the new exam's ID to the selectedClass's exams array
        await Class.findByIdAndUpdate(
            selectedClassAndSubject.classId,
            { $push: { schedules: savedSchedule._id } },
            { new: true, useFindAndModify: false }
        );

        return res.status(200).json(savedSchedule)

    } catch (err) {
        console.log(err);
        return res.status(500).json('Internal server error');
    }
}

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
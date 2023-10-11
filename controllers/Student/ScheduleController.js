import mongoose from "mongoose";
import Schedule from "../../Models/SchedulesSchema.js";
import Class from "../../Models/ClassSchema.js";

export const getSchedules = async (req, res, next) => {
    try {
        const id = req.query.id;
        const schedules = await Class.findById(id, 'schedules').populate('schedules');

        console.log(schedules);  // Keeping it for debug purposes

        if (!schedules) {
            return res.status(404).json('No schedules found for the provided ID.');
        }

        if (schedules.schedules.length === 0) {
            return res.status(404).json('No schedules data found for the provided IDs.');
        } else {
            return res.status(200).json(schedules.schedules);
        }
    } catch (err) {
        console.error(err);
        res.status(500).json("Internal server error");
    }
}


export const getTodaySchedules = async (req, res, next) => {
    try {
        const id = req.params.id;

        // Create new Date objects for today and tomorrow
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        // Find the class and populate its schedules
        const classObj = await Class.findById(id).populate({
            path: 'schedules',
            match: {
                time: {
                    $gte: today,
                    $lt: tomorrow
                }
            }
        });

        if (!classObj) {
            return res.status(404).json('No class found for the provided ID.');
        }


        // Extract today's schedules
        const todaySchedules = classObj.schedules;

        if (todaySchedules.length === 0) {
            return res.status(404).json('No schedules found for today.');
        } else {
            return res.status(200).json(todaySchedules);
        }

    } catch (err) {
        console.error(err);
        res.status(500).json("Internal server error");
    }
};

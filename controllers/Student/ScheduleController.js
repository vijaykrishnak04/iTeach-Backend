import mongoose from "mongoose";
import Schedule from "../../Models/SchedulesSchema.js";

export const getSchedules = async (req, res, next) => {
    try {
        const ids = req.query.ids.split(',').map(id => new mongoose.Types.ObjectId(id));
        const schedules = await Schedule.find({
            _id: { $in: ids }
        });
        if (schedules.length === 0) {
            return res.status(409).json('No exams data found for the provided IDs.');
        } else {
            return res.status(200).json(schedules);
        }
    } catch (err) {
        console.error(err);
        res.status(500).json("Internal server error");
    }
}

export const getTodaySchedules = async (req, res, next) => {
    try {
        const ids = req.query.ids.split(',').map(id => new mongoose.Types.ObjectId(id));
        // Create new Date object for today's date
        const today = new Date();
        // Set the hours, minutes, seconds, and milliseconds to zero
        today.setHours(0, 0, 0, 0);

        // Create new Date object for tomorrow's date by adding one day to today
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        // Query MongoDB to find all schedules for today
        const schedules = await Schedule.find({
            _id: { $in: ids },
            date: {
                $gte: today,
                $lt: tomorrow
            }
        });

        if (schedules.length === 0) {
            return res.status(409).json('No schedules found for today.');
        } else {
            return res.status(200).json(schedules);
        }
    } catch (err) {
        console.error(err);
        res.status(500).json("Internal server error");
    }
};
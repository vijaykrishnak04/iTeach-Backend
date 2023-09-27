import Class from "../../Models/ClassSchema.js";
import Student from "../../Models/StudentSchema.js";

export const getClasses = async (req, res, next) => {
    try {
        const classes = await Class.find();
        if (!classes || classes.length === 0) {
            return res.status(409).json('no data found');
        } else {
            return res.status(200).json(classes);
        }
    } catch (err) {
        console.log(err);
        return res.status(500).json('internal server error');
    }
}

export const addOrChangeClass = (studentId, classId, res) => {
    // First, fetch the student to get the prevClassId from classRef
    Student.findById(studentId)
        .then(student => {
            if (!student) {
                return res.status(404).json({ success: false, message: 'Student not found' });
            }

            const prevClassId = student.classRef;

            // If there's a previous class, remove the student from that class
            if (prevClassId) {
                Class.findByIdAndUpdate(prevClassId, { $pull: { students: studentId } }, { new: true })
                    .then(updatedPrevClass => {
                        if (!updatedPrevClass) {
                            return res.status(404).json({ success: false, message: 'Previous class not found' });
                        }
                        // Continue with the rest of the logic
                        proceedWithAddingToNewClass(studentId, classId, res);
                    })
                    .catch(err => {
                        return res.status(500).json({ success: false, message: err.message });
                    });
            } else {
                // If no prevClassId, directly proceed to add the student to the new class
                proceedWithAddingToNewClass(studentId, classId, res);
            }
        })
        .catch(err => {
            return res.status(500).json({ success: false, message: err.message });
        });
}

export const proceedWithAddingToNewClass = (studentId, classId, res) => {
    Student.findByIdAndUpdate(studentId, { classRef: classId, exam: [] }, { new: true })
        .then(updatedStudent => {
            if (!updatedStudent) {
                return res.status(404).json({ success: false, message: 'Student not found' });
            }

            // Now update the Class with the studentId
            return Class.findByIdAndUpdate(classId, { $push: { students: studentId } }, { new: true })
                .then(updatedClass => {
                    if (!updatedClass) {
                        return res.status(404).json({ success: false, message: 'Class not found' });
                    }
                    return res.json({ success: true, updatedStudent });
                });
        })
        .catch(err => {
            return res.status(500).json({ success: false, message: err.message });
        });
}

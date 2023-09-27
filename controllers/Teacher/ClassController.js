import Class from "../../Models/ClassSchema.js";

//class, subjects manage

export const getClasses = async (req, res, next) => {
    try {
      const classes = await Class.find();
  
      if (classes.length === 0) {
        return res.status(404).send('No classes found');
      }
  
      res.status(200).json(classes);
    } catch (err) {
      console.log(err);
      res.status(500).send('An unexpected error occurred');
    }
  };
  
  export const getClassById = async (req, res, next) => {
    try {
      const id = req.params.id
      const classData = await Class.findOne({ _id: id }, { isHidden: false });
      if (!classData) {
        return res.status(409).json('no data found');
      } else {
        return res.status(200).json(classData);
      }
  
    } catch (err) {
      console.log(err);
      return res.status(500).json('internal server error');
    }
  }
  
  export const addChapter = async (req, res, next) => {
    try {
      const { classId, subjectId, chapter } = req.body;
  
      console.log(req.files);
      // Iterate through the lessons and add the pdfNotes property
      chapter.lessons = chapter.lessons.map((lesson, index) => {
        // Check if the file exists for the lesson
        if (req.files[index]) {
          lesson.pdfNotes = {
            url: req.files[index].path,
            public_id: req.files[index].filename
          };
        }
        return lesson;
      });
  
      // The `$` positional operator will target the matched subject from the array filters
      const updatedSyllabus = await Class.findOneAndUpdate(
        { _id: classId },
        { $push: { "subjects.$[subject].chapters": chapter } },
        {
          new: true,
          arrayFilters: [{ "subject._id": subjectId }],
          upsert: false,
        }
      );
  
      if (!updatedSyllabus) {
        return res.status(404).json('Syllabus not found');
      } else {
        return res.status(200).json(updatedSyllabus);
      }
  
    } catch (err) {
      console.log(err);
      return res.status(500).json('Internal server error');
    }
  }
  
  
  export const editChapter = async (req, res, next) => {
    try {
      const { classId, subjectId, chapterId, updatedChapter } = req.body;
  
      console.log(req.files);
  
      const existingSyllabus = await Class.findOne({ _id: classId });
      const existingSubject = existingSyllabus.subjects.find(subj => subj._id.toString() === subjectId);
      const existingChapter = existingSubject.chapters.find(chap => chap._id.toString() === chapterId);
  
      // Merge lessons from the existing chapter with the updated ones
      if (req.files) {
        updatedChapter.lessons = updatedChapter.lessons.map((lesson, index) => {
          const existingLesson = existingChapter.lessons.find(l => l._id.toString() === lesson._id);
  
          if (req.files[index]) {
            // If there's an update for the lesson's file, modify the pdf notes
            lesson.pdfNotes = {
              url: req.files[index].path,
              public_id: req.files[index].filename
            };
          } else if (existingLesson) {
            // Retain the old pdf notes if no update is provided
            lesson.pdfNotes = existingLesson.pdfNotes;
          }
  
          return lesson;
        });
      }
  
  
      const updatedSyllabus = await Class.findOneAndUpdate(
        { _id: classId, "subjects._id": subjectId },
        {
          $set: { "subjects.$[subj].chapters.$[chap]": updatedChapter }
        },
        {
          new: true,
          arrayFilters: [{ "subj._id": subjectId }, { "chap._id": chapterId }],
          upsert: false,
        }
      );
  
      if (!updatedSyllabus) {
        return res.status(404).json('Syllabus or Chapter not found');
      } else {
        return res.status(200).json(updatedSyllabus);
      }
  
    } catch (err) {
      console.log(err);
      return res.status(500).json('Internal server error');
    }
  }
  
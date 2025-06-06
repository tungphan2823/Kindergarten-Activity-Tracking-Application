var mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  childId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Children",
    required: true,
  },
  date: { type: Date, required: true },
  arrivalTime: { type: Date, required: true },
  departureTime: { type: Date },
  caretakerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  monthHours: { type: Number, required: true },
  takenHours: { type: Number, default: 0 },
  cumulativeTakenHours: { type: Number, default: 0 },
});

attendanceSchema.pre("save", async function (next) {
  const currentDate = new Date(this.date);
  
  
  const dayOfWeek = currentDate.getDay(); 
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - dayOfWeek); 
  startOfWeek.setHours(0, 0, 0, 0); 

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); 
  endOfWeek.setHours(23, 59, 59, 999); 

  
  const latestAttendance = await this.constructor
    .findOne({
      childId: this.childId,
      date: {
        $gte: startOfWeek,
        $lte: endOfWeek,
        $ne: this.date, 
      },
      _id: { $ne: this._id }, 
    })
    .sort({ date: -1, _id: -1 });

  if (this.arrivalTime && this.departureTime) {
    
    const diffInMilliseconds =
      new Date(this.departureTime).getTime() -
      new Date(this.arrivalTime).getTime();
    this.takenHours = Number(
      (diffInMilliseconds / (1000 * 60 * 60)).toFixed(2)
    );

    
    this.cumulativeTakenHours = latestAttendance
      ? latestAttendance.cumulativeTakenHours + this.takenHours
      : this.takenHours;
  } else {
    
    this.cumulativeTakenHours = latestAttendance
      ? latestAttendance.cumulativeTakenHours
      : 0;
  }
  
  next();
});

export default mongoose.model("Attendances", attendanceSchema);
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../components/api";
import { RootState } from "../index";


interface Attendance {
  _id: string;
  childId: {
    _id: string;
    firstName: string;
    lastName: string;
    groupId: string;
    parentId: string;
  };
  date: string;
  arrivalTime: string;
  departureTime?: string;
  caretakerId: {
    _id: string;
    username: string;
  };
  monthHours: number;
  takenHours: number;
  cumulativeTakenHours: number;
}


interface AttendanceState {
  attendances: Attendance[];
  loading: boolean;
  error: string | null;
}

const initialState: AttendanceState = {
  attendances: [],
  loading: false,
  error: null,
};


export const fetchAttendances = createAsyncThunk(
  "attendance/fetchAttendances",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/attendances");
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      } else {
        return rejectWithValue("An unknown error occurred");
      }
    }
  }
);


export const createAttendance = createAsyncThunk(
  "attendance/createAttendance",
  async (
    attendanceData: Partial<Attendance>,
    { rejectWithValue, dispatch }
  ) => {
    try {
     
      if (!attendanceData.monthHours) {
        return rejectWithValue("Month hours is required");
      }
      
      const response = await api.post("/attendances", attendanceData);
      dispatch(fetchAttendances());
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      } else {
        return rejectWithValue("An unknown error occurred");
      }
    }
  }
);

export const updateAttendance = createAsyncThunk(
  "attendance/updateAttendance",
  async (
    { id, updatedData }: { id: string; updatedData: Partial<Attendance> },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const response = await api.put(`/attendances/${id}`, updatedData);
      dispatch(fetchAttendances());
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      } else {
        return rejectWithValue("An unknown error occurred");
      }
    }
  }
);

const attendanceSlice = createSlice({
  name: "attendance",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAttendances.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAttendances.fulfilled, (state, action) => {
        state.loading = false;
        state.attendances = action.payload;
      })
      .addCase(fetchAttendances.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAttendance.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAttendance.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});


export default attendanceSlice.reducer;


export const selectAttendances = (state: RootState) =>
  state.attendance.attendances;
export const selectLoading = (state: RootState) => state.attendance.loading;
export const selectError = (state: RootState) => state.attendance.error;

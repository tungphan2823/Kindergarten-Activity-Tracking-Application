import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "../index";
import api from "../../components/api"; 


interface Group {
  _id: string;
  name: string;
  description: string;
  slug: string;
  caretakerId: {
    _id: string;
    firstName: string;
    lastName: string;
  };
}


interface NewGroup {
  name: string;
  description: string;
  caretakerId: string; 
}


interface GroupsState {
  groups: Group[];
  loading: boolean;
  error: string | null;
}

const initialState: GroupsState = {
  groups: [],
  loading: false,
  error: null,
};


export const fetchGroups = createAsyncThunk(
  "groups/fetchGroups",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/groups");
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


export const createGroup = createAsyncThunk(
  "groups/createGroup",
  async (newGroupData: NewGroup, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.post("/groups", newGroupData);

      
      dispatch(fetchGroups());

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


export const editGroup = createAsyncThunk(
  "groups/editGroup",
  async (
    { id, updatedData }: { id: string; updatedData: NewGroup },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const response = await api.put(`/groups/${id}`, updatedData); 

      
      dispatch(fetchGroups());

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

const groupsSlice = createSlice({
  name: "groups",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      
      .addCase(fetchGroups.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGroups.fulfilled, (state, action) => {
        state.loading = false;
        state.groups = action.payload; 
      })
      .addCase(fetchGroups.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string; 
      })

      
      .addCase(createGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createGroup.fulfilled, (state) => {
        state.loading = false;
        
        
        
      })
      .addCase(createGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string; 
      })

      
      .addCase(editGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editGroup.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.groups.findIndex(
          (group) => group._id === action.payload._id
        );
        if (index !== -1) {
          state.groups[index] = action.payload;
        }
      })
      .addCase(editGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string; 
      });
  },
});


export default groupsSlice.reducer;


export const selectGroups = (state: RootState) => state.groups.groups;
export const selectLoading = (state: RootState) => state.groups.loading;
export const selectError = (state: RootState) => state.groups.error;

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "../index"; // Assuming you have a RootState defined in your store
import api from "../../components/api"; // Assuming you have an API instance like Axios

// Interface for Group
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

// Interface for creating or editing a group
interface NewGroup {
  name: string;
  description: string;
  caretakerId: string; // Only ID is passed
}

// Define the initial state using that type
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

// Thunk for fetching groups data
export const fetchGroups = createAsyncThunk(
  "groups/fetchGroups",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/groups"); // Use api instance to make a GET request
      return response.data; // Return fetched groups data
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message); // Access message if it's an Error object
      } else {
        return rejectWithValue("An unknown error occurred"); // Handle non-Error objects
      }
    }
  }
);

// Thunk for creating a new group
export const createGroup = createAsyncThunk(
  "groups/createGroup",
  async (newGroupData: NewGroup, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.post("/groups", newGroupData); // Use api instance to make a POST request

      // After successful creation, refetch the updated list of groups
      dispatch(fetchGroups());

      return response.data; // Return newly created group data
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message); // Access message if it's an Error object
      } else {
        return rejectWithValue("An unknown error occurred"); // Handle non-Error objects
      }
    }
  }
);

// Thunk for editing an existing group (PUT request)
export const editGroup = createAsyncThunk(
  "groups/editGroup",
  async (
    { id, updatedData }: { id: string; updatedData: NewGroup },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const response = await api.put(`/groups/${id}`, updatedData); // Use api instance to make a PUT request

      // After successful edit, refetch the updated list of groups
      dispatch(fetchGroups());

      return response.data; // Return updated group data
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message); // Access message if it's an Error object
      } else {
        return rejectWithValue("An unknown error occurred"); // Handle non-Error objects
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
      // Fetch Groups Cases
      .addCase(fetchGroups.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGroups.fulfilled, (state, action) => {
        state.loading = false;
        state.groups = action.payload; // Set fetched data to state
      })
      .addCase(fetchGroups.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string; // Set error message to state
      })

      // Create Group Cases
      .addCase(createGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createGroup.fulfilled, (state) => {
        state.loading = false;
        // Optionally add the newly created group directly to the state:
        // state.groups.push(action.payload);
        // However, we are refetching the entire list in this case.
      })
      .addCase(createGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string; // Set error message to state
      })

      // Edit Group Cases (PUT request)
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
        state.error = action.payload as string; // Set error message to state
      });
  },
});

// Export the reducer to be used in the store
export default groupsSlice.reducer;

// Selector to get groups state from the store
export const selectGroups = (state: RootState) => state.groups.groups;
export const selectLoading = (state: RootState) => state.groups.loading;
export const selectError = (state: RootState) => state.groups.error;

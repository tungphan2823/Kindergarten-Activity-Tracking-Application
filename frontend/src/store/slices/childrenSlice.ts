// src/features/children/childrenSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "../index";
import api from "../../components/api";

// Interface for Child
interface Child {
  _id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  parentId: {
    _id: string;
    username: string;
  };
  groupId: {
    _id: string;
    name: string;
    caretakerId: string;
  };
  gender: string;
  monthlyTime: number;
}

// Interface for creating or editing a child (only passing parentId and groupId as strings)
interface NewChild {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  parentId: string; // Only ID is passed
  groupId: string; // Only ID is passed
  gender: string;
  monthlyTime?: number;
}

// Define the initial state using that type
interface ChildrenState {
  children: Child[];
  loading: boolean;
  error: string | null;
}

const initialState: ChildrenState = {
  children: [],
  loading: false,
  error: null,
};

// Thunk for fetching children data
export const fetchChildren = createAsyncThunk(
  "children/fetchChildren",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/children"); // Use api instance to make a GET request
      return response.data; // Return fetched children data
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message); // Access message if it's an Error object
      } else {
        return rejectWithValue("An unknown error occurred"); // Handle non-Error objects
      }
    }
  }
);

// Thunk for creating a new child
export const createChild = createAsyncThunk(
  "children/createChild",
  async (newChildData: NewChild, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.post("/children", newChildData); // Use api instance to make a POST request

      // After successful creation, refetch the updated list of children
      dispatch(fetchChildren());

      return response.data; // Return newly created child data
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message); // Access message if it's an Error object
      } else {
        return rejectWithValue("An unknown error occurred"); // Handle non-Error objects
      }
    }
  }
);

// Thunk for editing an existing child (PUT request)
export const editChild = createAsyncThunk(
  "children/editChild",
  async (
    { id, updatedData }: { id: string; updatedData: NewChild },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const response = await api.put(`/children/${id}`, updatedData); // Use api instance to make a PUT request

      // After successful edit, refetch the updated list of children
      dispatch(fetchChildren());

      return response.data; // Return updated child data
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message); // Access message if it's an Error object
      } else {
        return rejectWithValue("An unknown error occurred"); // Handle non-Error objects
      }
    }
  }
);

const childrenSlice = createSlice({
  name: "children",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Children Cases
      .addCase(fetchChildren.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChildren.fulfilled, (state, action) => {
        state.loading = false;
        state.children = action.payload; // Set fetched data to state
      })
      .addCase(fetchChildren.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string; // Set error message to state
      })

      // Create Child Cases
      .addCase(createChild.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // @ts-expect-error
      .addCase(createChild.fulfilled, (state, action) => {
        state.loading = false;
        // Optionally, you could add the newly created child directly to the state:
        // state.children.push(action.payload);
        // However, we are refetching the entire list in this case.
      })
      .addCase(createChild.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string; // Set error message to state
      })

      // Edit Child Cases (PUT request)
      .addCase(editChild.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editChild.fulfilled, (state, action) => {
        state.loading = false;
        // Optionally update the specific child in the local state without refetching all children:
        const index = state.children.findIndex(
          (child) => child._id === action.payload._id
        );
        if (index !== -1) {
          state.children[index] = action.payload;
        }
      })
      .addCase(editChild.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string; // Set error message to state
      });
  },
});

// Export the reducer to be used in the store
export default childrenSlice.reducer;

// Selector to get children state
export const selectChildren = (state: RootState) => state.children.children;
export const selectLoading = (state: RootState) => state.children.loading;
export const selectError = (state: RootState) => state.children.error;

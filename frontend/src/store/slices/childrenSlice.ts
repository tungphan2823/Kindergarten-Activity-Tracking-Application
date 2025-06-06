
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "../index";
import api from "../../components/api";


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


interface NewChild {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  parentId: string; 
  groupId: string; 
  gender: string;
  monthlyTime?: number;
}


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


export const fetchChildren = createAsyncThunk(
  "children/fetchChildren",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/children"); 
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


export const createChild = createAsyncThunk(
  "children/createChild",
  async (newChildData: NewChild, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.post("/children", newChildData); 

      
      dispatch(fetchChildren());

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


export const editChild = createAsyncThunk(
  "children/editChild",
  async (
    { id, updatedData }: { id: string; updatedData: NewChild },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const response = await api.put(`/children/${id}`, updatedData); 

      
      dispatch(fetchChildren());

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

const childrenSlice = createSlice({
  name: "children",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      
      .addCase(fetchChildren.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChildren.fulfilled, (state, action) => {
        state.loading = false;
        state.children = action.payload; 
      })
      .addCase(fetchChildren.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string; 
      })

      
      .addCase(createChild.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      
      .addCase(createChild.fulfilled, (state, action) => {
        state.loading = false;
        
        
        
      })
      .addCase(createChild.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string; 
      })

      
      .addCase(editChild.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editChild.fulfilled, (state, action) => {
        state.loading = false;
        
        const index = state.children.findIndex(
          (child) => child._id === action.payload._id
        );
        if (index !== -1) {
          state.children[index] = action.payload;
        }
      })
      .addCase(editChild.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string; 
      });
  },
});


export default childrenSlice.reducer;


export const selectChildren = (state: RootState) => state.children.children;
export const selectLoading = (state: RootState) => state.children.loading;
export const selectError = (state: RootState) => state.children.error;

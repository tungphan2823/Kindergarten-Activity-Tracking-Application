import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "../index";
import api from "../../components/api";

interface AdditionalParent {
  _id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  phoneNumber: string;
  address: string;
  email: string;
  childId: string;
}

interface NewAdditionalParent {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  phoneNumber: string;
  address: string;
  email: string;
  childId: string;
}

interface AdditionalParentsState {
  additionalParents: AdditionalParent[];
  loading: boolean;
  error: string | null;
}

const initialState: AdditionalParentsState = {
  additionalParents: [],
  loading: false,
  error: null,
};

export const fetchAdditionalParents = createAsyncThunk(
  "additionalParents/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/additionParent");
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("An unknown error occurred");
    }
  }
);

export const createAdditionalParent = createAsyncThunk(
  "additionalParents/create",
  async (parentData: NewAdditionalParent, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.post("/additionParent", parentData);
      dispatch(fetchAdditionalParents());
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("An unknown error occurred");
    }
  }
);

export const fetchAdditionalParentById = createAsyncThunk(
  "additionalParents/fetchById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/additionParent/${id}`);
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("An unknown error occurred");
    }
  }
);

export const editAdditionalParent = createAsyncThunk(
  "additionalParents/edit",
  async (
    { id, parentData }: { id: string; parentData: Partial<AdditionalParent> },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const response = await api.put(`/additionParent/${id}`, parentData);
      dispatch(fetchAdditionalParents());
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("An unknown error occurred");
    }
  }
);

export const deleteAdditionalParent = createAsyncThunk(
  "additionalParents/delete",
  async (id: string, { rejectWithValue, dispatch }) => {
    try {
      await api.delete(`/additionParent/${id}`);
      dispatch(fetchAdditionalParents());
      return id;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("An unknown error occurred");
    }
  }
);

const additionalParentsSlice = createSlice({
  name: "additionalParents",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      
      .addCase(fetchAdditionalParents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdditionalParents.fulfilled, (state, action) => {
        state.loading = false;
        state.additionalParents = action.payload;
      })
      .addCase(fetchAdditionalParents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      
      .addCase(createAdditionalParent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAdditionalParent.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createAdditionalParent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      
      .addCase(fetchAdditionalParentById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdditionalParentById.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.additionalParents.findIndex(
          (parent) => parent._id === action.payload._id
        );
        if (index === -1) {
          state.additionalParents.push(action.payload);
        } else {
          state.additionalParents[index] = action.payload;
        }
      })
      .addCase(fetchAdditionalParentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      
      .addCase(editAdditionalParent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editAdditionalParent.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.additionalParents.findIndex(
          (parent) => parent._id === action.payload._id
        );
        if (index !== -1) {
          state.additionalParents[index] = action.payload;
        }
      })
      .addCase(editAdditionalParent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      
      .addCase(deleteAdditionalParent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAdditionalParent.fulfilled, (state, action) => {
        state.loading = false;
        state.additionalParents = state.additionalParents.filter(
          (parent) => parent._id !== action.payload
        );
      })
      .addCase(deleteAdditionalParent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default additionalParentsSlice.reducer;


export const selectAdditionalParents = (state: RootState) => 
  state.additionalParents.additionalParents;
export const selectAdditionalParentsLoading = (state: RootState) => 
  state.additionalParents.loading;
export const selectAdditionalParentsError = (state: RootState) => 
  state.additionalParents.error;
export const selectAdditionalParentById = (state: RootState, parentId: string) =>
  state.additionalParents.additionalParents.find(
    (parent) => parent._id === parentId
  );
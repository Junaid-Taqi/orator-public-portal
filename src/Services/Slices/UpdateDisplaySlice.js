import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { serverUrl } from '../Constants/Constants';

const initialState = {
    status: 'idle',
    error: null,
    updatedDisplay: null,
};

export const updateDisplay = createAsyncThunk(
    'UpdateDisplay/updateDisplay',
    async (payload, { rejectWithValue }) => {
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
                },
            };

            const response = await axios.post(`${serverUrl}/o/displayManagementApplication/updateDisplay`, payload, config);
            if (!response.data?.success) {
                return rejectWithValue(response.data);
            }
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error?.response?.data || { message: error.message || 'Failed to update display' }
            );
        }
    }
);

const UpdateDisplaySlice = createSlice({
    name: 'UpdateDisplay',
    initialState,
    reducers: {
        resetUpdateDisplayState: (state) => initialState,
    },
    extraReducers: (builder) => {
        builder
            .addCase(updateDisplay.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(updateDisplay.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.updatedDisplay = action.payload;
                state.error = null;
            })
            .addCase(updateDisplay.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload?.message || action.error.message;
            });
    },
});

export const { resetUpdateDisplayState } = UpdateDisplaySlice.actions;
export default UpdateDisplaySlice.reducer;

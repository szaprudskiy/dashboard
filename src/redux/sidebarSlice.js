import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  sections: [], // массив секций
  userId: null,
}

const sidebarSlice = createSlice({
  name: 'sidebar',
  initialState,
  reducers: {
    updateSections: (state, action) => {
      state.sections = action.payload
    },
    clearSections: (state) => {
      state.sections = []
    },
  },
})

export const { updateSections, clearSections } = sidebarSlice.actions
export default sidebarSlice.reducer

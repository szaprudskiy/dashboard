import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  sections: [], // массив секций
}

const sidebarSlice = createSlice({
  name: 'sidebar',
  initialState,
  reducers: {
    updateSections: (state, action) => {
      state.sections = action.payload
    },
  },
})

export const { updateSections } = sidebarSlice.actions
export default sidebarSlice.reducer

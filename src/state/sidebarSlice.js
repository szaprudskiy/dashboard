import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  sections: [], // массив секций
  userId: null,
  intervalId: null,
  intervalIdOpenAI: null, // новое состояние для функции fetchCommentsAndSendAutoReplyApi
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
    setIntervalId: (state, action) => {
      state.intervalId = action.payload
    },
    setIntervalIdOpenAI: (state, action) => {
      // новый action для установки intervalIdOpenAI
      state.intervalIdOpenAI = action.payload
    },
    clearIntervalId: (state) => {
      clearInterval(state.intervalId)
      state.intervalId = null
    },
    clearIntervalIdOpenAI: (state) => {
      // новый action для очистки intervalIdOpenAI
      clearInterval(state.intervalIdOpenAI)
      state.intervalIdOpenAI = null
    },
  },
})

export const {
  updateSections,
  clearSections,
  setIntervalId,
  setIntervalIdOpenAI,
  clearIntervalId,
  clearIntervalIdOpenAI,
} = sidebarSlice.actions

export const selectIntervalId = (state) => state.sidebar.intervalId
export const selectIntervalIdOpenAI = (state) => state.sidebar.intervalIdOpenAI // новый селектор для получения intervalIdOpenAI
export default sidebarSlice.reducer

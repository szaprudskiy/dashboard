import { configureStore } from '@reduxjs/toolkit'
import thunk from 'redux-thunk'
import sidebarReducer from './sidebarSlice'

export const store = configureStore({
  reducer: {
    sidebar: sidebarReducer,
  },
  middleware: [thunk],
})

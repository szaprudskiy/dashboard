import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Sidebar from './Sidebar'
import SectionEditor from './SectionEditor'

const Section = () => {
  return (
    <div className="flex">
      <Sidebar />
      <Routes>
        <Route
          path="/"
          element={
            <p>Select a section from the sidebar or create a new one.</p>
          }
        />
        <Route path="/:sectionId" element={<SectionEditor />} />
      </Routes>
    </div>
  )
}

export default Section

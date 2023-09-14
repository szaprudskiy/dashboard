import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

const Sidebar = () => {
  const [sections, setSections] = useState([])

  useEffect(() => {
    axios
      .get('http://localhost:4001/sections')
      .then((response) => {
        setSections(response.data.sections)
      })
      .catch((error) => {
        console.error('Ошибка при загрузке секций', error)
      })
  }, [])

  return (
    <div className="w-1/4 bg-gray-200 p-4">
      <h2 className="text-xl font-semibold mb-4">Sections</h2>
      <ul>
        {sections.map((section) => (
          <li
            key={section._id}
            className="cursor-pointer mb-2 hover:text-blue-500"
          >
            <Link to={`/dashboard/${section._id}`}>{section.title}</Link>
          </li>
        ))}
        <li className="cursor-pointer mb-2 hover:text-blue-500">
          <Link
            to="/dashboard/new"
            className="bg-blue-500 text-white px-2 py-1 rounded mt-4 hover:bg-blue-600"
          >
            Create New Section
          </Link>
        </li>
      </ul>
    </div>
  )
}

export default Sidebar

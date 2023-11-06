import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { updateSections } from '../../state/sidebarSlice'
import axios from 'axios'
import { Link } from 'react-router-dom'

const Sidebar = ({ handleLogout }) => {
  const sections = useSelector((state) => state.sidebar.sections)
  const dispatch = useDispatch()

  useEffect(() => {
    const loadSections = async () => {
      try {
        const response = await axios.get(
          'https://panel.stat-gurteam.info/api/sections',
          {
            withCredentials: true,
          }
        )
        const loadedSections = response.data.sections

        // Обновление состояния хранилища Redux с помощью dispatch
        dispatch(updateSections(loadedSections))
      } catch (error) {
        console.error('Ошибка при загрузке секций', error)
      }
    }

    loadSections()
  }, [dispatch])

  return (
    <div className="w-1/4 bg-gray-200 p-4 sidebar">
      <h2 className="text-xl font-semibold mb-4">Accounts</h2>
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
            Create New Account
          </Link>
        </li>
      </ul>
      <button className="logout-button" onClick={handleLogout}>
        Logout
      </button>
    </div>
  )
}

export default Sidebar

import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'

const SectionEditor = () => {
  const { sectionId } = useParams()
  const navigate = useNavigate() // Используем useNavigate
  const [selectedSection, setSelectedSection] = useState(null)
  const [editedSection, setEditedSection] = useState(null)

  useEffect(() => {
    axios
      .get(`http://localhost:4001/sections/${sectionId}`)
      .then((response) => {
        setSelectedSection(response.data.section)
        setEditedSection(response.data.section)
      })
      .catch((error) => {
        console.error('Ошибка при загрузке секции', error)
      })
  }, [sectionId])

  const handleFieldChange = (field, value) => {
    if (editedSection) {
      const updatedSection = { ...editedSection, [field]: value }
      setEditedSection(updatedSection)
    }
  }

  const handleSaveSection = () => {
    if (sectionId && editedSection) {
      axios
        .put(`http://localhost:4001/section/${sectionId}`, editedSection)
        .then((response) => {
          console.log('Секция успешно обновлена', response.data.section)
          // Перенаправляем пользователя обратно после сохранения
          navigate(`/dashboard/${sectionId}`)
        })
        .catch((error) => {
          console.error('Ошибка при обновлении секции', error)
        })
    }
  }

  return (
    <div>
      <h1>Section Editor</h1>
      {selectedSection ? (
        <div>
          <h2>{selectedSection.title}</h2>
          <div className="mb-4">
            <label className="block mb-1">Name:</label>
            <input
              type="text"
              value={editedSection.title}
              onChange={(e) => handleFieldChange('title', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1">Field 1:</label>
            <textarea
              value={editedSection.fieldF}
              onChange={(e) => handleFieldChange('fieldF', e.target.value)}
              type="text"
              className="w-full p-2 border border-gray-300 rounded-md"
            ></textarea>
          </div>
          <div className="mb-4">
            <label className="block mb-1">Field 2:</label>
            <input
              type="text"
              value={editedSection.fieldS}
              onChange={(e) => handleFieldChange('fieldS', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <button
            onClick={handleSaveSection}
            className="bg-blue-500 text-white px-2 py-1 rounded mt-4 hover:bg-blue-600"
          >
            Сохранить
          </button>
        </div>
      ) : (
        <div>
          <p>Loading...</p>
        </div>
      )}
    </div>
  )
}

export default SectionEditor

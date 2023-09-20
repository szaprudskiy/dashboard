import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useDispatch } from 'react-redux'
import { updateSections } from '../../redux/sidebarSlice'

const SectionEditor = () => {
  const { sectionId } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const [selectedSection, setSelectedSection] = useState(null)
  const [editedSection, setEditedSection] = useState(null)
  const [isNewSection, setIsNewSection] = useState(false)

  useEffect(() => {
    if (sectionId === 'new') {
      setIsNewSection(true)
      setEditedSection({ title: '', fieldF: '', fieldS: '' })
    } else {
      axios
        .get(`http://localhost:4001/sections/${sectionId}`, {
          withCredentials: true,
        })
        .then((response) => {
          setSelectedSection(response.data.section)
          setEditedSection(response.data.section)
          setIsNewSection(false)
        })
        .catch((error) => {
          console.error('Ошибка при загрузке секции', error)
        })
    }
  }, [sectionId])

  const handleFieldChange = (field, value) => {
    const updatedSection = { ...editedSection, [field]: value }
    setEditedSection(updatedSection)
  }

  const handleSaveSection = () => {
    if (editedSection && editedSection.title && editedSection.fieldF) {
      if (isNewSection) {
        axios
          .post('http://localhost:4001/create', editedSection, {
            withCredentials: true,
          })
          .then((response) => {
            console.log('Новая секция успешно создана', response.data.section)
            // После успешного создания, загрузите обновленный список секций
            loadSections()
            navigate('/dashboard')
          })
          .catch((error) => {
            console.error('Ошибка при создании секции', error)
          })
      } else {
        axios
          .put(`http://localhost:4001/section/${sectionId}`, editedSection, {
            withCredentials: true,
          })
          .then((response) => {
            console.log('Секция успешно обновлена', response.data.section)
            // После успешного обновления, загрузите обновленный список секций
            loadSections()
            navigate('/dashboard')
          })
          .catch((error) => {
            console.error('Ошибка при обновлении секции', error)
          })
      }
    }
  }

  const handleDeleteSection = () => {
    if (sectionId) {
      axios
        .delete(`http://localhost:4001/delete/${sectionId}`, {
          withCredentials: true,
        })
        .then((response) => {
          console.log('Секция успешно удалена')
          // После удаления секции, вы можете выполнить перенаправление на другую страницу
          // или обновить данные в боковой панели.
          loadSections()
          navigate('/dashboard')
        })
        .catch((error) => {
          console.error('Ошибка при удалении секции', error)
        })
    }
  }

  const loadSections = async () => {
    try {
      // Выполните запрос Axios для получения секций с сервера
      const response = await axios.get('http://localhost:4001/sections', {
        withCredentials: true,
      })
      const loadedSections = response.data.sections

      // Обновите состояние хранилища Redux с помощью dispatch
      dispatch(updateSections(loadedSections))
    } catch (error) {
      console.error('Ошибка при загрузке секций', error)
    }
  }

  return (
    <div className="w-full">
      <h1>Section Editor</h1>
      {selectedSection || isNewSection ? (
        <div>
          <div className="mb-4">
            <label className="block mb-1">Name:</label>
            <input
              type="text"
              value={editedSection.title}
              onChange={(e) => handleFieldChange('title', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
            {!editedSection.title && (
              <p className="text-red-500">Поле Name не может быть пустым</p>
            )}
          </div>
          <div className="mb-4">
            <label className="block mb-1">Field 1:</label>
            <input
              value={editedSection.fieldF}
              onChange={(e) => handleFieldChange('fieldF', e.target.value)}
              type="text"
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
            {!editedSection.fieldF && (
              <p className="text-red-500">Поле Field 1 не может быть пустым</p>
            )}
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
            {isNewSection ? 'Создать' : 'Сохранить'}
          </button>
          {!isNewSection && (
            <button
              onClick={handleDeleteSection}
              className="bg-red-500 text-white px-2 py-1 rounded mt-4 ml-2 hover:bg-red-600"
            >
              Удалить секцию
            </button>
          )}
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

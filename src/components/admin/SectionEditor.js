import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useDispatch, useSelector } from 'react-redux'
import {
  selectIntervalId,
  setIntervalId,
  clearIntervalId,
  selectIntervalIdOpenAI,
  setIntervalIdOpenAI,
  clearIntervalIdOpenAI,
  updateSections,
} from '../../state/sidebarSlice'
import '../../../src/index.css'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { createAsyncThunk } from '@reduxjs/toolkit'

const SectionEditor = () => {
  const { sectionId } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const [selectedSection, setSelectedSection] = useState(null)
  const [editedSection, setEditedSection] = useState(null)
  const [isNewSection, setIsNewSection] = useState(false)
  const [comments, setComments] = useState([])
  const [replyTo, setReplyTo] = useState(null)
  const [replyInput, setReplyInput] = useState('')
  const [showComments, setShowComments] = useState(false)

  const [autoReplyText, setAutoReplyText] = useState('')
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(false)

  const [openAIAutoReplyEnabled, setOpenAIAutoReplyEnabled] = useState(false)

  const [showErrorMessage, setShowErrorMessage] = useState(false)

  const wrongCommentNotify = () =>
    toast.error('Вы уже отправляли сообщение на этот комментарий!', {
      position: 'top-right',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: 'colored',
    })
  const successCommentNotify = () =>
    toast.success('Комментарий отправлен!', {
      position: 'top-right',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: 'colored',
    })

  useEffect(() => {
    setComments([])
    setReplyTo(null)
    setReplyInput('')
    setShowComments(false)
    if (sectionId === 'new') {
      setIsNewSection(true)
      setEditedSection({ title: '', pageId: '', postId: '', token: '' })
      setComments([])
      setReplyTo(null)
      setReplyInput('')
      setShowComments(false)
      setAutoReplyText('')
      setAutoReplyEnabled(false)
      setOpenAIAutoReplyEnabled(false)
    } else {
      axios
        .get(`http://localhost:4004/api/sections/${sectionId}`, {
          withCredentials: true,
        })
        .then((response) => {
          setSelectedSection(response.data.section)
          setEditedSection(response.data.section)
          setIsNewSection(false)
          setAutoReplyText(response.data.section.autoReplyText)
          setAutoReplyEnabled(response.data.section.autoReplyEnabled)
          setOpenAIAutoReplyEnabled(
            response.data.section.openAIAutoReplyEnabled
          )
        })
        .catch((error) => {
          console.error('Ошибка при загрузке секции', error)
        })
    }
  }, [sectionId])

  const fetchComments = () => {
    if (selectedSection) {
      const pageId = selectedSection.pageId
      const pagePost = selectedSection.postId
      const accessToken = selectedSection.token

      axios
        .get(
          `https://graph.facebook.com/v17.0/${pageId}_${pagePost}/comments?access_token=${accessToken}`
        )
        .then((response) => {
          console.log('Response from server:', response.data) // добавьте эту строку

          setComments(response.data.data)
          setShowComments(true)
        })
        .catch((error) => {
          console.error('Ошибка при загрузке комментариев', error)
        })
    }
  }

  const handleFieldChange = (field, value) => {
    const updatedSection = { ...editedSection, [field]: value }
    setEditedSection(updatedSection)
  }

  const intervalId = useSelector(selectIntervalId)

  const fetchCommentsAndSendAutoReply = createAsyncThunk(
    'sidebar/fetchCommentsAndSendAutoReply',
    async () => {
      if (autoReplyEnabled && autoReplyText && selectedSection) {
        try {
          const response = await axios.get(
            `https://graph.facebook.com/v17.0/${selectedSection.pageId}_${selectedSection.postId}/comments?access_token=${selectedSection.token}`
          )

          console.log('1', response)
          console.log('2', response.data.data)
          // Массив для хранения промисов запросов на проверку комментариев
          const checkCommentPromises = response.data.data.map(
            async (comment) => {
              console.log('comment', comment)
              try {
                const existingCommentResponse = await axios.post(
                  'http://localhost:4004/api/checkcomment',
                  {
                    commentId: comment.id,
                  }
                )
                console.log('3', existingCommentResponse)
                console.log('4', existingCommentResponse.data)
                return existingCommentResponse.data
              } catch (error) {
                console.error('Ошибка при проверке комментария', error)
                return null
              }
            }
          )

          // Дожидаемся завершения всех запросов на проверку комментариев
          const existingComments = await Promise.all(checkCommentPromises)

          for (let i = 0; i < response.data.data.length; i++) {
            const comment = response.data.data[i]
            const existingComment = existingComments[i]

            console.log(comment)

            if (existingComment !== null) {
              // Если комментарий уже существует в базе данных, показываем уведомление
              console.log(
                `Комментарий с commentId ${comment.id} уже существует в базе данных.`
              )
              // wrongCommentNotify()
            } else {
              // Отправляем автоматический ответ
              await axios.post(
                `https://graph.facebook.com/v17.0/${comment.id}/comments`,
                {
                  message: autoReplyText,
                },
                {
                  params: {
                    access_token: selectedSection.token,
                  },
                }
              )

              // Сохраняем информацию о комментарии в базе данных
              await axios.post('http://localhost:4004/api/comment', {
                postId: selectedSection.postId,
                commentId: comment.id,
                message: autoReplyText,
                autoReply: true,
              })

              // Обновляем состояние с отправленными комментариями
              setComments((prevComments) => [...prevComments, comment])
              successCommentNotify()
            }
          }
        } catch (error) {
          console.error('Ошибка при получении комментариев', error)
        }
      }
    }
  )

  useEffect(() => {
    if (autoReplyEnabled && selectedSection) {
      if (!intervalId) {
        const id = setInterval(() => {
          dispatch(fetchCommentsAndSendAutoReply())
        }, 600000)
        dispatch(setIntervalId(id))
        console.log('Запущен интервал', id)
      }
    } else {
      if (intervalId) {
        console.log('Остановлен интервал', intervalId)
        clearInterval(intervalId)
        dispatch(clearIntervalId())
      }
    }
  }, [autoReplyEnabled, selectedSection, intervalId, dispatch])

  const intervalIdOpenAI = useSelector(selectIntervalIdOpenAI)
  const fetchCommentsAndSendAutoReplyApi = createAsyncThunk(
    'sidebar/fetchCommentsAndSendAutoReplyApi',
    async () => {
      if (openAIAutoReplyEnabled && selectedSection) {
        try {
          const response = await axios.get(
            `https://graph.facebook.com/v17.0/${selectedSection.pageId}_${selectedSection.postId}/comments?access_token=${selectedSection.token}`
          )

          // Массив для хранения промисов запросов на проверку комментариев
          const checkCommentPromises = response.data.data.map(
            async (comment) => {
              try {
                const existingCommentResponse = await axios.post(
                  'http://localhost:4004/api/checkcomment',
                  {
                    commentId: comment.id,
                  }
                )

                return existingCommentResponse.data
              } catch (error) {
                console.error('Ошибка при проверке комментария', error)
                return null
              }
            }
          )

          console.log('checkCommentPromises', checkCommentPromises)
          // Дожидаемся завершения всех запросов на проверку комментариев
          const existingComments = await Promise.all(checkCommentPromises)

          for (let i = 0; i < response.data.data.length; i++) {
            const comment = response.data.data[i]
            const existingComment = existingComments[i]

            console.log('1', existingComments)
            console.log('2', existingComment)

            if (existingComment === null) {
              // Если комментарий не существует в базе данных, отправляем автоматический ответ
              const apikey = process.env.REACT_APP_API_KEY

              const openaiResponse = await axios.post(
                // https://api.openai.com/v1/engines/gpt-3.5-turbo-16k/completions
                // https://api.openai.com/v1/engines/text-davinci-002/completions
                'https://api.openai.com/v1/engines/text-davinci-003/completions',
                {
                  prompt: comment.message,
                  max_tokens: 500,
                  temperature: 0.7,
                  top_p: 1.0,
                  n: 1,
                  stop: null,
                },
                {
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${apikey}`,
                  },
                }
              )

              const openaiReply = openaiResponse.data.choices[0].text.trim()
              console.log(openaiReply)

              // Отправляем автоматический ответ
              await axios.post(
                `https://graph.facebook.com/v17.0/${comment.id}/comments`,
                {
                  message: openaiReply,
                },
                {
                  params: {
                    access_token: selectedSection.token,
                  },
                }
              )

              // Сохраняем информацию о комментарии в базе данных
              await axios.post('http://localhost:4004/api/comment', {
                postId: selectedSection.postId,
                commentId: comment.id,
                message: openaiReply,
                openAIautoReply: true,
              })

              // Обновляем состояние с отправленными комментариями
              setComments((prevComments) => [...prevComments, comment])
              successCommentNotify()
            } else {
              // Если комментарий уже существует в базе данных, показываем уведомление
              console.log(
                `Комментарий с commentId ${comment.id} уже существует в базе данных.`
              )
              wrongCommentNotify()
            }
          }
        } catch (error) {
          console.error('Ошибка при получении комментариев', error)
        }
      }
    }
  )

  if (openAIAutoReplyEnabled) {
    if (!intervalIdOpenAI) {
      const id = setInterval(() => {
        dispatch(fetchCommentsAndSendAutoReplyApi()) // рекурсивный вызов функции через интервал
      }, 600000) // интервал в миллисекундах (5 секунд в данном случае)
      dispatch(setIntervalIdOpenAI(id)) // сохраняем ID интервала в Redux store
      console.log('1', id)
    }
  } else {
    if (intervalIdOpenAI) {
      console.log('2', intervalIdOpenAI)
      clearInterval(intervalIdOpenAI) // очищаем интервал, если autoReplyEnabled стало false
      dispatch(clearIntervalIdOpenAI()) // очищаем ID интервала в Redux store
    }
  }

  const handleSendReply = async () => {
    if (!replyInput || !replyTo) {
      return // Не отправляем пустой ответ
    }

    axios
      .post(
        'http://localhost:4004/api/comment',
        {
          postId: selectedSection.postId,
          commentId: replyTo.id,
          message: replyInput,
        },
        {
          withCredentials: true,
        }
      )
      .then((response) => {
        console.log('exist response', response)
        if (replyTo.id !== response.data.commentId) {
          axios
            .post(
              `https://graph.facebook.com/v17.0/${replyTo.id}/comments`,
              {
                message: replyInput,
              },
              {
                params: {
                  access_token: selectedSection.token,
                },
              }
            )
            .then(() => {
              successCommentNotify()
              // Если ответ успешно отправлен в Facebook, сбрасываем состояния replyTo и replyInput
              setReplyTo(null)
              setReplyInput('')

              // Обновляем список комментариев, добавив новый комментарий из ответа
              setComments((prevComments) => [...prevComments, response.data])

              // // Запрос на обновление списка комментариев после добавления нового комментария
              // fetchComments()
            })
            .catch((error) => {
              console.error('Ошибка при отправке ответа в Facebook', error)
            })
        } else {
          // wrongCommentNotify()
        }
      })
      .catch((error) => {
        console.error('Ошибка при отправке ответа', error)
      })
  }

  const handleSaveSection = async () => {
    if (
      editedSection &&
      editedSection.title &&
      editedSection.pageId &&
      editedSection.postId &&
      editedSection.token
    ) {
      const sectionData = {
        ...editedSection,
        autoReplyText: autoReplyText,
        autoReplyEnabled: autoReplyEnabled,
        openAIAutoReplyEnabled: openAIAutoReplyEnabled,
      }

      try {
        let response
        if (isNewSection) {
          response = await axios.post(
            'http://localhost:4004/api/create',
            sectionData,
            {
              withCredentials: true,
            }
          )
        } else {
          response = await axios.put(
            `http://localhost:4004/api/section/${sectionId}`,
            sectionData,
            {
              withCredentials: true,
            }
          )
        }
        console.log('Секция успешно сохранена', response.data.section)
        loadSections()
        navigate('/dashboard')
      } catch (error) {
        console.error('Ошибка при сохранении секции', error)
      }
    } else {
      console.error('Не все обязательные поля заполнены')
    }
  }

  const handleDeleteSection = () => {
    if (sectionId) {
      axios
        .delete(`http://localhost:4004/api/delete/${sectionId}`, {
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
      const response = await axios.get('http://localhost:4004/api/sections', {
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
    <div className="w-full section-editor-container">
      <ToastContainer />
      <h1>Account Editor</h1>
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
            <label className="block mb-1">pageId:</label>
            <input
              value={editedSection.pageId}
              onChange={(e) => handleFieldChange('pageId', e.target.value)}
              type="text"
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
            {!editedSection.pageId && (
              <p className="text-red-500">Поле pageId не может быть пустым</p>
            )}
          </div>
          <div className="mb-4">
            <label className="block mb-1">postId:</label>
            <input
              type="text"
              value={editedSection.postId}
              onChange={(e) => handleFieldChange('postId', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
            {!editedSection.postId && (
              <p className="text-red-500">Поле postId не может быть пустым</p>
            )}
          </div>
          <div className="mb-4">
            <label className="block mb-1">token:</label>
            <input
              type="text"
              value={editedSection.token}
              onChange={(e) => handleFieldChange('token', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
            {!editedSection.token && (
              <p className="text-red-500">Поле token не может быть пустым</p>
            )}
          </div>
          <div className="mt-4">
            <h2>Auto Reply Message:</h2>
            <textarea
              value={autoReplyText}
              onChange={(e) => setAutoReplyText(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              rows="4"
            />
            <label className="block mt-2">
              <input
                type="checkbox"
                checked={autoReplyEnabled}
                onChange={() => setAutoReplyEnabled(!autoReplyEnabled)}
              />
              Enable Auto Reply via message
            </label>
            {showErrorMessage && (
              <p className="text-red-500">
                Пожалуйста, укажите текст и галочку для запуска автоответов
              </p>
            )}
          </div>
          <div className="mt-4">
            <label className="block mt-2">
              <input
                type="checkbox"
                checked={openAIAutoReplyEnabled}
                onChange={() =>
                  setOpenAIAutoReplyEnabled(!openAIAutoReplyEnabled)
                }
              />
              Enable Auto Reply via OpenAI
            </label>
          </div>
          <button
            onClick={handleSaveSection}
            className="bg-blue-500 text-white px-2 py-1 rounded mt-4 hover:bg-blue-600"
          >
            {isNewSection ? 'Create' : 'Update'}
          </button>
          {!isNewSection && (
            <button
              onClick={handleDeleteSection}
              className="bg-red-500 text-white px-2 py-1 rounded mt-4 ml-2 hover:bg-red-600"
            >
              Delete
            </button>
          )}
          {!isNewSection &&
            selectedSection &&
            selectedSection.pageId &&
            selectedSection.postId &&
            selectedSection.token && (
              <button
                onClick={fetchComments}
                className="bg-green-500 text-white px-2 py-1 rounded mt-4 hover:bg-green-600 ml-1"
              >
                Fetch Comments
              </button>
            )}

          {showComments && (
            <div className="mt-4">
              <h2>Comments:</h2>
              {comments.map((comment) =>
                comment.from && comment.message ? (
                  <div key={comment.id} className="comment-item">
                    <div className="comment-header">{comment.from.name}</div>
                    <div className="comment-message">{comment.message}</div>
                    {/* Кнопка для ответа на комментарий */}
                    <button
                      onClick={() =>
                        setReplyTo({
                          id: comment.id,
                          from: comment.from.name,
                          message: comment.message,
                        })
                      }
                      className="reply-button"
                    >
                      Reply
                    </button>
                  </div>
                ) : null
              )}
            </div>
          )}
          {/* Форма для отправки ответа */}
          {replyTo && (
            <div className="mt-4">
              <h2>Reply to {replyTo.from}'s comment:</h2>
              <p>{replyTo.message}</p>
              <textarea
                value={replyInput}
                onChange={(e) => setReplyInput(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                rows="4"
              />
              <button
                onClick={handleSendReply}
                className="bg-blue-500 text-white px-2 py-1 rounded mt-2 hover:bg-blue-600"
              >
                Send Reply
              </button>
            </div>
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

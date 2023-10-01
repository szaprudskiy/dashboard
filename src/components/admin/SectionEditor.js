import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useDispatch } from 'react-redux'
import { updateSections } from '../../redux/sidebarSlice'
import '../../../src/index.css'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

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
    } else {
      axios
        .get(`http://localhost:4004/sections/${sectionId}`, {
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

  // const handleSendReply = () => {
  //   if (!replyInput || !replyTo) {
  //     return // Не отправляем пустой ответ
  //   }

  //   axios
  //     .post(
  //       `https://graph.facebook.com/v17.0/${replyTo.id}/comments`,
  //       {
  //         message: replyInput,
  //       },
  //       {
  //         params: {
  //           access_token: selectedSection.token,
  //         },
  //       }
  //     )
  //     .then((response) => {
  //       // Если ответ успешно отправлен, сбрасываем состояния replyTo и replyInput
  //       setReplyTo(null)
  //       setReplyInput('')

  //       // Обновляем список комментариев, добавив новый комментарий из ответа
  //       setComments((prevComments) => [...prevComments, response.data])
  //     })
  //     .catch((error) => {
  //       console.error('Ошибка при отправке ответа', error)
  //     })
  // }

  const handleSendReply = async () => {
    if (!replyInput || !replyTo) {
      return // Не отправляем пустой ответ
    }

    axios
      .post('http://localhost:4004/comment', {
        postId: selectedSection.postId,
        commentId: replyTo.id,
        message: replyInput,
      })
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
          wrongCommentNotify()
        }
      })
      .catch((error) => {
        console.error('Ошибка при отправке ответа', error)
      })
  }

  const handleSaveSection = () => {
    if (
      editedSection &&
      editedSection.title &&
      editedSection.pageId &&
      editedSection.postId &&
      editedSection.token
    ) {
      if (isNewSection) {
        axios
          .post('http://localhost:4004/create', editedSection, {
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
          .put(`http://localhost:4004/section/${sectionId}`, editedSection, {
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
        .delete(`http://localhost:4004/delete/${sectionId}`, {
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
      const response = await axios.get('http://localhost:4004/sections', {
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

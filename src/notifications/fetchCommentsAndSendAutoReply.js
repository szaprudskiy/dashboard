const fetchCommentsAndSendAutoReply = async () => {
  if (autoReplyEnabled && autoReplyText && selectedSection) {
    try {
      const response = await axios.get(
        `https://graph.facebook.com/v17.0/${selectedSection.pageId}_${selectedSection.postId}/comments?access_token=${selectedSection.token}`
      )

      // Массив для хранения промисов запросов на проверку комментариев
      const checkCommentPromises = response.data.data.map(async (comment) => {
        try {
          const existingCommentResponse = await axios.post(
            'http://localhost:4004/checkcomment',
            {
              commentId: comment.id,
            }
          )
          return existingCommentResponse.data.comment
        } catch (error) {
          console.error('Ошибка при проверке комментария', error)
          return null
        }
      })

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
          wrongCommentNotify()
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
          await axios.post('http://localhost:4004/comment', {
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
export default fetchCommentsAndSendAutoReply

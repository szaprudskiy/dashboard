import axios from 'axios'
const checkCommentInDatabase = async (commentId) => {
  try {
    const response = await axios.get(`http://localhost:4004/checkcomment`)
    return response.data.commentId
  } catch (error) {
    console.error('Ошибка при проверке комментария в базе данных', error)
    return false
  }
}

export default checkCommentInDatabase

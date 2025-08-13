import multer from 'multer'

const storage = multer.diskStorage({})

export default upload = multer({ storage })

import multer from 'multer'

const storage = multer.diskStorage({})

export const Upload = multer({ storage })

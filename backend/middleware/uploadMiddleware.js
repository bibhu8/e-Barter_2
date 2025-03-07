import multer from 'multer';

const storage = multer.memoryStorage(); // Store files in memory
export default multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});
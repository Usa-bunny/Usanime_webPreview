const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const path = require('path');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const originalName = path.parse(file.originalname).name;
    const safeName = originalName
      .replace(/\s+/g, '_')
      .replace(/[^\w\-]/g, '')
      .toLowerCase();

    return {
      folder: 'usanime',
      format: 'webp',
      public_id: `${safeName}_${Date.now()}`,
      transformation: [
        {
          width: 300,        
          height: 400,      
          crop: 'fill',
          gravity: 'auto',    
        },
        {
          quality: 'auto:good',  
        },
      ],
      resource_type: 'image',
    };
  },
});

const upload = multer({ storage });

module.exports = upload;

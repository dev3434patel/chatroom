const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const cron = require('node-cron');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;
const MAX_USERS = 4;
const FILE_SIZE_LIMIT = 100 * 1024 * 1024; // 100MB
const DATA_RETENTION_DAYS = 7;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
fs.ensureDirSync(uploadsDir);

// In-memory storage
let users = new Map();
let messages = [];
let typingUsers = new Set();

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  // Allow all file types
  cb(null, true);
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: FILE_SIZE_LIMIT
  }
});

// Serve static files
app.use(express.static('public'));
app.use('/uploads', express.static(uploadsDir));

// File upload endpoint
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const fileInfo = {
    id: uuidv4(),
    filename: req.file.filename,
    originalName: req.file.originalname,
    size: req.file.size,
    mimetype: req.file.mimetype,
    uploadedAt: new Date(),
    url: `/uploads/${req.file.filename}`
  };

  res.json(fileInfo);
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Handle user joining
  socket.on('join', (displayName) => {
    if (users.size >= MAX_USERS) {
      socket.emit('room-full');
      return;
    }

    const user = {
      id: socket.id,
      displayName: displayName.trim(),
      joinedAt: new Date()
    };

    users.set(socket.id, user);
    socket.emit('join-success', { user, messages: getRecentMessages() });
    
    // Broadcast user joined
    socket.broadcast.emit('user-joined', user);
    io.emit('users-update', Array.from(users.values()));

    console.log(`${displayName} joined the chat`);
  });

  // Handle new message
  socket.on('message', (data) => {
    const user = users.get(socket.id);
    if (!user) return;

    const message = {
      id: uuidv4(),
      userId: socket.id,
      displayName: user.displayName,
      content: data.content,
      timestamp: new Date(),
      type: 'text'
    };

    messages.push(message);
    io.emit('message', message);
  });

  // Handle file message
  socket.on('file-message', (fileInfo) => {
    const user = users.get(socket.id);
    if (!user) return;

    const message = {
      id: uuidv4(),
      userId: socket.id,
      displayName: user.displayName,
      timestamp: new Date(),
      type: 'file',
      file: fileInfo
    };

    messages.push(message);
    io.emit('message', message);
  });

  // Handle typing indicators
  socket.on('typing', (isTyping) => {
    const user = users.get(socket.id);
    if (!user) return;

    if (isTyping) {
      typingUsers.add(user.displayName);
    } else {
      typingUsers.delete(user.displayName);
    }

    socket.broadcast.emit('typing-update', Array.from(typingUsers));
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    const user = users.get(socket.id);
    if (user) {
      users.delete(socket.id);
      typingUsers.delete(user.displayName);
      
      socket.broadcast.emit('user-left', user);
      io.emit('users-update', Array.from(users.values()));
      io.emit('typing-update', Array.from(typingUsers));
      
      console.log(`${user.displayName} left the chat`);
    }
  });
});

// Helper function to get recent messages
function getRecentMessages() {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - DATA_RETENTION_DAYS);
  
  return messages.filter(msg => new Date(msg.timestamp) > cutoffDate);
}

// Cleanup job - runs daily at midnight
cron.schedule('0 0 * * *', async () => {
  console.log('Running daily cleanup job...');
  
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - DATA_RETENTION_DAYS);
  
  // Clean up messages
  const initialMessageCount = messages.length;
  messages = messages.filter(msg => new Date(msg.timestamp) > cutoffDate);
  console.log(`Cleaned up ${initialMessageCount - messages.length} old messages`);
  
  // Clean up files
  try {
    const files = await fs.readdir(uploadsDir);
    let cleanedFiles = 0;
    
    for (const file of files) {
      const filePath = path.join(uploadsDir, file);
      const stats = await fs.stat(filePath);
      
      if (stats.mtime < cutoffDate) {
        await fs.remove(filePath);
        cleanedFiles++;
      }
    }
    
    console.log(`Cleaned up ${cleanedFiles} old files`);
  } catch (error) {
    console.error('Error during file cleanup:', error);
  }
});

// Error handling
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 100MB.' });
    }
  }
  
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

server.listen(PORT, () => {
  console.log(`🚀 Anonymous Chat App running on http://localhost:${PORT}`);
  console.log(`📁 Files will be stored in: ${uploadsDir}`);
  console.log(`🗑️  Data cleanup runs daily (${DATA_RETENTION_DAYS} day retention)`);
});
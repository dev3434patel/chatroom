# Anonymous 1-Room Chat App (Max 4 Users)

A lightweight, real-time anonymous chat application supporting up to 4 users simultaneously with file sharing capabilities and automatic data cleanup.

## 🚀 Features

- **Anonymous Chat**: Join with just a display name, no registration required
- **Real-time Messaging**: Instant messaging with Socket.IO
- **File Sharing**: Upload and share files up to 100MB
  - Support for all file types (AI, PSD, ZIP, PDF, images, documents, etc.)
  - Image preview with lightbox view
  - Download links for documents
- **User Management**: Maximum 4 users per room
- **Typing Indicators**: See when others are typing
- **Auto-cleanup**: Messages and files automatically deleted after 7 days
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Modern UI**: Dark theme with smooth animations and transitions

## 🛠 Tech Stack

- **Backend**: Node.js + Express + Socket.IO
- **File Upload**: Multer
- **Frontend**: HTML5 + CSS3 + JavaScript
- **Styling**: Tailwind CSS
- **Icons**: Font Awesome
- **Data Cleanup**: Node-cron

## 📁 Project Structure

```
chat-app/
├── public/
│   ├── index.html      # Frontend UI
│   ├── style.css       # Custom styles
│   └── app.js          # Client-side JavaScript
├── uploads/            # File storage (auto-created)
├── server.js           # Express server + Socket.IO
├── package.json        # Dependencies
├── .gitignore         # Git ignore rules
├── .env.example       # Environment template
├── README.md          # This file
└── LICENSE            # MIT License
```

## 🚦 Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd chat-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the application**
   ```bash
   npm start
   ```

4. **Open in browser**
   ```
   http://localhost:3000
   ```

## 🔧 Development

For development with auto-restart:

```bash
npm run dev
```

## 🌍 Environment Variables

Create a `.env` file (optional):

```env
PORT=3000
NODE_ENV=development
```

## 📝 Usage

1. **Join Chat**: Enter your display name and click "Join Chat Room"
2. **Send Messages**: Type in the input field and press Enter or click send
3. **Share Files**: Click the paperclip icon to upload files (max 100MB)
4. **View Users**: See online users in the sidebar (desktop) or toggle on mobile
5. **Leave Chat**: Click "Leave Chat" or simply close the browser

## 🔒 Privacy & Data

- **Anonymous**: No personal data required beyond display name
- **Temporary**: All messages and files are deleted after 7 days
- **Local Storage**: Files stored locally in `/uploads` directory
- **Memory-based**: Messages stored in server memory (resets on restart)

## 🚀 Deployment

### Local Deployment
The app runs on a single Node.js process serving both frontend and backend.

### Cloud Deployment
1. Upload to your preferred hosting service (Heroku, Railway, DigitalOcean, etc.)
2. Ensure the `/uploads` directory has write permissions
3. Set environment variables if needed
4. The app will create necessary directories automatically

## 🛡 Security Features

- File size limits (100MB max)
- File type validation
- XSS protection with HTML escaping
- CORS enabled for Socket.IO
- Auto-cleanup prevents data accumulation

## 🎨 UI Features

- **Responsive Design**: Adapts to all screen sizes
- **Dark Theme**: Modern dark UI with blue and emerald accents
- **Smooth Animations**: Transitions and micro-interactions
- **Image Lightbox**: Click images to view in full size
- **Typing Indicators**: Real-time typing status
- **Auto-scroll**: Smart scrolling with new message alerts
- **File Previews**: Visual previews for images, icons for documents

## 🔄 Background Jobs

- **Daily Cleanup**: Runs at midnight to remove old data
- **File Management**: Automatically removes files older than 7 days
- **Memory Cleanup**: Removes old messages from memory

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🆘 Troubleshooting

**Common Issues:**

1. **Port already in use**: Change the port in `.env` or stop other applications
2. **File upload fails**: Check disk space and file permissions
3. **Connection issues**: Verify firewall settings and network connectivity
4. **Memory issues**: Restart the server to clear memory-stored messages

**System Requirements:**
- Node.js 14.0 or higher
- 100MB+ free disk space for file uploads
- Modern web browser with JavaScript enabled

## 🔮 Future Enhancements

- [ ] Message encryption
- [ ] User authentication (optional)
- [ ] Multiple chat rooms
- [ ] Message persistence with database
- [ ] Video/audio calling
- [ ] Screen sharing
- [ ] Message reactions
- [ ] Custom themes

---

**Need help?** Open an issue or check the troubleshooting section above.
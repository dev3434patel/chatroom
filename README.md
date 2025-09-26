# SparowTech Chat - Anonymous Chat Application

🚀 **Live Demo**: [Try SparowTech Chat Now](https://dev3434patel.github.io/chatroom/)

A lightweight, real-time anonymous chat application supporting up to 4 users simultaneously with file sharing capabilities, session persistence, and automatic data cleanup.

## 🚀 Features

- **Anonymous Chat**: Join with just a display name, no registration required
- **Real-time Messaging**: Instant messaging with Socket.IO
- **File Sharing**: Upload and share files up to 100MB
  - Support for all file types (AI, PSD, ZIP, PDF, images, documents, etc.)
  - Image preview with lightbox view
  - Download links for documents
- **Session Persistence**: Stay connected even after page refresh - only manual leave removes you from chat
- **Smart Reconnection**: Automatic rejoin with stored session data
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

### 🌐 GitHub Pages (Static Demo) - 2 Minutes
1. **Fork this repository** ⭐
2. **Go to Settings → Pages**
3. **Select "Deploy from a branch"**
4. **Choose main branch and / (root) folder**
5. **Your demo will be live at: `https://yourusername.github.io/chatroom`**

> **Note**: This shows the UI only. For real chat functionality, see deployment options below.

### 💻 Local Development
```bash
# Clone and setup
git clone https://github.com/dev3434patel/chatroom.git
cd chatroom
npm install
npm start

# Open http://localhost:3000
```

### 🚀 Full App Deployment (Real Chat)
- **Railway**: [railway.app](https://railway.app) → Connect GitHub → Deploy
- **Render**: [render.com](https://render.com) → New Web Service → Connect Repo
- **Heroku**: `heroku create && git push heroku main`

📖 **Detailed Setup Guide**: [setup.md](./setup.md)

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
5. **Stay Connected**: Refresh the page or close/reopen browser - you'll automatically rejoin!
6. **Leave Chat**: Only clicking "Leave Chat" button will permanently remove you from the chat

## 🔒 Privacy & Data

- **Anonymous**: No personal data required beyond display name
- **Temporary**: All messages and files are deleted after 7 days
- **Local Storage**: Files stored locally in `/uploads` directory
- **Memory-based**: Messages stored in server memory (resets on restart)

## 🚀 Deployment

### 🌐 GitHub Pages (Static Demo)
- **Live Demo**: [View Static Demo](https://dev3434patel.github.io/chatroom/) (UI only)
- **Setup**: Fork → Settings → Pages → Deploy from main branch
- **Note**: GitHub Pages only serves static files and **cannot run Node.js servers**

### 🚀 Full App Deployment
For the complete chat functionality with real-time messaging, deploy to a Node.js hosting platform:

### 🚀 Quick Deploy Options

#### Railway (Recommended - Free Tier)
```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

#### Render (Free Tier)
1. Connect GitHub repository
2. Choose "Web Service"
3. Build: `npm install`
4. Start: `npm start`

#### Other Platforms
- **Heroku**: `heroku create && git push heroku main`
- **DigitalOcean App Platform**: Connect repo, select Node.js
- **Vercel**: `vercel` (with serverless functions)

### 📖 Detailed Deployment Guide
See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment instructions.

### Local Development
```bash
git clone https://github.com/dev3434patel/chatroom.git
cd chatroom
npm install
npm start
# Open http://localhost:3000
```

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
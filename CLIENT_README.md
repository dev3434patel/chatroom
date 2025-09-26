# 🚀 SparowTech Chat - Client-Side Version

A pure client-side chat application that works entirely in the browser without any server requirements!

## ✨ Features

- **No Server Required**: Works completely in the browser
- **Local Storage**: Messages and user data stored in browser localStorage
- **File Sharing**: Upload and share files (stored as data URLs)
- **Real-time UI**: Instant message updates and typing indicators
- **Session Persistence**: Stay connected even after page refresh
- **Auto-cleanup**: Messages automatically deleted after 7 days
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Modern UI**: Beautiful dark theme with SparowTech branding

## 🎯 How to Use

1. **Open the Chat**: Visit `public/chat.html` in your browser
2. **Enter Name**: Type your display name and click "Join Chat Room"
3. **Start Chatting**: Send messages, share files, and enjoy!

## 📁 Files

- `public/chat.html` - Main chat application
- `public/client-chat.js` - Client-side JavaScript (no server needed)
- `public/style.css` - Custom styles
- `public/White logo.png` - SparowTech logo
- `index.html` - Landing page that redirects to chat

## 🔧 Technical Details

### Data Storage
- **localStorage**: All data stored locally in browser
- **Auto-save**: Data saved every 5 seconds and on page unload
- **7-day Cleanup**: Old messages automatically removed

### File Handling
- **Data URLs**: Files converted to base64 data URLs
- **Size Limit**: 100MB maximum file size
- **All Types**: Supports images, documents, videos, etc.

### Browser Compatibility
- **Modern Browsers**: Chrome, Firefox, Safari, Edge
- **JavaScript Required**: ES6+ features used
- **localStorage**: Required for data persistence

## 🚀 Deployment

### GitHub Pages
1. Push to GitHub repository
2. Enable GitHub Pages
3. Set source to main branch
4. Visit your GitHub Pages URL

### Any Static Hosting
- Upload files to any web server
- No server-side requirements
- Works on any static hosting platform

### Local Development
1. Open `public/chat.html` in browser
2. No build process needed
3. No dependencies to install

## 🎨 Customization

### Styling
- Edit `public/style.css` for custom styles
- Uses Tailwind CSS CDN for utility classes
- Dark theme with blue/cyan color scheme

### Features
- Modify `public/client-chat.js` to add features
- All code is client-side JavaScript
- No server configuration needed

## 🔒 Privacy & Security

- **Local Only**: All data stays in your browser
- **No Tracking**: No external data collection
- **Anonymous**: No personal information required
- **Temporary**: Data automatically cleaned up

## 🆘 Troubleshooting

### Common Issues

1. **Messages Not Saving**: Check if localStorage is enabled
2. **Files Not Uploading**: Check file size (max 100MB)
3. **Styling Issues**: Ensure internet connection for Tailwind CDN

### Browser Requirements

- **JavaScript**: Must be enabled
- **localStorage**: Must be supported
- **File API**: Required for file uploads
- **Modern Browser**: ES6+ support needed

## 🎯 Perfect For

- **Local Networks**: Works without internet after initial load
- **Offline Use**: Once loaded, works without server
- **Quick Setup**: No server configuration needed
- **Learning**: Great for understanding client-side development
- **Prototyping**: Fast way to test chat UI concepts

## 📱 Mobile Support

- **Responsive Design**: Adapts to all screen sizes
- **Touch Friendly**: Optimized for mobile interactions
- **PWA Ready**: Can be installed as web app

---

**No server, no problem!** This chat application works entirely in your browser using modern web technologies.

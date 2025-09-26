class ChatApp {
    constructor() {
        this.socket = null;
        this.currentUser = null;
        this.typingTimeout = null;
        this.isAtBottom = true;
        this.unreadMessages = 0;
        this.sessionId = this.getOrCreateSessionId();
        
        this.init();
    }

    init() {
        // Check if running on GitHub Pages (static hosting)
        if (this.isGitHubPages()) {
            this.showGitHubPagesMessage();
            return;
        }
        
        this.socket = io();
        this.bindEvents();
        this.setupSocketListeners();
        this.setupAutoResize();
        this.checkExistingSession();
    }

    bindEvents() {
        // Landing page events
        document.getElementById('join-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.joinChat();
        });

        // Chat interface events
        document.getElementById('message-input').addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            } else {
                this.handleTyping();
            }
        });

        document.getElementById('send-button').addEventListener('click', () => {
            this.sendMessage();
        });

        document.getElementById('file-button').addEventListener('click', () => {
            document.getElementById('file-input').click();
        });

        document.getElementById('file-input').addEventListener('change', (e) => {
            this.handleFileSelect(e);
        });

        document.getElementById('cancel-upload').addEventListener('click', () => {
            this.cancelUpload();
        });

        document.getElementById('leave-chat').addEventListener('click', () => {
            this.leaveChat();
        });

        document.getElementById('toggle-sidebar').addEventListener('click', () => {
            this.toggleSidebar();
        });

        document.getElementById('new-messages-alert').addEventListener('click', () => {
            this.scrollToBottom();
            this.hideNewMessagesAlert();
        });

        // Lightbox events
        document.getElementById('close-lightbox').addEventListener('click', () => {
            this.closeLightbox();
        });

        document.getElementById('image-lightbox').addEventListener('click', (e) => {
            if (e.target.id === 'image-lightbox') {
                this.closeLightbox();
            }
        });

        // Scroll detection
        document.getElementById('messages-container').addEventListener('scroll', () => {
            this.handleScroll();
        });

        // Window events
        window.addEventListener('beforeunload', () => {
            if (this.socket) {
                this.socket.disconnect();
            }
        });
    }

    setupSocketListeners() {
        this.socket.on('join-success', (data) => {
            this.currentUser = data.user;
            this.showChatInterface();
            this.loadMessages(data.messages);
        });

        this.socket.on('rejoin-success', (data) => {
            this.currentUser = data.user;
            this.showChatInterface();
            this.loadMessages(data.messages);
        });

        this.socket.on('rejoin-failed', () => {
            this.clearSessionData();
            // Show landing page for new join
        });

        this.socket.on('room-full', () => {
            this.showError('Room is full (4/4). Please try again later.');
        });

        this.socket.on('message', (message) => {
            this.addMessage(message);
        });

        this.socket.on('user-joined', (user) => {
            this.addSystemMessage(`${user.displayName} joined the chat`, 'join');
        });

        this.socket.on('user-left', (user) => {
            this.addSystemMessage(`${user.displayName} left the chat`, 'leave');
        });

        this.socket.on('users-update', (users) => {
            this.updateUsersList(users);
        });

        this.socket.on('typing-update', (typingUsers) => {
            this.updateTypingIndicator(typingUsers);
        });

        this.socket.on('connect_error', () => {
            this.showError('Connection failed. Please refresh the page.');
        });

        this.socket.on('disconnect', () => {
            this.showError('Disconnected from server. Please refresh the page.');
        });
    }

    setupAutoResize() {
        const textarea = document.getElementById('message-input');
        textarea.addEventListener('input', () => {
            textarea.style.height = 'auto';
            textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
        });
    }

    joinChat() {
        const displayName = document.getElementById('display-name').value.trim();
        if (!displayName) return;

        if (displayName.length > 20) {
            this.showError('Display name must be 20 characters or less.');
            return;
        }

        // Store session data
        this.storeSessionData(displayName);
        this.socket.emit('join', { displayName, sessionId: this.sessionId });
    }

    showChatInterface() {
        document.getElementById('landing-page').classList.add('hidden');
        document.getElementById('chat-interface').classList.remove('hidden');
        document.getElementById('message-input').focus();
    }

    loadMessages(messages) {
        messages.forEach(message => {
            this.addMessage(message, false);
        });
        this.scrollToBottom();
    }

    sendMessage() {
        const input = document.getElementById('message-input');
        const content = input.value.trim();
        
        if (!content) return;

        this.socket.emit('message', { content });
        input.value = '';
        input.style.height = 'auto';
        this.stopTyping();
    }

    addMessage(message, animate = true) {
        const container = document.getElementById('messages-container');
        const messageEl = this.createMessageElement(message);
        
        if (animate) {
            messageEl.classList.add('message-enter');
        }

        container.appendChild(messageEl);

        // Handle new message notifications
        if (!this.isAtBottom && message.userId !== this.currentUser?.id) {
            this.unreadMessages++;
            this.showNewMessagesAlert();
        } else {
            this.scrollToBottom();
        }
    }

    createMessageElement(message) {
        const isOwnMessage = message.userId === this.currentUser?.id;
        const messageEl = document.createElement('div');
        messageEl.className = `flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`;

        const time = new Date(message.timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });

        if (message.type === 'text') {
            messageEl.innerHTML = `
                <div class="max-w-xs lg:max-w-md ${isOwnMessage ? 'bg-blue-600' : 'bg-gray-700'} rounded-2xl px-4 py-3 shadow-lg">
                    ${!isOwnMessage ? `<div class="text-xs font-semibold text-blue-400 mb-1">${this.escapeHtml(message.displayName)}</div>` : ''}
                    <div class="text-white break-words">${this.escapeHtml(message.content)}</div>
                    <div class="text-xs text-gray-300 mt-1 opacity-75">${time}</div>
                </div>
            `;
        } else if (message.type === 'file') {
            const fileEl = this.createFileElement(message.file, isOwnMessage);
            messageEl.innerHTML = `
                <div class="max-w-xs lg:max-w-md ${isOwnMessage ? 'bg-blue-600' : 'bg-gray-700'} rounded-2xl p-4 shadow-lg">
                    ${!isOwnMessage ? `<div class="text-xs font-semibold text-blue-400 mb-2">${this.escapeHtml(message.displayName)}</div>` : ''}
                    ${fileEl}
                    <div class="text-xs text-gray-300 mt-2 opacity-75">${time}</div>
                </div>
            `;
        }

        return messageEl;
    }

    createFileElement(file, isOwnMessage) {
        const isImage = file.mimetype.startsWith('image/');
        const fileSize = this.formatFileSize(file.size);
        const fileIcon = this.getFileIcon(file.mimetype, file.originalName);

        if (isImage) {
            return `
                <div class="file-preview-container">
                    <img src="${file.url}" 
                         alt="${this.escapeHtml(file.originalName)}" 
                         class="image-preview rounded-lg cursor-pointer" 
                         onclick="chatApp.openLightbox('${file.url}', '${this.escapeHtml(file.originalName)}')">
                    <div class="mt-2">
                        <div class="text-white font-medium text-sm">${this.escapeHtml(file.originalName)}</div>
                        <div class="text-gray-300 text-xs">${fileSize}</div>
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="flex items-center space-x-3 p-3 bg-gray-600/30 rounded-lg">
                    <div class="file-icon ${fileIcon.class}">
                        <i class="fas fa-${fileIcon.icon}"></i>
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="text-white font-medium text-sm truncate">${this.escapeHtml(file.originalName)}</div>
                        <div class="text-gray-300 text-xs">${fileSize}</div>
                    </div>
                    <a href="${file.url}" 
                       download="${this.escapeHtml(file.originalName)}" 
                       class="text-blue-400 hover:text-blue-300 transition-colors duration-300">
                        <i class="fas fa-download"></i>
                    </a>
                </div>
            `;
        }
    }

    getFileIcon(mimetype, filename) {
        const ext = filename.split('.').pop()?.toLowerCase() || '';
        
        if (mimetype.startsWith('image/')) {
            return { class: 'image', icon: 'image' };
        } else if (mimetype.startsWith('video/')) {
            return { class: 'video', icon: 'video' };
        } else if (mimetype.startsWith('audio/')) {
            return { class: 'audio', icon: 'music' };
        } else if (['pdf'].includes(ext)) {
            return { class: 'pdf', icon: 'file-pdf' };
        } else if (['doc', 'docx'].includes(ext)) {
            return { class: 'doc', icon: 'file-word' };
        } else if (['xls', 'xlsx'].includes(ext)) {
            return { class: 'xls', icon: 'file-excel' };
        } else if (['ppt', 'pptx'].includes(ext)) {
            return { class: 'ppt', icon: 'file-powerpoint' };
        } else if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
            return { class: 'zip', icon: 'file-archive' };
        } else if (['js', 'html', 'css', 'json', 'xml', 'py', 'java', 'cpp', 'c'].includes(ext)) {
            return { class: 'code', icon: 'file-code' };
        } else if (['txt', 'md', 'rtf'].includes(ext)) {
            return { class: 'text', icon: 'file-alt' };
        } else if (['ai', 'psd'].includes(ext)) {
            return { class: 'default', icon: 'palette' };
        } else {
            return { class: 'default', icon: 'file' };
        }
    }

    addSystemMessage(content, type) {
        const container = document.getElementById('messages-container');
        const messageEl = document.createElement('div');
        messageEl.className = 'flex justify-center message-enter';

        const iconClass = type === 'join' ? 'fa-sign-in-alt text-emerald-400' : 'fa-sign-out-alt text-red-400';
        
        messageEl.innerHTML = `
            <div class="bg-gray-800 rounded-full px-4 py-2 text-sm text-gray-300 flex items-center space-x-2">
                <i class="fas ${iconClass}"></i>
                <span>${content}</span>
            </div>
        `;

        container.appendChild(messageEl);
        
        if (this.isAtBottom) {
            this.scrollToBottom();
        }
    }

    handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (file.size > 100 * 1024 * 1024) { // 100MB
            this.showError('File size must be less than 100MB.');
            return;
        }

        this.showFilePreview(file);
    }

    showFilePreview(file) {
        const preview = document.getElementById('file-preview');
        const filename = document.getElementById('preview-filename');
        const size = document.getElementById('preview-size');

        filename.textContent = file.name;
        size.textContent = this.formatFileSize(file.size);

        preview.classList.remove('hidden');
    }

    cancelUpload() {
        document.getElementById('file-input').value = '';
        document.getElementById('file-preview').classList.add('hidden');
        document.getElementById('upload-progress').classList.add('hidden');
    }

    async uploadFile() {
        const fileInput = document.getElementById('file-input');
        const file = fileInput.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        const progressDiv = document.getElementById('upload-progress');
        const progressBar = document.getElementById('progress-bar');
        const progressText = document.getElementById('progress-text');

        progressDiv.classList.remove('hidden');

        try {
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Upload failed');
            }

            const fileInfo = await response.json();
            this.socket.emit('file-message', fileInfo);

            this.cancelUpload();
        } catch (error) {
            this.showError(error.message);
            this.cancelUpload();
        }
    }

    handleTyping() {
        this.socket.emit('typing', true);

        clearTimeout(this.typingTimeout);
        this.typingTimeout = setTimeout(() => {
            this.stopTyping();
        }, 1000);
    }

    stopTyping() {
        this.socket.emit('typing', false);
        clearTimeout(this.typingTimeout);
    }

    updateTypingIndicator(typingUsers) {
        const indicator = document.getElementById('typing-indicator');
        const usersSpan = document.getElementById('typing-users');

        if (typingUsers.length === 0) {
            indicator.classList.add('hidden');
            return;
        }

        let text;
        if (typingUsers.length === 1) {
            text = `${typingUsers[0]} is typing...`;
        } else if (typingUsers.length === 2) {
            text = `${typingUsers[0]} and ${typingUsers[1]} are typing...`;
        } else {
            text = `${typingUsers.length} people are typing...`;
        }

        usersSpan.textContent = text;
        indicator.classList.remove('hidden');
    }

    updateUsersList(users) {
        const usersList = document.getElementById('users-list');
        const userCount = document.getElementById('user-count');

        userCount.textContent = users.length;
        usersList.innerHTML = '';

        users.forEach(user => {
            const userEl = document.createElement('div');
            userEl.className = 'flex items-center space-x-3 p-2 rounded-lg bg-gray-700/50';

            const isCurrentUser = user.id === this.currentUser?.id;
            const displayName = isCurrentUser ? `${user.displayName} (You)` : user.displayName;

            userEl.innerHTML = `
                <div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-semibold text-sm user-online">
                    ${user.displayName.charAt(0).toUpperCase()}
                </div>
                <span class="text-white text-sm font-medium">${this.escapeHtml(displayName)}</span>
            `;

            usersList.appendChild(userEl);
        });
    }

    handleScroll() {
        const container = document.getElementById('messages-container');
        const threshold = 50;
        
        this.isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
        
        if (this.isAtBottom) {
            this.hideNewMessagesAlert();
            this.unreadMessages = 0;
        }
    }

    scrollToBottom() {
        const container = document.getElementById('messages-container');
        container.scrollTop = container.scrollHeight;
        this.isAtBottom = true;
    }

    showNewMessagesAlert() {
        const alert = document.getElementById('new-messages-alert');
        alert.textContent = `${this.unreadMessages} new message${this.unreadMessages > 1 ? 's' : ''}`;
        alert.classList.remove('hidden');
    }

    hideNewMessagesAlert() {
        document.getElementById('new-messages-alert').classList.add('hidden');
    }

    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.toggle('mobile-open');
    }

    openLightbox(url, filename) {
        const lightbox = document.getElementById('image-lightbox');
        const image = document.getElementById('lightbox-image');
        
        image.src = url;
        image.alt = filename;
        lightbox.classList.remove('hidden');
    }

    closeLightbox() {
        document.getElementById('image-lightbox').classList.add('hidden');
    }

    leaveChat() {
        if (confirm('Are you sure you want to leave the chat?')) {
            this.clearSessionData();
            this.socket.emit('manual-leave');
            this.socket.disconnect();
            location.reload();
        }
    }

    showError(message) {
        const errorDiv = document.getElementById('error-message');
        const errorSpan = errorDiv.querySelector('span');
        
        errorSpan.textContent = message;
        errorDiv.classList.remove('hidden');

        setTimeout(() => {
            errorDiv.classList.add('hidden');
        }, 5000);
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Session management methods
    getOrCreateSessionId() {
        let sessionId = sessionStorage.getItem('chatSessionId');
        if (!sessionId) {
            sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('chatSessionId', sessionId);
        }
        return sessionId;
    }

    storeSessionData(displayName) {
        const sessionData = {
            displayName: displayName,
            sessionId: this.sessionId,
            joinedAt: new Date().toISOString()
        };
        sessionStorage.setItem('chatSessionData', JSON.stringify(sessionData));
    }

    clearSessionData() {
        sessionStorage.removeItem('chatSessionData');
        sessionStorage.removeItem('chatSessionId');
    }

    checkExistingSession() {
        const sessionData = sessionStorage.getItem('chatSessionData');
        if (sessionData) {
            try {
                const data = JSON.parse(sessionData);
                // Auto-rejoin with stored session data
                this.socket.emit('rejoin', { sessionId: data.sessionId, displayName: data.displayName });
            } catch (e) {
                console.error('Error parsing session data:', e);
                this.clearSessionData();
            }
        }
    }

    // GitHub Pages detection and handling
    isGitHubPages() {
        return window.location.hostname.includes('github.io') || 
               window.location.hostname.includes('github.com') ||
               window.location.hostname === 'localhost' && !this.isLocalServerRunning();
    }

    isLocalServerRunning() {
        // Try to detect if local server is running by checking for specific ports
        return window.location.port === '3000' || window.location.port === '8080';
    }

    showGitHubPagesMessage() {
        // Hide the landing page and show GitHub Pages message
        const landingPage = document.getElementById('landing-page');
        const chatInterface = document.getElementById('chat-interface');
        
        // Create GitHub Pages message overlay
        const messageOverlay = document.createElement('div');
        messageOverlay.className = 'fixed inset-0 bg-gray-900 bg-opacity-95 flex items-center justify-center p-4 z-50';
        messageOverlay.innerHTML = `
            <div class="bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
                <div class="w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                    <img src="White logo.png" alt="SparowTech Logo" class="w-16 h-16 object-contain">
                </div>
                
                <h1 class="text-3xl font-bold bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent mb-4">
                    SparowTech Chat
                </h1>
                
                <div class="mb-6 p-4 bg-yellow-600/20 border border-yellow-600 rounded-lg">
                    <div class="flex items-center mb-2">
                        <i class="fas fa-exclamation-triangle text-yellow-400 mr-2"></i>
                        <h3 class="text-yellow-400 font-semibold">Server Required</h3>
                    </div>
                    <p class="text-yellow-200 text-sm">
                        This chat application requires a Node.js server to function. GitHub Pages only serves static files.
                    </p>
                </div>

                <div class="space-y-4">
                    <a href="demo.html" class="block w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105">
                        <i class="fas fa-eye mr-2"></i>
                        View Static Demo
                    </a>
                    
                    <a href="https://github.com/dev3434patel/chatroom" class="block w-full py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-all duration-300">
                        <i class="fab fa-github mr-2"></i>
                        View on GitHub
                    </a>
                </div>

                <div class="mt-6 p-4 bg-gray-700 rounded-lg text-left">
                    <h4 class="text-white font-semibold mb-2">🚀 To Run the Full Chat App:</h4>
                    <div class="text-sm text-gray-300 space-y-1">
                        <p><strong>1. Clone the repository:</strong></p>
                        <code class="block bg-gray-800 p-2 rounded text-xs break-all">git clone https://github.com/dev3434patel/chatroom.git</code>
                        
                        <p class="mt-2"><strong>2. Install dependencies:</strong></p>
                        <code class="block bg-gray-800 p-2 rounded text-xs">npm install</code>
                        
                        <p class="mt-2"><strong>3. Start the server:</strong></p>
                        <code class="block bg-gray-800 p-2 rounded text-xs">npm start</code>
                        
                        <p class="mt-2"><strong>4. Open:</strong> <span class="text-blue-400">http://localhost:3000</span></p>
                    </div>
                </div>

                <div class="mt-4 text-xs text-gray-400">
                    <p>Or deploy to Railway, Render, Heroku, or DigitalOcean for a live version.</p>
                </div>
            </div>
        `;

        document.body.appendChild(messageOverlay);
        
        // Hide the original landing page
        if (landingPage) {
            landingPage.style.display = 'none';
        }
        if (chatInterface) {
            chatInterface.style.display = 'none';
        }
    }
}

// Initialize the chat app
const chatApp = new ChatApp();

// Handle file upload when send button is clicked with file selected
document.getElementById('send-button').addEventListener('click', async () => {
    const fileInput = document.getElementById('file-input');
    if (fileInput.files.length > 0) {
        await chatApp.uploadFile();
    }
});

// Handle enter key for file upload
document.getElementById('message-input').addEventListener('keydown', async (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        const fileInput = document.getElementById('file-input');
        if (fileInput.files.length > 0) {
            e.preventDefault();
            await chatApp.uploadFile();
        }
    }
});
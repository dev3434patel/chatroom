class ClientChatApp {
    constructor() {
        this.currentUser = null;
        this.users = new Map();
        this.messages = [];
        this.typingUsers = new Set();
        this.isAtBottom = true;
        this.unreadMessages = 0;
        this.typingTimeout = null;
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupAutoResize();
        this.loadStoredData();
        this.startCleanupInterval();
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
            this.saveData();
        });

        // Periodic save
        setInterval(() => {
            this.saveData();
        }, 5000); // Save every 5 seconds
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

        // Check if room is full
        if (this.users.size >= 4) {
            this.showError('Room is full (4/4). Please try again later.');
            return;
        }

        const userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        this.currentUser = {
            id: userId,
            displayName: displayName,
            joinedAt: new Date()
        };

        this.users.set(userId, this.currentUser);
        this.showChatInterface();
        this.loadMessages();
        this.updateUsersList();
        this.saveData();
    }

    showChatInterface() {
        document.getElementById('landing-page').classList.add('hidden');
        document.getElementById('chat-interface').classList.remove('hidden');
        document.getElementById('message-input').focus();
    }

    sendMessage() {
        const input = document.getElementById('message-input');
        const content = input.value.trim();
        
        if (!content) return;

        const message = {
            id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            userId: this.currentUser.id,
            displayName: this.currentUser.displayName,
            content: content,
            timestamp: new Date(),
            type: 'text'
        };

        this.messages.push(message);
        this.addMessage(message);
        input.value = '';
        input.style.height = 'auto';
        this.stopTyping();
        this.saveData();
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
                         onclick="clientChatApp.openLightbox('${file.url}', '${this.escapeHtml(file.originalName)}')">
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

    handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (file.size > 100 * 1024 * 1024) { // 100MB
            this.showError('File size must be less than 100MB.');
            return;
        }

        this.uploadFile(file);
    }

    uploadFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const fileInfo = {
                id: 'file_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                filename: file.name,
                originalName: file.name,
                size: file.size,
                mimetype: file.type,
                uploadedAt: new Date(),
                url: e.target.result
            };

            const message = {
                id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                userId: this.currentUser.id,
                displayName: this.currentUser.displayName,
                timestamp: new Date(),
                type: 'file',
                file: fileInfo
            };

            this.messages.push(message);
            this.addMessage(message);
            this.cancelUpload();
            this.saveData();
        };
        reader.readAsDataURL(file);
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
    }

    handleTyping() {
        this.typingUsers.add(this.currentUser.displayName);
        this.updateTypingIndicator();

        clearTimeout(this.typingTimeout);
        this.typingTimeout = setTimeout(() => {
            this.stopTyping();
        }, 1000);
    }

    stopTyping() {
        this.typingUsers.delete(this.currentUser.displayName);
        this.updateTypingIndicator();
        clearTimeout(this.typingTimeout);
    }

    updateTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        const usersSpan = document.getElementById('typing-users');

        if (this.typingUsers.size === 0) {
            indicator.classList.add('hidden');
            return;
        }

        let text;
        if (this.typingUsers.size === 1) {
            text = `${Array.from(this.typingUsers)[0]} is typing...`;
        } else if (this.typingUsers.size === 2) {
            const users = Array.from(this.typingUsers);
            text = `${users[0]} and ${users[1]} are typing...`;
        } else {
            text = `${this.typingUsers.size} people are typing...`;
        }

        usersSpan.textContent = text;
        indicator.classList.remove('hidden');
    }

    updateUsersList() {
        const usersList = document.getElementById('users-list');
        const userCount = document.getElementById('user-count');

        userCount.textContent = this.users.size;
        usersList.innerHTML = '';

        this.users.forEach(user => {
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
            this.users.delete(this.currentUser.id);
            this.currentUser = null;
            this.clearStoredData();
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

    // Data persistence methods
    saveData() {
        const data = {
            users: Array.from(this.users.entries()),
            messages: this.messages,
            currentUser: this.currentUser,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem('sparowtech-chat-data', JSON.stringify(data));
    }

    loadStoredData() {
        const stored = localStorage.getItem('sparowtech-chat-data');
        if (stored) {
            try {
                const data = JSON.parse(stored);
                
                // Check if data is not too old (7 days)
                const dataAge = new Date() - new Date(data.timestamp);
                if (dataAge > 7 * 24 * 60 * 60 * 1000) {
                    this.clearStoredData();
                    return;
                }

                this.users = new Map(data.users || []);
                this.messages = data.messages || [];
                this.currentUser = data.currentUser;

                if (this.currentUser) {
                    this.showChatInterface();
                    this.loadMessages();
                    this.updateUsersList();
                }
            } catch (e) {
                console.error('Error loading stored data:', e);
                this.clearStoredData();
            }
        }
    }

    clearStoredData() {
        localStorage.removeItem('sparowtech-chat-data');
    }

    loadMessages() {
        const container = document.getElementById('messages-container');
        container.innerHTML = '';
        
        this.messages.forEach(message => {
            this.addMessage(message, false);
        });
        this.scrollToBottom();
    }

    startCleanupInterval() {
        // Clean up old messages every hour
        setInterval(() => {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - 7);
            
            const initialLength = this.messages.length;
            this.messages = this.messages.filter(msg => new Date(msg.timestamp) > cutoffDate);
            
            if (this.messages.length !== initialLength) {
                this.loadMessages();
                this.saveData();
            }
        }, 60 * 60 * 1000); // Every hour
    }
}

// Initialize the chat app
const clientChatApp = new ClientChatApp();

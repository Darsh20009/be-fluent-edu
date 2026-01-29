let socket;
let myStream;
let peers = {};
let roomId = new URLSearchParams(window.location.search).get('roomId');
let userId = new URLSearchParams(window.location.search).get('userId');
let userName = new URLSearchParams(window.location.search).get('userName');
let role = new URLSearchParams(window.location.search).get('role');

const videoGrid = document.getElementById('video-grid');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');
const chatMessages = document.getElementById('chat-messages');
const handBtn = document.getElementById('hand-btn');
const screenBtn = document.getElementById('screen-btn');
const recordBtn = document.getElementById('record-btn');

let mediaRecorder;
let recordedChunks = [];

async function init() {
    socket = io('/');
    
    try {
        myStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        });
        
        const myVideo = createVideoElement(userName, true);
        addVideoStream(myVideo, myStream);

        socket.emit('join-room', roomId, userId, userName);

        socket.on('user-connected', (userId, userName) => {
            console.log('User connected:', userName);
            // In a full implementation, we would initiate WebRTC offer/answer here
            appendMessage('النظام', `${userName} انضم إلى الحصة`);
        });

        socket.on('receive-message', (data) => {
            appendMessage(data.user, data.message);
        });

        socket.on('hand-raised', (data) => {
            appendMessage('النظام', `${data.userName} رفع يده ✋`);
        });

        socket.on('user-disconnected', (userId) => {
            appendMessage('النظام', `غادر أحد المستخدمين`);
        });

    } catch (err) {
        console.error('Failed to get local stream', err);
        alert('يرجى السماح بالوصول للكاميرا والمايكروفون');
    }
}

function addVideoStream(video, stream) {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    });
    videoGrid.append(video);
}

function createVideoElement(label, isSelf = false) {
    const div = document.createElement('div');
    div.className = 'video-item';
    const video = document.createElement('video');
    if (isSelf) video.muted = true;
    const p = document.createElement('p');
    p.innerText = label;
    p.className = 'video-label';
    div.append(video);
    div.append(p);
    return video;
}

function appendMessage(user, message) {
    const div = document.createElement('div');
    div.className = 'message';
    div.innerHTML = `<strong>${user}:</strong> ${message}`;
    chatMessages.append(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

sendBtn.onclick = () => {
    const message = chatInput.value;
    if (message) {
        socket.emit('send-message', { roomId, user: userName, message });
        appendMessage('أنت', message);
        chatInput.value = '';
    }
};

handBtn.onclick = () => {
    socket.emit('raise-hand', { roomId, userId, userName });
    handBtn.classList.toggle('active');
};

screenBtn.onclick = async () => {
    try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const videoElement = createVideoElement(`${userName} (Screen Share)`);
        addVideoStream(videoElement, screenStream);
        screenBtn.classList.add('active');
        
        screenStream.getVideoTracks()[0].onended = () => {
            videoElement.parentElement.remove();
            screenBtn.classList.remove('active');
        };
    } catch (err) {
        console.error('Error sharing screen:', err);
    }
};

recordBtn.onclick = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
        recordBtn.classList.remove('active');
        recordBtn.innerText = '⏺️';
    } else {
        recordedChunks = [];
        mediaRecorder = new MediaRecorder(myStream);
        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) recordedChunks.push(e.data);
        };
        mediaRecorder.onstop = () => {
            const blob = new Blob(recordedChunks, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `BeFluent-Meet-${new Date().getTime()}.webm`;
            document.body.appendChild(a);
            a.click();
            setTimeout(() => {
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            }, 100);
            
            appendMessage('النظام', 'تم حفظ تسجيل الحصة على جهازك بنجاح');
        };
        mediaRecorder.start();
        recordBtn.classList.add('active');
        recordBtn.innerText = '⏹️';
        appendMessage('النظام', 'بدأ تسجيل الحصة...');
    }
};

document.getElementById('mic-btn').onclick = () => {
    const enabled = myStream.getAudioTracks()[0].enabled;
    myStream.getAudioTracks()[0].enabled = !enabled;
    document.getElementById('mic-btn').classList.toggle('active', !enabled);
    document.getElementById('mic-btn').innerText = enabled ? '🔇' : '🎙️';
};

document.getElementById('cam-btn').onclick = () => {
    const enabled = myStream.getVideoTracks()[0].enabled;
    myStream.getVideoTracks()[0].enabled = !enabled;
    document.getElementById('cam-btn').classList.toggle('active', !enabled);
    document.getElementById('cam-btn').innerText = enabled ? '📷 (off)' : '📷';
};

document.getElementById('chat-btn').onclick = () => {
    document.getElementById('chat-panel').classList.toggle('hidden');
};

document.getElementById('leave-btn').onclick = () => {
    if (confirm('هل أنت متأكد من مغادرة الحصة؟')) {
        window.location.href = '/dashboard';
    }
};

init();

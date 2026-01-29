let socket;
let myStream;
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
const recordingStatus = document.getElementById('recording-status');

let mediaRecorder;
let recordedChunks = [];
let screenStream;

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

        socket.on('user-connected', (data) => {
            appendMessage('النظام', `${data.userName} انضم إلى الحصة`);
        });

        socket.on('receive-message', (data) => {
            appendMessage(data.user, data.message);
        });

        socket.on('hand-raised', (data) => {
            appendMessage('النظام', `✋ ${data.userName} قام برفع يده`);
        });

        socket.on('user-disconnected', (data) => {
            appendMessage('النظام', `غادر أحد المستخدمين`);
        });

    } catch (err) {
        console.error('Failed to get local stream', err);
        alert('يرجى السماح بالوصول للكاميرا والمايكروفون لبدء الحصة');
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
    if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
        screenStream = null;
        screenBtn.classList.remove('active');
        return;
    }
    try {
        screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const videoElement = createVideoElement(`${userName} (Screen Share)`);
        addVideoStream(videoElement, screenStream);
        screenBtn.classList.add('active');
        
        screenStream.getVideoTracks()[0].onended = () => {
            videoElement.parentElement.remove();
            screenBtn.classList.remove('active');
            screenStream = null;
        };
    } catch (err) {
        console.error('Error sharing screen:', err);
    }
};

recordBtn.onclick = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
        recordBtn.classList.remove('active');
        recordingStatus.classList.add('hidden');
    } else {
        recordedChunks = [];
        // Combine audio and video for recording
        const tracks = [...myStream.getTracks()];
        if (screenStream) tracks.push(...screenStream.getTracks());
        
        const combinedStream = new MediaStream(tracks);
        mediaRecorder = new MediaRecorder(combinedStream);
        
        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) recordedChunks.push(e.data);
        };
        
        mediaRecorder.onstop = async () => {
            const blob = new Blob(recordedChunks, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            
            // Download to teacher's device
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `BeFluent-Meet-${new Date().getTime()}.webm`;
            document.body.appendChild(a);
            a.click();
            
            // Success notification
            appendMessage('النظام', '✅ تم حفظ تسجيل الحصة على جهازك. سيتم الآن تنظيف الذاكرة المؤقتة.');
            
            setTimeout(() => {
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            }, 100);
        };
        
        mediaRecorder.start();
        recordBtn.classList.add('active');
        recordingStatus.classList.remove('hidden');
        appendMessage('النظام', '🔴 بدأ تسجيل الحصة...');
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

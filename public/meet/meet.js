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
const peerConnections = new Map();
const remoteStreams = new Map();

const ICE_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' }
    ]
};

async function init() {
    socket = io('/', { path: '/api/socket/io' });
    
    // Check for stealth mode (Admin/Manager)
    const isStealth = role === 'manager' || role === 'admin';

    try {
        if (!isStealth) {
            myStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });
            
            const myVideoContainer = createVideoContainer(userName + ' (أنت)', true);
            const myVideo = myVideoContainer.querySelector('video');
            myVideo.srcObject = myStream;
            myVideo.muted = true;
            videoGrid.appendChild(myVideoContainer);
        } else {
            // Stealth mode only needs a placeholder or no video
            appendMessage('النظام', '🕵️ أنت في وضع المشاهدة الخفي');
            socket.emit('stealth-join', roomId);
        }

        if (!isStealth) {
            socket.emit('join-room', roomId, userId, userName);
        }

        socket.on('existing-users', async (users) => {
            console.log('📋 Existing users:', users);
            for (const user of users) {
                await createPeerConnection(user.socketId, user.userName, true);
            }
        });

        socket.on('user-connected', async (data) => {
            console.log(`👤 ${data.userName} joined`);
            appendMessage('النظام', `${data.userName} انضم إلى الحصة`);
        });

        socket.on('offer', async (data) => {
            console.log('📥 Received offer from:', data.fromSocketId);
            await handleOffer(data);
        });

        socket.on('answer', async (data) => {
            console.log('📥 Received answer from:', data.fromSocketId);
            await handleAnswer(data);
        });

        socket.on('ice-candidate', async (data) => {
            await handleIceCandidate(data);
        });

        socket.on('toggle-mute', (data) => {
            const audioTrack = myStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !data.mute;
                document.getElementById('mic-btn').classList.toggle('active', audioTrack.enabled);
                document.getElementById('mic-btn').innerText = audioTrack.enabled ? '🎙️' : '🔇';
                appendMessage('النظام', data.mute ? '🔇 تم كتم صوتك من قبل المعلم' : '🎙️ تم تفعيل المايكروفون');
            }
        });

        socket.on('receive-message', (data) => {
            appendMessage(data.user, data.message);
        });

        socket.on('hand-raised', (data) => {
            appendMessage('النظام', `✋ ${data.userName} قام برفع يده`);
        });

        socket.on('user-disconnected', (data) => {
            console.log('❌ User disconnected:', data.socketId);
            appendMessage('النظام', `غادر أحد المستخدمين`);
            
            if (peerConnections.has(data.socketId)) {
                peerConnections.get(data.socketId).close();
                peerConnections.delete(data.socketId);
            }
            
            const videoContainer = document.getElementById(`video-${data.socketId}`);
            if (videoContainer) {
                videoContainer.remove();
            }
        });

    } catch (err) {
        console.error('Failed to get local stream', err);
        appendMessage('النظام', '⚠️ يرجى السماح بالوصول للكاميرا والمايكروفون');
        alert('يرجى السماح بالوصول للكاميرا والمايكروفون لبدء الحصة');
    }
}

async function createPeerConnection(targetSocketId, targetUserName, isInitiator) {
    console.log(`🔗 Creating peer connection with ${targetUserName} (initiator: ${isInitiator})`);
    
    const pc = new RTCPeerConnection(ICE_SERVERS);
    peerConnections.set(targetSocketId, pc);
    
    myStream.getTracks().forEach(track => {
        pc.addTrack(track, myStream);
    });
    
    pc.onicecandidate = (event) => {
        if (event.candidate) {
            socket.emit('ice-candidate', {
                candidate: event.candidate,
                targetSocketId: targetSocketId
            });
        }
    };
    
    pc.ontrack = (event) => {
        console.log('🎥 Received remote track from:', targetSocketId);
        let videoContainer = document.getElementById(`video-${targetSocketId}`);
        
        if (!videoContainer) {
            videoContainer = createVideoContainer(targetUserName, false);
            videoContainer.id = `video-${targetSocketId}`;
            videoGrid.appendChild(videoContainer);
        }
        
        const video = videoContainer.querySelector('video');
        if (event.streams[0]) {
            video.srcObject = event.streams[0];
            remoteStreams.set(targetSocketId, event.streams[0]);
        }
    };
    
    pc.onconnectionstatechange = () => {
        console.log(`📡 Connection state with ${targetUserName}:`, pc.connectionState);
        if (pc.connectionState === 'connected') {
            appendMessage('النظام', `✅ متصل مع ${targetUserName}`);
        }
    };
    
    if (isInitiator) {
        try {
            // Only send offer if not in stealth mode (Admin check)
            if (role !== 'manager' && role !== 'admin') {
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                
                socket.emit('offer', {
                    offer: offer,
                    targetSocketId: targetSocketId,
                    userName: userName
                });
            }
        } catch (err) {
            console.error('Error creating offer:', err);
        }
    }
    
    return pc;
}

async function handleOffer(data) {
    let pc = peerConnections.get(data.fromSocketId);
    
    if (!pc) {
        pc = await createPeerConnection(data.fromSocketId, data.userName, false);
    }
    
    try {
        await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        
        socket.emit('answer', {
            answer: answer,
            targetSocketId: data.fromSocketId
        });
    } catch (err) {
        console.error('Error handling offer:', err);
    }
}

async function handleAnswer(data) {
    const pc = peerConnections.get(data.fromSocketId);
    if (pc) {
        try {
            await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
        } catch (err) {
            console.error('Error handling answer:', err);
        }
    }
}

async function handleIceCandidate(data) {
    const pc = peerConnections.get(data.fromSocketId);
    if (pc) {
        try {
            await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        } catch (err) {
            console.error('Error adding ICE candidate:', err);
        }
    }
}

function createVideoContainer(label, isSelf = false) {
    const container = document.createElement('div');
    container.className = 'video-item';
    
    const video = document.createElement('video');
    video.autoplay = true;
    video.playsInline = true;
    if (isSelf) video.muted = true;
    
    const labelEl = document.createElement('p');
    labelEl.className = 'video-label';
    labelEl.innerText = label;
    
    container.appendChild(video);
    container.appendChild(labelEl);
    
    return container;
}

function appendMessage(user, message) {
    const div = document.createElement('div');
    div.className = 'message';
    div.innerHTML = `<strong>${user}:</strong> ${message}`;
    chatMessages.appendChild(div);
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

chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendBtn.click();
    }
});

handBtn.onclick = () => {
    socket.emit('raise-hand', { roomId, userId, userName });
    handBtn.classList.toggle('active');
    appendMessage('النظام', '✋ رفعت يدك');
};

screenBtn.onclick = async () => {
    if (screenStream) {
        // Stop screen sharing
        screenStream.getTracks().forEach(track => track.stop());
        
        // Revert to camera stream for all peers
        const videoTrack = myStream.getVideoTracks()[0];
        peerConnections.forEach(pc => {
            const sender = pc.getSenders().find(s => s.track && s.track.kind === 'video');
            if (sender) sender.replaceTrack(videoTrack);
        });

        const screenContainer = document.getElementById('screen-share');
        if (screenContainer) screenContainer.remove();
        
        screenBtn.classList.remove('active');
        screenBtn.innerText = '🖥️';
        screenStream = null;
        appendMessage('النظام', '📴 توقفت مشاركة الشاشة');
        return;
    }

    try {
        screenStream = await navigator.mediaDevices.getDisplayMedia({ 
            video: {
                cursor: "always"
            },
            audio: false 
        });

        // Add local preview
        const videoContainer = createVideoContainer(`${userName} (مشاركة الشاشة)`);
        videoContainer.id = 'screen-share';
        const video = videoContainer.querySelector('video');
        video.srcObject = screenStream;
        videoGrid.appendChild(videoContainer);
        
        // Replace track for all peers
        const screenTrack = screenStream.getVideoTracks()[0];
        peerConnections.forEach(pc => {
            const sender = pc.getSenders().find(s => s.track && s.track.kind === 'video');
            if (sender) sender.replaceTrack(screenTrack);
        });

        screenBtn.classList.add('active');
        screenBtn.innerText = '🖥️❌';
        appendMessage('النظام', '🖥️ بدأت مشاركة الشاشة');
        
        screenTrack.onended = () => {
            if (screenStream) screenBtn.click();
        };
    } catch (err) {
        console.error('Error sharing screen:', err);
        appendMessage('النظام', '⚠️ فشل بدء مشاركة الشاشة');
    }
};

// Add Copy Link Functionality
document.getElementById('copy-link-btn').onclick = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
        toast.success('تم نسخ رابط الحصة!');
        appendMessage('النظام', '🔗 تم نسخ رابط الحصة بنجاح');
    }).catch(err => {
        console.error('Failed to copy:', err);
        // Fallback
        const input = document.createElement('input');
        input.value = url;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        appendMessage('النظام', '🔗 تم نسخ رابط الحصة');
    });
};

recordBtn.onclick = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
        recordBtn.classList.remove('active');
        recordingStatus.classList.add('hidden');
    } else {
        recordedChunks = [];
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
            
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `BeFluent-Meet-${new Date().getTime()}.webm`;
            document.body.appendChild(a);
            a.click();
            
            appendMessage('النظام', '✅ تم حفظ تسجيل الحصة على جهازك');
            
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
    const audioTrack = myStream.getAudioTracks()[0];
    if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        document.getElementById('mic-btn').classList.toggle('active', audioTrack.enabled);
        document.getElementById('mic-btn').innerText = audioTrack.enabled ? '🎙️' : '🔇';
        appendMessage('النظام', audioTrack.enabled ? '🎙️ المايكروفون مفعل' : '🔇 المايكروفون مغلق');
    }
};

document.getElementById('cam-btn').onclick = () => {
    const videoTrack = myStream.getVideoTracks()[0];
    if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        document.getElementById('cam-btn').classList.toggle('active', videoTrack.enabled);
        document.getElementById('cam-btn').innerText = videoTrack.enabled ? '📷' : '📷❌';
        appendMessage('النظام', videoTrack.enabled ? '📷 الكاميرا مفعلة' : '📷❌ الكاميرا مغلقة');
    }
};

// Add Mute All for Teachers/Admins
if (role === 'teacher' || role === 'admin' || role === 'manager') {
    const muteAllBtn = document.createElement('button');
    muteAllBtn.id = 'mute-all-btn';
    muteAllBtn.className = 'control-btn';
    muteAllBtn.innerHTML = '🔇 الكل';
    muteAllBtn.title = 'كتم صوت الجميع';
    document.querySelector('.controls').appendChild(muteAllBtn);

    muteAllBtn.onclick = () => {
        if (confirm('هل تريد كتم صوت جميع الطلاب؟')) {
            socket.emit('mute-all', { roomId });
            appendMessage('النظام', '🔇 تم كتم صوت الجميع');
        }
    };
}

document.getElementById('chat-btn').onclick = () => {
    document.getElementById('chat-panel').classList.toggle('hidden');
};

document.getElementById('leave-btn').onclick = () => {
    if (confirm('هل أنت متأكد من مغادرة الحصة؟')) {
        peerConnections.forEach(pc => pc.close());
        if (myStream) {
            myStream.getTracks().forEach(track => track.stop());
        }
        if (screenStream) {
            screenStream.getTracks().forEach(track => track.stop());
        }
        window.location.href = '/dashboard';
    }
};

init();

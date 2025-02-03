import { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';

function ViewerRoom() {
    const { roomId } = useParams();
    const socket = useSocket();
    const videoRef = useRef();
    const peerConnectionRef = useRef(null);

    useEffect(() => {
        if (!socket) return;

        const createPeerConnection = (sharerId) => {
            const peerConnection = new RTCPeerConnection({
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' }
                ]
            });

            peerConnection.ontrack = (event) => {
                console.log('Received track:', event);
                if (videoRef.current && event.streams[0]) {
                    videoRef.current.srcObject = event.streams[0];
                }
            };

            peerConnection.onicecandidate = (event) => {
                if (event.candidate) {
                    socket.emit('ice-candidate', {
                        roomId,
                        candidate: event.candidate,
                        recipientId: sharerId
                    });
                }
            };

            return peerConnection;
        };

        socket.emit('join-room', roomId);

        socket.on('offer', async ({ offer, sharerId }) => {
            try {
                // Close existing connection if any
                if (peerConnectionRef.current) {
                    peerConnectionRef.current.close();
                }

                const peerConnection = createPeerConnection(sharerId);
                peerConnectionRef.current = peerConnection;

                await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
                const answer = await peerConnection.createAnswer();
                await peerConnection.setLocalDescription(answer);

                socket.emit('answer', {
                    roomId,
                    answer,
                    sharerId
                });
            } catch (error) {
                console.error('Error handling offer:', error);
            }
        });

        socket.on('ice-candidate', async ({ candidate, senderId }) => {
            try {
                if (peerConnectionRef.current) {
                    await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
                }
            } catch (error) {
                console.error('Error adding ICE candidate:', error);
            }
        });

        socket.on('sharer-changed', (sharerId) => {
            if (!sharerId && peerConnectionRef.current) {
                peerConnectionRef.current.close();
                peerConnectionRef.current = null;
                if (videoRef.current) {
                    videoRef.current.srcObject = null;
                }
            }
        });

        return () => {
            if (peerConnectionRef.current) {
                peerConnectionRef.current.close();
                peerConnectionRef.current = null;
            }
            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }
            socket.off('offer');
            socket.off('ice-candidate');
            socket.off('sharer-changed');
        };
    }, [socket, roomId]);

    return (
        <div className="fixed inset-0 bg-black">
            <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-contain"
            />
            {!videoRef.current?.srcObject && (
                <div className="">
                    <div className="text-center">
                        <div className="animate-pulse text-white/60 text-xl mb-4">
                            Waiting for screen share...
                        </div>
                        <div className="text-white/40 text-sm">
                            The presenter will start sharing soon
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ViewerRoom;
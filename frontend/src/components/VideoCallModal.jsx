// VideoCallModal.jsx

function VideoCallModal({ isOpen, onClose, onAccept }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-4 rounded-lg shadow-lg">
                <h2 className="text-lg font-bold">영상 통화</h2>
                <p className="mt-2">영상 통화가 왔습니다. 수락하시겠습니까?</p>
                <div className="mt-4 flex justify-end">
                    <button onClick={onClose} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                        거절
                    </button>
                    <button onClick={onAccept} className="ml-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                        수락
                    </button>
                </div>
            </div>
        </div>
    );
}

export default VideoCallModal;

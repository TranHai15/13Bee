from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit  # Đảm bảo có Flask-SocketIO
from run import askModel

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")  # Đảm bảo WebSocket có thể nhận từ bất kỳ nguồn nào

@app.route('/api/data', methods=['POST'])
def receive_data():
    data = request.get_json()
    idSocket = data['idSocket']
    messages = data['messages']
    
    # Xử lý câu hỏi từ client và trả về câu trả lời
    res = askModel(messages, idSocket, socketio)  # Truyền socketio vào askModel

    # Phản hồi lại với một thông điệp (có thể gửi qua HTTP hoặc WebSocket nếu cần)
    response = {
        'message': 'Dữ liệu đã nhận thành công!',
        "can_answer": True,
        "role": "answer",
        "content": res,
        "idSocket": idSocket,
    }

    return jsonify(response), 200

# Sử dụng WebSocket để nhận và gửi tin nhắn realtime
@socketio.on('send_message')
def handle_send_message(data):
    """Lắng nghe sự kiện gửi tin nhắn từ client."""
    idSocket = data['idSocket']
    messages = data['messages']
    
    # Xử lý câu hỏi và trả về câu trả lời realtime
    result = askModel(messages, idSocket, socketio)  # Truyền socketio vào

    # Gửi lại câu trả lời qua WebSocket
    emit('receive_message', {
        'role': 'answer',
        'content': result,
        'idSocket': idSocket,
        'can_answer': True
    }, room=idSocket)  # Gửi về đúng client qua WebSocket

if __name__ == '__main__':
    socketio.run(app, debug=True)  # Sử dụng socketio.run thay vì app.run()

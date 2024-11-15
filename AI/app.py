# from flask import Flask, request, jsonify
# from run import askModel
# app = Flask(__name__)
# # print(askModel("Xin chào"))
# @app.route('/api/data', methods=['POST'])
# def receive_data():
#     # Lấy JSON từ yêu cầu
#     data = request.get_json()
#     # messages = data[1]['messages']
#     # idSocket = data[0]['idSocket']
#     idSocket = data['idSocket']
#     messages = data['messages']
#     # Xử lý dữ liệu (ví dụ, in ra console)
#     res = askModel(messages, idSocket)

#     # res = "Success"
#     # Phản hồi lại với một thông điệp
#     # res = "Server nhận dữ liệu thành công"
#     response = {
#         'message': 'Dữ liệu đã nhận thành công!',
#         "can_answer": True,
#         "role": "answer",
#         "content": res,
#         "idSocket": idSocket,
#     }
    
#     return jsonify(response), 200

# if __name__ == '__main__':
#     app.run(debug=True)


from flask import Flask, request, jsonify
from run import askModel
import threading

app = Flask(__name__)

@app.route('/api/data', methods=['POST'])
def receive_data():
    # Lấy JSON từ yêu cầu
    data = request.get_json()
    idSocket = data['idSocket']
    messages = data['messages']

    # Chạy hàm askModel trong một thread riêng và lấy kết quả
    result = run_in_thread(messages, idSocket)

    # Phản hồi lại với kết quả
    response = {
        'message': 'Dữ liệu đã nhận thành công!',
        "can_answer": True,
        "role": "answer",
        "content": result,
        "idSocket": idSocket,
    }
    return jsonify(response), 200

def run_in_thread(messages, idSocket):
    event = threading.Event()
    result = []

    def process_data():
        res = askModel(messages, idSocket)
        result.append(res)
        event.set()

    thread = threading.Thread(target=process_data)
    thread.start()
    event.wait()
    return result[0]

if __name__ == '__main__':
    app.run(debug=True)

# from flask import Flask, request, jsonify
# from flask_socketio import SocketIO, emit
# from run import askModel

# app = Flask(__name__)

# socketio = SocketIO(app)

# # Lưu trữ các kết nối WebSocket
# clients = {}

# @socketio.on('connect')
# def handle_connect():
#     client_id = request.sid
#     clients[client_id] = request.remote_addr
#     print(f"Client {client_id} connected from {clients[client_id]}")

# @socketio.on('disconnect')
# def handle_disconnect():
#     client_id = request.sid
#     print(f"Client {client_id} disconnected")
#     del clients[client_id]

# @socketio.on('message')
# def handle_message(data):
#     client_id = request.sid
#     print(f"Received message '{data}' from client {client_id}")
    
#     # Xử lý dữ liệu và gửi kết quả trả về cho đúng client
#     result = askModel(data, client_id)
#     emit('response', result, to=client_id)

# @app.route('/api/data', methods=['POST'])
# def receive_data():
#     # Lấy JSON từ yêu cầu
#     data = request.get_json()
#     idSocket = data['idSocket']
#     messages = data['messages']
    
#     # Xử lý dữ liệu và gửi kết quả trả về cho đúng client
#     result = askModel(messages)
#     response = {
#         'message': 'Dữ liệu đã nhận thành công!',
#         "can_answer": True,
#         "role": "answer",
#         "content": result,
#         "idSocket": idSocket,
#     }
    
#     return jsonify(response), 200

# if __name__ == '__main__':
#     socketio.run(app, debug=True)
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes


# Home route for testing the server
@app.route('/', methods=['GET'])
def home():
    return jsonify({'message': 'Server is running!'})


# API route for the chatbot
@app.route('/api/message', methods=['POST'])
def receive_message():
    data = request.json
    user_message = data.get('message')

    # Here you would add your AI logic to generate a response
    # For demonstration purposes, we will just echo the user's message
    ai_response = f"{user_message}"

    return jsonify({"response": ai_response})


# Start the Flask server
if __name__ == '__main__':
    app.run(debug=True)

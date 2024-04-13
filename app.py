from flask import Flask, render_template, request
import AiText

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/chatbot/earth", methods=["POST"])
def chatbot_earth():
    # Probably should do input sanitisation and error handling
    user_input = request.form['user_input']
    response = {"response": AiText.getResponse(user_input)}
    return response



with app.app_context():
    # Start AI conversations
    AiText.getResponse("")
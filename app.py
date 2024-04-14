from flask import Flask, render_template, request, session
from flask_session import Session
import AiText

app = Flask(__name__)
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

@app.route("/")
def index():
    return render_template("index.html")


@app.route("/chatbot/test")
def chatbot_test():
    return render_template("ai_test.html")

@app.route("/chatbot/test2")
def chatbot_test2():
    return render_template("ai_test_reformat.html")

@app.route("/chatbot/<planet>", methods=["POST"])
def chatbot(planet):
    print("planet is", planet)
    # Probably should do input sanitisation and error handling
    user_input = request.get_json()['user_input']
    if session.get(planet+"_previous") == None:
        previous = ""
    else:
        previous = session[planet+"_previous"]

    response, session[planet+"_previous"] = AiText.getResponse(user_input, previous, 2)

    return {"response":response}



# with app.app_context():
#     # Start AI conversations
#     AiText.getResponse("", "")

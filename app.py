from flask import Flask, render_template, request, session
from flask_session import Session
import AiText

app = Flask(__name__)
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

@app.route("/")
def index():
    session.clear()
    return render_template("index.html")


@app.route("/chatbot/test")
def chatbot_test():
    session.clear()
    return render_template("ai_test.html")

@app.route("/chatbot/test2")
def chatbot_test2():
    return render_template("ai_test_reformat.html")

@app.route("/chatbot/<planet>", methods=["POST"])
def chatbot(planet):
    #print("planet is", planet)
    # Probably should do input sanitisation and error handling
    user_input = request.get_json()['user_input']
    if session.get(planet+"_previous") == None:
        previous = ""
    else:
        previous = session[planet+"_previous"]

    #convert name to ID
    match planet:
        case "sun": ID = 1
        case "mercury": ID = 2
        case "venus": ID = 3
        case "earth": ID = 4
        case "mars": ID = 5
        case "asteroid": ID = 6
        case "juptiter": ID = 7
        case "saturn": ID = 8
        case "uranus": ID = 9
        case "neptune": ID = 10
        case "pluto": ID = 11
        case "moon": ID = 12
        
    print(ID)

    
    response, session[planet+"_previous"] = AiText.getResponse(user_input, previous, ID)

    return {"response":response}

# with app.app_context():
#     # Start AI conversations
#     AiText.getResponse("", "")

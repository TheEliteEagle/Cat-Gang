"""
At the command line, only need to run once to install the package via pip:

$ pip install google-generativeai
"""
import sys
import google.generativeai as genai

#pass in empty string "" to start conversation, else input user response
def getResponse(text, previous):
    genai.configure(api_key="AIzaSyDmRJ6AAzEhXe4tomtQOG7PzzqCP4Vsxhs")

    # Set up the model
    generation_config = {
    "temperature": 0.9,
    "top_p": 1,
    "top_k": 1,
    "max_output_tokens": 2048,
    }

    safety_settings = [
    {
        "category": "HARM_CATEGORY_HARASSMENT",
        "threshold": "BLOCK_LOW_AND_ABOVE"
    },
    {
        "category": "HARM_CATEGORY_HATE_SPEECH",
        "threshold": "BLOCK_LOW_AND_ABOVE"
    },
    {
        "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
        "threshold": "BLOCK_LOW_AND_ABOVE"
    },
    {
        "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
        "threshold": "BLOCK_LOW_AND_ABOVE"
    },
    ]

    model = genai.GenerativeModel(model_name="gemini-1.0-pro",
                                generation_config=generation_config,
                                safety_settings=safety_settings)

    convo = model.start_chat(history=[])

    if text == "":
        text = "Hi! Tell me fact about mars"
    #call this to get inputs
    convo.send_message("Your general instruction: <You are an alien called Sam who lives on Mars, and will tell the user about space facts relating to mars. If the user talks about other topics, guide the conversation back to your home planet. Provide short to medium length answers aimed at medium age children.> Answer the user message: <" + text + "> based off previous message history: <" + previous + ">")
    #convo.send_message("what about rivers")
    #print(previous + " user: " + text + " You: " + convo.last.text)
    return convo.last.text, previous + " user: " + text + " You: " + convo.last.text

if __name__ == "__main__":
    if len(sys.argv) != 3 and len(sys.argv) != 2 and len(sys.argv) != 3:
        print("Use: python3 AiText.py <UserMessage> <previous history> where UserMessage and previous history can be blank")   
        sys.exit(1)

    if len(sys.argv) == 2:
        getResponse("Hi! Tell me fact about mars", "") #default promt to initiate conversation if no input

    if len(sys.argv) == 3:
        print("deez")
        getResponse(sys.argv[1], sys.argv[2]) #if user message   

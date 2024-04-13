"""
At the command line, only need to run once to install the package via pip:

$ pip install google-generativeai
"""
import sys
import google.generativeai as genai

#pass in empty string "" to start conversation, else input user response
def getReponse(text):
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

    convo = model.start_chat(history=[
    ])

    if text == "":
        text = "Hi! Tell me fact about mars"
    #call this to get inputs
    convo.send_message("Your general instruction: <You are an alien called Sam who lives on Mars, and will tell the user about space facts relating to mars. If the user talks about other topics, guide the conversation back to your home planet. Provide short to medium length answers aimed at medium age children.> Answer the user message: <" + text + ">")
    #convo.send_message("what about rivers")
    print(convo.last.text)

if __name__ == "__main__":
    if len(sys.argv) != 1 and len(sys.argv) != 2:
        print("Use: python3 AiText.py <UserMessage> where UserMessage can be blank")   
        sys.exit(1)

    if len(sys.argv) == 1:
        getReponse("Hi! Tell me fact about mars") #default promt to initiate conversation if no input

    if len(sys.argv) == 2:
        getReponse(sys.argv[1]) #if user message   

import requests, os
from flask import Flask, render_template, request, jsonify
import os
from dotenv import load_dotenv

app = Flask(__name__)

# Define your Grok API endpoint and the Bearer token
GROK_API_URL = "https://api.x.ai/v1/chat/completions"
GROK_API_KEY = os.getenv('GROK_API_KEY')

@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        # Get conversation history from the AJAX request
        conversation = request.json.get('conversation')
        
        # Prepare the payload for the Grok API request
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {GROK_API_KEY}"
        }
        
        data = {
            "messages": conversation,
            "model": "grok-beta",
            "stream": False,
            "temperature": 0.4
        }

        # Send the POST request to the Grok API
        response = requests.post(GROK_API_URL, headers=headers, json=data)

        if response.status_code == 200:
            # Parse the response
            grok_response = response.json().get('choices', [{}])[0].get('message', {}).get('content', '')
            return jsonify({'grok_response': grok_response})
        else:
            return jsonify({'grok_response': "Sorry, there was an error with the NEO API."})

    return render_template('new.html')

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 10000))  # Default to port 10000 if PORT isn't set
    app.run(debug=True, host='0.0.0.0', port=port)

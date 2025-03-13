import os
from flask import Flask, render_template, request, jsonify, redirect, url_for, session, flash
from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField
from wtforms.validators import DataRequired, URL
import requests
from flask_session import Session
from dotenv import load_dotenv
import json
from datetime import timedelta

# Load environment variables
load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-key-for-chatty-app')
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SESSION_PERMANENT'] = True
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=30)
Session(app)

# Form for settings
class SettingsForm(FlaskForm):
    webhook_url = StringField('N8N Webhook URL', validators=[DataRequired(), URL()])
    username = StringField('Username', validators=[DataRequired()])
    password = PasswordField('Password', validators=[DataRequired()])
    submit = SubmitField('Save Settings')

@app.route('/')
def index():
    # Check if settings are configured
    if not all(session.get(key) for key in ['webhook_url', 'username', 'password']):
        flash('Please configure your settings first', 'warning')
        return redirect(url_for('settings'))
    
    # Create a session ID if one doesn't exist
    if 'sessionId' not in session:
        session['sessionId'] = os.urandom(16).hex()
        
    return render_template('index.html')

@app.route('/settings', methods=['GET', 'POST'])
def settings():
    form = SettingsForm()
    
    # Pre-populate form with existing settings
    if request.method == 'GET' and all(session.get(key) for key in ['webhook_url', 'username', 'password']):
        form.webhook_url.data = session.get('webhook_url')
        form.username.data = session.get('username')
        # Don't pre-populate password for security reasons
    
    if form.validate_on_submit():
        # Save settings to session
        session['webhook_url'] = form.webhook_url.data
        session['username'] = form.username.data
        session['password'] = form.password.data
        flash('Settings saved successfully!', 'success')
        return redirect(url_for('index'))
    
    return render_template('settings.html', form=form)

@app.route('/chat', methods=['POST'])
def chat():
    try:
        # Get user message from request
        user_message = request.json.get('message', '')
        
        if not user_message:
            return jsonify({'error': 'No message provided'}), 400
        
        # Get webhook settings from session
        webhook_url = session.get('webhook_url')
        username = session.get('username')
        password = session.get('password')
        
        if not all([webhook_url, username, password]):
            return jsonify({'error': 'Settings not configured'}), 400
        
        # Make sure we have a session ID
        if 'sessionId' not in session:
            session['sessionId'] = os.urandom(16).hex()
        
        # Send request to N8N webhook with chatInput and sessionId
        response = requests.post(
            webhook_url,
            json={
                'chatInput': user_message,
                'sessionId': session['sessionId']
            },
            auth=(username, password),
            headers={'Content-Type': 'application/json'}
        )
        
        # Check response
        if response.status_code == 200:
            try:
                result = response.json()
                # If the response format includes "output" key like in the Streamlit example
                if "output" in result:
                    return jsonify({'response': {'text': result.get('output')}})
                return jsonify({'response': result})
            except json.JSONDecodeError:
                return jsonify({'response': {'text': response.text}})
        else:
            return jsonify({
                'error': f'Error from webhook: {response.status_code}',
                'details': response.text
            }), 500
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/clear_chat', methods=['POST'])
def clear_chat():
    # Generate a new session ID
    session['sessionId'] = os.urandom(16).hex()
    return jsonify({'status': 'success'})

if __name__ == '__main__':
    app.run(debug=True)

from flask import request, jsonify
from . import app

announcements = []

@app.route('/')
def home():
    return jsonify({"message": "Welcome to the Tablica Internetowa API"})

@app.route('/announcements', methods=['GET', 'POST'])
def announcements_endpoint():
    if request.method == 'GET':
    
        html_output = "<h1>Announcements</h1><ul>"
        for a in announcements:
            html_output += f"<li><b>{a['title']}</b>: {a['content']}</li>"
        html_output += "</ul>"
        return html_output

    elif request.method == 'POST':
        
        data = request.get_json()
        new_announcement = {
            "id": len(announcements) + 1,
            "title": data['title'],
            "content": data['content']
        }
        announcements.append(new_announcement)
        return jsonify({'message': 'Announcement added!'})


@app.route('/announcements/<int:announcement_id>', methods=['PUT', 'DELETE'])
def modify_announcement(announcement_id):
    global announcements
    announcement = next((a for a in announcements if a['id'] == announcement_id), None)

    if not announcement:
        return jsonify({'error': 'Announcement not found!'}), 404

    if request.method == 'PUT':
     
        data = request.get_json()
        announcement['title'] = data.get('title', announcement['title'])
        announcement['content'] = data.get('content', announcement['content'])
        return jsonify({'message': 'Announcement updated!', 'announcement': announcement})

    elif request.method == 'DELETE':
       
        announcements = [a for a in announcements if a['id'] != announcement_id]
        return jsonify({'message': 'Announcement deleted!'})




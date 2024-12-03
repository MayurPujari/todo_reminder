from flask import Flask, request, jsonify
from flask_restful import Api, Resource
from flask_cors import CORS
import psycopg2
import os
from dotenv import load_dotenv
from urllib.parse import urlparse
import logging

# Initialize the Flask app and API
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
api = Api(app)

# Load environment variables from .env file
load_dotenv()

# Initialize logging
logging.basicConfig(level=logging.DEBUG)

# PostgreSQL connection
# def get_db_connection():
#     conn = psycopg2.connect(
#         host="localhost",
#         database="todo_app",
#         user="postgres",  
#         password="postgres"  
#     )
#     return conn

# Function to get database connection
def get_db_connection():
    try:
        database_url = os.getenv("DATABASE_URL")  # Get the DATABASE_URL from environment variable
        logging.debug(f"Connecting to database: {database_url}")
        
        result = urlparse(database_url)

        # Connect to the database
        conn = psycopg2.connect(
            database=result.path[1:],  # Remove the leading '/' from the database name
            user=result.username,
            password=result.password,
            host=result.hostname,
            port=result.port
        )
        logging.debug("Database connected successfully.")
        return conn
    except Exception as e:
        logging.error(f"Error while connecting to the database: {str(e)}")
        raise

# Create the Todo resource
class TodoList(Resource):
    def get(self):
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT * FROM todos")
        todos = cur.fetchall()
        cur.close()
        conn.close()
        return jsonify(todos)

    def post(self):
        data = request.get_json()
        todo_text = data['text']
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("INSERT INTO todos (text) VALUES (%s) RETURNING id", (todo_text,))
        new_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"id": new_id, "text": todo_text, "message": "Todo added!"})

class Todo(Resource):
    def get(self, todo_id):
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT * FROM todos WHERE id = %s", (todo_id,))
        todo = cur.fetchone()
        cur.close()
        conn.close()
        return jsonify(todo)

    def put(self, todo_id):
        data = request.get_json()
        todo_text = data['text']
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("UPDATE todos SET text = %s WHERE id = %s", (todo_text, todo_id))
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"message": "Todo updated!"})

    def delete(self, todo_id):
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("DELETE FROM todos WHERE id = %s", (todo_id,))
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"message": "Todo deleted!"})

class DeleteAllTodos(Resource):
    def delete(self):
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("DELETE FROM todos")
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"message": "All todos deleted!"})

# Add resources to API
api.add_resource(TodoList, '/todos')
api.add_resource(Todo, '/todos/<int:todo_id>')
api.add_resource(DeleteAllTodos, '/todos/delete_all')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
from flask import Flask, request, jsonify
from flask_restful import Api, Resource
from flask_cors import CORS
import psycopg2

# Initialize the Flask app and API
app = Flask(__name__)
CORS(app)
api = Api(app)

# PostgreSQL connection
def get_db_connection():
    conn = psycopg2.connect(
        host="localhost",
        database="todo_app",
        user="postgres",  
        password="postgres"  
    )
    return conn

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
        cur.execute("INSERT INTO todos (text) VALUES (%s)", (todo_text,))
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"message": "Todo added!"})

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
    app.run()

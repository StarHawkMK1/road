# test_db_connection.py
import psycopg2

try:
    conn = psycopg2.connect(
        dbname="road_dev",
        user="root",
        password="tomato",
        host="localhost",
        port="5432"
    )
    print("Database connection successful!")
    conn.close()
except psycopg2.OperationalError as e:
    print(f"Database connection failed: {e}")
except Exception as e:
    print(f"An unexpected error occurred: {e}")

import http.server
import socketserver
import webbrowser
import os
import sys

PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

def run_server():
    # Allow address reuse
    socketserver.TCPServer.allow_reuse_address = True
    
    try:
        with socketserver.TCPServer(("", PORT), Handler) as httpd:
            print(f"Serving at http://localhost:{PORT}")
            print("Press Ctrl+C to stop.")
            webbrowser.open(f"http://localhost:{PORT}")
            httpd.serve_forever()
    except OSError as e:
        print(f"Error: {e}")
        print(f"Port {PORT} might be in use. Try closing other servers.")

if __name__ == "__main__":
    run_server()

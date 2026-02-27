import os
import sys
import time
import shutil
import subprocess
import webbrowser

# Determine absolute paths based on the location of run.py
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(BACKEND_DIR)
FRONTEND_DIR = os.path.join(ROOT_DIR, "frontend")

def get_executable(name):
    """Finds the path to an executable (like npm or npx) to ensure cross-platform compatibility."""
    exe = shutil.which(name)
    if not exe:
        print(f"Error: Could not find '{name}' in your system PATH.")
        sys.exit(1)
    return exe

def main():
    # Get platform-specific executables
    python_exe = sys.executable
    npm_exe = get_executable("npm")
    npx_exe = get_executable("npx")

    try:
        # 1. Install Backend Dependencies
        print("=== Installing Backend Dependencies ===")
        subprocess.run(
            [python_exe, "-m", "pip", "install", "-r", "requirements.txt"], 
            cwd=BACKEND_DIR, 
            check=True
        )

        # 2. Install Frontend Dependencies
        print("\n=== Installing Frontend Dependencies ===")
        subprocess.run(
            [npm_exe, "install"], 
            cwd=FRONTEND_DIR, 
            check=True
        )

        # 3. Start Both Servers Asynchronously
        print("\n=== Starting Backend Server (Uvicorn) ===")
        backend_proc = subprocess.Popen(
            [python_exe, "-m", "uvicorn", "main:app", "--reload", "--port", "8000"], 
            cwd=BACKEND_DIR
        )

        print("=== Starting Frontend Server (Angular) ===")
        frontend_proc = subprocess.Popen(
            [npx_exe, "ng", "serve"], 
            cwd=FRONTEND_DIR
        )

        # 4. Open the Web Browser
        print("\nWaiting for servers to initialize...")
        time.sleep(6)  # Give Angular a few seconds to compile before opening
        print("Opening http://localhost:4200 in the default web browser...")
        webbrowser.open("http://localhost:4200")

        # 5. Keep script running until user terminates
        print("\n✅ Servers are running! Press Ctrl+C to stop.")
        
        # Wait indefinitely for the processes
        backend_proc.wait()
        frontend_proc.wait()

    except subprocess.CalledProcessError as e:
        print(f"\n❌ An error occurred while installing dependencies: {e}")
        
    except KeyboardInterrupt:
        # Graceful shutdown on Ctrl+C
        print("\n\n🛑 Caught KeyboardInterrupt. Shutting down servers gracefully...")
        try:
            backend_proc.terminate()
            frontend_proc.terminate()
            backend_proc.wait(timeout=5)
            frontend_proc.wait(timeout=5)
        except Exception as e:
            print(f"Error during shutdown: {e}")
        print("👋 Servers shut down successfully.")

if __name__ == "__main__":
    main()
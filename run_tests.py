"""
Skin Intelligence Platform - Root Test Runner
Convenience runner to launch all backend tests from workspace root.
"""

import sys
import os
import subprocess

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
VENV_PYTHON = os.path.join(ROOT_DIR, "backend", "venv", "Scripts", "python.exe")
BACKEND_RUNNER = os.path.join(ROOT_DIR, "backend", "run_tests.py")

python_bin = VENV_PYTHON if os.path.exists(VENV_PYTHON) else sys.executable

cmd = [python_bin, BACKEND_RUNNER]
sys.exit(subprocess.call(cmd))

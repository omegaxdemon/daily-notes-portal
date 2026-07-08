"""
Bootstrap shim.

The Daily Notes Portal backend is implemented in Node.js + Express
(see server.js).

Supervisor executes uvicorn against this module; when this module is
imported, it replaces the current process with `node server.js` so that
Express actually binds to port 8001.

`--reload` is inert once execvp has replaced the process.
"""

import os
import sys

# Replace the uvicorn process with Node/Express so nothing Python-side
# keeps running.
os.execvp("node", ["node", "server.js"])

# Unreachable, but kept for uvicorn's `server:app` lookup should execvp
# ever fail.
app = None  # pragma: no cover

sys.exit(1)  # pragma: no cover
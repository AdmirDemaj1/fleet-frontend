1. I see the issue! The backend is setting X-Frame-Options: SAMEORIGIN which prevents the document from being displayed in an iframe when the frontend and backend are on different origins (localhost:5174 vs localhost:3000).
Let me fix this by opening the preview in a new window/tab instead of using an iframe:

Investigate this
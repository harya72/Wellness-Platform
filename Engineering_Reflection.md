# Engineering Reflection: AI-Powered Wellness Tracking System

This document outlines the architectural decisions, product assumptions, scalability strategies, and technical tradeoffs made while building the AI-Powered Wellness Tracking System across the React Native (Mobile), React.js (Web Dashboard), and Node.js (Backend) stack.

---

## 1. Stack and Architecture Decisions

The system is built using a decoupled client-server architecture, allowing the mobile application and admin dashboard to scale independently while sharing a unified backend API.

### Mobile App (React Native + Expo)
- **Framework:** Expo was chosen to rapidly bootstrap the React Native app.
- **UI & Navigation:** Used standard React Navigation for routing and built custom reusable components for a cohesive, clean user interface.

### Web Dashboard (React.js + Vite)
- **Tooling:** Vite was selected for significantly faster hot-module replacement (HMR) and optimized build times compared to older bundlers.
- **Styling:** Maintained zero-dependency vanilla CSS for complete control over the layout, ensuring the dashboard remains lightweight.

### Backend API (Node.js + Express + Prisma)
- **RESTful API:** Express.js provides a robust, lightweight foundation for routing and middleware.
- **Database (PostgreSQL & Prisma):** Chose Prisma ORM for database interactions. Prisma provides exceptional type-safety via its auto-generated client and schema migrations. The database itself is a PostgreSQL instance.

### Realtime & Storage Infrastructure (Supabase)
- **Supabase Realtime:** To fulfill the real-time syncing requirement without maintaining a custom WebSocket server, the system leverages Supabase's Postgres replication channels. This allows the applications to subscribe to database events (like meal deletions or status updates) and reflect live changes instantly.
- **Supabase Storage:** User-uploaded meal images are piped directly into Supabase Storage buckets, keeping the PostgreSQL database lean.

---

## 2. Product Thinking and UX Assumptions

The core product thesis is that users abandon health trackers when logging becomes tedious.

- **Frictionless Entry:** The mobile app allows users to log a meal using either a simple text description or an image. The AI pipeline abstracts away the manual labor of calculating calories and macronutrients.
- **Actionable AI Feedback:** Instead of just returning raw macros, the Gemini AI prompt is engineered to provide a short, actionable health insight directly to the user based on their meal.
- **Live Accountability Loop:** The bidirectional real-time integration ensures that when a mobile user logs a meal, it instantly appears on the admin dashboard. Conversely, when an admin changes a meal's status or adds a comment, the mobile app reflects it immediately.
- **Proactive Engagement:** The system includes automated reminder notifications to keep users engaged and consistent with their daily logging habits.

---

## 3. Scalability Considerations

- **Stateless Authentication (JWT):** The backend utilizes stateless JSON Web Tokens. Since no session data is stored in memory, the backend can be horizontally scaled easily.
- **Prisma Connection Pooling:** Postgres connections are expensive. Prisma natively handles connection pooling, preventing the database from being overwhelmed by connection timeouts.
- **Media Offloading:** Storing Base64 images in a relational database destroys performance. By using Supabase Storage, the database only stores lightweight URL strings, ensuring fast queries.

---

## 4. AI Reliability and Safety (Google Gemini)

Relying on LLMs for deterministic, structured data poses hallucination and syntax risks.

- **Strict JSON Enforcement:** The system uses a highly structured prompt requesting ONLY valid JSON in an exact structure. 
- **Graceful Error Handling:** The backend intercepts the Gemini response and runs a custom parsing utility that strips markdown code blocks before running `JSON.parse` inside a `try/catch`. If the LLM hallucinates broken JSON, the API returns a clean failure rather than crashing.
- **Rate Limits & Fallbacks:** AI APIs frequently hit quota limits. The application implements an API key rotation pool in the Gemini service to swap keys automatically if a quota limit is reached.
- **Out-of-Bounds Rejection:** The prompt includes instructions to return a failure flag if the image or text is completely unrelated to food, preventing the system from calculating calories for unrelated images.

---

## 5. Technical Tradeoffs and Compromises

1. **Managed Realtime vs. Custom WebSockets:** I opted to couple the real-time architecture to Supabase's Postgres replication channels. While building a custom Node.js WebSocket infrastructure would allow for more granular control over non-database events, Supabase Realtime drastically accelerated development time and simplified infrastructure.
2. **LLM Latency:** AI image processing inherently adds a few seconds of latency. I traded immediate synchronous responses for powerful automation. To mitigate the UX impact on the mobile side, the app utilizes non-blocking loading states so it remains responsive while Gemini processes the meal.
3. **Prisma Query Engine Binary Size:** Prisma utilizes a Rust-based query engine under the hood. While this provides incredible performance and type-safety, it slightly increases the memory footprint of the Node server compared to lighter query builders. I accepted this tradeoff for the boost in developer velocity and safety.

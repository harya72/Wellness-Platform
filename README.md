# Engineering Reflection: AI-Powered Wellness Tracking System

This document outlines the architectural decisions, product assumptions, scalability strategies, and technical tradeoffs made while building the AI-Powered Wellness Tracking System across the React Native (Mobile), React.js (Web Dashboard), and Node.js (Backend) stack.

---

## 1. Stack & Architecture Decisions

**Does the suggested stack actually make sense for this product?**
Yes, the decoupled architecture (React Native, React.js, Node.js + Supabase) is highly appropriate. React Native enables cross-platform mobile delivery, React.js with Vite offers a fast admin dashboard, and Supabase handles real-time sync and media storage effortlessly.

**Which parts feel overkill?**
Using a full custom Node.js/Express backend with Prisma might seem like overkill for a simple CRUD app when Supabase provides auto-generated REST APIs. However, I intentionally chose Node.js because it provides a dedicated, robust environment to securely handle the AI integration, custom data validation, and complex business logic that would be difficult or unsafe to manage entirely on the client side.

**Which parts feel insufficient?**
Relying solely on Supabase Realtime for system-wide events can be insufficient if we need complex background processing (like delayed AI retries or queueing).

**What would you keep or change if this evolved into a real startup product?**
I would keep the core stack (React Native, React.js, and Node.js) because it provides a scalable, proven foundation. As the product evolves, I would change the Node.js backend architecture from a monolithic Express server to a more scalable, containerized architecture (e.g., using Docker). I would also introduce a message broker (like RabbitMQ or Redis queues) to handle the LLM processing asynchronously, ensuring the main API remains responsive under heavy user load.

---

## 2. Product Thinking

**What assumptions did you make about the users?**
I assumed users often abandon health trackers when logging becomes tedious. Therefore, I assumed they would value speed and automation over granular, manual entry.

**What UX decisions did you intentionally make?**
- **Frictionless Entry:** Allowed users to log a meal via a simple image or short text description.
- **Actionable AI Feedback:** Designed the LLM prompt to return a short, personalized health insight rather than just raw numbers.

**What would you improve if given one additional week?**
I would implement a comprehensive offline-first architecture using a local database (like WatermelonDB) synced with Supabase, ensuring users can log meals even without an internet connection. I would also add data visualization (charts) for weekly macro tracking.

---

## 3. Scalability & Systems Thinking

**What breaks first if the system scales to 100k+ users?**
The Node.js backend's synchronous handling of AI API calls would become a bottleneck. Keeping HTTP connections open while waiting for Gemini to analyze an image will rapidly consume the server's connection pool, causing timeouts. Supabase Realtime concurrent connection limits could also be hit.

**How would you redesign the system over time?**
I would redesign the AI processing pipeline to be strictly asynchronous. The mobile app would upload the image and create a "pending" meal record. The backend would simply acknowledge the upload and pass a job to a queue.

**Where would caching, queues, background workers, or service separation become necessary?**
- **Queues & Background Workers:** Necessary for AI meal analysis. Instead of analyzing synchronously, a worker would pull from an SQS/RabbitMQ queue to call the Gemini API and then update the database.
- **Caching:** Redis would be necessary for caching user profiles and frequent queries on the Admin dashboard.
- **Service Separation:** Separating the AI processing service from the core CRUD API to prevent compute-heavy tasks from affecting basic app responsiveness.

---

## 4. AI & Reliability

**Risks of relying on LLM-generated outputs in a wellness product:**
The primary risks are hallucinations (providing dangerous nutritional advice or wildly inaccurate calories) and format inconsistency (breaking the JSON parser on the backend).

**How you would improve Reliability, Consistency, Safety:**
- **Reliability & Consistency:** Use strict structured output generation. Validate the LLM output against a Zod schema before saving to the database. Implement a retry mechanism with exponential backoff if the AI fails.
- **Safety:** Include explicit system prompts commanding the AI to reject non-food images and refrain from giving medical advice.

**What strategies you would use to reduce AI cost and latency:**
- **Caching LLM Results:** Hash the meal descriptions/images. If a user logs "1 cup of black coffee" today, we can retrieve the cached macros from yesterday instead of calling the API.
- **Model Tiering:** Use a smaller, cheaper, and faster model (like Gemini Flash) for text-only descriptions, and only use the larger multimodal models when image analysis is required.

---

## 5. Technical Tradeoffs

**One shortcut you intentionally took:**
Coupled the real-time architecture directly to Supabase's Postgres replication channels instead of building a custom WebSocket service. This accelerated development but ties the real-time logic closely to database changes.

**One engineering compromise you disagree with:**
Storing unstructured AI insights directly in the main `meals` table. Ideally, AI outputs and raw logs should be separated (e.g., a `meal_analyses` table) so we can easily recalculate or drop AI data without touching the canonical user entry.

**One aspect of the implementation you are particularly proud of:**
The graceful error handling around the LLM integration. By anticipating AI format failures, stripping markdown, and gracefully catching parsing errors, the system ensures the mobile app doesn't crash when the AI hallucinates.

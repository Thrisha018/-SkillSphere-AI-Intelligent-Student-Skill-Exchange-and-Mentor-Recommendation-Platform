# SkillSphere AI – Intelligent Student Skill Exchange and Mentor Recommendation Platform

A peer-to-peer student skill exchange and mentor recommendation platform powered by FastAPI, MongoDB, React, and Scikit-Learn Content-Based AI Recommendation Engine.

---

## 1. Project Introduction
**SkillSphere AI** is an intelligent peer-to-peer skill exchange platform designed for college students. Students possess diverse technical and non-technical skills that they can teach to fellow peers. SkillSphere AI bridges learners with suitable student mentors based on skill compatibility, expertise, schedule availability, mentor ratings, and historical feedback.

---

## 2. Problem Addressed
Existing learning and tutoring platforms rely heavily on manual searching or generic static listings. Finding an ideal peer mentor requires evaluating multiple subjective factors. SkillSphere AI replaces manual search with an intelligent, multi-factor recommendation engine that evaluates skill overlap, rating quality, mentoring experience, availability alignment, and past feedback sentiment.

---

## 3. Proposed System
SkillSphere AI provides an end-to-end peer mentoring environment:
- **Intelligent Mentor Recommendation**: Calculates multi-factor compatibility scores using Scikit-Learn TF-IDF Cosine Similarity & Weighted scoring.
- **Skill Compatibility Matching**: Automatically maps learner's required skills with mentor's teaching repertoire.
- **Mentoring Lifecycle**: Handles request creation, mentor response (`Pending`, `Accepted`, `Rejected`), session completion, and feedback submission.
- **Rating & Feedback Pipeline**: Collects qualitative reviews and 5-star ratings, dynamically recalculating mentor scores for future recommendations.
- **Progress Tracking**: Monitors learning completion percentages (0-100%) and skill mastery outcomes.

---

## 4. Main Objectives
1. Connect student learners with compatible peer mentors.
2. Recommend mentors using an explainable, deterministic AI recommendation engine.
3. Incorporate skills, ratings, availability, experience, and historical feedback into candidate ranking.
4. Support mentoring request lifecycle and session management.
5. Track learning progress and completed outcomes.
6. Foster collaborative student-to-student knowledge sharing.

---

## 5. Technology Stack
- **Frontend**: React.js (Vite), HTML5, CSS3 (Vanilla Glassmorphism Design System), JavaScript (ES6+), React Router DOM, Axios, Lucide React Icons.
- **Backend**: Python 3.13, FastAPI, Pydantic v2, PyJWT, bcrypt.
- **Database**: MongoDB (with fail-safe in-memory fallback).
- **AI / ML**: Python, Scikit-Learn (`TfidfVectorizer`, `cosine_similarity`), NumPy.
- **Authentication**: JSON Web Tokens (JWT) with HTTP Bearer Authorization.

---

## 6. Required Modules
1. **User Management Module**: Student registration, JWT login, profile customization.
2. **Skill Management Module**: Manage skills you can teach and skills you want to learn.
3. **Mentor Recommendation Module**: Core AI engine calculating compatibility scores and ranking candidate mentors.
4. **Mentoring Session Module**: Session requests and lifecycle status updates (`Pending`, `Accepted`, `Rejected`, `Completed`).
5. **Rating & Feedback Module**: Rating (1-5 stars) and qualitative feedback after session completion.
6. **Progress Tracking Module**: Track learning outcomes and completion percentages per skill.
7. **User Interface Module**: Responsive dark-mode glassmorphic student dashboard.

---

## 7. System Architecture
```
+-------------------------------------------------------------+
|                      React Frontend                         |
|    (Dashboard, Profile, Skills, AI Recs, Sessions, Progress) |
+------------------------------+------------------------------+
                               | REST API (Axios + JWT)
                               v
+-------------------------------------------------------------+
|                     FastAPI Backend                         |
|         (Auth, Users, Skills, Sessions, Progress)           |
+--------------+-------------------------------+--------------+
               |                               |
               v                               v
    +--------------------+           +-------------------+
    |      MongoDB       |           |   AI Engine       |
    | (Users, Sessions,  |           | (Scikit-Learn     |
    | Progress, Feedback)|           | TF-IDF & Weights) |
    +--------------------+           +-------------------+
```

---

## 8. Database Design
MongoDB Collections:
- **`users`**: `{ _id, name, email, hashed_password, college, department, year, bio, teach_skills, learn_skills, experience_years, availability, rating, total_ratings, mentoring_count, feedback_history }`
- **`sessions`**: `{ _id, learner_id, learner_name, mentor_id, mentor_name, skill_topic, message, proposed_time, status, created_at, updated_at }`
- **`feedback`**: `{ _id, session_id, learner_id, mentor_id, rating, comment, created_at }`
- **`progress`**: `{ _id, user_id, skill_name, status, completion_percentage, notes, updated_at }`

---

## 9. Recommendation Methodology
Multi-Feature Weighted Compatibility Score Formula:
$$\text{Score} = (0.40 \times \text{SkillMatch}) + (0.20 \times \text{RatingScore}) + (0.20 \times \text{ExperienceScore}) + (0.10 \times \text{AvailabilityScore}) + (0.10 \times \text{FeedbackScore})$$

- **Skill Compatibility (40%)**:
  Scikit-Learn `TfidfVectorizer` (ngram range 1-2) with `cosine_similarity` combined with exact skill overlap ratio:
  $$\text{SkillMatch} = 0.6 \times \text{ExactRatio} + 0.4 \times \text{CosineSimilarity}$$
- **Rating Score (20%)**: Bayesian smoothed 5-star rating normalized to $[0, 1]$.
- **Experience Score (20%)**: Scaled years of mentoring experience ($\min(1.0, \frac{\text{Years}}{5.0})$).
- **Availability Score (10%)**: Matching keyword overlap (Weekdays, Weekends, Flexible).
- **Feedback Score (10%)**: Historical qualitative rating average & review volume bonus.

---

## 10. How to Run the Project

### Prerequisites
- Python 3.10+
- Node.js v18+ & npm

### Backend Setup
1. Navigate to backend directory:
   ```bash
   cd backend
   ```
2. Install Python dependencies:
   ```bash
   python -m pip install -r requirements.txt
   ```
3. Run database seed script:
   ```bash
   python seed_data.py
   ```
4. Start FastAPI server:
   ```bash
   python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
   ```
   FastAPI Swagger API Documentation will be available at: `http://127.0.0.1:8000/docs`

### Frontend Setup
1. Open a new terminal and navigate to frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start React dev server:
   ```bash
   npm run dev
   ```
   Frontend will run at: `http://localhost:5173`

---

## 11. API Documentation Summary
- `POST /api/v1/auth/register`: Student registration.
- `POST /api/v1/auth/login`: Student JWT login.
- `GET /api/v1/auth/me`: Get current authenticated user profile.
- `PUT /api/v1/users/profile`: Update user profile, availability, and experience.
- `POST /api/v1/skills/teach`: Add skill you can teach.
- `POST /api/v1/skills/learn`: Add skill you want to learn.
- `GET /api/v1/recommendations/mentors`: Retrieve AI-ranked mentor recommendations.
- `POST /api/v1/sessions/request`: Send mentoring request.
- `PUT /api/v1/sessions/{session_id}/status`: Update session status (`Accepted`, `Rejected`, `Completed`).
- `POST /api/v1/feedback`: Submit rating and qualitative review.
- `GET /api/v1/progress`: Retrieve skill learning progress records.
- `POST /api/v1/progress/update`: Update completion percentage and notes.

---

## 12. Demonstration Accounts for Testing
- **Learner Account**: `rohan@college.edu` / Password: `password123`
- **Mentor Account (Python / AI)**: `ananya@college.edu` / Password: `password123`
- **Mentor Account (FullStack)**: `vikram@college.edu` / Password: `password123`

---

## 13. Future Scope
- Real-time WebSockets chat for instant peer messaging.
- Video mentoring room integration (WebRTC).
- Cross-college student verification.
- Mobile Application (React Native).

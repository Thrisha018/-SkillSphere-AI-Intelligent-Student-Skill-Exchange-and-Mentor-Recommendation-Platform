import sys
import os
import uuid
import datetime

# Add backend root to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import Database
from app.utils.auth import hash_password

SEED_USERS = [
    {
        "_id": "user_demo_learner_1",
        "name": "Rohan Verma",
        "email": "rohan@college.edu",
        "hashed_password": hash_password("password123"),
        "college": "IIT Bombay",
        "department": "Computer Science",
        "year": "3rd Year",
        "bio": "Enthusiastic CS student passionate about backend development, machine learning, and databases.",
        "teach_skills": ["HTML", "CSS", "C++"],
        "learn_skills": ["Python", "Machine Learning", "FastAPI", "MongoDB"],
        "experience_years": 1.5,
        "availability": "Weekdays Evenings",
        "rating": 4.8,
        "total_ratings": 3,
        "mentoring_count": 2,
        "feedback_history": [
            {"learner_name": "Priya", "rating": 5.0, "comment": "Great C++ explanations!", "date": "2026-08-10"}
        ]
    },
    {
        "_id": "user_mentor_python_ai",
        "name": "Ananya Sharma",
        "email": "ananya@college.edu",
        "hashed_password": hash_password("password123"),
        "college": "IIT Bombay",
        "department": "Artificial Intelligence & Data Science",
        "year": "4th Year",
        "bio": "Senior AI researcher & Kaggle expert. Specializing in Python, Scikit-Learn, Deep Learning & PyTorch.",
        "teach_skills": ["Python", "Machine Learning", "Scikit-Learn", "Data Science", "FastAPI"],
        "learn_skills": ["React.js", "System Design"],
        "experience_years": 4.5,
        "availability": "Weekdays Evenings",
        "rating": 4.95,
        "total_ratings": 18,
        "mentoring_count": 14,
        "feedback_history": [
            {"learner_name": "Karan", "rating": 5.0, "comment": "Ananya breaks down ML algorithms effortlessly!", "date": "2026-09-01"},
            {"learner_name": "Sneha", "rating": 4.9, "comment": "Super helpful Python data structure session.", "date": "2026-09-12"}
        ]
    },
    {
        "_id": "user_mentor_web_fullstack",
        "name": "Vikramaditya Patel",
        "email": "vikram@college.edu",
        "hashed_password": hash_password("password123"),
        "college": "BITS Pilani",
        "department": "Information Technology",
        "year": "4th Year",
        "bio": "Full Stack developer. Building scalable web applications using React, Node, FastAPI & MongoDB.",
        "teach_skills": ["React.js", "JavaScript", "FastAPI", "MongoDB", "Node.js", "TailwindCSS"],
        "learn_skills": ["DevOps", "Kubernetes"],
        "experience_years": 3.8,
        "availability": "Flexible",
        "rating": 4.85,
        "total_ratings": 12,
        "mentoring_count": 10,
        "feedback_history": [
            {"learner_name": "Rohan", "rating": 5.0, "comment": "Awesome session on React Router and state management!", "date": "2026-08-20"}
        ]
    },
    {
        "_id": "user_mentor_db_sql",
        "name": "Neha Kulkarni",
        "email": "neha@college.edu",
        "hashed_password": hash_password("password123"),
        "college": "COEP Pune",
        "department": "Computer Engineering",
        "year": "3rd Year",
        "bio": "Database enthusiast & SQL query expert. Loves teaching relational database design, indexing, and MongoDB.",
        "teach_skills": ["SQL", "PostgreSQL", "MongoDB", "Database Systems", "Python"],
        "learn_skills": ["Machine Learning", "Docker"],
        "experience_years": 2.5,
        "availability": "Weekends",
        "rating": 4.7,
        "total_ratings": 8,
        "mentoring_count": 6,
        "feedback_history": [
            {"learner_name": "Amit", "rating": 4.8, "comment": "Very practical SQL optimization tips.", "date": "2026-09-05"}
        ]
    },
    {
        "_id": "user_mentor_dsa",
        "name": "Siddharth Rao",
        "email": "siddharth@college.edu",
        "hashed_password": hash_password("password123"),
        "college": "IIT Delhi",
        "department": "Computer Science",
        "year": "4th Year",
        "bio": "Competitive programmer (Candidate Master on Codeforces). Teaching Data Structures & Algorithms in C++ and Python.",
        "teach_skills": ["Data Structures", "Algorithms", "C++", "Python", "Problem Solving"],
        "learn_skills": ["Cloud Computing", "AWS"],
        "experience_years": 4.0,
        "availability": "Weekends",
        "rating": 4.9,
        "total_ratings": 22,
        "mentoring_count": 19,
        "feedback_history": [
            {"learner_name": "Rahul", "rating": 5.0, "comment": "Cleared my graph algorithm doubts in 1 session!", "date": "2026-09-15"}
        ]
    },
    {
        "_id": "user_demo_learner_2",
        "name": "Tanvi Joshi",
        "email": "tanvi@college.edu",
        "hashed_password": hash_password("password123"),
        "college": "NIT Trichy",
        "department": "Electrical Engineering",
        "year": "2nd Year",
        "bio": "Learning coding to transition into software engineering & data analysis.",
        "teach_skills": ["MATLAB", "Circuit Design"],
        "learn_skills": ["SQL", "Python", "Data Science"],
        "experience_years": 1.0,
        "availability": "Weekdays Evenings",
        "rating": 5.0,
        "total_ratings": 1,
        "mentoring_count": 0,
        "feedback_history": []
    }
]

def seed_database():
    print("Connecting to database for seeding...")
    db = Database.get_db()

    print("Clearing existing sample collection data...")
    db.users.delete_many({})
    db.sessions.delete_many({})
    db.feedback.delete_many({})
    db.progress.delete_many({})

    print(f"Inserting {len(SEED_USERS)} seed student/mentor profiles...")
    db.users.insert_many(SEED_USERS)

    # Seed sample completed session & progress for demonstration
    sample_session_id = "session_demo_sample_1"
    now_str = datetime.datetime.now(datetime.timezone.utc).isoformat()
    
    sample_session = {
        "_id": sample_session_id,
        "learner_id": "user_demo_learner_1",
        "learner_name": "Rohan Verma",
        "learner_email": "rohan@college.edu",
        "mentor_id": "user_mentor_python_ai",
        "mentor_name": "Ananya Sharma",
        "mentor_email": "ananya@college.edu",
        "skill_topic": "Python Fundamentals & OOP",
        "message": "Hi Ananya! Need guidance on Python OOP principles for my project.",
        "proposed_time": "Weekdays Evenings",
        "status": "Completed",
        "created_at": now_str,
        "updated_at": now_str
    }
    db.sessions.insert_one(sample_session)

    sample_feedback = {
        "_id": "feedback_demo_1",
        "session_id": sample_session_id,
        "learner_id": "user_demo_learner_1",
        "learner_name": "Rohan Verma",
        "mentor_id": "user_mentor_python_ai",
        "rating": 5.0,
        "comment": "Ananya is an extraordinary mentor! Taught me Python classes, inheritance, and FastAPI routes crystal clearly.",
        "created_at": now_str
    }
    db.feedback.insert_one(sample_feedback)

    sample_progress = [
        {
            "_id": "prog_demo_1",
            "user_id": "user_demo_learner_1",
            "skill_name": "Python",
            "status": "In Progress",
            "completion_percentage": 80.0,
            "notes": "Mastered basic syntax, loops, and OOP with mentor Ananya.",
            "updated_at": now_str
        },
        {
            "_id": "prog_demo_2",
            "user_id": "user_demo_learner_1",
            "skill_name": "Machine Learning",
            "status": "In Progress",
            "completion_percentage": 40.0,
            "notes": "Learned Linear Regression & Scikit-Learn basics.",
            "updated_at": now_str
        }
    ]
    db.progress.insert_many(sample_progress)

    print("Seed data insertion completed successfully!")

if __name__ == "__main__":
    seed_database()

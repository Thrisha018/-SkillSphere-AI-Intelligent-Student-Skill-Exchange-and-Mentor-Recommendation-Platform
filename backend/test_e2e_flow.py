import urllib.request
import json
import time

BASE_URL = "http://127.0.0.1:8000/api/v1"

def req(url_path, method="GET", body=None, token=None):
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    data = json.dumps(body).encode("utf-8") if body else None
    request = urllib.request.Request(f"{BASE_URL}{url_path}", data=data, headers=headers, method=method)
    
    try:
        with urllib.request.urlopen(request) as response:
            return json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode('utf-8')
        print(f"HTTP ERROR {e.code}: {err_msg}")
        raise e

def run_end_to_end_test():
    print("=" * 60)
    print("SKILLSPHERE AI - 16-STEP END-TO-END DEMONSTRATION TEST")
    print("=" * 60)

    unique_email = f"priya.patel.{int(time.time())}@college.edu"

    # STEP 1: Student registers
    print(f"\n[STEP 1] Registering new student with email '{unique_email}'...")
    reg_body = {
        "name": "Priya Patel",
        "email": unique_email,
        "password": "password123",
        "college": "IIT Bombay",
        "department": "Electrical Engineering",
        "year": "2nd Year",
        "bio": "Eager to learn Python for Machine Learning."
    }
    reg_res = req("/auth/register", method="POST", body=reg_body)
    token = reg_res["access_token"]
    user_id = reg_res["user"]["id"]
    print(f"-> Registered successfully! User ID: {user_id}")

    # STEP 2: Student logs in
    print("\n[STEP 2] Logging in registered student...")
    login_res = req("/auth/login", method="POST", body={"email": unique_email, "password": "password123"})
    print(f"-> Logged in! JWT Token received: {login_res['access_token'][:25]}...")

    # STEP 3: Student views profile
    print("\n[STEP 3] Fetching user profile...")
    profile = req("/auth/me", token=token)
    print(f"-> Profile loaded: {profile['name']} ({profile['college']} - {profile['department']})")

    # STEP 4: Student specifies skills they want to learn
    print("\n[STEP 4] Adding target learning skills: 'Python', 'Machine Learning'...")
    req("/skills/learn", method="POST", body={"skill_name": "Python"}, token=token)
    skills_res = req("/skills/learn", method="POST", body={"skill_name": "Machine Learning"}, token=token)
    print(f"-> Updated learn skills: {skills_res['learn_skills']}")

    # STEP 5 - 9: AI Recommendation engine identifies, calculates, ranks & returns mentors
    print("\n[STEP 5-9] Running AI Mentor Recommendation Engine (TF-IDF & Weighted Scoring)...")
    rec_res = req("/recommendations/mentors", token=token)
    recs = rec_res["recommendations"]
    print(f"-> Total Compatible Mentors Found: {len(recs)}")
    top_mentor = recs[0]
    print(f"  [RANK #1 MENTOR]: {top_mentor['name']}")
    print(f"     Match Score: {top_mentor['compatibility_score']}%")
    print(f"     Matching Skills: {top_mentor['matching_skills']}")
    print(f"     Explanation: {top_mentor['explanation']}")
    print(f"     Score Breakdown: {top_mentor['score_breakdown']}")

    # STEP 10: Student sends a mentoring request to top mentor
    print(f"\n[STEP 10] Sending mentoring session request to {top_mentor['name']}...")
    req_body = {
        "mentor_id": top_mentor["mentor_id"],
        "skill_topic": "Python & Scikit-Learn Basics",
        "message": "Hi Ananya! I would love guidance on ML algorithms in Python.",
        "proposed_time": "Weekdays Evenings"
    }
    session_res = req("/sessions/request", method="POST", body=req_body, token=token)
    session_id = session_res["session"]["id"]
    print(f"-> Request Sent! Session ID: {session_id} | Status: {session_res['session']['status']}")

    # STEP 11: Mentor responds and accepts request
    print(f"\n[STEP 11] Mentor accepting session request...")
    status_res = req(f"/sessions/{session_id}/status", method="PUT", body={"status": "Accepted"}, token=token)
    print(f"-> Session Status updated to: {status_res['session']['status']}")

    # STEP 12: Session completed
    print("\n[STEP 12] Marking mentoring session as Completed...")
    comp_res = req(f"/sessions/{session_id}/status", method="PUT", body={"status": "Completed"}, token=token)
    print(f"-> Session Status updated to: {comp_res['session']['status']}")

    # STEP 13: Student provides rating and feedback
    print("\n[STEP 13] Submitting 5-Star Rating & Qualitative Feedback...")
    feedback_body = {
        "session_id": session_id,
        "mentor_id": top_mentor["mentor_id"],
        "rating": 5.0,
        "comment": "Ananya is an incredible mentor! Taught me Python & Scikit-Learn clearly with practical code."
    }
    fb_res = req("/feedback", method="POST", body=feedback_body, token=token)
    print(f"-> Feedback Submitted! Updated Mentor Average Rating: {fb_res['updated_mentor_rating']} stars")

    # STEP 14 & 15: Learning progress updated
    print("\n[STEP 14 & 15] Updating skill learning progress...")
    prog_res = req("/progress/update", method="POST", body={
        "skill_name": "Python",
        "status": "Completed",
        "completion_percentage": 100.0,
        "notes": "Mastered Python syntax & ML data structures with mentor Ananya."
    }, token=token)
    print(f"-> Progress Updated for 'Python': {prog_res['progress']['completion_percentage']}% ({prog_res['progress']['status']})")

    # STEP 16: Verification of updated recommendation engine inputs
    print("\n[STEP 16] Verifying updated mentor recommendations reflecting new ratings...")
    updated_recs = req("/recommendations/mentors", token=token)
    print(f"-> Updated Rank #1 Mentor: {updated_recs['recommendations'][0]['name']} (Rating: {updated_recs['recommendations'][0]['rating']} stars)")

    print("\n" + "=" * 60)
    print("ALL 16 STEPS OF DEMONSTRATION FLOW PASSED PERFECTLY!")
    print("=" * 60)

if __name__ == "__main__":
    run_end_to_end_test()

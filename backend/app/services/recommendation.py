import numpy as np
from typing import List, Dict, Any
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def calculate_skill_compatibility(learner_skills: List[str], mentor_skills: List[str]) -> Dict[str, Any]:
    """
    Calculates skill compatibility using Scikit-Learn TF-IDF Cosine Similarity 
    and exact intersection matching.
    """
    if not learner_skills or not mentor_skills:
        return {
            "score": 0.0,
            "matching_skills": [],
            "missing_skills": learner_skills,
            "similarity_matrix_score": 0.0
        }

    # Normalize skill strings
    norm_learner = [s.strip().lower() for s in learner_skills if s.strip()]
    norm_mentor = [s.strip().lower() for s in mentor_skills if s.strip()]

    if not norm_learner or not norm_mentor:
        return {
            "score": 0.0,
            "matching_skills": [],
            "missing_skills": learner_skills,
            "similarity_matrix_score": 0.0
        }

    # 1. Exact Intersection Matching
    learner_set = set(norm_learner)
    mentor_set = set(norm_mentor)
    matching_set = learner_set.intersection(mentor_set)

    matching_skills = [s for s in learner_skills if s.strip().lower() in matching_set]
    missing_skills = [s for s in learner_skills if s.strip().lower() not in matching_set]

    exact_ratio = len(matching_set) / len(learner_set) if learner_set else 0.0

    # 2. Scikit-Learn TF-IDF Cosine Similarity for semantic/sub-string skill overlap
    learner_doc = " ".join(norm_learner)
    mentor_doc = " ".join(norm_mentor)

    try:
        vectorizer = TfidfVectorizer(ngram_range=(1, 2))
        tfidf_matrix = vectorizer.fit_transform([learner_doc, mentor_doc])
        sim_score = float(cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0])
    except Exception:
        sim_score = exact_ratio

    # Hybrid skill score: 60% exact skill match ratio + 40% TF-IDF cosine similarity
    combined_skill_score = min(1.0, (0.6 * exact_ratio) + (0.4 * sim_score))

    return {
        "score": float(combined_skill_score),
        "matching_skills": matching_skills,
        "missing_skills": missing_skills,
        "similarity_matrix_score": float(sim_score)
    }

def calculate_experience_score(experience_years: float) -> float:
    """
    Scales experience years to a 0.0 - 1.0 range.
    5+ years experience gets full 1.0 score.
    """
    if not experience_years or experience_years <= 0:
        return 0.2
    return min(1.0, experience_years / 5.0)

def calculate_rating_score(rating: float, total_ratings: int) -> float:
    """
    Normalizes rating (1-5) to 0.0 - 1.0 with Bayesian prior smoothing for low count ratings.
    """
    if total_ratings == 0:
        # Default prior for unrated new mentors is 4.0 out of 5
        smoothed_rating = 4.0
    else:
        # Bayesian average with prior = 4.0, weight = 2
        smoothed_rating = ((total_ratings * rating) + (2 * 4.0)) / (total_ratings + 2)
    
    return float(smoothed_rating / 5.0)

def calculate_availability_score(learner_avail: str, mentor_avail: str) -> float:
    """
    Calculates availability compatibility score based on preferences.
    """
    if not learner_avail or not mentor_avail:
        return 0.8  # Default moderate compatibility
    
    l_lower = learner_avail.lower()
    m_lower = mentor_avail.lower()

    if "flexible" in m_lower or "flexible" in l_lower or l_lower in m_lower or m_lower in l_lower:
        return 1.0
    
    # Check overlap in days/time keywords
    keywords = ["weekday", "weekend", "evening", "morning", "afternoon"]
    matches = sum(1 for kw in keywords if kw in l_lower and kw in m_lower)
    if matches > 0:
        return 0.9
    
    return 0.6

def calculate_feedback_score(feedback_history: List[dict]) -> float:
    """
    Calculates feedback score based on historical ratings and feedback volume.
    """
    if not feedback_history:
        return 0.8  # Default baseline for mentors without written feedback yet
    
    ratings = [f.get("rating", 4.0) for f in feedback_history if "rating" in f]
    if not ratings:
        return 0.8
    
    avg_rating = sum(ratings) / len(ratings)
    # Higher score for consistent high ratings + feedback volume bonus
    volume_bonus = min(0.1, len(feedback_history) * 0.02)
    return float(min(1.0, (avg_rating / 5.0) + volume_bonus))

def recommend_mentors(learner: Dict[str, Any], mentors: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Core Content-Based & Weighted AI Mentor Recommendation Engine.
    
    Weights:
    - Skill Compatibility: 40%
    - Mentor Rating: 20%
    - Experience: 20%
    - Availability: 10%
    - Previous Feedback: 10%
    """
    learner_skills = learner.get("learn_skills", [])
    learner_avail = learner.get("availability", "Flexible")

    recommendations = []

    for mentor in mentors:
        # Exclude self if learner is in mentor list
        if str(mentor.get("_id")) == str(learner.get("_id")):
            continue

        mentor_teach_skills = mentor.get("teach_skills", [])
        if not mentor_teach_skills:
            continue

        # 1. Skill Compatibility (40%)
        skill_res = calculate_skill_compatibility(learner_skills, mentor_teach_skills)
        skill_score = skill_res["score"]

        # Only recommend mentors who teach at least 1 relevant skill or have non-zero skill overlap
        if skill_score <= 0.0 and len(skill_res["matching_skills"]) == 0:
            continue

        # 2. Rating Score (20%)
        rating = mentor.get("rating", 5.0)
        total_ratings = mentor.get("total_ratings", 0)
        rating_score = calculate_rating_score(rating, total_ratings)

        # 3. Experience Score (20%)
        exp_years = mentor.get("experience_years", 1.0)
        exp_score = calculate_experience_score(exp_years)

        # 4. Availability Score (10%)
        mentor_avail = mentor.get("availability", "Flexible")
        avail_score = calculate_availability_score(learner_avail, mentor_avail)

        # 5. Feedback Score (10%)
        feedback_hist = mentor.get("feedback_history", [])
        feedback_score = calculate_feedback_score(feedback_hist)

        # Multi-factor Weighted Compatibility Calculation
        weighted_score = (
            (0.40 * skill_score) +
            (0.20 * rating_score) +
            (0.20 * exp_score) +
            (0.10 * avail_score) +
            (0.10 * feedback_score)
        )

        compatibility_percentage = round(weighted_score * 100, 1)

        # Generate explainable recommendation details
        matching_str = ", ".join(skill_res["matching_skills"]) if skill_res["matching_skills"] else "General match"
        explanation = (
            f"Matches {len(skill_res['matching_skills'])} of {len(learner_skills)} requested skills ({matching_str}). "
            f"Rated {rating}/5.0 with {exp_years} yrs experience and {mentor_avail} availability."
        )

        recommendation_entry = {
            "mentor_id": str(mentor.get("_id")),
            "name": mentor.get("name", "Student Mentor"),
            "email": mentor.get("email", ""),
            "college": mentor.get("college", ""),
            "department": mentor.get("department", ""),
            "year": mentor.get("year", ""),
            "bio": mentor.get("bio", ""),
            "teach_skills": mentor_teach_skills,
            "matching_skills": skill_res["matching_skills"],
            "missing_skills": skill_res["missing_skills"],
            "experience_years": exp_years,
            "availability": mentor_avail,
            "rating": rating,
            "total_ratings": total_ratings,
            "compatibility_score": compatibility_percentage,
            "explanation": explanation,
            "score_breakdown": {
                "skill_compatibility": round(skill_score * 100, 1),
                "rating_score": round(rating_score * 100, 1),
                "experience_score": round(exp_score * 100, 1),
                "availability_score": round(avail_score * 100, 1),
                "feedback_score": round(feedback_score * 100, 1)
            }
        }

        recommendations.append(recommendation_entry)

    # Sort mentors from highest compatibility score to lowest
    recommendations.sort(key=lambda x: x["compatibility_score"], reverse=True)

    return recommendations

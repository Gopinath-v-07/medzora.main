import joblib
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.exceptions import HTTPException
import jwt
import datetime
from functools import wraps
import requests
import os
import pathlib
import json
from dotenv import load_dotenv

# Load .env.local from the project root
load_dotenv(pathlib.Path(__file__).parent.parent / ".env.local")

app = Flask(__name__)
CORS(app)

# Security Configuration
app.config['SECRET_KEY'] = os.environ.get("JWT_SECRET_KEY", "fallback-secret-key-for-dev-only")
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/medzora")
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# --- Health Check ---
@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy", "postgres": "connected"}), 200

# --- Global Error Handler ---
@app.errorhandler(Exception)
def handle_error(e):
    code = 500
    if isinstance(e, HTTPException):
        code = e.code
    print(f"Server Error: {str(e)}")
    return jsonify({"error": str(e)}), code

# --- Authentication Decorator ---
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]
        
        if not token:
            return jsonify({'error': 'Token is missing!'}), 401
        
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = User.query.get(data['user_id'])
            if not current_user:
                return jsonify({'error': 'User not found!'}), 401
        except Exception as e:
            return jsonify({'error': 'Token is invalid or expired!'}), 401
            
        return f(current_user, *args, **kwargs)
    return decorated

# --- Models ---

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(20), nullable=False) # 'PATIENT', 'DOCTOR'
    doctor_code = db.Column(db.String(50), nullable=True) # The link code
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

class Profile(db.Model):
    __tablename__ = 'profiles'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    age = db.Column(db.String(10))
    gender = db.Column(db.String(20))
    preferred_language = db.Column(db.String(10), default='en')
    address_line1 = db.Column(db.String(200))
    address_line2 = db.Column(db.String(200))
    district = db.Column(db.String(100))
    state = db.Column(db.String(100))
    country = db.Column(db.String(100), default='India')

class MedicalRecord(db.Model):
    __tablename__ = 'medical_records'
    id = db.Column(db.String(50), primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    doctor_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    data = db.Column(db.JSON, nullable=False) # Stores the full record object
    status = db.Column(db.String(50), default='PENDING')
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

CONSTANT_DOCTOR_EMAIL = "doctor@medzora.com"

# Create tables and default doctor
with app.app_context():
    try:
        db.create_all()
        # Ensure constant doctor exists
        doctor = User.query.filter_by(email=CONSTANT_DOCTOR_EMAIL).first()
        if not doctor:
            hashed_pw = generate_password_hash("doctor123")
            doctor = User(email=CONSTANT_DOCTOR_EMAIL, password_hash=hashed_pw, role="DOCTOR")
            db.session.add(doctor)
            db.session.commit()
            
            doc_profile = Profile(
                user_id=doctor.id,
                name="Krithika V",
                age="32",
                gender="Female",
                preferred_language="en",
                address_line1="Medzora Speciality Clinic",
                state="Tamil Nadu",
                country="India"
            )
            db.session.add(doc_profile)
            db.session.commit()
            print(f"Constant Doctor '{CONSTANT_DOCTOR_EMAIL}' created as 'Krithika V'.")
        else:
            # Update name if it's already there but different
            profile = Profile.query.filter_by(user_id=doctor.id).first()
            if profile and profile.name != "Krithika V":
                profile.name = "Krithika V"
                db.session.commit()
                print("Default doctor name updated to 'Krithika V'.")
        
        print("Database tables and default doctor verified.")
    except Exception as e:
        print(f"Database connection/initialization failed: {e}")

# --- ML Model Loading ---

print("Loading ML models for medication/diagnosis prediction...")
try:
    current_dir = os.path.dirname(os.path.abspath(__file__))
    rf_model = joblib.load(os.path.join(current_dir, "medicine_model.pkl"))
    vectorizer = joblib.load(os.path.join(current_dir, "tfidf_vectorizer.pkl"))
    label_encoder = joblib.load(os.path.join(current_dir, "label_encoder.pkl"))
    print("Models loaded successfully.")
except Exception as e:
    print(f"Failed to load models: {e}")
    rf_model, vectorizer, label_encoder = None, None, None

# --- Auth Endpoints ---

@app.route('/auth/signup', methods=['POST'])
def signup():
    data = request.json
    
    # Doctor verification code check
    role = data.get('role', '').upper()
    if role == 'DOCTOR':
        required_code = os.environ.get("DOCTOR_SIGNUP_CODE", "MEDZORA-DOC-2026")
        if data.get('doctorCode') != required_code:
            return jsonify({'error': 'INVALID_CODE'}), 400

    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'ID_EXISTS'}), 400
        
    hashed_pw = generate_password_hash(data['password'])
    doctor_code = data.get('doctorCode') # Both patients and doctors send this
    
    new_user = User(
        email=data['email'], 
        password_hash=hashed_pw, 
        role=role,
        doctor_code=doctor_code
    )
    db.session.add(new_user)
    db.session.commit()
    
    new_profile = Profile(
        user_id=new_user.id,
        name=data['name'],
        age=data.get('age'),
        gender=data.get('gender'),
        preferred_language=data.get('preferredLanguage', 'en'),
        address_line1=data.get('addressLine1'),
        address_line2=data.get('addressLine2'),
        district=data.get('district'),
        state=data.get('state')
    )
    db.session.add(new_profile)
    db.session.commit()
    
    token = jwt.encode({
        'user_id': new_user.id,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    }, app.config['SECRET_KEY'], algorithm="HS256")
    
    return jsonify({
        'status': 'SUCCESS',
        'token': token,
        'user': {'id': new_user.id, 'role': new_user.role, 'email': new_user.email}
    }), 201

@app.route('/auth/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(email=data['email']).first()
    
    if user and check_password_hash(user.password_hash, data['password']):
        token = jwt.encode({
            'user_id': user.id,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }, app.config['SECRET_KEY'], algorithm="HS256")
        
        profile = Profile.query.filter_by(user_id=user.id).first()
        return jsonify({
            'status': 'SUCCESS',
            'token': token,
            'user': {'id': user.id, 'role': user.role, 'email': user.email},
            'profile': {
                'id': user.id,
                'name': profile.name,
                'age': profile.age,
                'gender': profile.gender,
                'preferredLanguage': profile.preferred_language
            }
        })
    
    return jsonify({'error': 'Invalid credentials'}), 401

# --- ML & Data Endpoints ---

@app.route('/predict', methods=['POST'])
@token_required
def predict(current_user):
    if not all([rf_model, vectorizer, label_encoder]):
        return jsonify({'error': 'Models not loaded'}), 500
        
    data = request.json
    symptoms = data.get('symptoms', '')
    if not symptoms:
        return jsonify({'error': 'No symptoms provided'}), 400
        
    try:
        vec = vectorizer.transform([symptoms])
        pred_class = rf_model.predict(vec)
        pred_label = label_encoder.inverse_transform(pred_class)[0]
        clean_diagnosis = pred_label.split('(')[0].strip() if '(' in pred_label else pred_label
        
        return jsonify({
            'prediction': clean_diagnosis,
            'raw_label': pred_label
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

SERP_API_KEY = os.environ.get("SERP_API_KEY", "YOUR_SERP_API_KEY")

@app.route('/nearby-medicals', methods=['GET'])
@token_required
def nearby_medicals(current_user):
    lat = request.args.get('lat')
    lon = request.args.get('lon')
    if not lat or not lon: return jsonify({'error': 'Missing coordinates'}), 400
        
    params = {"engine": "google_maps", "q": "medical shop", "ll": f"@{lat},{lon},15z", "api_key": SERP_API_KEY}
    print(f"Fetching pharmacies with params: {params}")
    try:
        response = requests.get("https://www.searchapi.io/api/v1/search", params=params)
        print(f"SearchAPI.io response status: {response.status_code}")
        results = response.json()
        print(f"Results keys: {results.keys()}")
        if "error" in results:
            print(f"SearchAPI.io Error: {results['error']}")
            
        medicals = []
        local_results = results.get("local_results", [])
        print(f"Found {len(local_results)} local results")
        
        for place in local_results:
            gps = place.get("gps_coordinates", {})
            medicals.append({
                "name": place.get("title"), 
                "address": place.get("address"), 
                "lat": gps.get("latitude"), 
                "lng": gps.get("longitude"),
                "rating": place.get("rating")
            })
        return jsonify(medicals)
    except Exception as e:
        print(f"Pharmacy Search Traceback: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/records', methods=['GET', 'POST'])
@token_required
def manage_records(current_user):
    if request.method == 'POST':
        data = request.json
        record = MedicalRecord.query.get(data['id'])
        
        # Security check: User can only update their own record unless they are the constant doctor
        if current_user.role != 'DOCTOR' and str(data['patientData']['id']) != str(current_user.id):
            return jsonify({'error': 'Unauthorized access to this record'}), 403

        # Get constant doctor ID
        constant_doc = User.query.filter_by(email=CONSTANT_DOCTOR_EMAIL).first()
        doc_id = constant_doc.id if constant_doc else None
        
        # Override with current_user if they are the one updating
        if current_user.role == 'DOCTOR':
            doc_id = current_user.id

        if record:
            record.data = data
            record.status = data.get('status', record.status)
            if doc_id: record.doctor_id = doc_id
        else:
            try:
                p_id = int(data['patientData']['id'])
            except:
                p_id = current_user.id # Fallback to current user if it's a patient
                
            new_record = MedicalRecord(
                id=data['id'], 
                patient_id=p_id, 
                doctor_id=doc_id, 
                data=data, 
                status=data.get('status', 'PENDING')
            )
            db.session.add(new_record)
        
        try:
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500
            
        return jsonify({'status': 'SUCCESS'})
    else:
        # GET records
        patient_id = request.args.get('patient_id')
        doctor_id = request.args.get('doctor_id')
        
        # Security: Patients can only see their own records.
        if current_user.role == 'PATIENT':
            records = MedicalRecord.query.filter_by(patient_id=current_user.id).all()
        elif current_user.role == 'DOCTOR':
            # Authorized doctors see records of patients with MAPPING DOCTOR CODE
            # If the doctor has a code, they see all patients with that same code.
            if current_user.doctor_code:
                # Find all patients with this doctor's code
                all_patients = User.query.filter_by(doctor_code=current_user.doctor_code, role='PATIENT').all()
                patient_ids = [u.id for u in all_patients]
                records = MedicalRecord.query.filter(MedicalRecord.patient_id.in_(patient_ids)).all()
            else:
                # Fallback to direct assignment or all if no code (for the constant doctor)
                records = MedicalRecord.query.all()
        else:
            records = []
            
        return jsonify([r.data for r in records])

if __name__ == '__main__':
    app.run(port=5000, debug=False)

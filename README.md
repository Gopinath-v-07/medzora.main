# Medzora - AI Medical Assistant

## Project Overview

Medzora is a sophisticated web application designed to streamline the initial stages of medical diagnosis by leveraging the power of Generative AI. It serves as a bridge between patients and doctors, providing a dual-interface platform where patients can receive an AI-driven preliminary analysis of their symptoms, which is then professionally reviewed, edited, and verified by a doctor.

The primary goal is to reduce administrative workload for medical professionals and provide patients with a structured and informative preliminary report, which can be discussed and finalized during a formal consultation.

---

## 🚀 Application Setup

This application relies on a dual-server architecture to function correctly (React Frontend + Python ML Backend). You must run **both** servers simultaneously.

### 1. Python ML Backend (Diagnosis Engine)
You need to install the required Python packages and start the Flask service to load the `.pkl` machine learning models.
```bash
cd services
pip install flask flask-cors joblib scikit-learn
python python_api.py
```
*The Python server will run on `http://127.0.0.1:5000`.*

### 2. React Frontend 
In a separate terminal, install the Node dependencies and start the Vite development server. Make sure you have your `.env.local` configured with your `API_KEY`!
```bash
npm install
npm run dev
```

---

## How It Works: Core Functionality

The application operates with two distinct user roles: **Patient** and **Doctor**.

### 1. Patient Workflow

1.  **Authentication**: Patients can create a new account (Sign Up) or log in with their existing Patient ID and password.
2.  **Dashboard**: After logging in, the patient sees their dashboard, which displays a list of their past, verified medical reports.
3.  **New Report Submission**: The patient can initiate a new consultation by filling out a comprehensive form that includes:
    *   **Personal Information**: Name and age.
    *   **Symptoms**: A checklist of common symptoms and a field for describing other symptoms.
    *   **Medical History**: Optional fields for past conditions and current medications.
4.  **AI Analysis**: Upon submission, the patient's data is sent to the Google Gemini API. The application shows a loading state while the AI performs its analysis.
5.  **Pending Report View**: Once the analysis is complete, the patient can view the AI-generated report. This report is clearly marked as **"Pending Doctor Verification"**.
6.  **Verified Reports**: Once a doctor has reviewed and verified the report, it moves to the patient's main dashboard under "Past Medical Reports". The patient can then:
    *   **Expand** to see the final diagnosis, medication, diet plan, and the doctor's notes.
    *   **Download** the complete report as a professionally formatted PDF.
    *   **Chat** with the verifying doctor directly through a built-in messaging interface to ask follow-up questions.

### 2. Doctor Workflow

1.  **Authentication**: Doctors log in using their unique Doctor ID and password.
2.  **Dashboard**: The doctor's dashboard is split into two main sections:
    *   **Reports for Review**: A list of new patient submissions that are pending review.
    *   **My Verified Reports**: A history of all reports the doctor has previously verified.
3.  **Review Process**: The doctor can select any pending report to open a detailed review screen. This screen includes:
    *   All the data submitted by the patient.
    *   The complete AI-generated analysis.
4.  **Edit and Verify**: The doctor has full control to **edit** any part of the AI's analysis (diagnosis, severity, medication, diet plan) to ensure it aligns with their professional judgment. They can also add their own **Doctor's Notes**.
5.  **Finalization**: After making necessary changes, the doctor clicks the **"Verify & Send to Patient"** button. This action:
    *   Updates the report's status to `Verified`.
    *   Timestamps the verification and attaches the doctor's ID.
    *   Makes the final report available to the patient.
6.  **Post-Verification**: Verified reports move to the doctor's "My Verified Reports" list, where they can be reviewed again or used to chat with the patient.

---

## The AI Technology: Dual-Model Hybrid Architecture

A key feature of Medzora is its intelligent two-step AI analysis. By combining traditional Machine Learning with advanced Large Language Models, it achieves high diagnosis accuracy while maintaining conversational nuance.

1.  **Step 1: ML Pre-Diagnosis (Python Backend)**: When a patient submits their symptoms, the frontend first sends the data to the local Python Flask API. This API uses a trained `RandomForestClassifier` and a `TfidfVectorizer` (loaded from serialized `.pkl` files) to rapidly categorize the text symptoms into a highly probable medical diagnosis label based on its focused training dataset.
2.  **Step 2: LLM Grounded Generation (Gemini)**: The application then communicates with the **Google Gemini API**. It provides Gemini with the patient's full data profile **AND** the mathematically predicted diagnosis from Step 1. Gemini is instructed to act as a medical professional: verifying the diagnosis against the provided context, determining problem severity, prescribing relevant targeted medications, creating a diet plan, and formulating the final reasoning. 

This hybrid approach ensures that the AI's output is not a generic text generation, but rather an expert-styled consultation deeply grounded in the statistical backbone of an internal classifier model.

---

## Technical Stack

*   **Frontend**: React with TypeScript for a robust, type-safe user interface.
*   **Styling**: Tailwind CSS configured for a modern, responsive, glassmorphic design system.
*   **Machine Learning Backend**: Python, Flask, `scikit-learn`, `joblib`.
*   **LLM Integration**: The official `@google/genai` SDK is used to interact with the **Google Gemini API**.
*   **PDF Generation**: `jspdf` and `jspdf-autotable` are used to generate downloadable PDF reports on the client-side.
*   **State Management**: React hooks (`useState`) are used for local component state and prop drilling for global state, suitable for an application of this scale. All data is mock data held in memory and resets on page refresh.

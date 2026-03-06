import { GoogleGenAI, Type } from "@google/genai";
import { PatientData, AIReport } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

// The dependency on medical_conditions.json has been removed to resolve loading errors
// and perform analysis directly using the Gemini model's general knowledge.
// - Removed MedicalCondition interface
// - Removed medicalConditions array
// - Removed loadMedicalData function

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const model = "gemini-2.5-flash";

const reportSchema = {
  type: Type.OBJECT,
  properties: {
    diagnosis: {
      type: Type.STRING,
      description: "The most likely probable diagnosis based on the provided symptoms and patient data.",
    },
    severity: {
      type: Type.STRING,
      description: "The estimated severity of the condition. Must be one of: 'Low', 'Medium', 'High'.",
    },
    medication: {
      type: Type.STRING,
      description: "Suggest relevant medications based on the diagnosis. List only the names of the medications, separated by commas. Do not include dosage, frequency, or prescription information. e.g., 'Ibuprofen, Acetaminophen'.",
    },
    dietPlan: {
      type: Type.STRING,
      description: "A plain text summary of dietary recommendations. e.g., 'Low-salt diet, Weight loss, Regular aerobic exercise'.",
    },
    reasoning: {
      type: Type.STRING,
      description: "A brief, clear explanation for the diagnosis, referencing how the patient's symptoms align with the diagnosis. This is for a medical professional to review.",
    }
  },
  required: ["diagnosis", "severity", "medication", "dietPlan", "reasoning"],
};

export const analyzePatientData = async (patientData: PatientData): Promise<AIReport> => {
  const patientSymptoms = [...patientData.symptoms, patientData.otherSymptoms].filter(s => s).join(', ');

  const medicalHistoryPrompt = patientData.medicalHistory.startsWith('data:')
    ? `A file named '${patientData.medicalHistoryFileName}' has been provided by the patient.`
    : patientData.medicalHistory || 'None provided';

  // 1. Fetch the diagnosis from our local Python ML model
  let modelDiagnosis = "Unknown";
  try {
    const mlResponse = await fetch(`${API_BASE}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symptoms: patientSymptoms })
    });
    if (mlResponse.ok) {
      const mlData = await mlResponse.json();
      modelDiagnosis = mlData.prediction || "Unknown";
    } else {
      console.warn("ML model response not okay:", mlResponse.status);
    }
  } catch (err) {
    console.warn("Failed to reach the local Python ML service. Skipping initial ML prediction.", err);
  }

  // 2. Instruct Gemini what to do with the pre-diagnosed condition
  const prompt = `
      Analyze the following patient's data and generate a preliminary medical report.
      Our internal machine learning model predicted the following diagnosis based on the symptoms: "${modelDiagnosis}".

      --- PATIENT DATA START ---
      - Name: ${patientData.name}
      - Age: ${patientData.age}
      - Gender: ${patientData.gender}
      - Email: ${patientData.email}
      - Symptoms: ${patientSymptoms}
      - Past Medical History: ${medicalHistoryPrompt}
      - Current Medications: ${patientData.currentMedications || 'None provided'}
      --- PATIENT DATA END ---

      Based on this data and the provided pre-diagnosis ("${modelDiagnosis}"), generate a report in the required JSON format.
      - In the 'diagnosis' field, confirm or adjust the pre-diagnosis based on the other contexts available.
      - In the 'medication' field, use your medical expertise to suggest medications explicitly targeted at relieving the aforementioned diagnosis.
      - The 'reasoning' field should explain how the patient's symptoms led to the diagnosis and why the suggested medications apply.
  `;

  let jsonString = '';
  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: "You are a highly intelligent medical AI assistant. Your role is to formulate patient prescriptions and confirm initial diagnostics based on your general medical knowledge. Your output must be a structured JSON object. Your suggestions are for review by a qualified medical professional. Be concise and professional.",
        responseMimeType: "application/json",
        responseSchema: reportSchema,
      },
    });

    jsonString = response.text.trim();
    // It's possible for the response to be wrapped in ```json ... ```, so we clean it.
    const cleanedJsonString = jsonString.replace(/^```json\s*|```$/g, '');
    const report: AIReport = JSON.parse(cleanedJsonString);
    return report;

  } catch (error) {
    console.error("Error calling Gemini API for analysis:", error);
    console.error("Raw AI response received before error:", jsonString);
    throw new Error("Failed to get analysis from AI. Please check the console for more details.");
  }
};
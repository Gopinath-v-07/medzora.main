import express from 'express';
import axios from 'axios';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the root .env.local file
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const app = express();
app.use(cors());

// Require GOOGLE_API_KEY but don't crash immediately, let it fail on fetch if missing
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

if (!GOOGLE_API_KEY) {
    console.warn("WARNING: GOOGLE_API_KEY is missing from .env.local.");
}

app.get("/api/nearby-pharmacies", async (req, res) => {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
        return res.status(400).json({ error: "Latitude and longitude are required." });
    }

    try {
        const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=3000&type=pharmacy&key=${GOOGLE_API_KEY}`;

        const response = await axios.get(url);

        if (response.data.status !== 'OK') {
            console.error("Google API Error:", response.data);
            return res.status(400).json({ error: response.data.error_message || "Google API returned an error status." });
        }

        const pharmacies = response.data.results.map(place => ({
            name: place.name,
            address: place.vicinity,
            rating: place.rating,
            lat: place.geometry.location.lat,
            lng: place.geometry.location.lng,
            place_id: place.place_id // Useful for links later if needed
        }));

        res.json(pharmacies);

    } catch (error) {
        console.error("Error fetching pharmacies:", error.message);
        res.status(500).json({ error: "Failed to fetch pharmacies from Google API." });
    }
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Pharmacy API Server running on port ${PORT}`);
});

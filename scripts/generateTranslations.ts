import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = 'AIzaSyDgyWwwmHOROsPZclCm-LGzZs_uoYNhVDk';
const TARGET_LANGUAGES = [
    'es', 'fr', 'pt', 'de', 'ar', 'hi', 'bn', 'zh', 'ja',
    'id', 'tr', 'vi', 'ko', 'ru', 'it', 'pl', 'th', 'tl'
];

const STRINGS = {
    "healing_check": "Healing Check",
    "body_adjusting": "Your body is adjusting.",
    "feeling_symptoms": "Are you feeling any withdrawal symptoms right now?",
    "yes": "Yes",
    "no": "No",
    "view_history": "View check-in history",
    "no_noticeable_symptoms": "No noticeable symptoms.",
    "thats_a_good_sign": "That's a good sign.",
    "system_stabilizing": "Your system is stabilizing.",
    "day_without_nicotine": "Each day without nicotine helps your body reset.",
    "done": "Done",
    "what_feels_noticeable": "What feels most noticeable?",
    "describe_feeling": "Describe what you're feeling...",
    "continue": "Continue",
    "how_intense": "How intense is it right now?",
    "i_understand": "I understand",
    "healing_uncomfortable": "You're healing, even if it's uncomfortable.",
    "body_learning": "Your body is learning to function without nicotine — and that's powerful.",
    "finish_checkin": "Finish Check-In",
    "checkin_history": "Check-In History",
    "no_checkins_yet": "No check-ins yet.",
    "complete_first_checkin": "Complete your first Healing Check to start tracking.",
    "back_to_checkin": "Back to Check-In",
    "no_symptoms": "No symptoms",
    "symptoms_logged": "Symptoms logged",
    "irritability": "Irritability",
    "restlessness": "Restlessness",
    "headache": "Headache",
    "low_mood": "Low mood",
    "trouble_sleeping": "Trouble sleeping",
    "strong_cravings": "Strong cravings",
    "other": "Other",
    "very_mild": "Very Mild",
    "mild": "Mild",
    "moderate": "Moderate",
    "strong": "Strong",
    "very_strong": "Very Strong",
    "passing_signal": "This is just a passing signal.",
    "still_in_control": "You're still in control.",
    "handled_level_before": "You've handled this level before.",
    "not_turn_into_action": "It doesn't have to turn into action.",
    "moment_to_pause": "This is the moment to pause.",
    "take_one_breath": "Take one breath before deciding.",
    "feels_intense": "This feels intense, but it will peak and pass.",
    "not_respond_immediately": "You don't have to respond immediately.",
    "this_is_a_wave": "This is a wave.",
    "pause_one_minute": "Pause for one minute before doing anything."
};

async function translate(text: string, target: string) {
    try {
        const response = await axios.post(`https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`, {
            q: text,
            target: target
        });
        return response.data.data.translations[0].translatedText;
    } catch (error) {
        console.error(`Error translating to ${target}:`, error);
        return text;
    }
}

async function generate() {
    const localesDir = path.join(__dirname, '../src/i18n/locales');
    if (!fs.existsSync(localesDir)) {
        fs.mkdirSync(localesDir, { recursive: true });
    }

    // Save English as-is
    fs.writeFileSync(path.join(localesDir, 'en.json'), JSON.stringify(STRINGS, null, 2));
    console.log('Saved en.json');

    for (const lang of TARGET_LANGUAGES) {
        console.log(`Translating to ${lang}...`);
        const translated: any = {};
        for (const [key, value] of Object.entries(STRINGS)) {
            translated[key] = await translate(value, lang);
        }
        fs.writeFileSync(path.join(localesDir, `${lang}.json`), JSON.stringify(translated, null, 2));
        console.log(`Saved ${lang}.json`);
    }
}

generate();

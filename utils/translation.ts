export const SUPPORTED_LANGUAGES = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'Hindi (हिंदी)' },
    { code: 'ta', label: 'Tamil (தமிழ்)' },
    { code: 'te', label: 'Telugu (తెలుగు)' },
    { code: 'bn', label: 'Bengali (বাংলা)' },
    { code: 'mr', label: 'Marathi (मराठी)' },
    { code: 'gu', label: 'Gujarati (ગુજરાતી)' },
    { code: 'kn', label: 'Kannada (ಕನ್ನಡ)' },
    { code: 'ml', label: 'Malayalam (മലയാളம்)' },
    { code: 'pa', label: 'Punjabi (ਪੰਜਾਬੀ)' },
    { code: 'or', label: 'Odia (ଓଡ଼ିଆ)' },
    { code: 'as', label: 'Assamese (অসমীয়া)' },
    { code: 'ur', label: 'Urdu (اردو)' },
    { code: 'sa', label: 'Sanskrit (संस्कृतम्)' },
    { code: 'ks', label: 'Kashmiri (کٲشُر)' },
    { code: 'ne', label: 'Nepali (नेपाली)' },
    { code: 'sd', label: 'Sindhi (سنڌي)' },
    { code: 'kok', label: 'Konkani (कोंकणी)' },
    { code: 'mni', label: 'Manipuri (মৈতৈলোন)' },
    { code: 'brx', label: 'Bodo (बड़ो)' },
    { code: 'doi', label: 'Dogri (डोगरी)' },
    { code: 'mai', label: 'Maithili (मैथिली)' },
    { code: 'sat', label: 'Santali (Santali)' }
] as const;

export type SupportedLanguageCode = typeof SUPPORTED_LANGUAGES[number]['code'];

export const changeAppLanguage = (langCode: string) => {
    // Determine the host for the cookie based on the current window location
    const hostname = window.location.hostname;
    const domain = hostname === 'localhost' ? '' : `; domain=${hostname}`;

    // Update the googtrans cookie to standard paths
    document.cookie = `googtrans=/en/${langCode}; path=/${domain}`;
    document.cookie = `googtrans=/en/${langCode}; path=/`;

    // Dispatch a custom event in case components want to listen for purely React-side updates
    window.dispatchEvent(new CustomEvent('appLanguageChanged', { detail: { langCode } }));

    // Force reload the page to allow the Google Translate script to read the new cookie
    // and instantly translate the entire DOM on the next paint cycle.
    window.location.reload();
};

export const getCurrentAppLanguage = (): string => {
    const match = document.cookie.match(/googtrans=\/en\/([^;]+)/);
    return match ? match[1] : 'en';
};

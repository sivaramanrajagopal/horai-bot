// src/config/constants.js

const planets = {
    surya: { 
        name: 'சூரியன்', 
        english: 'Sun (Suryan)',
        tamilDescription: 'அரசு அதிகாரிகளை சந்திக்க, பதவி ஏற்க உகந்த நேரம்',
        englishDescription: 'Auspicious time for meeting officials and taking up positions',
        characteristics: {
            element: 'Fire',
            nature: 'Hot',
            gender: 'Masculine',
            direction: 'East',
            governs: ['Authority', 'Government', 'Father', 'Health']
        }
    },
    sukra: { 
        name: 'சுக்ரன்', 
        english: 'Venus (Sukran)',
        tamilDescription: 'கலை, அழகு சார்ந்த செயல்களுக்கு உகந்த நேரம்',
        englishDescription: 'Auspicious time for arts and beauty-related activities',
        characteristics: {
            element: 'Water',
            nature: 'Cool',
            gender: 'Feminine',
            direction: 'Southeast',
            governs: ['Arts', 'Beauty', 'Marriage', 'Pleasure']
        }
    },
    budha: { 
        name: 'புதன்', 
        english: 'Mercury (Budhan)',
        tamilDescription: 'கல்வி, வியாபாரம் செய்ய உகந்த நேரம்',
        englishDescription: 'Auspicious time for education and business',
        characteristics: {
            element: 'Earth',
            nature: 'Mixed',
            gender: 'Neutral',
            direction: 'North',
            governs: ['Education', 'Commerce', 'Communication']
        }
    },
    chandra: { 
        name: 'சந்திரன்', 
        english: 'Moon (Chandran)',
        tamilDescription: 'பயணம், புதிய முயற்சிகளுக்கு உகந்த நேரம்',
        englishDescription: 'Auspicious time for travel and new ventures',
        characteristics: {
            element: 'Water',
            nature: 'Cool',
            gender: 'Feminine',
            direction: 'Northwest',
            governs: ['Mind', 'Emotions', 'Mother', 'Water']
        }
    },
    sani: { 
        name: 'சனி', 
        english: 'Saturn (Sani)',
        tamilDescription: 'பழைய பொருட்களை அகற்ற உகந்த நேரம்',
        englishDescription: 'Auspicious time for removing old things',
        characteristics: {
            element: 'Air',
            nature: 'Cold',
            gender: 'Neutral',
            direction: 'West',
            governs: ['Justice', 'Discipline', 'Time', 'Karma']
        }
    },
    guru: { 
        name: 'குரு', 
        english: 'Jupiter (Guru)',
        tamilDescription: 'ஆன்மீக செயல்களுக்கு உகந்த நேரம்',
        englishDescription: 'Auspicious time for spiritual activities',
        characteristics: {
            element: 'Ether',
            nature: 'Sattvic',
            gender: 'Masculine',
            direction: 'Northeast',
            governs: ['Wisdom', 'Spirituality', 'Wealth']
        }
    },
    cevvai: { 
        name: 'செவ்வாய்', 
        english: 'Mars (Sevvai)',
        tamilDescription: 'வீரம் சார்ந்த செயல்களுக்கு உகந்த நேரம்',
        englishDescription: 'Auspicious time for brave ventures',
        characteristics: {
            element: 'Fire',
            nature: 'Hot',
            gender: 'Masculine',
            direction: 'South',
            governs: ['Energy', 'Courage', 'Property', 'Siblings']
        }
    }
};

const planetSequences = {
    0: ['surya', 'sukra', 'budha', 'chandra', 'sani', 'guru', 'cevvai'], // Sunday
    1: ['chandra', 'sani', 'guru', 'cevvai', 'surya', 'sukra', 'budha'], // Monday
    2: ['cevvai', 'surya', 'sukra', 'budha', 'chandra', 'sani', 'guru'], // Tuesday
    3: ['budha', 'chandra', 'sani', 'guru', 'cevvai', 'surya', 'sukra'], // Wednesday
    4: ['guru', 'cevvai', 'surya', 'sukra', 'budha', 'chandra', 'sani'], // Thursday
    5: ['sukra', 'budha', 'chandra', 'sani', 'guru', 'cevvai', 'surya'], // Friday
    6: ['sani', 'guru', 'cevvai', 'surya', 'sukra', 'budha', 'chandra']  // Saturday
};

const DEFAULT_LOCATION = {
    latitude: 13.0827,
    longitude: 80.2707,
    city: 'Chennai'
};

module.exports = {
    planets,
    planetSequences,
    DEFAULT_LOCATION
};
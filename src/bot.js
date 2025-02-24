const { Telegraf, Markup } = require('telegraf');
const dotenv = require('dotenv');
schedule = require('node-schedule');
const moment = require('moment-timezone');
const fs = require('fs');
// ✅ Initialize Express Server
const app = express();
app.get('/', (req, res) => {
    res.send('Horai Bot is running!');
});

// ✅ Start Server on Render Port (Default: 3000)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});

// Load environment variables
dotenv.config();

// Initialize bot
const bot = new Telegraf(process.env.BOT_TOKEN);


// Store user preferences and reminders
const userPreferences = new Map();
let userReminders = new Map();
let subscribedUsers = new Set(); // Track users who enable notifications


// Load reminders from file on startup
const remindersFile = 'reminders.json';
if (fs.existsSync(remindersFile)) {
    const data = fs.readFileSync(remindersFile);
    userReminders = new Map(JSON.parse(data));
} else {
    userReminders = new Map();
}

// Save reminders periodically
function saveReminders() {
    fs.writeFileSync(remindersFile, JSON.stringify([...userReminders]));
}
function generateDailySchedule(ctx) {
    const userId = ctx.from.id;
    const userLocation = userPreferences.get(userId);

    if (!userLocation) {
        return ctx.reply('Please set your location first using /setlocation command.');
    }

    const { defaultSunrise, timeZone } = userLocation;
    const [sunriseHour, sunriseMinute] = defaultSunrise.split(':').map(Number);
    let scheduleMessage = `📅 **${userLocation.name} - Daily Hora Schedule**\n\n`;

    let horaTime = moment.tz({ hour: sunriseHour, minute: sunriseMinute }, timeZone);
    for (let i = 0; i < 24; i++) {
        const horaIndex = i % 7;
        const planet = DAY_PLANET_SEQUENCE[moment().day()][horaIndex];
        const planetInfo = PLANETS[planet];

        scheduleMessage += `🕒 **${horaTime.format('hh:mm A')} - ${horaTime.add(1, 'hour').format('hh:mm A')}**\n`;
        scheduleMessage += `✨ **Hora:** ${planetInfo.name} (${planetInfo.english})\n`;
        scheduleMessage += `✅ **Auspicious:** ${planetInfo.auspicious.slice(0, 2).join(', ')}\n`;
        scheduleMessage += `⛔ **Avoid:** ${planetInfo.avoid.slice(0, 2).join(', ')}\n\n`;
    }

    ctx.reply(scheduleMessage);
}

function sendHoraNotification() {
    const now = moment();
    
    subscribedUsers.forEach((userId) => {
        const userLocation = userPreferences.get(userId);
        if (!userLocation) return;

        const horaiDetails = getCurrentHoraiDetails(
            userLocation.defaultSunrise,
            userLocation.defaultSunset,
            userLocation.timeZone
        );

        if (horaiDetails.error) return;

        const message = 
            `📍 **${userLocation.name}**\n` +
            `🕒 **நேரம்:** ${horaiDetails.currentTime}\n` +
            `🌟 **முக்கிய ஹோரை:** ${horaiDetails.planet.name} (${horaiDetails.planet.english})\n` +
            `⏳ **நேரம்:** ${horaiDetails.timeRange.start} - ${horaiDetails.timeRange.end}\n` +
            `✅ **சிறந்தது:** ${horaiDetails.planet.auspicious.slice(0, 2).join(', ')}\n` +
            `⛔ **தவிர்க்க:** ${horaiDetails.planet.avoid.slice(0, 2).join(', ')}\n\n` +
            `🔹 **உப-ஹோரை:** ${horaiDetails.subHorai.planet.name} (${horaiDetails.subHorai.planet.english})\n` +
            `⏳ ${horaiDetails.subHorai.timeRange.start} - ${horaiDetails.subHorai.timeRange.end}`;

        bot.telegram.sendMessage(userId, message);
    });
}

// Location data
const LOCATIONS = {
    // Indian Cities
    'CHENNAI': {
        name: 'சென்னை',
        englishName: 'Chennai',
        latitude: 13.0827,
        longitude: 80.2707,
        defaultSunrise: '06:00',
        defaultSunset: '18:00',
        timeZone: 'Asia/Kolkata'
    },
    'BANGALORE': {
        name: 'பெங்களூரு',
        englishName: 'Bangalore',
        latitude: 12.9716,
        longitude: 77.5946,
        defaultSunrise: '06:15',
        defaultSunset: '18:15',
        timeZone: 'Asia/Kolkata'
    },
    'MUMBAI': {
        name: 'மும்பை',
        englishName: 'Mumbai',
        latitude: 19.0760,
        longitude: 72.8777,
        defaultSunrise: '06:30',
        defaultSunset: '18:30',
        timeZone: 'Asia/Kolkata'
    },
    'DELHI': {
        name: 'டெல்லி',
        englishName: 'Delhi',
        latitude: 28.6139,
        longitude: 77.2090,
        defaultSunrise: '05:45',
        defaultSunset: '18:45',
        timeZone: 'Asia/Kolkata'
    },
    // International Cities
    'PLEASANTON': {
        name: 'Pleasanton',
        englishName: 'Pleasanton, CA',
        latitude: 37.6624,
        longitude: -121.8747,
        defaultSunrise: '06:45',
        defaultSunset: '18:45',
        timeZone: 'America/Los_Angeles'
    },
    'ATLANTA': {
        name: 'Atlanta',
        englishName: 'Atlanta, GA',
        latitude: 33.7490,
        longitude: -84.3880,
        defaultSunrise: '07:15',
        defaultSunset: '19:15',
        timeZone: 'America/New_York'
    },
    'TORONTO': {
        name: 'Toronto',
        englishName: 'Toronto',
        latitude: 43.6532,
        longitude: -79.3832,
        defaultSunrise: '07:00',
        defaultSunset: '19:00',
        timeZone: 'America/Toronto'
    },
    'SINGAPORE': {
        name: 'Singapore',
        englishName: 'Singapore',
        latitude: 1.3521,
        longitude: 103.8198,
        defaultSunrise: '07:00',
        defaultSunset: '19:00',
        timeZone: 'Asia/Singapore'
    },
    'DUBAI': {
        name: 'Dubai',
        englishName: 'Dubai',
        latitude: 25.2048,
        longitude: 55.2708,
        defaultSunrise: '06:30',
        defaultSunset: '18:30',
        timeZone: 'Asia/Dubai'
    },
    'LONDON': {
        name: 'லண்டன்',
        englishName: 'London',
        latitude: 51.5074,
        longitude: -0.1278,
        defaultSunrise: '07:00',
        defaultSunset: '19:00',
        timeZone: 'Europe/London'
    },
    'MALAYSIA': {
        name: 'மலேசியா',
        englishName: 'Malaysia',
        latitude: 3.1390,
        longitude: 101.6869,
        defaultSunrise: '07:00',
        defaultSunset: '19:00',
        timeZone: 'Asia/Kuala_Lumpur'
    }
};

// Planet sequences
const DAY_PLANET_SEQUENCE = {
    0: ['surya', 'sukra', 'budha', 'chandra', 'sani', 'guru', 'cevvai'], // Sunday
    1: ['chandra', 'sani', 'guru', 'cevvai', 'surya', 'sukra', 'budha'], // Monday
    2: ['cevvai', 'surya', 'sukra', 'budha', 'chandra', 'sani', 'guru'], // Tuesday
    3: ['budha', 'chandra', 'sani', 'guru', 'cevvai', 'surya', 'sukra'], // Wednesday
    4: ['guru', 'cevvai', 'surya', 'sukra', 'budha', 'chandra', 'sani'], // Thursday
    5: ['sukra', 'budha', 'chandra', 'sani', 'guru', 'cevvai', 'surya'], // Friday
    6: ['sani', 'guru', 'cevvai', 'surya', 'sukra', 'budha', 'chandra']  // Saturday
};

// Night follows same sequence
const NIGHT_PLANET_SEQUENCE = DAY_PLANET_SEQUENCE;// Planet definitions and activities
const PLANETS = {
    surya: {
        name: 'சூரியன்',
        english: 'Sun (Suryan)',
        name_en: 'surya',
        auspicious: [
            'அரசு சார்ந்த வேலைகள்',
            'பதவி ஏற்பு',
            'அதிகாரிகளை சந்திக்க',
            'முக்கிய முடிவுகள் எடுக்க'
        ],
        avoid: [
            'சட்ட விவகாரங்கள்',
            'பயணம்'
        ]
    },
    chandra: {
        name: 'சந்திரன்',
        english: 'Moon (Chandran)',
        name_en: 'chandra',
        auspicious: [
            'புதிய முயற்சிகள்',
            'குடும்ப விவகாரங்கள்',
            'பயணம்',
            'நண்பர்களை சந்திக்க'
        ],
        avoid: [
            'மருத்துவ சிகிச்சை',
            'முக்கிய முடிவுகள்'
        ]
    },
    cevvai: {
        name: 'செவ்வாய்',
        english: 'Mars (Cevvai)',
        name_en: 'cevvai',
        auspicious: [
            'உழைப்புடன் தொடர்பான செயல்கள்',
            'படிப்பு',
            'செயல்திறன்'
        ],
        avoid: [
            'சண்டை',
            'சிகிச்சை'
        ]
    },
    budha: {
        name: 'புதன்',
        english: 'Mercury (Budha)',
        name_en: 'budha',
        auspicious: [
            'கலந்து பேசுதல்',
            'கல்வி',
            'புத்திசாலித்தனம் தேவைப்படும் பணிகள்',
            'கணக்கு தொடர்பான வேலைகள்'
        ],
        avoid: [
            'விவாகம்',
            'தள்ளுபடி வியாபாரம்'
        ]
    },
    guru: {
        name: 'குரு',
        english: 'Jupiter (Guru)',
        name_en: 'guru',
        auspicious: [
            'விவாகம்',
            'புதிய முயற்சிகள்',
            'சான்றோர் ஆசிர்வாதம் பெறுதல்',
            'ஆலோசனை தருதல்'
        ],
        avoid: [
            'விசுவாசம் இல்லாத செயல்கள்',
            'தள்ளுபடி வியாபாரம்'
        ]
    },
    sukra: {
        name: 'சுக்கிரன்',
        english: 'Venus (Sukra)',
        name_en: 'sukra',
        auspicious: [
            'சேர்க்கை & திருமணம்',
            'கலை, இசை, நடனம்',
            'அழகு சாதனங்கள் & ஆடைகள்',
            'சந்தோஷம் தரும் செயல்கள்'
        ],
        avoid: [
            'சிக்கல் தரும் வியாபாரம்',
            'புதிய வேலை ஆரம்பம்'
        ]
    },
    sani: {
        name: 'சனி',
        english: 'Saturn (Sani)',
        name_en: 'sani',
        auspicious: [
            'கடின உழைப்பு',
            'திட்டமிட்டு செயல்படுதல்',
            'நீதி, தர்மம் சார்ந்த வேலைகள்'
        ],
        avoid: [
            'புதிய வேலைகள் ஆரம்பித்தல்',
            'பரிட்சை எழுதுதல்'
        ]
    }
};

// Sub-Horai sequences for each planet
const SUB_HORAI_SEQUENCES = {
    surya: ['surya', 'chandra', 'cevvai', 'budha', 'guru'],
    sukra: ['sukra', 'sani', 'surya', 'chandra', 'cevvai'],
    budha: ['budha', 'guru', 'sukra', 'sani', 'surya'],
    chandra: ['chandra', 'cevvai', 'budha', 'guru', 'sukra'],
    sani: ['sani', 'surya', 'chandra', 'cevvai', 'budha'],
    guru: ['guru', 'sukra', 'sani', 'surya', 'chandra'],
    cevvai: ['cevvai', 'budha', 'guru', 'sukra', 'sani']
};

// Time formatting function
function formatTime(hours, minutes) {
    return moment({ hour: hours, minute: minutes }).format("h:mm A (HH:mm)");
}

// Main Horai calculation function
function getCurrentHoraiDetails(sunriseStr, sunsetStr, timezone) {
    try {
        const now = moment().tz(timezone);
        console.log('Current time:', now.format('YYYY-MM-DD HH:mm:ss'));

        const [sunriseHour, sunriseMinute] = sunriseStr.split(':').map(Number);
        const [sunsetHour, sunsetMinute] = sunsetStr.split(':').map(Number);

        const currentMinutes = now.hours() * 60 + now.minutes();
        const sunriseMinutes = sunriseHour * 60 + sunriseMinute;
        const sunsetMinutes = sunsetHour * 60 + sunsetMinute;

        let isDaytime = currentMinutes >= sunriseMinutes && currentMinutes < sunsetMinutes;
        let horaiNumber, periodStart, periodEnd;

        // 1️⃣ **Find the first Hora of the day based on the weekday**
        const dayOfWeek = now.day(); // 0=Sunday, 1=Monday... 6=Saturday

        if (isDaytime) {
            // ✅ **Daytime Hora Calculation**
            const minutesSinceSunrise = currentMinutes - sunriseMinutes;
            horaiNumber = Math.floor(minutesSinceSunrise / 60) % 24;
            periodStart = sunriseMinutes + horaiNumber * 60;
        } else {
            // ✅ **Nighttime Hora Calculation**
            const minutesSinceSunset = (currentMinutes + 1440 - sunsetMinutes) % 1440;
            horaiNumber = (Math.floor(minutesSinceSunset / 60) + 12) % 24; // 🔥 Fix: Shifting Night Hora Correctly
            periodStart = sunsetMinutes + (horaiNumber - 12) * 60;
        }

        periodEnd = periodStart + 60;

        // 2️⃣ **Find the correct Main Hora using proper 24-hour sequence**
        const planetSequence = DAY_PLANET_SEQUENCE[dayOfWeek]; // The correct 24-hour cycle
        const mainPlanet = planetSequence[horaiNumber % 7];

        if (!PLANETS[mainPlanet]) {
            console.error(`⚠️ Error: Planet '${mainPlanet}' is not found in PLANETS.`);
            throw new Error(`Invalid planet lookup for horai ${horaiNumber}: ${mainPlanet}`);
        }

        // 3️⃣ **Find the correct Sub-Hora (Changes every 12 minutes)**
        const minutesIntoHorai = (currentMinutes - periodStart + 1440) % 1440;
        const subHoraiNumber = Math.floor(minutesIntoHorai / 12);
        const subHoraiPlanet = SUB_HORAI_SEQUENCES[mainPlanet][subHoraiNumber % 5];

        console.log(`✅ FIXED Main Horai: ${PLANETS[mainPlanet].english} (${PLANETS[mainPlanet].name})`);
        console.log(`✅ FIXED Sub-Horai: ${PLANETS[subHoraiPlanet].english} (${PLANETS[subHoraiPlanet].name})`);

        return {
            currentTime: formatTime(now.hours(), now.minutes()),
            isDaytime,
            horaiNumber: horaiNumber + 1, // Convert to 1-based index
            planet: PLANETS[mainPlanet],
            subHorai: {
                number: subHoraiNumber + 1, // 1-based index
                planet: PLANETS[subHoraiPlanet],
                timeRange: {
                    start: formatTime(Math.floor((periodStart + subHoraiNumber * 12) / 60), (periodStart + subHoraiNumber * 12) % 60),
                    end: formatTime(Math.floor((periodStart + (subHoraiNumber + 1) * 12) / 60), (periodStart + (subHoraiNumber + 1) * 12) % 60)
                }
            },
            timeRange: {
                start: formatTime(Math.floor(periodStart / 60), periodStart % 60),
                end: formatTime(Math.floor(periodEnd / 60), periodEnd % 60)
            }
        };
    } catch (error) {
        console.error('Error calculating Horai:', error.message);
        return { error: 'Failed to compute Horai' };
    }
}



// Bot command handlers
bot.command('start', (ctx) => {
    ctx.reply(
        'வணக்கம்! Horai Calculator\n\n' +
        'Please set your location using /setlocation command.',
        Markup.keyboard([
            ['🕒 Current Hora'],
            ['📅 Daily Schedule', '⏰ Reminders'],
            ['🔔 Enable Notifications', '🔕 Disable Notifications']
        ]).resize()
    );
});
// Location setting command
bot.command('setlocation', (ctx) => {
    const location = ctx.message.text.split('/setlocation ')[1];

    if (!location) {
        let message = 'Available Locations:\n\nIndia:\n';
        message += Object.entries(LOCATIONS)
            .filter(([_, loc]) => loc.timeZone === 'Asia/Kolkata')
            .map(([_, loc]) => `• ${loc.name} (${loc.englishName})`)
            .join('\n');
        message += '\n\nInternational:\n';
        message += Object.entries(LOCATIONS)
            .filter(([_, loc]) => loc.timeZone !== 'Asia/Kolkata')
            .map(([_, loc]) => `• ${loc.englishName}`)
            .join('\n');
        message += '\n\nExample: /setlocation Chennai';

        return ctx.reply(message);
    }

    const locationKey = location.toUpperCase();
    const locationData = LOCATIONS[locationKey];

    if (!locationData) {
        return ctx.reply('Location not found. Please try again with a valid location.');
    }

    userPreferences.set(ctx.from.id, locationData);

    ctx.reply(
        `✅ Location set to ${locationData.englishName}\n\n` +
        `Sunrise: ${locationData.defaultSunrise} AM\n` +
        `Sunset: ${locationData.defaultSunset} PM`
    );
});
// Current Horai handler
// ✅ Fix: Simplified Hora Display
bot.hears(['🕒 Current Hora', 'Current Hora'], (ctx) => {
    const userId = ctx.from.id;
    const userLocation = userPreferences.get(userId);

    if (!userLocation) {
        return ctx.reply('Please set your location first using /setlocation command.');
    }

    const horaiDetails = getCurrentHoraiDetails(
        userLocation.defaultSunrise,
        userLocation.defaultSunset,
        userLocation.timeZone
    );

    if (horaiDetails.error) {
        return ctx.reply(horaiDetails.error);
    }

    const message =
        `📍 **${userLocation.name}**\n` +
        `🕒 **நேரம்:** ${horaiDetails.currentTime}\n` +
        `🌟 **முக்கிய ஹோரை:** ${horaiDetails.planet.name} (${horaiDetails.planet.english})\n` +
        `⏳ **நேரம்:** ${horaiDetails.timeRange.start} - ${horaiDetails.timeRange.end}\n` +
        `✅ **சிறந்தது:** ${horaiDetails.planet.auspicious.slice(0, 2).join(', ')}\n` +
        `⛔ **தவிர்க்க:** ${horaiDetails.planet.avoid.slice(0, 2).join(', ')}\n\n` +
        `🔹 **உப-ஹோரை:** ${horaiDetails.subHorai.planet.name} (${horaiDetails.subHorai.planet.english})\n` +
        `⏳ ${horaiDetails.subHorai.timeRange.start} - ${horaiDetails.subHorai.timeRange.end}`;

    ctx.reply(message);
});

bot.hears('📅 Daily Schedule', (ctx) => {
    ctx.reply('Generating the daily schedule...');
    generateDailySchedule(ctx);
    ctx.reply('Choose an option:', Markup.keyboard([
        ['🕒 Current Hora'],
        ['📅 Daily Schedule', '⏰ Reminders'],
        ['🔔 Enable Notifications', '🔕 Disable Notifications']
    ]).resize());
});

bot.hears('⏰ Reminders', (ctx) => {
    ctx.reply('✅ Notifications enabled! You will receive alerts for Hora and Sub-Hora changes.', Markup.keyboard([
        ['🕒 Current Hora'],
        ['📅 Daily Schedule', '⏰ Reminders'],
        ['🔔 Enable Notifications', '🔕 Disable Notifications']
    ]).resize());
    
});

// ✅ Add notification toggle button
bot.hears('🔔 Enable Notifications', (ctx) => {
    subscribedUsers.add(ctx.from.id);
    ctx.reply('✅ Notifications enabled! You will receive alerts for Hora and Sub-Hora changes.', Markup.keyboard([
        ['🕒 Current Hora'],
        ['📅 Daily Schedule', '⏰ Reminders'],
        ['🔕 Disable Notifications']
    ]).resize());
});
    

bot.hears('🔕 Disable Notifications', (ctx) => {
    subscribedUsers.delete(ctx.from.id);
    ctx.reply('❌ Notifications disabled! You will no longer receive alerts.', Markup.keyboard([
        ['🕒 Current Hora'],
        ['📅 Daily Schedule', '⏰ Reminders'],
        ['🔔 Enable Notifications']
    ]).resize());
});

    


// ✅ Fix: Simplified Hora Display with Notifications
bot.hears(['🕒 Current Hora', 'Current Hora'], (ctx) => {
    const userId = ctx.from.id;
    const userLocation = userPreferences.get(userId);

    if (!userLocation) {
        return ctx.reply('Please set your location first using /setlocation command.');
    }

    const horaiDetails = getCurrentHoraiDetails(
        userLocation.defaultSunrise,
        userLocation.defaultSunset,
        userLocation.timeZone
    );

    if (horaiDetails.error) {
        return ctx.reply(horaiDetails.error);
    }

    const message =
        `📍 **${userLocation.name}**\n` +
        `🕒 **நேரம்:** ${horaiDetails.currentTime}\n` +
        `🌟 **முக்கிய ஹோரை:** ${horaiDetails.planet.name} (${horaiDetails.planet.english})\n` +
        `⏳ **நேரம்:** ${horaiDetails.timeRange.start} - ${horaiDetails.timeRange.end}\n` +
        `✅ **சிறந்தது:** ${horaiDetails.planet.auspicious.slice(0, 2).join(', ')}\n` +
        `⛔ **தவிர்க்க:** ${horaiDetails.planet.avoid.slice(0, 2).join(', ')}\n\n` +
        `🔹 **உப-ஹோரை:** ${horaiDetails.subHorai.planet.name} (${horaiDetails.subHorai.planet.english})\n` +
        `⏳ ${horaiDetails.subHorai.timeRange.start} - ${horaiDetails.subHorai.timeRange.end}`;

    ctx.reply(message, Markup.keyboard([
        ['🔔 Enable Notifications', '🔕 Disable Notifications'],
        ['📅 Daily Schedule', '⏰ Reminders']
    ]).resize());
});


// ✅ Schedule Hora and Sub-Hora Notifications for Subscribed Users
function scheduleHoraiNotifications() {
    let lastHora = {};
    let lastSubHora = {};

    setInterval(() => {
        const now = moment();

        subscribedUsers.forEach((userId) => {
            const locationData = userPreferences.get(userId);
            if (!locationData) return;

            const horaiDetails = getCurrentHoraiDetails(
                locationData.defaultSunrise,
                locationData.defaultSunset,
                locationData.timeZone
            );

            if (horaiDetails.error) return;

            // Check if Hora or Sub-Hora has changed
            if (
                lastHora[userId] !== horaiDetails.planet.name ||
                lastSubHora[userId] !== horaiDetails.subHorai.planet.name
            ) {
                const notificationMessage =
                    `🔔 **Horai Notification**\n` +
                    `📍 **${locationData.name}**\n` +
                    `🕒 **நேரம்:** ${horaiDetails.currentTime}\n` +
                    `🌟 **முக்கிய ஹோரை:** ${horaiDetails.planet.name} (${horaiDetails.planet.english})\n` +
                    `⏳ **நேரம்:** ${horaiDetails.timeRange.start} - ${horaiDetails.timeRange.end}\n` +
                    `✅ **சிறந்தது:** ${horaiDetails.planet.auspicious.slice(0, 2).join(', ')}\n` +
                    `⛔ **தவிர்க்க:** ${horaiDetails.planet.avoid.slice(0, 2).join(', ')}\n\n` +
                    `🔹 **உப-ஹோரை:** ${horaiDetails.subHorai.planet.name} (${horaiDetails.subHorai.planet.english})\n` +
                    `⏳ ${horaiDetails.subHorai.timeRange.start} - ${horaiDetails.subHorai.timeRange.end}`;

                bot.telegram.sendMessage(userId, notificationMessage);
                
                lastHora[userId] = horaiDetails.planet.name;
                lastSubHora[userId] = horaiDetails.subHorai.planet.name;
            }
        });
    }, 60000); // Runs every minute to check Hora and Sub-Hora changes
}

// Start notifications
scheduleHoraiNotifications();

// Schedule notification for every Hora change (every hour)
schedule.scheduleJob('0 * * * *', sendHoraNotification);

// Schedule notification for every Sub-Hora change (every 12 minutes)
schedule.scheduleJob('*/12 * * * *', sendHoraNotification);

// Replace with your Render URL
const RENDER_URL = "https://horai-bot.onrender.com";

const axios = require('axios');

function keepAlive() {
    const url = 'https://your-bot-service.onrender.com'; // Replace with your actual Render URL
    setInterval(async () => {
        try {
            const res = await axios.get(url);
            console.log('✅ Self-ping successful:', res.status);
        } catch (error) {
            console.error('⚠️ Self-ping failed:', error.message);
        }
    }, 40000); // Ping every 40 seconds
}

keepAlive(); // Start self-pinging
// Start bot
bot.launch()
    .then(() => console.log('✅ Bot successfully launched!'))
    .catch(err => console.error('Failed to launch bot:', err));

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

// src/utils/horaiCalculations.js

const { planets, planetSequences } = require('../config/constants');

function calculateHoraiTimings(sunrise, sunset, nextSunrise) {
    const sunriseTime = new Date(sunrise);
    const sunsetTime = new Date(sunset);
    const nextSunriseTime = new Date(nextSunrise);
    
    // Calculate durations
    const dayDuration = sunsetTime - sunriseTime;
    const nightDuration = nextSunriseTime - sunsetTime;
    
    // Calculate individual Horai durations
    const dayHoraiDuration = dayDuration / 7;
    const nightHoraiDuration = nightDuration / 7;
    
    const horaiTimings = [];
    
    // Calculate day Horai periods
    for (let i = 0; i < 7; i++) {
        const startTime = new Date(sunriseTime.getTime() + (dayHoraiDuration * i));
        const endTime = new Date(sunriseTime.getTime() + (dayHoraiDuration * (i + 1)));
        horaiTimings.push({
            startTime,
            endTime,
            isDaytime: true,
            periodIndex: i
        });
    }
    
    // Calculate night Horai periods
    for (let i = 0; i < 7; i++) {
        const startTime = new Date(sunsetTime.getTime() + (nightHoraiDuration * i));
        const endTime = new Date(sunsetTime.getTime() + (nightHoraiDuration * (i + 1)));
        horaiTimings.push({
            startTime,
            endTime,
            isDaytime: false,
            periodIndex: i + 7
        });
    }
    
    return horaiTimings;
}

function calculateSubHoraiTimings(horaiStart, horaiEnd) {
    const duration = horaiEnd - horaiStart;
    const subHoraiDuration = duration / 5;
    
    const subHoraiTimings = [];
    
    for (let i = 0; i < 5; i++) {
        const startTime = new Date(horaiStart.getTime() + (subHoraiDuration * i));
        const endTime = new Date(horaiStart.getTime() + (subHoraiDuration * (i + 1)));
        subHoraiTimings.push({ startTime, endTime });
    }
    
    return subHoraiTimings;
}

function getCurrentHoraiDetails(currentTime, horaiTimings, dayOfWeek) {
    const currentHorai = horaiTimings.find(timing => 
        currentTime >= timing.startTime && currentTime < timing.endTime
    );
    
    if (!currentHorai) {
        throw new Error('Could not determine current Horai period');
    }
    
    const sequence = planetSequences[dayOfWeek];
    const planetKey = sequence[currentHorai.periodIndex % 7];
    
    const subHoraiTimings = calculateSubHoraiTimings(currentHorai.startTime, currentHorai.endTime);
    const currentSubHorai = subHoraiTimings.findIndex(timing => 
        currentTime >= timing.startTime && currentTime < timing.endTime
    );
    
    const subHoraiSequence = getSubHoraiSequence(planetKey);
    const subHoraiPlanetKey = subHoraiSequence[currentSubHorai];
    
    return {
        mainHorai: {
            startTime: currentHorai.startTime,
            endTime: currentHorai.endTime,
            isDaytime: currentHorai.isDaytime,
            planet: planets[planetKey]
        },
        subHorai: {
            startTime: subHoraiTimings[currentSubHorai].startTime,
            endTime: subHoraiTimings[currentSubHorai].endTime,
            planet: planets[subHoraiPlanetKey]
        }
    };
}

// Sub-Horai sequences for each main planet
const subHoraiSequences = {
    surya: ['surya', 'chandra', 'cevvai', 'budha', 'guru'],
    sukra: ['sukra', 'sani', 'surya', 'chandra', 'cevvai'],
    budha: ['budha', 'guru', 'sukra', 'sani', 'surya'],
    chandra: ['chandra', 'cevvai', 'budha', 'guru', 'sukra'],
    sani: ['sani', 'surya', 'chandra', 'cevvai', 'budha'],
    guru: ['guru', 'sukra', 'sani', 'surya', 'chandra'],
    cevvai: ['cevvai', 'budha', 'guru', 'sukra', 'sani']
};

// Helper function to format time in both 12-hour and 24-hour formats
function formatTime(hours, minutes) {
    const paddedHours = hours.toString().padStart(2, '0');
    const paddedMinutes = minutes.toString().padStart(2, '0');
    
    // 24-hour format
    const railwayTime = `${paddedHours}:${paddedMinutes}`;
    
    // 12-hour format
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    const standardTime = `${hours12}:${paddedMinutes} ${period}`;
    
    return `${standardTime} (${railwayTime})`;
}

// Enhanced getCurrentHorai function
function getCurrentHorai(sunrise, sunset) {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    // Convert sunrise and sunset times to hours and minutes
    const [sunriseHour, sunriseMinute] = sunrise.split(':').map(Number);
    const [sunsetHour, sunsetMinute] = sunset.split(':').map(Number);
    
    // Calculate times in minutes
    const currentTimeInMinutes = currentHour * 60 + currentMinute;
    const sunriseTimeInMinutes = sunriseHour * 60 + sunriseMinute;
    const sunsetTimeInMinutes = sunsetHour * 60 + sunsetMinute;
    
    // Calculate durations
    const dayDuration = sunsetTimeInMinutes - sunriseTimeInMinutes;
    const nightDuration = (24 * 60) - dayDuration;
    
    const dayHoraiDuration = dayDuration / 7;
    const nightHoraiDuration = nightDuration / 7;
    
    const dayOfWeek = now.getDay();
    const sequence = planetSequences[dayOfWeek];
    
    let horaiIndex;
    let isDaytime;
    let startTime, endTime;
    let horaiDuration;
    
    if (currentTimeInMinutes >= sunriseTimeInMinutes && currentTimeInMinutes < sunsetTimeInMinutes) {
        // Daytime
        isDaytime = true;
        horaiDuration = dayHoraiDuration;
        horaiIndex = Math.floor((currentTimeInMinutes - sunriseTimeInMinutes) / dayHoraiDuration);
        startTime = sunriseTimeInMinutes + (horaiIndex * dayHoraiDuration);
        endTime = startTime + dayHoraiDuration;
    } else {
        // Nighttime
        isDaytime = false;
        horaiDuration = nightHoraiDuration;
        const timeFromSunset = currentTimeInMinutes < sunriseTimeInMinutes 
            ? (currentTimeInMinutes + (24 * 60) - sunsetTimeInMinutes)
            : (currentTimeInMinutes - sunsetTimeInMinutes);
        horaiIndex = Math.floor(timeFromSunset / nightHoraiDuration) + 7;
        startTime = sunsetTimeInMinutes + (horaiIndex - 7) * nightHoraiDuration;
        endTime = startTime + nightHoraiDuration;
    }
    
    horaiIndex = Math.min(horaiIndex, 13);
    const planetKey = sequence[horaiIndex % 7];
    
    // Calculate sub-horai
    const subHoraiDuration = horaiDuration / 5;
    const timeInCurrentHorai = (currentTimeInMinutes - startTime);
    const subHoraiIndex = Math.floor(timeInCurrentHorai / subHoraiDuration);
    const subHoraiSequence = subHoraiSequences[planetKey];
    const subPlanetKey = subHoraiSequence[subHoraiIndex % 5];
    
    // Calculate time ranges
    const startHour = Math.floor(startTime / 60);
    const startMinute = Math.floor(startTime % 60);
    const endHour = Math.floor(endTime / 60) % 24;
    const endMinute = Math.floor(endTime % 60);
    
    const subHoraiStart = startTime + (subHoraiIndex * subHoraiDuration);
    const subHoraiEnd = subHoraiStart + subHoraiDuration;
    const subStartHour = Math.floor(subHoraiStart / 60) % 24;
    const subStartMinute = Math.floor(subHoraiStart % 60);
    const subEndHour = Math.floor(subHoraiEnd / 60) % 24;
    const subEndMinute = Math.floor(subHoraiEnd % 60);
    
    return {
        mainHorai: {
            planet: planets[planetKey],
            isDaytime,
            periodNumber: (horaiIndex % 7) + 1,
            timeRange: {
                start: formatTime(startHour, startMinute),
                end: formatTime(endHour, endMinute)
            }
        },
        subHorai: {
            planet: planets[subPlanetKey],
            periodNumber: subHoraiIndex + 1,
            timeRange: {
                start: formatTime(subStartHour, subStartMinute),
                end: formatTime(subEndHour, subEndMinute)
            }
        }
    };
}


module.exports = {
    calculateHoraiTimings,
    calculateSubHoraiTimings,
    getCurrentHoraiDetails,
    formatTime
};
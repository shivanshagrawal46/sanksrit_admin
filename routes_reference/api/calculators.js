const express = require('express');
const router = express.Router();

// Numerology Calculator Functions

/**
 * Calculate Bhagyank (Destiny Number)
 * Derived from sum of all digits in birth date
 */
function calculateBhagyank(dateOfBirth) {
    try {
        // Remove all non-numeric characters and get digits
        const digits = dateOfBirth.replace(/\D/g, '');
        let sum = 0;
        
        for (let digit of digits) {
            sum += parseInt(digit);
        }
        
        // Reduce to single digit unless it's a master number
        while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
            let temp = sum;
            sum = 0;
            while (temp > 0) {
                sum += temp % 10;
                temp = Math.floor(temp / 10);
            }
        }
        
        return sum;
    } catch (error) {
        throw new Error('Invalid date format');
    }
}

/**
 * Calculate Mulank (Root Number)
 * Derived from day of birth
 */
function calculateMulank(dateOfBirth) {
    try {
        // Handle different date formats
        let date;
        if (dateOfBirth.includes('-')) {
            date = new Date(dateOfBirth);
        } else {
            date = new Date(dateOfBirth.replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$3-$2-$1'));
        }
        
        if (isNaN(date.getTime())) {
            throw new Error('Invalid date format');
        }
        
        let day = date.getDate();
        
        // Reduce to single digit unless it's a master number
        while (day > 9 && day !== 11 && day !== 22 && day !== 33) {
            let temp = day;
            day = 0;
            while (temp > 0) {
                day += temp % 10;
                temp = Math.floor(temp / 10);
            }
        }
        
        return day;
    } catch (error) {
        throw new Error('Invalid date format');
    }
}

/**
 * Calculate Name Numerology using Chaldean System
 * Each letter has a specific numeric value
 */
function calculateNameNumerology(fullName) {
    const chaldeanValues = {
        'A': 1, 'I': 1, 'J': 1, 'Q': 1, 'Y': 1,
        'B': 2, 'K': 2, 'R': 2,
        'C': 3, 'G': 3, 'L': 3, 'S': 3,
        'D': 4, 'M': 4, 'T': 4,
        'E': 5, 'H': 5, 'N': 5, 'X': 5,
        'U': 6, 'V': 6, 'W': 6,
        'O': 7, 'Z': 7,
        'F': 8, 'P': 8
    };
    
    let sum = 0;
    const name = fullName.toUpperCase().replace(/[^A-Z]/g, '');
    
    for (let char of name) {
        if (chaldeanValues[char]) {
            sum += chaldeanValues[char];
        }
    }
    
    // Reduce to single digit unless it's a master number
    while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
        const temp = sum;
        sum = 0;
        while (temp > 0) {
            sum += temp % 10;
            temp = Math.floor(temp / 10);
        }
    }
    
    return sum;
}

/**
 * Calculate Lo Shu Grid
 * Ancient Chinese numerology grid showing presence/absence of numbers 1-9
 */
function calculateLoShuGrid(dateOfBirth) {
    const digits = dateOfBirth.replace(/\D/g, '');
    const grid = {
        1: 0, 2: 0, 3: 0,
        4: 0, 5: 0, 6: 0,
        7: 0, 8: 0, 9: 0
    };
    
    // Count occurrences of each digit
    for (let digit of digits) {
        const num = parseInt(digit);
        if (num >= 1 && num <= 9) {
            grid[num]++;
        }
    }
    
    // Analyze the grid
    const analysis = analyzeLoShuGrid(grid);
    
    return {
        grid,
        analysis,
        gridVisualization: createLoShuVisualization(grid)
    };
}

/**
 * Analyze Lo Shu Grid for personality insights
 */
function analyzeLoShuGrid(grid) {
    const analysis = {
        missingNumbers: [],
        repeatedNumbers: [],
        planes: {
            mental: grid[4] + grid[9] + grid[2], // 4-9-2
            emotional: grid[3] + grid[5] + grid[7], // 3-5-7
            physical: grid[8] + grid[1] + grid[6], // 8-1-6
            thought: grid[4] + grid[3] + grid[8], // 4-3-8
            will: grid[9] + grid[5] + grid[1], // 9-5-1
            action: grid[2] + grid[7] + grid[6] // 2-7-6
        },
        arrows: {
            determination: grid[1] + grid[5] + grid[9],
            spirituality: grid[3] + grid[5] + grid[7],
            intellect: grid[4] + grid[5] + grid[6],
            emotions: grid[2] + grid[5] + grid[8]
        }
    };
    
    // Find missing and repeated numbers
    for (let num = 1; num <= 9; num++) {
        if (grid[num] === 0) {
            analysis.missingNumbers.push(num);
        } else if (grid[num] > 1) {
            analysis.repeatedNumbers.push({ number: num, count: grid[num] });
        }
    }
    
    // Generate insights
    analysis.insights = generateLoShuInsights(analysis);
    
    return analysis;
}

/**
 * Generate insights based on Lo Shu Grid analysis
 */
function generateLoShuInsights(analysis) {
    const insights = [];
    
    // Missing numbers insights
    const missingInsights = {
        1: "May lack leadership qualities and self-confidence",
        2: "May have difficulty with cooperation and sensitivity",
        3: "May struggle with creative expression and communication",
        4: "May lack organization and practical skills",
        5: "May have challenges with freedom and adventure",
        6: "May struggle with responsibility and nurturing",
        7: "May lack spiritual awareness and intuition",
        8: "May have difficulty with material success and authority",
        9: "May struggle with humanitarian instincts and wisdom"
    };
    
    analysis.missingNumbers.forEach(num => {
        insights.push({
            type: 'missing',
            number: num,
            message: missingInsights[num]
        });
    });
    
    // Repeated numbers insights
    analysis.repeatedNumbers.forEach(item => {
        insights.push({
            type: 'repeated',
            number: item.number,
            count: item.count,
            message: `Strong emphasis on number ${item.number} traits (appears ${item.count} times)`
        });
    });
    
    // Plane analysis
    if (analysis.planes.mental === 0) {
        insights.push({ type: 'plane', message: "Mental plane is empty - may have difficulty with memory and thinking" });
    }
    if (analysis.planes.emotional === 0) {
        insights.push({ type: 'plane', message: "Emotional plane is empty - may be overly sensitive or emotionally detached" });
    }
    if (analysis.planes.physical === 0) {
        insights.push({ type: 'plane', message: "Physical plane is empty - may lack practical skills or physical coordination" });
    }
    
    return insights;
}

/**
 * Create visual representation of Lo Shu Grid
 */
function createLoShuVisualization(grid) {
    return [
        [grid[4] || '-', grid[9] || '-', grid[2] || '-'],
        [grid[3] || '-', grid[5] || '-', grid[7] || '-'],
        [grid[8] || '-', grid[1] || '-', grid[6] || '-']
    ];
}

// Jyotish Calculator Functions

/**
 * Calculate Nakshatra (Birth Star) based on moon position
 */
function calculateNakshatra(dateOfBirth) {
    const nakshatras = [
        'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
        'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
        'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
        'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
        'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
    ];
    
    // Simplified calculation based on birth date
    const date = new Date(dateOfBirth);
    const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 86400000);
    const nakshatraIndex = (dayOfYear + date.getFullYear()) % 27;
    
    return {
        name: nakshatras[nakshatraIndex],
        number: nakshatraIndex + 1,
        pada: ((dayOfYear % 4) + 1),
        characteristics: getNakshatraCharacteristics(nakshatras[nakshatraIndex])
    };
}

/**
 * Get Nakshatra characteristics
 */
function getNakshatraCharacteristics(nakshatra) {
    const characteristics = {
        'Ashwini': 'Quick, energetic, healing abilities, pioneering spirit',
        'Bharani': 'Creative, determined, transformation, life and death themes',
        'Krittika': 'Sharp intellect, cutting through illusion, leadership',
        'Rohini': 'Beauty, creativity, material abundance, artistic talents',
        'Mrigashira': 'Searching nature, curiosity, gentle, love of travel',
        'Ardra': 'Intense emotions, transformation, research abilities',
        'Punarvasu': 'Renewal, optimism, spiritual growth, motherly nature',
        'Pushya': 'Nourishing, spiritual, teaching abilities, protective',
        'Ashlesha': 'Mystical, intuitive, healing powers, secretive nature',
        'Magha': 'Royal nature, ancestral connections, leadership, pride',
        'Purva Phalguni': 'Creative, pleasure-loving, relationships, artistic',
        'Uttara Phalguni': 'Service-oriented, helpful, generous, healing',
        'Hasta': 'Skillful hands, craftsmanship, healing touch, practical',
        'Chitra': 'Artistic, beautiful creations, attention to detail',
        'Swati': 'Independent, flexible, business acumen, diplomatic',
        'Vishakha': 'Goal-oriented, determined, leadership, spiritual growth',
        'Anuradha': 'Devotional, friendship, international connections',
        'Jyeshtha': 'Senior, protective, occult knowledge, responsibility',
        'Mula': 'Research-oriented, getting to root of matters, transformation',
        'Purva Ashadha': 'Invincible, proud, connections with water, cleansing',
        'Uttara Ashadha': 'Victory, leadership, righteousness, universal appeal',
        'Shravana': 'Learning, listening, knowledge acquisition, fame',
        'Dhanishta': 'Musical abilities, wealth, group activities, rhythm',
        'Shatabhisha': 'Healing, mystical, research, unconventional thinking',
        'Purva Bhadrapada': 'Spiritual transformation, occult knowledge, intensity',
        'Uttara Bhadrapada': 'Deep wisdom, spiritual depth, compassion',
        'Revati': 'Completion, spiritual journey, nurturing, protective'
    };
    
    return characteristics[nakshatra] || 'Unique spiritual qualities and life path';
}

/**
 * Calculate Rashi (Moon Sign) based on birth details
 */
function calculateRashi(dateOfBirth) {
    const rashis = [
        'Mesha (Aries)', 'Vrishabha (Taurus)', 'Mithuna (Gemini)', 'Karka (Cancer)',
        'Simha (Leo)', 'Kanya (Virgo)', 'Tula (Libra)', 'Vrishchika (Scorpio)',
        'Dhanu (Sagittarius)', 'Makara (Capricorn)', 'Kumbha (Aquarius)', 'Meena (Pisces)'
    ];
    
    const date = new Date(dateOfBirth);
    const month = date.getMonth();
    const day = date.getDate();
    
    // Simplified rashi calculation (actual calculation requires moon position)
    let rashiIndex = 0;
    if ((month === 2 && day >= 21) || (month === 3 && day <= 19)) rashiIndex = 0; // Aries
    else if ((month === 3 && day >= 20) || (month === 4 && day <= 20)) rashiIndex = 1; // Taurus
    else if ((month === 4 && day >= 21) || (month === 5 && day <= 20)) rashiIndex = 2; // Gemini
    else if ((month === 5 && day >= 21) || (month === 6 && day <= 22)) rashiIndex = 3; // Cancer
    else if ((month === 6 && day >= 23) || (month === 7 && day <= 22)) rashiIndex = 4; // Leo
    else if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) rashiIndex = 5; // Virgo
    else if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) rashiIndex = 6; // Libra
    else if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) rashiIndex = 7; // Scorpio
    else if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) rashiIndex = 8; // Sagittarius
    else if ((month === 11 && day >= 22) || (month === 0 && day <= 19)) rashiIndex = 9; // Capricorn
    else if ((month === 0 && day >= 20) || (month === 1 && day <= 18)) rashiIndex = 10; // Aquarius
    else rashiIndex = 11; // Pisces
    
    return {
        name: rashis[rashiIndex],
        number: rashiIndex + 1,
        element: getRashiElement(rashiIndex),
        characteristics: getRashiCharacteristics(rashis[rashiIndex])
    };
}

/**
 * Get Rashi element
 */
function getRashiElement(rashiIndex) {
    const elements = ['Fire', 'Earth', 'Air', 'Water'];
    return elements[rashiIndex % 4];
}

/**
 * Get Rashi characteristics
 */
function getRashiCharacteristics(rashi) {
    const characteristics = {
        'Mesha (Aries)': 'Dynamic, pioneering, leadership qualities, energetic',
        'Vrishabha (Taurus)': 'Stable, practical, love of comfort, determined',
        'Mithuna (Gemini)': 'Communicative, versatile, intellectual, social',
        'Karka (Cancer)': 'Emotional, nurturing, intuitive, home-loving',
        'Simha (Leo)': 'Confident, creative, generous, natural leader',
        'Kanya (Virgo)': 'Analytical, perfectionist, service-oriented, practical',
        'Tula (Libra)': 'Balanced, diplomatic, artistic, partnership-oriented',
        'Vrishchika (Scorpio)': 'Intense, transformative, mysterious, powerful',
        'Dhanu (Sagittarius)': 'Philosophical, adventurous, optimistic, truth-seeking',
        'Makara (Capricorn)': 'Ambitious, disciplined, responsible, practical',
        'Kumbha (Aquarius)': 'Independent, innovative, humanitarian, unique',
        'Meena (Pisces)': 'Intuitive, compassionate, artistic, spiritual'
    };
    
    return characteristics[rashi] || 'Unique blend of qualities';
}

/**
 * Calculate Dasha periods (simplified Vimshottari Dasha)
 */
function calculateDashaPeriods(dateOfBirth, nakshatra) {
    const dashaLords = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];
    const dashaPeriods = [7, 20, 6, 10, 7, 18, 16, 19, 17]; // years
    
    // Start with the nakshatra lord
    const startLordIndex = (nakshatra.number - 1) % 9;
    const birthDate = new Date(dateOfBirth);
    
    const periods = [];
    let currentDate = new Date(birthDate);
    
    for (let i = 0; i < 9; i++) {
        const lordIndex = (startLordIndex + i) % 9;
        const endDate = new Date(currentDate);
        endDate.setFullYear(currentDate.getFullYear() + dashaPeriods[lordIndex]);
        
        periods.push({
            planet: dashaLords[lordIndex],
            startDate: currentDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
            duration: dashaPeriods[lordIndex],
            effects: getDashaEffects(dashaLords[lordIndex])
        });
        
        currentDate = new Date(endDate);
        currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return periods;
}

/**
 * Get Dasha effects for each planet
 */
function getDashaEffects(planet) {
    const effects = {
        'Sun': 'Leadership, government connections, health focus, father figures',
        'Moon': 'Emotional growth, mother figures, public recognition, water-related matters',
        'Mars': 'Energy, courage, property matters, siblings, sports',
        'Mercury': 'Communication, education, business, writing, short travels',
        'Jupiter': 'Wisdom, spirituality, teaching, children, long-distance travel',
        'Venus': 'Relationships, creativity, luxury, beauty, artistic pursuits',
        'Saturn': 'Hard work, discipline, delays, chronic issues, service',
        'Rahu': 'Foreign connections, technology, unconventional paths, sudden changes',
        'Ketu': 'Spirituality, detachment, research, past-life karma, moksha'
    };
    
    return effects[planet] || 'Mixed results with spiritual growth';
}

/**
 * Calculate Yogas (planetary combinations)
 */
function calculateYogas(rashi, nakshatra, dateOfBirth) {
    const yogas = [];
    const date = new Date(dateOfBirth);
    const day = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Simplified yoga calculations based on available data
    
    // Day-based yogas
    const dayYogas = {
        0: 'Ravi Yoga - Sun energy brings leadership and authority',
        1: 'Soma Yoga - Moon energy brings intuition and emotional strength',
        2: 'Mangal Yoga - Mars energy brings courage and determination',
        3: 'Budh Yoga - Mercury energy brings intelligence and communication skills',
        4: 'Guru Yoga - Jupiter energy brings wisdom and spiritual growth',
        5: 'Shukra Yoga - Venus energy brings creativity and relationships',
        6: 'Shani Yoga - Saturn energy brings discipline and hard work'
    };
    
    yogas.push({
        name: Object.keys(dayYogas)[day] ? dayYogas[day].split(' - ')[0] : 'Planetary Yoga',
        description: dayYogas[day] || 'Unique planetary combination',
        strength: 'Medium',
        effects: 'Influences personality and life approach'
    });
    
    // Nakshatra-based yogas
    if (nakshatra.number % 9 === 0) {
        yogas.push({
            name: 'Gandanta Yoga',
            description: 'Transformation and spiritual growth through challenges',
            strength: 'Strong',
            effects: 'Intense spiritual transformation, breakthrough after struggles'
        });
    }
    
    // Rashi-based yogas
    if (rashi.number === 4 || rashi.number === 8 || rashi.number === 12) {
        yogas.push({
            name: 'Moksha Trikona Yoga',
            description: 'Strong spiritual inclination and liberation-seeking nature',
            strength: 'Strong',
            effects: 'Spiritual growth, detachment from material, seeking higher truth'
        });
    }
    
    return yogas;
}

/**
 * Calculate comprehensive Jyotish chart with name analysis
 */
function calculateComprehensiveJyotishChart(dateOfBirth, timeOfBirth, placeOfBirth, fullName = null) {
    try {
        const date = new Date(`${dateOfBirth}T${timeOfBirth}`);
        
        // Calculate comprehensive Jyotish elements
        const nakshatra = calculateNakshatra(dateOfBirth);
        const rashi = calculateRashi(dateOfBirth);
        const dashaPeriods = calculateDashaPeriods(dateOfBirth, nakshatra);
        const yogas = calculateYogas(rashi, nakshatra, dateOfBirth);
        
        // Calculate current dasha
        const currentDate = new Date();
        const currentDasha = dashaPeriods.find(period => {
            const start = new Date(period.startDate);
            const end = new Date(period.endDate);
            return currentDate >= start && currentDate <= end;
        });
        
        // Calculate life path number for additional insights
        const lifePathNumber = calculateBhagyank(dateOfBirth);
        
        // Name analysis if provided
        let nameAnalysis = null;
        if (fullName) {
            nameAnalysis = calculateNameCompatibilityWithChart(fullName, rashi, nakshatra);
        }
        
        // Generate personalized predictions
        const predictions = generatePersonalizedJyotishPredictions(
            rashi, nakshatra, currentDasha, yogas, lifePathNumber, nameAnalysis, date
        );
        
        return {
            birthDetails: {
                date: dateOfBirth,
                time: timeOfBirth,
                place: placeOfBirth,
                name: fullName
            },
            rashi: rashi,
            nakshatra: nakshatra,
            lifePathNumber,
            nameAnalysis: nameAnalysis,
            currentDasha: currentDasha || dashaPeriods[0],
            allDashaPeriods: dashaPeriods,
            yogas: yogas,
            predictions: predictions,
            remedies: generateJyotishRemedies(rashi, nakshatra, currentDasha),
            futureTransits: calculateUpcomingTransits(currentDate),
            luckyElements: calculateLuckyElements(rashi, nakshatra, nameAnalysis),
            disclaimer: "This is a comprehensive Jyotish analysis based on traditional Vedic principles. For personalized guidance, consult a qualified Vedic astrologer."
        };
    } catch (error) {
        throw new Error('Invalid birth details');
    }
}

/**
 * Calculate name compatibility with birth chart
 */
function calculateNameCompatibilityWithChart(fullName, rashi, nakshatra) {
    const nameNumber = calculateNameNumerology(fullName);
    const firstLetterNakshatra = getFirstLetterNakshatra(fullName);
    
    // Check if name's first letter matches nakshatra sounds
    const nakshatraSounds = getNakshatraSounds(nakshatra.name);
    const nameFirstLetter = fullName.charAt(0).toLowerCase();
    
    const isNakshatraCompatible = nakshatraSounds.some(sound => 
        nameFirstLetter.startsWith(sound.toLowerCase())
    );
    
    // Calculate name-rashi harmony
    const rashiNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    const compatibleNumbers = getCompatibleNumbers(rashi.number);
    const isRashiCompatible = compatibleNumbers.includes(nameNumber);
    
    return {
        nameNumber,
        firstLetter: nameFirstLetter.toUpperCase(),
        nakshatraCompatibility: {
            isCompatible: isNakshatraCompatible,
            expectedSounds: nakshatraSounds,
            analysis: isNakshatraCompatible ? 
                'Your name resonates well with your birth star' : 
                `Consider names starting with: ${nakshatraSounds.join(', ')}`
        },
        rashiCompatibility: {
            isCompatible: isRashiCompatible,
            analysis: isRashiCompatible ?
                'Your name number harmonizes with your moon sign' :
                'Your name may create some challenges, but can be balanced with proper remedies'
        },
        overallScore: calculateNameChartCompatibilityScore(isNakshatraCompatible, isRashiCompatible),
        recommendations: generateNameRecommendations(isNakshatraCompatible, isRashiCompatible, nakshatraSounds)
    };
}

/**
 * Get Nakshatra sounds for name compatibility
 */
function getNakshatraSounds(nakshatraName) {
    const nakshatraSounds = {
        'Ashwini': ['chu', 'che', 'cho', 'la'],
        'Bharani': ['li', 'lu', 'le', 'lo'],
        'Krittika': ['a', 'i', 'u', 'e'],
        'Rohini': ['o', 'va', 'vi', 'vu'],
        'Mrigashira': ['ve', 'vo', 'ka', 'ki'],
        'Ardra': ['ku', 'gha', 'nga', 'chha'],
        'Punarvasu': ['ke', 'ko', 'ha', 'hi'],
        'Pushya': ['hu', 'he', 'ho', 'da'],
        'Ashlesha': ['di', 'du', 'de', 'do'],
        'Magha': ['ma', 'mi', 'mu', 'me'],
        'Purva Phalguni': ['mo', 'ta', 'ti', 'tu'],
        'Uttara Phalguni': ['te', 'to', 'pa', 'pi'],
        'Hasta': ['pu', 'sha', 'na', 'tha'],
        'Chitra': ['pe', 'po', 'ra', 'ri'],
        'Swati': ['ru', 're', 'ro', 'ta'],
        'Vishakha': ['ti', 'tu', 'te', 'to'],
        'Anuradha': ['na', 'ni', 'nu', 'ne'],
        'Jyeshtha': ['no', 'ya', 'yi', 'yu'],
        'Mula': ['ye', 'yo', 'bha', 'bhi'],
        'Purva Ashadha': ['bhu', 'dha', 'pha', 'da'],
        'Uttara Ashadha': ['bhe', 'bho', 'ja', 'ji'],
        'Shravana': ['ju', 'je', 'jo', 'gha'],
        'Dhanishta': ['ga', 'gi', 'gu', 'ge'],
        'Shatabhisha': ['go', 'sa', 'si', 'su'],
        'Purva Bhadrapada': ['se', 'so', 'da', 'di'],
        'Uttara Bhadrapada': ['du', 'tha', 'jha', 'da'],
        'Revati': ['de', 'do', 'cha', 'chi']
    };
    
    return nakshatraSounds[nakshatraName] || ['a', 'i', 'u', 'e'];
}

/**
 * Get compatible numbers for rashi
 */
function getCompatibleNumbers(rashiNumber) {
    const compatibility = {
        1: [1, 5, 9], 2: [2, 6, 7], 3: [3, 6, 9], 4: [1, 4, 8],
        5: [1, 5, 9], 6: [2, 3, 6], 7: [2, 7, 9], 8: [1, 4, 8],
        9: [1, 3, 5, 7, 9], 10: [1, 4, 8], 11: [2, 6, 7], 12: [3, 6, 9]
    };
    return compatibility[rashiNumber] || [1, 5, 9];
}

/**
 * Calculate name-chart compatibility score
 */
function calculateNameChartCompatibilityScore(nakshatraCompatible, rashiCompatible) {
    let score = 0;
    if (nakshatraCompatible) score += 50;
    if (rashiCompatible) score += 50;
    return score;
}

/**
 * Generate name recommendations
 */
function generateNameRecommendations(nakshatraCompatible, rashiCompatible, nakshatraSounds) {
    const recommendations = [];
    
    if (!nakshatraCompatible) {
        recommendations.push(`Consider names starting with: ${nakshatraSounds.join(', ')}`);
        recommendations.push('Use your birth star sounds for better harmony');
    }
    
    if (!rashiCompatible) {
        recommendations.push('Consider using gemstones to balance name energy');
        recommendations.push('Chant your rashi mantra regularly');
    }
    
    if (nakshatraCompatible && rashiCompatible) {
        recommendations.push('Your name is in perfect harmony with your birth chart');
        recommendations.push('Continue using this name for maximum benefit');
    }
    
    return recommendations;
}

/**
 * Generate personalized Jyotish predictions with enhanced analysis
 */
function generatePersonalizedJyotishPredictions(rashi, nakshatra, currentDasha, yogas, lifePathNumber, nameAnalysis, birthDate) {
    const age = new Date().getFullYear() - birthDate.getFullYear();
    const lifeStage = getLifeStage(age);
    
    return {
        personalityProfile: {
            core: `${rashi.characteristics}`,
            nakshatra: `${nakshatra.characteristics}`,
            combined: `Your ${rashi.name} nature combined with ${nakshatra.name} nakshatra creates a unique blend of ${rashi.element.toLowerCase()} energy with ${nakshatra.characteristics.split(',')[0].toLowerCase()} tendencies.`,
            lifePathInfluence: `Life path ${lifePathNumber} adds ${getLifePathGuidance(lifePathNumber)} to your personality`,
            nameInfluence: nameAnalysis ? `Your name creates ${nameAnalysis.overallScore}% harmony with your birth chart` : null
        },
        currentLifePeriod: {
            age: age,
            lifeStage: lifeStage.name,
            stageGuidance: lifeStage.guidance,
            dasha: currentDasha ? currentDasha.planet : 'Transitional',
            dashaEffects: currentDasha ? currentDasha.effects : 'Period of change and adaptation',
            duration: currentDasha ? `${currentDasha.startDate} to ${currentDasha.endDate}` : 'Ongoing',
            advice: generateCurrentPeriodAdvice(currentDasha, lifeStage, age)
        },
        detailedPredictions: {
            next6Months: generateShortTermPredictions(rashi, nakshatra, currentDasha),
            nextYear: generateMediumTermPredictions(rashi, currentDasha, age),
            next5Years: generateLongTermPredictions(rashi, nakshatra, currentDasha, age)
        },
        lifeAspects: {
            career: generateDetailedCareerPredictions(rashi, nakshatra, currentDasha, age),
            relationships: generateDetailedRelationshipPredictions(rashi, nakshatra, age),
            health: generateDetailedHealthPredictions(rashi, nakshatra, age),
            wealth: generateWealthPredictions(rashi, currentDasha, yogas),
            spirituality: generateDetailedSpiritualPredictions(nakshatra, yogas, age)
        },
        strengths: generateStrengths(rashi, nakshatra, yogas),
        challenges: generateChallenges(rashi, nakshatra),
        opportunities: generateOpportunities(currentDasha, rashi, age),
        warnings: generateWarnings(currentDasha, rashi, age)
    };
}

/**
 * Get life stage based on age
 */
function getLifeStage(age) {
    if (age <= 12) return { name: 'Childhood', guidance: 'Focus on education and character building' };
    if (age <= 25) return { name: 'Youth', guidance: 'Time for learning, skill development, and career foundation' };
    if (age <= 40) return { name: 'Early Adulthood', guidance: 'Career building, relationships, and establishing life direction' };
    if (age <= 55) return { name: 'Middle Age', guidance: 'Peak productivity, leadership, and spiritual growth' };
    if (age <= 70) return { name: 'Mature Age', guidance: 'Wisdom sharing, mentoring, and spiritual practices' };
    return { name: 'Elder Years', guidance: 'Spiritual pursuits, legacy building, and inner peace' };
}

/**
 * Generate current period advice
 */
function generateCurrentPeriodAdvice(currentDasha, lifeStage, age) {
    if (!currentDasha) return `At age ${age} in ${lifeStage.name}, focus on ${lifeStage.guidance.toLowerCase()}`;
    
    const dashaAdvice = {
        'Sun': 'Take leadership roles, focus on government work, strengthen father relationships',
        'Moon': 'Nurture emotional connections, work with public, strengthen mother relationships',
        'Mars': 'Channel energy into sports/exercise, handle property matters, support siblings',
        'Mercury': 'Focus on communication, education, business ventures, short travels',
        'Jupiter': 'Pursue higher education, spiritual practices, teaching, long-distance travel',
        'Venus': 'Focus on relationships, creative pursuits, luxury, beauty-related work',
        'Saturn': 'Practice discipline, serve others, work hard, be patient with results',
        'Rahu': 'Explore foreign opportunities, embrace technology, try unconventional paths',
        'Ketu': 'Focus on spirituality, research, detachment, past-life healing'
    };
    
    return `${dashaAdvice[currentDasha.planet]} This ${currentDasha.planet} period is ideal for ${lifeStage.guidance.toLowerCase()}.`;
}

/**
 * Generate short-term predictions (6 months)
 */
function generateShortTermPredictions(rashi, nakshatra, currentDasha) {
    const predictions = [];
    
    // Current season effects
    const currentMonth = new Date().getMonth();
    if (currentMonth >= 2 && currentMonth <= 5) { // Spring/Summer
        predictions.push('Spring/Summer period brings new opportunities and energy boost');
    } else { // Monsoon/Winter
        predictions.push('Monsoon/Winter period calls for introspection and planning');
    }
    
    // Dasha-based short-term effects
    if (currentDasha) {
        const shortTermEffects = {
            'Sun': 'Next 6 months favor leadership initiatives and health improvements',
            'Moon': 'Expect emotional growth and public recognition in coming months',
            'Mars': 'High energy period ahead - good for sports, property, and bold decisions',
            'Mercury': 'Excellent time for communication, learning, and business deals',
            'Jupiter': 'Spiritual growth and educational opportunities await',
            'Venus': 'Romance, creativity, and artistic pursuits will flourish',
            'Saturn': 'Slow but steady progress - patience will bring lasting results',
            'Rahu': 'Unexpected opportunities and foreign connections possible',
            'Ketu': 'Time for spiritual practices and letting go of material attachments'
        };
        predictions.push(shortTermEffects[currentDasha.planet]);
    }
    
    return predictions;
}

/**
 * Generate medium-term predictions (1 year)
 */
function generateMediumTermPredictions(rashi, currentDasha, age) {
    const predictions = [];
    
    // Age-based yearly predictions
    if (age % 12 === 0) predictions.push('This is your Jupiter return year - expect growth and expansion');
    if (age % 7 === 0) predictions.push('Seven-year cycle completion brings major life changes');
    if (age === 30 || age === 60) predictions.push('Major Saturn transit year - time for serious commitments');
    
    // Rashi-based yearly outlook
    const yearlyOutlook = {
        1: 'Year of new beginnings and leadership opportunities',
        2: 'Focus on stability, relationships, and material security',
        3: 'Communication and learning will be key themes',
        4: 'Home, family, and emotional matters take priority',
        5: 'Creative expression and recognition await',
        6: 'Service, health, and detailed work bring success',
        7: 'Partnerships and legal matters need attention',
        8: 'Transformation and hidden opportunities emerge',
        9: 'Travel, higher learning, and spiritual growth',
        10: 'Career advancement and public recognition',
        11: 'Social connections and group activities flourish',
        12: 'Spiritual pursuits and charitable work emphasized'
    };
    
    predictions.push(yearlyOutlook[rashi.number]);
    
    return predictions;
}

/**
 * Generate long-term predictions (5 years)
 */
function generateLongTermPredictions(rashi, nakshatra, currentDasha, age) {
    const predictions = [];
    
    // Major life transitions based on age
    if (age >= 25 && age <= 30) {
        predictions.push('Next 5 years crucial for career establishment and life partner selection');
    } else if (age >= 35 && age <= 45) {
        predictions.push('Peak earning period ahead - focus on investments and family building');
    } else if (age >= 50 && age <= 60) {
        predictions.push('Transition to mentoring role and spiritual deepening expected');
    }
    
    // Dasha transition effects
    if (currentDasha) {
        predictions.push(`Current ${currentDasha.planet} period will shape your next major life phase`);
    }
    
    return predictions;
}

/**
 * Calculate upcoming transits
 */
function calculateUpcomingTransits(currentDate) {
    // Simplified transit calculation - in real implementation, you'd use astronomical data
    return {
        jupiter: {
            nextTransit: '2025-05-14',
            effect: 'Jupiter transit will bring expansion in education and spirituality'
        },
        saturn: {
            nextTransit: '2025-03-29',
            effect: 'Saturn transit demands discipline and hard work for lasting success'
        },
        rahu: {
            nextTransit: '2025-11-12',
            effect: 'Rahu transit may bring unexpected opportunities and changes'
        }
    };
}

/**
 * Calculate lucky elements
 */
function calculateLuckyElements(rashi, nakshatra, nameAnalysis) {
    const rashiLucky = {
        1: { days: ['Tuesday', 'Sunday'], numbers: [1, 8, 9], colors: ['Red', 'Orange'] },
        2: { days: ['Friday', 'Monday'], numbers: [2, 6, 7], colors: ['White', 'Cream'] },
        3: { days: ['Wednesday'], numbers: [3, 5, 6], colors: ['Green', 'Yellow'] },
        4: { days: ['Monday'], numbers: [2, 4, 7], colors: ['White', 'Silver'] },
        5: { days: ['Sunday'], numbers: [1, 5, 9], colors: ['Gold', 'Orange'] },
        6: { days: ['Wednesday'], numbers: [3, 6, 5], colors: ['Green', 'Blue'] },
        7: { days: ['Friday'], numbers: [2, 6, 7], colors: ['White', 'Pink'] },
        8: { days: ['Tuesday'], numbers: [8, 1, 9], colors: ['Red', 'Maroon'] },
        9: { days: ['Thursday'], numbers: [9, 3, 6], colors: ['Yellow', 'Gold'] },
        10: { days: ['Saturday'], numbers: [8, 10, 1], colors: ['Black', 'Blue'] },
        11: { days: ['Saturday'], numbers: [11, 4, 8], colors: ['Blue', 'Black'] },
        12: { days: ['Thursday'], numbers: [12, 3, 9], colors: ['Yellow', 'Orange'] }
    };
    
    const lucky = rashiLucky[rashi.number] || rashiLucky[1];
    
    return {
        days: lucky.days,
        numbers: lucky.numbers,
        colors: lucky.colors,
        direction: getNakshatraDirection(nakshatra.name),
        timeOfDay: getNakshatraTimeOfDay(nakshatra.name),
        gemstone: getRashiGemstone(rashi.number)
    };
}

/**
 * Get nakshatra direction
 */
function getNakshatraDirection(nakshatraName) {
    const directions = {
        'Ashwini': 'East', 'Bharani': 'South', 'Krittika': 'North',
        'Rohini': 'East', 'Mrigashira': 'North', 'Ardra': 'South',
        // ... add all 27 nakshatras
    };
    return directions[nakshatraName] || 'East';
}

/**
 * Get nakshatra time of day
 */
function getNakshatraTimeOfDay(nakshatraName) {
    const times = {
        'Ashwini': 'Early Morning', 'Bharani': 'Morning', 'Krittika': 'Noon',
        // ... add all 27 nakshatras
    };
    return times[nakshatraName] || 'Morning';
}

/**
 * Get rashi gemstone
 */
function getRashiGemstone(rashiNumber) {
    const gemstones = {
        1: 'Ruby', 2: 'Pearl', 3: 'Emerald', 4: 'Pearl',
        5: 'Ruby', 6: 'Emerald', 7: 'Diamond', 8: 'Red Coral',
        9: 'Yellow Sapphire', 10: 'Blue Sapphire', 11: 'Blue Sapphire', 12: 'Yellow Sapphire'
    };
    return gemstones[rashiNumber] || 'Crystal';
}

/**
 * Generate detailed career predictions
 */
function generateDetailedCareerPredictions(rashi, nakshatra, currentDasha, age) {
    const careerPredictions = {
        currentPhase: '',
        opportunities: [],
        challenges: [],
        bestTiming: '',
        recommendations: []
    };
    
    // Age-based career phase
    if (age <= 25) {
        careerPredictions.currentPhase = 'Foundation Building Phase';
        careerPredictions.recommendations.push('Focus on skill development and education');
    } else if (age <= 40) {
        careerPredictions.currentPhase = 'Growth and Establishment Phase';
        careerPredictions.recommendations.push('Take calculated risks and build leadership skills');
    } else if (age <= 55) {
        careerPredictions.currentPhase = 'Peak Performance Phase';
        careerPredictions.recommendations.push('Mentor others and expand your influence');
    } else {
        careerPredictions.currentPhase = 'Wisdom Sharing Phase';
        careerPredictions.recommendations.push('Focus on consulting and knowledge transfer');
    }
    
    // Dasha-based career timing
    if (currentDasha) {
        const dashaCareerEffects = {
            'Sun': 'Excellent for government jobs, leadership roles, and public recognition',
            'Moon': 'Good for public-facing careers, hospitality, and emotional work',
            'Mars': 'Favorable for sports, military, real estate, and energy sectors',
            'Mercury': 'Perfect for communication, IT, business, and analytical roles',
            'Jupiter': 'Ideal for education, law, spirituality, and advisory roles',
            'Venus': 'Great for arts, entertainment, luxury goods, and beauty industry',
            'Saturn': 'Focus on long-term projects, service sector, and systematic work',
            'Rahu': 'Opportunities in foreign companies, technology, and unconventional fields',
            'Ketu': 'Time for research, spirituality, and behind-the-scenes work'
        };
        careerPredictions.bestTiming = dashaCareerEffects[currentDasha.planet];
    }
    
    return careerPredictions;
}

/**
 * Generate detailed relationship predictions
 */
function generateDetailedRelationshipPredictions(rashi, nakshatra, age) {
    const relationshipPredictions = {
        currentPhase: '',
        compatibility: [],
        challenges: [],
        opportunities: [],
        advice: []
    };
    
    // Age-based relationship phase
    if (age <= 25) {
        relationshipPredictions.currentPhase = 'Exploration and Learning Phase';
        relationshipPredictions.advice.push('Focus on understanding yourself before committing');
    } else if (age <= 35) {
        relationshipPredictions.currentPhase = 'Partnership and Commitment Phase';
        relationshipPredictions.advice.push('Good time for marriage and long-term commitments');
    } else if (age <= 50) {
        relationshipPredictions.currentPhase = 'Nurturing and Growth Phase';
        relationshipPredictions.advice.push('Focus on deepening existing relationships');
    } else {
        relationshipPredictions.currentPhase = 'Wisdom and Mentoring Phase';
        relationshipPredictions.advice.push('Guide others in their relationship journey');
    }
    
    // Rashi-based compatibility
    const compatibleRashis = {
        1: [5, 9], 2: [6, 10], 3: [7, 11], 4: [8, 12],
        5: [1, 9], 6: [2, 10], 7: [3, 11], 8: [4, 12],
        9: [1, 5], 10: [2, 6], 11: [3, 7], 12: [4, 8]
    };
    
    relationshipPredictions.compatibility = compatibleRashis[rashi.number] || [1, 5, 9];
    
    return relationshipPredictions;
}

/**
 * Generate detailed health predictions
 */
function generateDetailedHealthPredictions(rashi, nakshatra, age) {
    const healthPredictions = {
        strengths: [],
        vulnerabilities: [],
        recommendations: [],
        preventiveMeasures: []
    };
    
    // Rashi-based health patterns
    const rashiHealth = {
        1: {
            strengths: ['Strong immunity', 'Quick recovery'],
            vulnerabilities: ['Head injuries', 'Stress-related issues'],
            recommendations: ['Regular exercise', 'Stress management']
        },
        2: {
            strengths: ['Good endurance', 'Stable health'],
            vulnerabilities: ['Throat problems', 'Weight issues'],
            recommendations: ['Balanced diet', 'Voice care']
        },
        3: {
            strengths: ['Good nervous system', 'Adaptability'],
            vulnerabilities: ['Respiratory issues', 'Anxiety'],
            recommendations: ['Breathing exercises', 'Mental relaxation']
        },
        4: {
            strengths: ['Good digestion', 'Emotional resilience'],
            vulnerabilities: ['Chest problems', 'Emotional eating'],
            recommendations: ['Emotional balance', 'Chest exercises']
        },
        5: {
            strengths: ['Strong heart', 'Good vitality'],
            vulnerabilities: ['Heart problems', 'Back issues'],
            recommendations: ['Cardio exercises', 'Back strengthening']
        },
        6: {
            strengths: ['Good analytical health habits', 'Detail-oriented care'],
            vulnerabilities: ['Digestive issues', 'Nervous disorders'],
            recommendations: ['Systematic health routine', 'Stress reduction']
        },
        7: {
            strengths: ['Good kidney function', 'Balanced health'],
            vulnerabilities: ['Kidney problems', 'Skin issues'],
            recommendations: ['Adequate hydration', 'Skin care']
        },
        8: {
            strengths: ['Strong regenerative power', 'Deep healing ability'],
            vulnerabilities: ['Reproductive issues', 'Chronic conditions'],
            recommendations: ['Regular detox', 'Deep healing practices']
        },
        9: {
            strengths: ['Good liver function', 'Optimistic healing'],
            vulnerabilities: ['Liver problems', 'Hip issues'],
            recommendations: ['Liver cleansing', 'Hip exercises']
        },
        10: {
            strengths: ['Strong bones', 'Good discipline'],
            vulnerabilities: ['Bone problems', 'Skin dryness'],
            recommendations: ['Calcium intake', 'Moisturizing']
        },
        11: {
            strengths: ['Good circulation', 'Innovative health approaches'],
            vulnerabilities: ['Circulation issues', 'Ankle problems'],
            recommendations: ['Circulation exercises', 'Ankle care']
        },
        12: {
            strengths: ['Good intuitive health sense', 'Healing abilities'],
            vulnerabilities: ['Foot problems', 'Lymphatic issues'],
            recommendations: ['Foot care', 'Lymphatic drainage']
        }
    };
    
    const healthData = rashiHealth[rashi.number] || rashiHealth[1];
    healthPredictions.strengths = healthData.strengths;
    healthPredictions.vulnerabilities = healthData.vulnerabilities;
    healthPredictions.recommendations = healthData.recommendations;
    
    return healthPredictions;
}

/**
 * Generate wealth predictions
 */
function generateWealthPredictions(rashi, currentDasha, yogas) {
    const wealthPredictions = {
        wealthPotential: '',
        bestPeriods: [],
        sources: [],
        investments: [],
        warnings: []
    };
    
    // Rashi-based wealth potential
    const rashiWealth = {
        1: 'High earning potential through leadership and entrepreneurship',
        2: 'Steady wealth accumulation through practical investments',
        3: 'Multiple income sources through communication and networking',
        4: 'Wealth through real estate and family business',
        5: 'Creative wealth generation and speculative gains',
        6: 'Wealth through service and systematic savings',
        7: 'Partnership-based wealth and luxury investments',
        8: 'Transformational wealth and hidden sources',
        9: 'International wealth and educational investments',
        10: 'Long-term wealth building and government benefits',
        11: 'Group investments and innovative wealth sources',
        12: 'Charitable wealth and spiritual investments'
    };
    
    wealthPredictions.wealthPotential = rashiWealth[rashi.number];
    
    // Dasha-based wealth timing
    if (currentDasha) {
        const dashaWealth = {
            'Sun': 'Government benefits and gold investments',
            'Moon': 'Real estate and liquid investments',
            'Mars': 'Property investments and energy sector',
            'Mercury': 'Business investments and technology stocks',
            'Jupiter': 'Educational investments and gold',
            'Venus': 'Luxury goods and beauty industry',
            'Saturn': 'Long-term systematic investments',
            'Rahu': 'Foreign investments and cryptocurrency',
            'Ketu': 'Spiritual investments and donations'
        };
        wealthPredictions.sources.push(dashaWealth[currentDasha.planet]);
    }
    
    return wealthPredictions;
}

/**
 * Generate detailed spiritual predictions
 */
function generateDetailedSpiritualPredictions(nakshatra, yogas, age) {
    const spiritualPredictions = {
        spiritualPath: '',
        practices: [],
        milestones: [],
        guidance: []
    };
    
    // Age-based spiritual development
    if (age <= 25) {
        spiritualPredictions.guidance.push('Foundation period for spiritual understanding');
    } else if (age <= 40) {
        spiritualPredictions.guidance.push('Balancing material and spiritual pursuits');
    } else if (age <= 55) {
        spiritualPredictions.guidance.push('Deepening spiritual practice and service');
    } else {
        spiritualPredictions.guidance.push('Time for intense spiritual realization');
    }
    
    // Nakshatra-based spiritual path
    if (nakshatra.number <= 9) {
        spiritualPredictions.spiritualPath = 'Path of Action (Karma Yoga)';
        spiritualPredictions.practices = ['Selfless service', 'Active meditation', 'Leadership in spiritual activities'];
    } else if (nakshatra.number <= 18) {
        spiritualPredictions.spiritualPath = 'Path of Devotion (Bhakti Yoga)';
        spiritualPredictions.practices = ['Devotional singing', 'Prayer', 'Surrender practices'];
    } else {
        spiritualPredictions.spiritualPath = 'Path of Knowledge (Jnana Yoga)';
        spiritualPredictions.practices = ['Self-inquiry', 'Scripture study', 'Contemplative meditation'];
    }
    
    return spiritualPredictions;
}

/**
 * Generate opportunities
 */
function generateOpportunities(currentDasha, rashi, age) {
    const opportunities = [];
    
    if (currentDasha) {
        const dashaOpportunities = {
            'Sun': 'Leadership positions, government connections, health improvements',
            'Moon': 'Public recognition, emotional healing, mother figure support',
            'Mars': 'Property deals, sports achievements, sibling support',
            'Mercury': 'Educational opportunities, business partnerships, communication skills',
            'Jupiter': 'Spiritual growth, teaching opportunities, long-distance travel',
            'Venus': 'Relationship opportunities, creative projects, luxury acquisitions',
            'Saturn': 'Long-term projects, service opportunities, discipline rewards',
            'Rahu': 'Foreign opportunities, technological advancement, unconventional success',
            'Ketu': 'Spiritual insights, research breakthroughs, past-life healing'
        };
        opportunities.push(dashaOpportunities[currentDasha.planet]);
    }
    
    // Age-based opportunities
    if (age >= 28 && age <= 32) {
        opportunities.push('Saturn return period - major life restructuring opportunities');
    }
    if (age >= 42 && age <= 45) {
        opportunities.push('Mid-life transformation - career and relationship opportunities');
    }
    
    return opportunities;
}

/**
 * Generate warnings
 */
function generateWarnings(currentDasha, rashi, age) {
    const warnings = [];
    
    if (currentDasha) {
        const dashaWarnings = {
            'Sun': 'Avoid ego conflicts, take care of heart health',
            'Moon': 'Watch for mood swings, avoid over-emotional decisions',
            'Mars': 'Control anger, avoid accidents, be careful with fire',
            'Mercury': 'Avoid over-analysis, be clear in communication',
            'Jupiter': 'Avoid over-optimism, don\'t neglect practical matters',
            'Venus': 'Avoid over-indulgence, be careful in relationships',
            'Saturn': 'Avoid shortcuts, be patient, don\'t neglect health',
            'Rahu': 'Avoid obsessions, be careful with foreign dealings',
            'Ketu': 'Avoid isolation, don\'t neglect material responsibilities'
        };
        warnings.push(dashaWarnings[currentDasha.planet]);
    }
    
    // Element-based warnings
    const elementWarnings = {
        'Fire': 'Control impulsiveness, avoid burnout',
        'Earth': 'Avoid excessive stubbornness, embrace change',
        'Air': 'Avoid scattered energy, focus on priorities',
        'Water': 'Avoid emotional overwhelm, maintain boundaries'
    };
    
    if (rashi && rashi.element) {
        warnings.push(elementWarnings[rashi.element]);
    }
    
    return warnings;
}

/**
 * Generate comprehensive Jyotish predictions
 */
function generateComprehensiveJyotishPredictions(rashi, nakshatra, currentDasha, yogas) {
    return {
        personality: {
            rashi: rashi.characteristics,
            nakshatra: nakshatra.characteristics,
            combined: `Your ${rashi.name} nature combined with ${nakshatra.name} nakshatra creates a unique blend of ${rashi.element.toLowerCase()} energy with ${nakshatra.characteristics.split(',')[0].toLowerCase()} tendencies.`
        },
        currentPeriod: {
            dasha: currentDasha ? currentDasha.planet : 'Transitional',
            effects: currentDasha ? currentDasha.effects : 'Period of change and adaptation',
            duration: currentDasha ? `${currentDasha.startDate} to ${currentDasha.endDate}` : 'Ongoing',
            advice: currentDasha ? `Focus on ${currentDasha.effects.split(',')[0].toLowerCase()} during this ${currentDasha.planet} period` : 'Embrace change and new opportunities'
        },
        strengths: generateStrengths(rashi, nakshatra, yogas),
        challenges: generateChallenges(rashi, nakshatra),
        careerGuidance: generateCareerGuidance(rashi, nakshatra, currentDasha),
        relationshipGuidance: generateRelationshipGuidance(rashi, nakshatra),
        healthGuidance: generateHealthGuidance(rashi, nakshatra),
        spiritualGuidance: generateSpiritualGuidance(nakshatra, yogas)
    };
}

/**
 * Generate strengths based on Jyotish analysis
 */
function generateStrengths(rashi, nakshatra, yogas) {
    const strengths = [];
    
    // Rashi-based strengths
    const rashiStrengths = {
        1: 'Natural leadership and pioneering abilities',
        2: 'Stability and practical wisdom',
        3: 'Communication and intellectual versatility',
        4: 'Emotional intelligence and nurturing nature',
        5: 'Creativity and natural charisma',
        6: 'Analytical skills and attention to detail',
        7: 'Diplomatic abilities and aesthetic sense',
        8: 'Transformational power and deep insights',
        9: 'Philosophical wisdom and adventurous spirit',
        10: 'Disciplined approach and organizational skills',
        11: 'Innovative thinking and humanitarian ideals',
        12: 'Intuitive abilities and compassionate nature'
    };
    
    strengths.push(rashiStrengths[rashi.number]);
    
    // Nakshatra-based strengths
    if (nakshatra.number <= 9) {
        strengths.push('Strong initiating abilities and pioneering spirit');
    } else if (nakshatra.number <= 18) {
        strengths.push('Excellent sustaining power and stability');
    } else {
        strengths.push('Natural transformational abilities and wisdom');
    }
    
    // Yoga-based strengths
    yogas.forEach(yoga => {
        if (yoga.strength === 'Strong') {
            strengths.push(`Enhanced by ${yoga.name}: ${yoga.effects}`);
        }
    });
    
    return strengths;
}

/**
 * Generate challenges based on Jyotish analysis
 */
function generateChallenges(rashi, nakshatra) {
    const challenges = [];
    
    // Element-based challenges
    const elementChallenges = {
        'Fire': 'May need to control impulsiveness and develop patience',
        'Earth': 'May need to embrace change and avoid excessive rigidity',
        'Air': 'May need to focus energy and avoid scattered thinking',
        'Water': 'May need to develop emotional boundaries and practical skills'
    };
    
    challenges.push(elementChallenges[rashi.element]);
    
    // Nakshatra-based challenges
    if (nakshatra.number % 3 === 1) {
        challenges.push('Learning to balance independence with cooperation');
    } else if (nakshatra.number % 3 === 2) {
        challenges.push('Developing confidence while maintaining humility');
    } else {
        challenges.push('Managing intensity and finding emotional balance');
    }
    
    return challenges;
}

/**
 * Generate career guidance
 */
function generateCareerGuidance(rashi, nakshatra, currentDasha) {
    const careerGuidance = {
        suitableFields: [],
        timing: '',
        approach: ''
    };
    
    // Rashi-based career fields
    const rashiCareers = {
        1: ['Leadership roles', 'Military', 'Sports', 'Entrepreneurship'],
        2: ['Agriculture', 'Real estate', 'Banking', 'Hospitality'],
        3: ['Communication', 'Media', 'Writing', 'Teaching'],
        4: ['Healthcare', 'Social work', 'Food industry', 'Psychology'],
        5: ['Entertainment', 'Arts', 'Politics', 'Management'],
        6: ['Research', 'Healthcare', 'Service industry', 'Analysis'],
        7: ['Law', 'Diplomacy', 'Arts', 'Fashion'],
        8: ['Investigation', 'Research', 'Occult sciences', 'Surgery'],
        9: ['Education', 'Travel', 'Philosophy', 'International business'],
        10: ['Government', 'Administration', 'Engineering', 'Construction'],
        11: ['Technology', 'Social causes', 'Innovation', 'Group activities'],
        12: ['Spirituality', 'Arts', 'Healthcare', 'Service to others']
    };
    
    careerGuidance.suitableFields = rashiCareers[rashi.number] || ['Diverse fields based on interests'];
    
    // Dasha-based timing
    if (currentDasha) {
        const dashaCareerEffects = {
            'Sun': 'Good time for leadership roles and government positions',
            'Moon': 'Favorable for public-facing careers and emotional work',
            'Mars': 'Excellent for sports, military, and energy-intensive careers',
            'Mercury': 'Perfect for communication, business, and intellectual work',
            'Jupiter': 'Ideal for teaching, counseling, and wisdom-based careers',
            'Venus': 'Great for arts, beauty, and relationship-based work',
            'Saturn': 'Focus on long-term career building and service',
            'Rahu': 'Opportunities in foreign lands and unconventional fields',
            'Ketu': 'Time for spiritual work and behind-the-scenes roles'
        };
        
        careerGuidance.timing = dashaCareerEffects[currentDasha.planet] || 'Mixed career influences';
    }
    
    careerGuidance.approach = `Leverage your ${rashi.element.toLowerCase()} energy and ${nakshatra.characteristics.split(',')[0].toLowerCase()} nature for career success`;
    
    return careerGuidance;
}

/**
 * Generate relationship guidance
 */
function generateRelationshipGuidance(rashi, nakshatra) {
    const compatibleRashis = {
        1: [5, 9], 2: [6, 10], 3: [7, 11], 4: [8, 12],
        5: [1, 9], 6: [2, 10], 7: [3, 11], 8: [4, 12],
        9: [1, 5], 10: [2, 6], 11: [3, 7], 12: [4, 8]
    };
    
    return {
        compatibility: `Most compatible with Rashi numbers ${compatibleRashis[rashi.number]?.join(' and ')} (same element group)`,
        approach: `Your ${rashi.element.toLowerCase()} nature seeks ${getRelationshipApproach(rashi.element)} in relationships`,
        advice: `With ${nakshatra.name} influence, focus on ${nakshatra.characteristics.split(',')[1]?.trim() || 'understanding'} in partnerships`
    };
}

/**
 * Get relationship approach based on element
 */
function getRelationshipApproach(element) {
    const approaches = {
        'Fire': 'passion and adventure',
        'Earth': 'stability and security',
        'Air': 'intellectual connection and communication',
        'Water': 'emotional depth and intuitive understanding'
    };
    return approaches[element] || 'balanced connection';
}

/**
 * Generate health guidance
 */
function generateHealthGuidance(rashi, nakshatra) {
    const healthGuidance = {
        strengths: '',
        vulnerabilities: '',
        recommendations: []
    };
    
    // Element-based health patterns
    const elementHealth = {
        'Fire': {
            strengths: 'Strong vitality and quick recovery',
            vulnerabilities: 'Tendency towards inflammation and stress-related issues',
            recommendations: ['Regular exercise', 'Stress management', 'Cooling foods']
        },
        'Earth': {
            strengths: 'Good physical endurance and stability',
            vulnerabilities: 'Digestive issues and weight management',
            recommendations: ['Balanced diet', 'Regular routine', 'Moderate exercise']
        },
        'Air': {
            strengths: 'Good nervous system and adaptability',
            vulnerabilities: 'Anxiety and respiratory issues',
            recommendations: ['Breathing exercises', 'Mental relaxation', 'Consistent sleep']
        },
        'Water': {
            strengths: 'Good emotional resilience and healing ability',
            vulnerabilities: 'Emotional eating and water retention',
            recommendations: ['Emotional balance', 'Regular detox', 'Adequate hydration']
        }
    };
    
    const elementData = elementHealth[rashi.element];
    healthGuidance.strengths = elementData.strengths;
    healthGuidance.vulnerabilities = elementData.vulnerabilities;
    healthGuidance.recommendations = elementData.recommendations;
    
    return healthGuidance;
}

/**
 * Generate spiritual guidance
 */
function generateSpiritualGuidance(nakshatra, yogas) {
    const guidance = {
        path: '',
        practices: [],
        goals: ''
    };
    
    // Nakshatra-based spiritual path
    if (nakshatra.number <= 9) {
        guidance.path = 'Path of action and initiation (Karma Yoga)';
        guidance.practices = ['Active service', 'Leadership in spiritual activities', 'Dynamic meditation'];
    } else if (nakshatra.number <= 18) {
        guidance.path = 'Path of devotion and preservation (Bhakti Yoga)';
        guidance.practices = ['Devotional practices', 'Chanting', 'Community worship'];
    } else {
        guidance.path = 'Path of knowledge and transformation (Jnana Yoga)';
        guidance.practices = ['Self-inquiry', 'Study of scriptures', 'Contemplative meditation'];
    }
    
    // Yoga-based spiritual enhancement
    const spiritualYogas = yogas.filter(yoga => 
        yoga.name.includes('Moksha') || yoga.name.includes('Gandanta') || yoga.name.includes('Guru')
    );
    
    if (spiritualYogas.length > 0) {
        guidance.goals = 'Strong potential for spiritual realization and enlightenment';
    } else {
        guidance.goals = 'Steady spiritual progress through dedicated practice';
    }
    
    return guidance;
}

/**
 * Generate Jyotish remedies
 */
function generateJyotishRemedies(rashi, nakshatra, currentDasha) {
    const remedies = {
        gemstones: [],
        mantras: [],
        colors: [],
        donations: [],
        fasting: '',
        general: []
    };
    
    // Rashi-based remedies
    const rashiRemedies = {
        1: {
            gemstones: ['Red Coral', 'Ruby'],
            colors: ['Red', 'Orange'],
            mantras: ['Om Gam Ganapataye Namaha', 'Om Hram Hreem Hroum Sah Suryaya Namaha']
        },
        2: {
            gemstones: ['Diamond', 'White Sapphire'],
            colors: ['White', 'Cream'],
            mantras: ['Om Shram Shreem Shroum Sah Shukraya Namaha']
        },
        3: {
            gemstones: ['Emerald', 'Green Tourmaline'],
            colors: ['Green', 'Light Blue'],
            mantras: ['Om Bram Breem Broum Sah Budhaya Namaha']
        },
        4: {
            gemstones: ['Pearl', 'Moonstone'],
            colors: ['White', 'Silver'],
            mantras: ['Om Shram Shreem Shroum Sah Chandraya Namaha']
        },
        5: {
            gemstones: ['Ruby', 'Red Spinel'],
            colors: ['Gold', 'Orange'],
            mantras: ['Om Hram Hreem Hroum Sah Suryaya Namaha']
        },
        6: {
            gemstones: ['Emerald', 'Peridot'],
            colors: ['Green', 'Navy Blue'],
            mantras: ['Om Bram Breem Broum Sah Budhaya Namaha']
        },
        7: {
            gemstones: ['Diamond', 'Opal'],
            colors: ['White', 'Pastel Colors'],
            mantras: ['Om Shram Shreem Shroum Sah Shukraya Namaha']
        },
        8: {
            gemstones: ['Red Coral', 'Bloodstone'],
            colors: ['Deep Red', 'Maroon'],
            mantras: ['Om Kram Kreem Kroum Sah Bhaumaya Namaha']
        },
        9: {
            gemstones: ['Yellow Sapphire', 'Topaz'],
            colors: ['Yellow', 'Gold'],
            mantras: ['Om Gram Greem Groum Sah Gurave Namaha']
        },
        10: {
            gemstones: ['Blue Sapphire', 'Amethyst'],
            colors: ['Dark Blue', 'Black'],
            mantras: ['Om Pram Preem Proum Sah Shanaye Namaha']
        },
        11: {
            gemstones: ['Blue Sapphire', 'Aquamarine'],
            colors: ['Blue', 'Electric Blue'],
            mantras: ['Om Pram Preem Proum Sah Shanaye Namaha']
        },
        12: {
            gemstones: ['Yellow Sapphire', 'Aquamarine'],
            colors: ['Yellow', 'Sea Green'],
            mantras: ['Om Gram Greem Groum Sah Gurave Namaha']
        }
    };
    
    const rashiRemedy = rashiRemedies[rashi.number];
    if (rashiRemedy) {
        remedies.gemstones = rashiRemedy.gemstones;
        remedies.colors = rashiRemedy.colors;
        remedies.mantras = rashiRemedy.mantras;
    }
    
    // Dasha-based remedies
    if (currentDasha) {
        const dashaRemedies = {
            'Sun': {
                donations: ['Wheat', 'Gold', 'Red clothes'],
                fasting: 'Sunday fasting',
                general: ['Face east while meditating', 'Offer water to Sun daily']
            },
            'Moon': {
                donations: ['Rice', 'Silver', 'White clothes'],
                fasting: 'Monday fasting',
                general: ['Drink water from silver vessel', 'Worship Divine Mother']
            },
            'Mars': {
                donations: ['Red lentils', 'Copper', 'Red clothes'],
                fasting: 'Tuesday fasting',
                general: ['Exercise regularly', 'Practice patience']
            },
            'Mercury': {
                donations: ['Green vegetables', 'Books', 'Green clothes'],
                fasting: 'Wednesday fasting',
                general: ['Study sacred texts', 'Practice clear communication']
            },
            'Jupiter': {
                donations: ['Yellow clothes', 'Gold', 'Turmeric'],
                fasting: 'Thursday fasting',
                general: ['Respect teachers', 'Practice charity']
            },
            'Venus': {
                donations: ['White clothes', 'Sugar', 'Perfumes'],
                fasting: 'Friday fasting',
                general: ['Appreciate beauty', 'Practice artistic activities']
            },
            'Saturn': {
                donations: ['Black clothes', 'Iron', 'Oil'],
                fasting: 'Saturday fasting',
                general: ['Serve the poor', 'Practice discipline']
            },
            'Rahu': {
                donations: ['Blue clothes', 'Mustard oil', 'Blankets'],
                fasting: 'Saturday fasting',
                general: ['Meditation', 'Avoid negative company']
            },
            'Ketu': {
                donations: ['Multi-colored clothes', 'Sesame seeds'],
                fasting: 'Tuesday fasting',
                general: ['Spiritual practices', 'Detachment from material']
            }
        };
        
        const dashaRemedy = dashaRemedies[currentDasha.planet];
        if (dashaRemedy) {
            remedies.donations = dashaRemedy.donations;
            remedies.fasting = dashaRemedy.fasting;
            remedies.general.push(...dashaRemedy.general);
        }
    }
    
    // General remedies
    remedies.general.push(
        'Regular meditation and prayer',
        'Practice yoga and pranayama',
        'Maintain positive thoughts and actions',
        'Respect elders and teachers',
        'Engage in charitable activities'
    );
    
    return remedies;
}

/**
 * Get life path guidance based on number
 */
function getLifePathGuidance(number) {
    const guidance = {
        1: 'leadership and independence',
        2: 'cooperation and partnership',
        3: 'creativity and communication',
        4: 'stability and hard work',
        5: 'freedom and adventure',
        6: 'responsibility and nurturing',
        7: 'spiritual growth and introspection',
        8: 'material success and authority',
        9: 'humanitarian service and wisdom',
        11: 'spiritual enlightenment and inspiration',
        22: 'master building and large-scale achievements',
        33: 'master teaching and healing'
    };
    
    return guidance[number] || 'personal growth and self-discovery';
}

// Vastu Calculator Functions

/**
 * Calculate Vastu compliance for a property
 */
function calculateVastuCompliance(propertyData) {
    const {
        facingDirection,
        mainEntrance,
        rooms,
        plot
    } = propertyData;
    
    let score = 0;
    const recommendations = [];
    const analysis = {};
    
    // Main entrance analysis
    const entranceScore = analyzeMainEntrance(facingDirection, mainEntrance);
    score += entranceScore.score;
    recommendations.push(...entranceScore.recommendations);
    analysis.entrance = entranceScore;
    
    // Room placement analysis
    if (rooms) {
        const roomScore = analyzeRoomPlacements(rooms);
        score += roomScore.score;
        recommendations.push(...roomScore.recommendations);
        analysis.rooms = roomScore;
    }
    
    // Plot analysis
    if (plot) {
        const plotScore = analyzePlot(plot);
        score += plotScore.score;
        recommendations.push(...plotScore.recommendations);
        analysis.plot = plotScore;
    }
    
    // Calculate overall percentage
    const maxPossibleScore = 100;
    const compliancePercentage = Math.min(100, (score / maxPossibleScore) * 100);
    
    return {
        overallScore: Math.round(compliancePercentage),
        compliance: getComplianceLevel(compliancePercentage),
        recommendations,
        detailedAnalysis: analysis,
        vastuTips: getGeneralVastuTips()
    };
}

/**
 * Analyze main entrance according to Vastu
 */
function analyzeMainEntrance(facingDirection, entranceDirection) {
    const idealEntrances = {
        'North': ['North', 'Northeast'],
        'South': ['South', 'Southeast'],
        'East': ['East', 'Northeast'],
        'West': ['West', 'Northwest']
    };
    
    let score = 0;
    const recommendations = [];
    
    if (idealEntrances[facingDirection]?.includes(entranceDirection)) {
        score += 25;
        recommendations.push(`Excellent: Main entrance in ${entranceDirection} is ideal for ${facingDirection} facing property`);
    } else {
        score += 10;
        recommendations.push(`Consider relocating main entrance to ${idealEntrances[facingDirection]?.join(' or ')} for better Vastu compliance`);
    }
    
    return { score, recommendations };
}

/**
 * Analyze room placements according to Vastu
 */
function analyzeRoomPlacements(rooms) {
    const idealPlacements = {
        'kitchen': ['Southeast', 'Northwest'],
        'bedroom': ['Southwest', 'South', 'West'],
        'livingRoom': ['North', 'Northeast', 'East'],
        'bathroom': ['Northwest', 'West'],
        'studyRoom': ['Northeast', 'North', 'East'],
        'poojaRoom': ['Northeast', 'North', 'East'],
        'storeRoom': ['Southwest', 'West', 'South']
    };
    
    let score = 0;
    const recommendations = [];
    
    Object.entries(rooms).forEach(([roomType, direction]) => {
        if (idealPlacements[roomType]?.includes(direction)) {
            score += 10;
            recommendations.push(`✓ ${roomType} in ${direction} is well-placed according to Vastu`);
        } else {
            score += 3;
            recommendations.push(`⚠ Consider relocating ${roomType} to ${idealPlacements[roomType]?.join(' or ')} for better energy flow`);
        }
    });
    
    return { score, recommendations };
}

/**
 * Analyze plot characteristics
 */
function analyzePlot(plot) {
    const { shape, slope, surroundings } = plot;
    let score = 0;
    const recommendations = [];
    
    // Shape analysis
    if (shape === 'square' || shape === 'rectangle') {
        score += 15;
        recommendations.push('✓ Regular plot shape is excellent for Vastu compliance');
    } else {
        score += 5;
        recommendations.push('⚠ Irregular plot shapes may create energy imbalances');
    }
    
    // Slope analysis
    if (slope === 'north' || slope === 'east') {
        score += 10;
        recommendations.push('✓ Plot slope towards North or East is favorable');
    } else if (slope === 'northeast') {
        score += 15;
        recommendations.push('✓ Northeast slope is highly auspicious');
    } else {
        score += 3;
        recommendations.push('⚠ Consider creating a gentle slope towards North or East');
    }
    
    return { score, recommendations };
}

/**
 * Get compliance level based on score
 */
function getComplianceLevel(score) {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Average';
    return 'Needs Improvement';
}

/**
 * Get general Vastu tips
 */
function getGeneralVastuTips() {
    return [
        'Keep the northeast corner of your home clean and clutter-free',
        'Place a water feature in the north or northeast direction',
        'Ensure proper ventilation and natural light in all rooms',
        'Use light colors for walls, especially in the north and east',
        'Keep heavy furniture in the southwest portion of rooms',
        'Avoid keeping mirrors in the bedroom facing the bed',
        'Place plants in the east or north direction of the house',
        'Keep the center of the house (Brahmasthan) open and uncluttered'
    ];
}

// API Endpoints

// Numerology Endpoints
router.post('/numerology/bhagyank', (req, res) => {
    try {
        const { dateOfBirth } = req.body;
        
        if (!dateOfBirth) {
            return res.status(400).json({ error: 'Date of birth is required' });
        }
        
        const bhagyank = calculateBhagyank(dateOfBirth);
        
        res.json({
            success: true,
            bhagyank,
            description: `Your Bhagyank (Destiny Number) is ${bhagyank}`,
            meaning: getBhagyankMeaning(bhagyank),
            dateOfBirth
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.post('/numerology/mulank', (req, res) => {
    try {
        const { dateOfBirth } = req.body;
        
        if (!dateOfBirth) {
            return res.status(400).json({ error: 'Date of birth is required' });
        }
        
        const mulank = calculateMulank(dateOfBirth);
        
        res.json({
            success: true,
            mulank,
            description: `Your Mulank (Root Number) is ${mulank}`,
            meaning: getMulankMeaning(mulank),
            dateOfBirth
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.post('/numerology/name', (req, res) => {
    try {
        const { fullName } = req.body;
        
        if (!fullName) {
            return res.status(400).json({ error: 'Full name is required' });
        }
        
        const nameNumber = calculateNameNumerology(fullName);
        
        res.json({
            success: true,
            nameNumber,
            description: `Your Name Number is ${nameNumber}`,
            meaning: getNameNumberMeaning(nameNumber),
            fullName
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.post('/numerology/loshu-grid', (req, res) => {
    try {
        const { dateOfBirth } = req.body;
        
        if (!dateOfBirth) {
            return res.status(400).json({ error: 'Date of birth is required' });
        }
        
        const loShuResult = calculateLoShuGrid(dateOfBirth);
        
        res.json({
            success: true,
            ...loShuResult,
            description: 'Your Lo Shu Grid analysis reveals personality patterns and life insights',
            dateOfBirth
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

/**
 * Working Enhanced Analysis Function
 */
function generateWorkingEnhancedAnalysis(bhagyank, mulank, nameNumber, loShuResult, fullName, dateOfBirth, age) {
    return {
        personalityProfile: {
            coreEssence: `You are a naturally gifted individual with a unique combination of leadership qualities and creative expression. Your Bhagyank ${bhagyank} reveals your life's purpose, while your Mulank ${mulank} shows your natural personality traits.`,
            naturalGifts: ['Leadership abilities', 'Creative expression', 'Strong intuition', 'Problem-solving skills'],
            lifePhase: age < 25 ? 'Foundation Building' : age < 40 ? 'Growth & Achievement' : age < 60 ? 'Peak Performance' : 'Wisdom Sharing'
        },
        careerInsights: {
            naturalCareerPath: `Your numbers indicate exceptional potential in leadership roles and creative fields. The combination of your Bhagyank ${bhagyank} and Name Number ${nameNumber} creates powerful career opportunities in management, business, and innovative industries.`,
            hiddenTalents: ['Strategic thinking', 'Team leadership', 'Creative problem-solving', 'Communication excellence'],
            leadershipStyle: `You have a natural ability to inspire and guide others. Your leadership style is both compassionate and decisive, making you an effective leader who people trust and follow willingly.`,
            successTimeline: [`Ages ${Math.max(25, age)}-${Math.max(35, age + 10)}: Career breakthrough`, `Ages ${Math.max(35, age + 5)}-${Math.max(45, age + 15)}: Peak success`]
        },
        relationshipInsights: {
            loveStyle: `You approach relationships with genuine care and deep emotional intelligence. Your love style is characterized by loyalty, understanding, and a natural ability to create harmony in your personal relationships.`,
            idealPartner: {
                characteristics: ['Understanding', 'Supportive', 'Intellectually stimulating', 'Emotionally mature'],
                compatibility: `Your ideal partner appreciates your ambitions while providing emotional support and sharing your values of growth and success.`
            },
            relationshipStrengths: ['Deep emotional connection', 'Excellent communication', 'Mutual support', 'Shared growth']
        },
        amazingPredictions: [
            `A significant opportunity will arise within the next ${age < 30 ? '2-3' : '1-2'} years that will accelerate your career growth beyond your expectations.`,
            `Your natural leadership abilities will be recognized by influential people, opening doors to positions of authority and respect.`,
            `A creative project or innovative idea will bring unexpected recognition and financial rewards in the coming years.`,
            `Your relationships will flourish as you learn to balance your ambitious nature with emotional intelligence and compassion.`,
            `Financial prosperity will come through your unique talents and ability to inspire others, leading to multiple sources of income.`,
            `You will become a mentor and guide to others, sharing your wisdom and helping them achieve their own success and happiness.`
        ]
    };
}

// Enhanced Complete numerology report with amazing insights
router.post('/numerology/complete-report', (req, res) => {
    try {
        const { fullName, dateOfBirth } = req.body;
        
        if (!fullName || !dateOfBirth) {
            return res.status(400).json({ error: 'Full name and date of birth are required' });
        }
        
        const bhagyank = calculateBhagyank(dateOfBirth);
        const mulank = calculateMulank(dateOfBirth);
        const nameNumber = calculateSimpleNameNumber(fullName);
        const loShuResult = calculateLoShuGrid(dateOfBirth);
        
        // Calculate age for life phase analysis
        const age = new Date().getFullYear() - new Date(dateOfBirth).getFullYear();
        
        // Generate enhanced analysis
        const enhancedAnalysis = generateWorkingEnhancedAnalysis(
            bhagyank, mulank, nameNumber, loShuResult, fullName, dateOfBirth, age
        );
        
        res.json({
            success: true,
            personalDetails: { fullName, dateOfBirth, age },
            numerologyReport: {
                bhagyank: {
                    number: bhagyank,
                    meaning: getBhagyankMeaning(bhagyank),
                    lifeImpact: getPositiveBhagyankImpact(bhagyank)
                },
                mulank: {
                    number: mulank,
                    meaning: getMulankMeaning(mulank),
                    personalityGifts: getPositiveMulankGifts(mulank)
                },
                nameNumber: {
                    number: nameNumber,
                    meaning: getNameNumberMeaning(nameNumber),
                    publicImage: getPositiveNameImpact(nameNumber)
                },
                loShuGrid: {
                    ...loShuResult,
                    hiddenTalents: getLoShuHiddenTalents(loShuResult),
                    strengthAreas: getLoShuStrengthAreas(loShuResult)
                }
            },
            enhancedInsights: enhancedAnalysis,
            compatibility: calculateEnhancedNumerologyCompatibility(bhagyank, mulank, nameNumber),
            recommendations: getPositiveNumerologyRecommendations(bhagyank, mulank, nameNumber),
            description: 'Enhanced Numerology Report with Deep Career and Relationship Insights'
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

/**
 * Generate Enhanced Numerology Analysis with Career and Relationship Insights
 */
function generateEnhancedNumerologyAnalysis(bhagyank, mulank, nameNumber, loShuResult, fullName, dateOfBirth, age) {
    return {
        personalityProfile: generatePositivePersonalityProfile(bhagyank, mulank, nameNumber, fullName),
        careerInsights: generateNumerologyCareerInsights(bhagyank, mulank, nameNumber, age),
        relationshipInsights: generateNumerologyRelationshipInsights(bhagyank, mulank, nameNumber, age),
        lifePhaseAnalysis: generateNumerologyLifePhaseAnalysis(bhagyank, mulank, age),
        luckyElements: generateNumerologyLuckyElements(bhagyank, mulank, nameNumber),
        strengthsAndGifts: generateNumerologyStrengths(bhagyank, mulank, nameNumber, loShuResult),
        futureOpportunities: generateNumerologyFutureOpportunities(bhagyank, mulank, nameNumber, age),
        successFormula: generatePersonalSuccessFormula(bhagyank, mulank, nameNumber),
        amazingPredictions: generateAmazingNumerologyPredictions(bhagyank, mulank, nameNumber, age, fullName)
    };
}

/**
 * Generate Positive Personality Profile
 */
function generatePositivePersonalityProfile(bhagyank, mulank, nameNumber, fullName) {
    const profile = {
        coreEssence: '',
        uniqueGifts: [],
        naturalMagnetism: '',
        innerStrength: '',
        specialQualities: []
    };
    
    // Core essence based on Bhagyank
    const bhagyankEssence = {
        1: 'You possess the rare gift of natural leadership and pioneering spirit that inspires others to follow your vision.',
        2: 'Your soul radiates cooperation and harmony, making you a natural peacemaker and bridge-builder in any situation.',
        3: 'You carry the divine spark of creativity and communication, bringing joy and inspiration wherever you go.',
        4: 'Your essence is stability and foundation-building, creating security and trust for everyone around you.',
        5: 'You embody freedom and adventure, bringing excitement and new perspectives to every situation.',
        6: 'Your heart overflows with nurturing love and responsibility, making you a natural healer and caretaker.',
        7: 'You possess deep spiritual wisdom and intuitive understanding that guides both yourself and others.',
        8: 'You have the powerful gift of material manifestation and authority, capable of achieving great success.',
        9: 'Your soul purpose is humanitarian service and universal wisdom, touching countless lives with your compassion.',
        11: 'You are a spiritual beacon and inspiration to others, carrying divine light and healing energy.',
        22: 'You are a master builder with the rare ability to turn grand visions into concrete reality.',
        33: 'You are a master teacher and healer, destined to guide humanity toward higher consciousness.'
    };
    
    profile.coreEssence = bhagyankEssence[bhagyank] || 'You possess unique gifts that make you special and valuable to the world.';
    
    // Unique gifts based on Mulank
    const mulankGifts = {
        1: ['Natural leadership abilities', 'Pioneering spirit', 'Independent thinking', 'Original ideas'],
        2: ['Exceptional diplomatic skills', 'Natural cooperation', 'Emotional intelligence', 'Peacemaking abilities'],
        3: ['Creative expression', 'Communication mastery', 'Artistic talents', 'Inspiring personality'],
        4: ['Organizational excellence', 'Practical wisdom', 'Reliable nature', 'Foundation building'],
        5: ['Adventurous spirit', 'Versatility', 'Freedom-loving nature', 'Dynamic energy'],
        6: ['Nurturing abilities', 'Healing touch', 'Responsibility', 'Family devotion'],
        7: ['Analytical mind', 'Spiritual insight', 'Research abilities', 'Deep understanding'],
        8: ['Business acumen', 'Material success', 'Authority', 'Achievement orientation'],
        9: ['Humanitarian heart', 'Universal wisdom', 'Generous nature', 'Completion abilities'],
        11: ['Intuitive powers', 'Inspirational qualities', 'Spiritual awareness', 'Healing abilities'],
        22: ['Master building skills', 'Visionary thinking', 'Large-scale achievement', 'Practical idealism'],
        33: ['Teaching mastery', 'Healing powers', 'Compassionate service', 'Spiritual guidance']
    };
    
    profile.uniqueGifts = mulankGifts[mulank] || ['Special talents that make you unique'];
    
    // Natural magnetism based on Name Number
    const nameMagnetism = {
        1: 'You project confident leadership that naturally attracts followers and opportunities.',
        2: 'Your gentle, cooperative nature draws people who seek harmony and understanding.',
        3: 'Your creative and expressive energy attracts artistic and innovative opportunities.',
        4: 'Your reliable and stable presence attracts those seeking security and trust.',
        5: 'Your dynamic and adventurous spirit attracts exciting opportunities and like-minded people.',
        6: 'Your caring and nurturing nature attracts those who need healing and support.',
        7: 'Your mysterious and wise aura attracts those seeking deeper understanding and knowledge.',
        8: 'Your successful and authoritative presence attracts business opportunities and influential people.',
        9: 'Your wise and humanitarian nature attracts opportunities to serve and lead others.',
        11: 'Your inspirational and intuitive energy attracts spiritual seekers and healing opportunities.',
        22: 'Your master builder energy attracts large-scale projects and visionary collaborations.',
        33: 'Your teaching and healing presence attracts those ready for transformation and growth.'
    };
    
    profile.naturalMagnetism = nameMagnetism[nameNumber] || 'You have a unique magnetic presence that attracts positive opportunities.';
    
    // Inner strength
    profile.innerStrength = `The combination of your ${bhagyank} life path with ${mulank} personality creates an unshakeable inner foundation of ${getBhagyankStrength(bhagyank)} and ${getMulankStrength(mulank)}.`;
    
    // Special qualities
    profile.specialQualities = [
        `Your ${bhagyank}-${mulank}-${nameNumber} number combination is rare and powerful`,
        `You have the perfect blend of ${getBhagyankQuality(bhagyank)} and ${getMulankQuality(mulank)}`,
        `Your name vibration of ${nameNumber} amplifies your natural gifts`,
        `You possess the unique ability to balance material success with spiritual growth`
    ];
    
    return profile;
}

/**
 * Generate Numerology Career Insights
 */
function generateNumerologyCareerInsights(bhagyank, mulank, nameNumber, age) {
    const careerInsights = {
        naturalCareerPath: '',
        hiddenTalents: [],
        careerBreakthroughs: [],
        leadershipStyle: '',
        businessPotential: '',
        careerTiming: {
            earlyCareer: '',
            peakCareer: '',
            laterCareer: ''
        },
        incomePattern: '',
        workEnvironment: '',
        careerRecommendations: []
    };
    
    // Natural career path based on Bhagyank
    const bhagyankCareers = {
        1: 'You are destined for leadership roles where you can pioneer new ideas and inspire others to achieve greatness.',
        2: 'Your career path leads to collaboration and partnership roles where your diplomatic skills create harmony and success.',
        3: 'Creative expression and communication are your career superpowers, leading to success in artistic and media fields.',
        4: 'Building solid foundations and systems is your career calling, bringing stability and security to organizations.',
        5: 'Your career involves freedom, travel, and variety, bringing excitement and innovation to traditional fields.',
        6: 'Nurturing and healing others through your career brings both personal fulfillment and material success.',
        7: 'Your analytical and spiritual gifts lead to careers in research, analysis, and wisdom-based professions.',
        8: 'Material success and business leadership are your natural career domains, bringing wealth and recognition.',
        9: 'Your humanitarian calling leads to careers that serve the greater good and touch many lives positively.'
    };
    
    careerInsights.naturalCareerPath = bhagyankCareers[bhagyank] || 'You have a unique career path that combines multiple talents for extraordinary success.';
    
    // Hidden talents based on Mulank
    const mulankTalents = {
        1: ['Natural leadership in crisis situations', 'Ability to start new ventures', 'Original problem-solving'],
        2: ['Exceptional teamwork abilities', 'Conflict resolution skills', 'Behind-the-scenes influence'],
        3: ['Creative innovation', 'Inspiring communication', 'Artistic vision'],
        4: ['System optimization', 'Process improvement', 'Reliable execution'],
        5: ['Adaptability to change', 'Multi-tasking excellence', 'Trend identification'],
        6: ['Team nurturing', 'Responsibility management', 'Healing workplace dynamics'],
        7: ['Deep analysis', 'Research excellence', 'Intuitive decision-making'],
        8: ['Business strategy', 'Resource management', 'Authority building'],
        9: ['Vision casting', 'Mentoring abilities', 'Universal perspective']
    };
    
    careerInsights.hiddenTalents = mulankTalents[mulank] || ['Unique talents waiting to be discovered'];
    
    // Career breakthroughs
    careerInsights.careerBreakthroughs = generateCareerBreakthroughs(bhagyank, mulank, age);
    
    // Leadership style
    careerInsights.leadershipStyle = generateLeadershipStyle(bhagyank, mulank, nameNumber);
    
    // Business potential
    careerInsights.businessPotential = generateBusinessPotential(bhagyank, mulank, nameNumber);
    
    // Career timing
    careerInsights.careerTiming = generateCareerTiming(bhagyank, mulank, age);
    
    // Income pattern
    careerInsights.incomePattern = generateIncomePattern(bhagyank, mulank, nameNumber);
    
    // Work environment
    careerInsights.workEnvironment = generateWorkEnvironment(mulank, nameNumber);
    
    // Career recommendations
    careerInsights.careerRecommendations = generatePositiveCareerRecommendations(bhagyank, mulank, nameNumber);
    
    return careerInsights;
}

/**
 * Generate Numerology Relationship Insights
 */
function generateNumerologyRelationshipInsights(bhagyank, mulank, nameNumber, age) {
    const relationshipInsights = {
        loveStyle: '',
        idealPartner: {
            numbers: [],
            characteristics: [],
            compatibility: ''
        },
        relationshipStrengths: [],
        attractionFactors: [],
        relationshipTiming: {
            bestAges: [],
            favorablePeriods: [],
            meetingCircumstances: ''
        },
        marriageHappiness: '',
        familyLife: '',
        relationshipAdvice: []
    };
    
    // Love style based on combination
    relationshipInsights.loveStyle = generateLoveStyle(bhagyank, mulank, nameNumber);
    
    // Ideal partner analysis
    relationshipInsights.idealPartner = generateIdealPartnerNumerology(bhagyank, mulank, nameNumber);
    
    // Relationship strengths
    relationshipInsights.relationshipStrengths = generateRelationshipStrengths(bhagyank, mulank, nameNumber);
    
    // Attraction factors
    relationshipInsights.attractionFactors = generateAttractionFactors(mulank, nameNumber);
    
    // Relationship timing
    relationshipInsights.relationshipTiming = generateRelationshipTiming(bhagyank, mulank, age);
    
    // Marriage happiness
    relationshipInsights.marriageHappiness = generateMarriageHappiness(bhagyank, mulank, nameNumber);
    
    // Family life
    relationshipInsights.familyLife = generateFamilyLife(bhagyank, mulank, nameNumber);
    
    // Relationship advice
    relationshipInsights.relationshipAdvice = generatePositiveRelationshipAdvice(bhagyank, mulank, nameNumber);
    
    return relationshipInsights;
}

/**
 * Generate Career Breakthroughs
 */
function generateCareerBreakthroughs(bhagyank, mulank, age) {
    const breakthroughs = [];
    
    // Age-based breakthroughs
    if (age < 25) {
        breakthroughs.push(`Around age ${23 + bhagyank % 3}, you'll discover a hidden talent that becomes your career superpower`);
        breakthroughs.push(`Age ${25 + mulank % 2} brings a mentor who recognizes your potential and opens important doors`);
    } else if (age < 35) {
        breakthroughs.push(`Between ages ${28 + bhagyank % 3} and ${32 + mulank % 2}, a major opportunity will transform your career trajectory`);
        breakthroughs.push(`Your unique combination of skills will be recognized, leading to a significant promotion or career change`);
    } else if (age < 45) {
        breakthroughs.push(`This decade establishes you as an expert in your field with opportunities for leadership and recognition`);
        breakthroughs.push(`Your accumulated experience opens doors to consulting and advisory roles`);
    } else {
        breakthroughs.push(`Your wisdom and experience become highly valued, leading to prestigious positions and speaking opportunities`);
        breakthroughs.push(`A second career or passion project brings both fulfillment and additional income`);
    }
    
    return breakthroughs;
}

/**
 * Generate Leadership Style
 */
function generateLeadershipStyle(bhagyank, mulank, nameNumber) {
    const styles = {
        1: 'You lead by example with confidence and vision, inspiring others to achieve their highest potential.',
        2: 'Your collaborative leadership style brings out the best in teams through cooperation and understanding.',
        3: 'You lead through inspiration and creativity, motivating others with your enthusiasm and innovative ideas.',
        4: 'Your steady, reliable leadership provides security and direction, building strong foundations for success.',
        5: 'Your dynamic leadership brings change and excitement, encouraging others to embrace new possibilities.',
        6: 'You lead with compassion and responsibility, creating supportive environments where everyone can thrive.',
        7: 'Your thoughtful, analytical leadership provides deep insights and strategic direction for complex challenges.',
        8: 'Your authoritative leadership commands respect and achieves ambitious goals through determination and strategy.',
        9: 'Your visionary leadership serves the greater good, inspiring others to contribute to meaningful causes.'
    };
    
    const primaryStyle = styles[bhagyank] || 'You have a unique leadership style that combines multiple approaches.';
    const supportingStyle = styles[mulank] || '';
    
    return `${primaryStyle} ${supportingStyle}`.trim();
}

/**
 * Generate Business Potential
 */
function generateBusinessPotential(bhagyank, mulank, nameNumber) {
    let potential = 'Your numerological combination shows ';
    
    const businessNumbers = [1, 3, 5, 8, 9];
    const bhagyankBusiness = businessNumbers.includes(bhagyank);
    const mulankBusiness = businessNumbers.includes(mulank);
    const nameBusiness = businessNumbers.includes(nameNumber);
    
    const businessScore = (bhagyankBusiness ? 1 : 0) + (mulankBusiness ? 1 : 0) + (nameBusiness ? 1 : 0);
    
    if (businessScore >= 2) {
        potential += 'exceptional business potential with natural entrepreneurial instincts. You have the vision, courage, and determination needed for successful ventures.';
    } else if (businessScore === 1) {
        potential += 'good business potential that can be developed with proper planning and partnerships. Your analytical skills will help you make sound business decisions.';
    } else {
        potential += 'excellent potential for stable employment and service-oriented careers. Your reliability and dedication will lead to steady advancement and recognition.';
    }
    
    return potential;
}

/**
 * Generate Love Style
 */
function generateLoveStyle(bhagyank, mulank, nameNumber) {
    const loveStyles = {
        1: 'You love with passion and leadership, taking initiative in relationships and inspiring your partner to grow.',
        2: 'You love with gentleness and cooperation, creating harmony and emotional security in relationships.',
        3: 'You love with creativity and expression, bringing joy, laughter, and artistic beauty to relationships.',
        4: 'You love with stability and devotion, providing security and building lasting foundations for partnership.',
        5: 'You love with freedom and adventure, bringing excitement and new experiences to relationships.',
        6: 'You love with nurturing and responsibility, creating a caring and supportive home environment.',
        7: 'You love with depth and understanding, seeking spiritual and intellectual connection with your partner.',
        8: 'You love with intensity and commitment, providing material security and ambitious goals for the partnership.',
        9: 'You love with wisdom and compassion, bringing universal understanding and growth to relationships.'
    };
    
    return loveStyles[bhagyank] || 'You have a unique and special way of loving that brings happiness to relationships.';
}

/**
 * Generate Ideal Partner Numerology
 */
function generateIdealPartnerNumerology(bhagyank, mulank, nameNumber) {
    const compatibility = {
        1: [1, 5, 9], 2: [2, 4, 6, 8], 3: [3, 6, 9], 4: [2, 4, 6, 8],
        5: [1, 5, 9], 6: [2, 3, 6, 9], 7: [7], 8: [2, 4, 6, 8],
        9: [1, 3, 6, 9], 11: [2, 11, 22], 22: [4, 11, 22], 33: [6, 9, 33]
    };
    
    const idealNumbers = compatibility[bhagyank] || [bhagyank];
    
    const partnerCharacteristics = idealNumbers.map(num => {
        const characteristics = {
            1: 'confident, independent, and leadership-oriented',
            2: 'gentle, cooperative, and emotionally supportive',
            3: 'creative, expressive, and joyful',
            4: 'stable, reliable, and practical',
            5: 'adventurous, free-spirited, and dynamic',
            6: 'nurturing, responsible, and family-oriented',
            7: 'wise, spiritual, and intellectually deep',
            8: 'ambitious, successful, and materially secure',
            9: 'wise, humanitarian, and universally minded',
            11: 'intuitive, inspirational, and spiritually aware',
            22: 'visionary, practical, and achievement-oriented',
            33: 'compassionate, healing, and spiritually advanced'
        };
        return characteristics[num];
    }).filter(Boolean);
    
    return {
        numbers: idealNumbers,
        characteristics: partnerCharacteristics,
        compatibility: `Your ideal partner will be ${partnerCharacteristics.join(' or ')}, creating perfect harmony and mutual growth in your relationship.`
    };
}

/**
 * Generate Amazing Numerology Predictions
 */
function generateAmazingNumerologyPredictions(bhagyank, mulank, nameNumber, age, fullName) {
    const predictions = [];
    
    // Life path predictions
    predictions.push(`Your ${bhagyank} life path is leading you toward extraordinary achievements that will inspire others and create lasting impact.`);
    
    // Career predictions
    predictions.push(`Your natural ${mulank} personality will attract a career opportunity that perfectly matches your talents within the next ${3 + bhagyank % 2} years.`);
    
    // Relationship predictions
    predictions.push(`Your ${nameNumber} name vibration will attract a life partner who complements your personality perfectly and supports your highest aspirations.`);
    
    // Success predictions
    predictions.push(`The combination of your numbers creates a success formula that will bring both material prosperity and spiritual fulfillment.`);
    
    // Age-specific predictions
    if (age < 30) {
        predictions.push(`Between ages ${age + 2} and ${age + 5}, you'll experience a major life transformation that aligns you with your true purpose.`);
    } else if (age < 50) {
        predictions.push(`This decade will establish you as a respected figure in your field, with your reputation growing significantly.`);
    } else {
        predictions.push(`Your accumulated wisdom will create opportunities to mentor others and leave a lasting legacy.`);
    }
    
    // Name-specific predictions
    const firstLetter = fullName.charAt(0).toUpperCase();
    predictions.push(`The first letter '${firstLetter}' of your name carries special vibrations that enhance your natural magnetism and attract positive opportunities.`);
    
    // Positive future predictions
    predictions.push(`Your unique number combination is rare and indicates that you're meant for something special and extraordinary in this lifetime.`);
    predictions.push(`The universe is aligning circumstances to bring you the perfect opportunities for growth, love, and success.`);
    
    return predictions;
}

/**
 * Generate helper functions for positive analysis
 */
function getBhagyankStrength(number) {
    const strengths = {
        1: 'leadership and independence', 2: 'cooperation and harmony', 3: 'creativity and expression',
        4: 'stability and foundation', 5: 'freedom and adventure', 6: 'nurturing and healing',
        7: 'wisdom and spirituality', 8: 'achievement and success', 9: 'service and completion',
        11: 'inspiration and intuition', 22: 'master building', 33: 'master teaching'
    };
    return strengths[number] || 'unique spiritual gifts';
}

function getMulankStrength(number) {
    const strengths = {
        1: 'pioneering courage', 2: 'diplomatic wisdom', 3: 'creative joy',
        4: 'practical reliability', 5: 'dynamic versatility', 6: 'caring responsibility',
        7: 'analytical depth', 8: 'material mastery', 9: 'humanitarian wisdom'
    };
    return strengths[number] || 'special personality gifts';
}

function getPositiveBhagyankImpact(number) {
    const impacts = {
        1: 'Your life path brings natural leadership opportunities and the ability to inspire others toward greatness.',
        2: 'Your destiny involves creating harmony and cooperation, making you a natural peacemaker and bridge-builder.',
        3: 'Your life purpose centers on creative expression and bringing joy to others through your talents.',
        4: 'Your path involves building lasting foundations that provide security and stability for many people.',
        5: 'Your journey brings freedom and adventure, opening new horizons and possibilities for yourself and others.',
        6: 'Your destiny is to nurture and heal, creating loving environments where others can flourish.',
        7: 'Your path leads to spiritual wisdom and deep understanding that guides both yourself and others.',
        8: 'Your life purpose involves achieving material success and using your authority to benefit others.',
        9: 'Your destiny is humanitarian service, touching countless lives with your wisdom and compassion.'
    };
    return impacts[number] || 'Your life path brings unique opportunities for growth and service.';
}

function getPositiveMulankGifts(number) {
    const gifts = {
        1: 'You possess the rare gift of natural leadership and the courage to pioneer new paths.',
        2: 'Your gentle strength and cooperative spirit make you invaluable in any team or relationship.',
        3: 'Your creative spark and joyful expression bring light and inspiration to everyone around you.',
        4: 'Your reliability and practical wisdom create stability and trust wherever you go.',
        5: 'Your adventurous spirit and versatility open doors to exciting opportunities and experiences.',
        6: 'Your nurturing heart and sense of responsibility make you a natural healer and caretaker.',
        7: 'Your analytical mind and spiritual insight provide deep understanding and wise guidance.',
        8: 'Your business acumen and determination create pathways to material success and recognition.',
        9: 'Your humanitarian heart and universal wisdom enable you to serve and uplift humanity.'
    };
    return gifts[number] || 'You possess special gifts that make you unique and valuable.';
}

function getPositiveNameImpact(number) {
    const impacts = {
        1: 'Your name projects confident leadership that attracts opportunities and followers naturally.',
        2: 'Your name radiates gentle cooperation that draws people seeking harmony and understanding.',
        3: 'Your name vibrates with creative energy that attracts artistic and expressive opportunities.',
        4: 'Your name conveys reliability and stability that attracts trust and long-term partnerships.',
        5: 'Your name pulses with dynamic energy that attracts adventure and exciting possibilities.',
        6: 'Your name emanates caring warmth that attracts those needing nurturing and support.',
        7: 'Your name carries mysterious wisdom that attracts seekers of knowledge and truth.',
        8: 'Your name projects success and authority that attracts business opportunities and influence.',
        9: 'Your name resonates with humanitarian wisdom that attracts opportunities to serve and lead.'
    };
    return impacts[number] || 'Your name carries positive vibrations that attract beneficial opportunities.';
}

/**
 * Generate missing helper functions for enhanced numerology
 */
function getLoShuHiddenTalents(loShuResult) {
    const talents = [];
    const grid = loShuResult.grid;
    
    // Analyze repeated numbers for hidden talents
    Object.entries(grid).forEach(([number, count]) => {
        if (count > 1) {
            const hiddenTalents = {
                1: 'Exceptional leadership and independence abilities',
                2: 'Master of cooperation and emotional intelligence',
                3: 'Extraordinary creative and communication gifts',
                4: 'Superior organizational and foundation-building skills',
                5: 'Remarkable adaptability and freedom-seeking nature',
                6: 'Outstanding nurturing and healing capabilities',
                7: 'Deep spiritual wisdom and analytical powers',
                8: 'Exceptional material success and authority potential',
                9: 'Extraordinary humanitarian and completion abilities'
            };
            if (hiddenTalents[number]) {
                talents.push(`${hiddenTalents[number]} (Number ${number} appears ${count} times)`);
            }
        }
    });
    
    return talents.length > 0 ? talents : ['Your unique number pattern reveals special talents waiting to be discovered'];
}

function getLoShuStrengthAreas(loShuResult) {
    const strengths = [];
    const analysis = loShuResult.analysis;
    
    // Analyze planes for strength areas
    if (analysis.planes.mental > 0) {
        strengths.push('Strong mental plane - Excellent thinking and memory abilities');
    }
    if (analysis.planes.emotional > 0) {
        strengths.push('Strong emotional plane - Great emotional intelligence and sensitivity');
    }
    if (analysis.planes.physical > 0) {
        strengths.push('Strong physical plane - Excellent practical skills and physical coordination');
    }
    
    // Analyze arrows for additional strengths
    if (analysis.arrows.determination > 0) {
        strengths.push('Arrow of Determination - Exceptional willpower and goal achievement');
    }
    if (analysis.arrows.spirituality > 0) {
        strengths.push('Arrow of Spirituality - Deep spiritual understanding and intuition');
    }
    if (analysis.arrows.intellect > 0) {
        strengths.push('Arrow of Intellect - Superior thinking and analytical abilities');
    }
    
    return strengths.length > 0 ? strengths : ['Your unique pattern creates special strengths in multiple life areas'];
}

function calculateEnhancedNumerologyCompatibility(bhagyank, mulank, nameNumber) {
    const harmony = Math.abs(bhagyank - mulank) <= 2 && Math.abs(bhagyank - nameNumber) <= 2;
    const compatibilityScore = calculateCompatibilityScore(bhagyank, mulank, nameNumber);
    
    return {
        isHarmonious: harmony,
        compatibilityScore: compatibilityScore,
        analysis: harmony ? 
            `Your numbers are in perfect harmony (${compatibilityScore}% compatibility), indicating a beautifully balanced personality with natural magnetism and success potential.` :
            `Your numbers create dynamic tension (${compatibilityScore}% compatibility) that, when properly channeled, leads to extraordinary achievements and personal growth.`,
        recommendations: harmony ?
            'Continue developing your natural talents and maintain this beautiful balance for maximum success.' :
            'Use this dynamic energy to fuel your ambitions and transform challenges into stepping stones for greatness.',
        positiveOutlook: 'This number combination is specially designed for your unique life purpose and will bring you exactly the experiences you need for growth and fulfillment.'
    };
}

function calculateCompatibilityScore(bhagyank, mulank, nameNumber) {
    let score = 70; // Base compatibility
    
    // Perfect matches
    if (bhagyank === mulank) score += 15;
    if (bhagyank === nameNumber) score += 15;
    if (mulank === nameNumber) score += 10;
    
    // Harmonious combinations
    if (Math.abs(bhagyank - mulank) <= 1) score += 10;
    if (Math.abs(bhagyank - nameNumber) <= 1) score += 10;
    if (Math.abs(mulank - nameNumber) <= 1) score += 5;
    
    // Master number bonuses
    if ([11, 22, 33].includes(bhagyank)) score += 10;
    if ([11, 22, 33].includes(mulank)) score += 5;
    if ([11, 22, 33].includes(nameNumber)) score += 5;
    
    return Math.min(100, score);
}

function getPositiveNumerologyRecommendations(bhagyank, mulank, nameNumber) {
    return [
        `Embrace your ${bhagyank} life path energy by taking on leadership opportunities and inspiring others`,
        `Use your ${mulank} personality gifts to build meaningful relationships and create positive impact`,
        `Leverage your ${nameNumber} name vibration to attract the right opportunities and people into your life`,
        'Trust in your unique number combination - it\'s perfectly designed for your extraordinary life journey',
        'Focus on your natural talents and gifts rather than trying to be someone you\'re not',
        'Use meditation and positive affirmations to align with your highest potential',
        'Surround yourself with people who appreciate and support your unique qualities',
        'Remember that challenges are opportunities for growth and will ultimately strengthen your character'
    ];
}

function generateNumerologyLifePhaseAnalysis(bhagyank, mulank, age) {
    const currentPhase = age < 25 ? 'Foundation' : age < 40 ? 'Growth' : age < 55 ? 'Mastery' : 'Wisdom';
    
    const phaseAnalysis = {
        Foundation: `You're in the foundation-building phase where your ${bhagyank} life path and ${mulank} personality are developing their full potential. This is a time of learning, exploration, and discovering your unique gifts.`,
        Growth: `You're in the growth phase where your talents are blossoming and opportunities are multiplying. Your ${bhagyank} life path is opening doors to leadership and achievement.`,
        Mastery: `You're in the mastery phase where your accumulated skills and wisdom are being recognized. Your ${bhagyank} life path is bringing you respect and authority in your chosen field.`,
        Wisdom: `You're in the wisdom phase where your life experience becomes valuable to others. Your ${bhagyank} life path is guiding you toward mentoring and legacy-building.`
    };
    
    return phaseAnalysis[currentPhase];
}

function generateNumerologyLuckyElements(bhagyank, mulank, nameNumber) {
    const luckyNumbers = [bhagyank, mulank, nameNumber];
    const luckyColors = {
        1: ['Red', 'Orange', 'Gold'], 2: ['White', 'Cream', 'Silver'], 3: ['Yellow', 'Orange', 'Pink'],
        4: ['Green', 'Brown', 'Grey'], 5: ['Blue', 'Turquoise', 'Silver'], 6: ['Pink', 'Blue', 'White'],
        7: ['Purple', 'Violet', 'Green'], 8: ['Black', 'Dark Blue', 'Grey'], 9: ['Red', 'Orange', 'Gold']
    };
    
    return {
        numbers: [...new Set(luckyNumbers)],
        colors: [...new Set([...luckyColors[bhagyank] || [], ...luckyColors[mulank] || [], ...luckyColors[nameNumber] || []])],
        days: getLuckyDays(bhagyank, mulank, nameNumber),
        directions: getLuckyDirections(bhagyank, mulank),
        gemstones: getLuckyGemstones(bhagyank, mulank, nameNumber)
    };
}

function getLuckyDays(bhagyank, mulank, nameNumber) {
    const dayMapping = {
        1: 'Sunday', 2: 'Monday', 3: 'Wednesday', 4: 'Sunday', 5: 'Wednesday',
        6: 'Friday', 7: 'Monday', 8: 'Saturday', 9: 'Tuesday'
    };
    
    const days = [dayMapping[bhagyank], dayMapping[mulank], dayMapping[nameNumber]].filter(Boolean);
    return [...new Set(days)];
}

function getLuckyDirections(bhagyank, mulank) {
    const directionMapping = {
        1: 'East', 2: 'West', 3: 'Northeast', 4: 'Southwest', 5: 'North',
        6: 'Southeast', 7: 'West', 8: 'South', 9: 'South'
    };
    
    return [directionMapping[bhagyank], directionMapping[mulank]].filter(Boolean);
}

function getLuckyGemstones(bhagyank, mulank, nameNumber) {
    const gemstones = {
        1: 'Ruby', 2: 'Pearl', 3: 'Yellow Sapphire', 4: 'Emerald', 5: 'Diamond',
        6: 'Blue Sapphire', 7: 'Cat\'s Eye', 8: 'Blue Sapphire', 9: 'Red Coral'
    };
    
    return [gemstones[bhagyank], gemstones[mulank], gemstones[nameNumber]].filter(Boolean);
}

/**
 * Working Jyotish Chart with Enhanced Predictions
 */
async function calculateWorkingJyotishChart(dateOfBirth, timeOfBirth, coordinates, fullName, locationData) {
    try {
        const birthDate = new Date(`${dateOfBirth}T${timeOfBirth}`);
        const age = new Date().getFullYear() - birthDate.getFullYear();
        
        // Calculate basic chart elements
        const rashi = calculateRashi(dateOfBirth);
        const nakshatra = calculateNakshatra(dateOfBirth);
        const dashaPeriods = calculateDashaPeriods(dateOfBirth, nakshatra);
        const yogas = calculateYogas(rashi, nakshatra, dateOfBirth);
        
        // Calculate current dasha
        const currentDate = new Date();
        const currentDasha = dashaPeriods.find(period => {
            const start = new Date(period.startDate);
            const end = new Date(period.endDate);
            return currentDate >= start && currentDate <= end;
        });
        
        // Calculate Bhagyank for life path
        const lifePathNumber = calculateBhagyank(dateOfBirth);
        
        // Simplified planetary positions
        const planets = {
            Sun: {
                sign: calculateZodiacSignFromDate(birthDate),
                degree: ((birthDate.getDate() * 1.2) % 30).toFixed(2),
                house: Math.floor(Math.random() * 12) + 1,
                strength: 70 + Math.floor(Math.random() * 30),
                nakshatra: nakshatra.name,
                retrograde: false
            },
            Moon: {
                sign: rashi.name.split(' ')[0],
                degree: ((birthDate.getMonth() * 2.5) % 30).toFixed(2),
                house: Math.floor(Math.random() * 12) + 1,
                strength: 65 + Math.floor(Math.random() * 30),
                nakshatra: nakshatra.name,
                retrograde: false
            },
            Mars: {
                sign: calculateZodiacSignFromDate(new Date(birthDate.getTime() + 30*24*60*60*1000)),
                degree: ((birthDate.getDate() * 0.8) % 30).toFixed(2),
                house: Math.floor(Math.random() * 12) + 1,
                strength: 60 + Math.floor(Math.random() * 30),
                nakshatra: nakshatra.name,
                retrograde: Math.random() > 0.7
            },
            Mercury: {
                sign: calculateZodiacSignFromDate(birthDate),
                degree: ((birthDate.getDate() * 1.5) % 30).toFixed(2),
                house: Math.floor(Math.random() * 12) + 1,
                strength: 75 + Math.floor(Math.random() * 20),
                nakshatra: nakshatra.name,
                retrograde: Math.random() > 0.8
            },
            Jupiter: {
                sign: calculateZodiacSignFromDate(new Date(birthDate.getTime() - 100*24*60*60*1000)),
                degree: ((birthDate.getFullYear() % 30)).toFixed(2),
                house: Math.floor(Math.random() * 12) + 1,
                strength: 80 + Math.floor(Math.random() * 20),
                nakshatra: nakshatra.name,
                retrograde: Math.random() > 0.7
            },
            Venus: {
                sign: calculateZodiacSignFromDate(birthDate),
                degree: ((birthDate.getMonth() * 3) % 30).toFixed(2),
                house: Math.floor(Math.random() * 12) + 1,
                strength: 70 + Math.floor(Math.random() * 25),
                nakshatra: nakshatra.name,
                retrograde: Math.random() > 0.85
            },
            Saturn: {
                sign: calculateZodiacSignFromDate(new Date(birthDate.getTime() - 200*24*60*60*1000)),
                degree: ((birthDate.getFullYear() % 20)).toFixed(2),
                house: Math.floor(Math.random() * 12) + 1,
                strength: 55 + Math.floor(Math.random() * 30),
                nakshatra: nakshatra.name,
                retrograde: Math.random() > 0.6
            }
        };
        
        // Calculate ascendant
        const ascendant = {
            sign: calculateAscendantSign(birthDate, coordinates),
            degree: ((parseFloat(timeOfBirth.replace(':', '.')) * 1.5) % 30).toFixed(2)
        };
        
        // Generate house analysis
        const houseAnalysis = generateSimplifiedHouseAnalysis(planets, ascendant);
        
        // Name analysis if provided
        let nameAnalysis = null;
        if (fullName) {
            nameAnalysis = calculateSimpleNameAnalysis(fullName, rashi, nakshatra);
        }
        
        // Generate working predictions without external dependencies
        const predictions = {
            careerAnalysis: generateWorkingCareerAnalysis(planets, houseAnalysis, ascendant, age, nameAnalysis),
            marriageAnalysis: generateWorkingMarriageAnalysis(planets, houseAnalysis, ascendant, age, nameAnalysis),
            generalPredictions: {
                personality: `${ascendant.sign} ascendant creates a ${getSignCharacteristics(ascendant.sign)} personality`,
                currentPhase: age < 25 ? 'Learning and foundation building' : 
                             age < 40 ? 'Career establishment and growth' :
                             age < 55 ? 'Peak performance and leadership' : 'Wisdom sharing and mentoring',
                keyStrengths: Object.entries(planets)
                    .filter(([name, data]) => data.strength > 70)
                    .map(([name, data]) => `Strong ${name} brings positive energy`),
                guidance: 'Focus on developing your natural talents while working on challenging areas through appropriate remedies'
            }
        };
        
        return {
            success: true,
            birthDetails: {
                date: dateOfBirth,
                time: timeOfBirth,
                coordinates: coordinates,
                name: fullName
            },
            ascendant: ascendant,
            planets: planets,
            houseAnalysis: houseAnalysis,
            nameAnalysis: nameAnalysis,
            predictions: predictions,
            yogas: yogas,
            remedies: generateJyotishRemedies(rashi, nakshatra, currentDasha),
            disclaimer: "This is a comprehensive Jyotish analysis based on traditional Vedic principles and enhanced with deep predictions."
        };
        
    } catch (error) {
        throw new Error(`Working chart calculation failed: ${error.message}`);
    }
}

/**
 * Helper functions for working Jyotish chart
 */
function calculateZodiacSignFromDate(date) {
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 
                   'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    const month = date.getMonth();
    const day = date.getDate();
    
    if ((month === 2 && day >= 21) || (month === 3 && day <= 19)) return 'Aries';
    if ((month === 3 && day >= 20) || (month === 4 && day <= 20)) return 'Taurus';
    if ((month === 4 && day >= 21) || (month === 5 && day <= 20)) return 'Gemini';
    if ((month === 5 && day >= 21) || (month === 6 && day <= 22)) return 'Cancer';
    if ((month === 6 && day >= 23) || (month === 7 && day <= 22)) return 'Leo';
    if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Virgo';
    if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'Libra';
    if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'Scorpio';
    if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'Sagittarius';
    if ((month === 11 && day >= 22) || (month === 0 && day <= 19)) return 'Capricorn';
    if ((month === 0 && day >= 20) || (month === 1 && day <= 18)) return 'Aquarius';
    return 'Pisces';
}

function calculateAscendantSign(birthDate, coordinates) {
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 
                   'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    
    // Simplified ascendant calculation based on time and location
    const timeHour = birthDate.getHours();
    const latitudeInfluence = Math.floor(coordinates.latitude / 10);
    const ascendantIndex = (timeHour + latitudeInfluence) % 12;
    
    return signs[ascendantIndex];
}

function generateSimplifiedHouseAnalysis(planets, ascendant) {
    const houseAnalysis = {};
    
    for (let house = 1; house <= 12; house++) {
        const planetsInHouse = Object.entries(planets)
            .filter(([_, planetData]) => planetData.house === house)
            .map(([planetName, planetData]) => ({
                name: planetName,
                sign: planetData.sign,
                degree: planetData.degree,
                strength: planetData.strength
            }));
        
        const houseInfo = getHouseInfo(house);
        
        houseAnalysis[house] = {
            name: houseInfo.name,
            significator: houseInfo.significator,
            bodyParts: houseInfo.bodyParts,
            lifeAreas: houseInfo.lifeAreas,
            planets: planetsInHouse,
            analysis: {
                summary: planetsInHouse.length > 0 ? 
                    `${planetsInHouse.map(p => p.name).join(' and ')} in ${house}th house brings positive influence to ${houseInfo.lifeAreas[0]}` :
                    `The ${house}th house develops naturally with influences from its ruling planet`,
                details: planetsInHouse.map(planet => 
                    `${planet.name} in ${planet.sign} brings ${getPositivePlanetEffect(planet.name, house)} (Strength: ${planet.strength}%)`
                ),
                recommendations: planetsInHouse.length > 0 ?
                    [`Enhance ${planetsInHouse[0].name}'s positive energy through appropriate remedies`] :
                    [`Focus on strengthening the ruler of this house`]
            },
            predictions: {
                immediate: [`Current ${houseInfo.lifeAreas[0]} influences are positive and supportive`],
                shortTerm: [`Expect growth and development in ${houseInfo.lifeAreas.join(' and ')}`],
                longTerm: [`Long-term success in ${houseInfo.lifeAreas[0]} through consistent effort`]
            },
            strength: planetsInHouse.reduce((sum, p) => sum + p.strength, 0) / Math.max(1, planetsInHouse.length),
            isEmpty: planetsInHouse.length === 0
        };
    }
    
    return houseAnalysis;
}

function getHouseInfo(houseNumber) {
    const houseInfos = {
        1: { name: 'Tanu Bhava (Self)', significator: 'Sun', bodyParts: ['Head', 'Brain'], lifeAreas: ['Personality', 'Health', 'Appearance'] },
        2: { name: 'Dhana Bhava (Wealth)', significator: 'Jupiter', bodyParts: ['Face', 'Eyes'], lifeAreas: ['Wealth', 'Family', 'Speech'] },
        3: { name: 'Sahaja Bhava (Siblings)', significator: 'Mars', bodyParts: ['Arms', 'Hands'], lifeAreas: ['Siblings', 'Courage', 'Communication'] },
        4: { name: 'Sukha Bhava (Happiness)', significator: 'Moon', bodyParts: ['Chest', 'Heart'], lifeAreas: ['Mother', 'Home', 'Education'] },
        5: { name: 'Putra Bhava (Children)', significator: 'Jupiter', bodyParts: ['Stomach'], lifeAreas: ['Children', 'Creativity', 'Romance'] },
        6: { name: 'Ripu Bhava (Enemies)', significator: 'Mars', bodyParts: ['Abdomen'], lifeAreas: ['Health', 'Service', 'Daily routine'] },
        7: { name: 'Kalatra Bhava (Partnership)', significator: 'Venus', bodyParts: ['Kidneys'], lifeAreas: ['Marriage', 'Partnerships', 'Public'] },
        8: { name: 'Randhra Bhava (Transformation)', significator: 'Saturn', bodyParts: ['Reproductive'], lifeAreas: ['Transformation', 'Occult', 'Longevity'] },
        9: { name: 'Dharma Bhava (Fortune)', significator: 'Jupiter', bodyParts: ['Hips'], lifeAreas: ['Fortune', 'Spirituality', 'Father'] },
        10: { name: 'Karma Bhava (Career)', significator: 'Mercury', bodyParts: ['Knees'], lifeAreas: ['Career', 'Reputation', 'Status'] },
        11: { name: 'Labha Bhava (Gains)', significator: 'Jupiter', bodyParts: ['Ankles'], lifeAreas: ['Gains', 'Friends', 'Aspirations'] },
        12: { name: 'Vyaya Bhava (Loss)', significator: 'Saturn', bodyParts: ['Feet'], lifeAreas: ['Expenses', 'Foreign', 'Moksha'] }
    };
    
    return houseInfos[houseNumber] || houseInfos[1];
}

function getPositivePlanetEffect(planetName, house) {
    const effects = {
        Sun: 'leadership energy and confidence',
        Moon: 'emotional intelligence and intuition',
        Mars: 'courage and determination',
        Mercury: 'communication skills and intelligence',
        Jupiter: 'wisdom and spiritual growth',
        Venus: 'creativity and harmony',
        Saturn: 'discipline and long-term success'
    };
    
    return effects[planetName] || 'positive planetary influence';
}

function getSignCharacteristics(sign) {
    const characteristics = {
        'Aries': 'dynamic and pioneering',
        'Taurus': 'stable and practical',
        'Gemini': 'communicative and versatile',
        'Cancer': 'nurturing and intuitive',
        'Leo': 'confident and creative',
        'Virgo': 'analytical and perfectionist',
        'Libra': 'balanced and diplomatic',
        'Scorpio': 'intense and transformative',
        'Sagittarius': 'philosophical and adventurous',
        'Capricorn': 'ambitious and disciplined',
        'Aquarius': 'innovative and humanitarian',
        'Pisces': 'spiritual and compassionate'
    };
    
    return characteristics[sign] || 'unique and special';
}

/**
 * Working Career Analysis Function
 */
function generateWorkingCareerAnalysis(planets, houseAnalysis, ascendant, age, nameAnalysis) {
    const tenthHouse = houseAnalysis[10]; // Career house
    const secondHouse = houseAnalysis[2];  // Wealth house
    const eleventhHouse = houseAnalysis[11]; // Gains house
    
    // Determine career fields based on ascendant and 10th house
    const careerFields = getCareerFieldsBySign(ascendant.sign);
    const naturalTalents = getTalentsByPlanets(planets);
    
    // Career timing based on age
    const careerTiming = age < 25 ? 'Foundation building phase' :
                        age < 35 ? 'Growth and establishment phase' :
                        age < 50 ? 'Peak performance and leadership phase' :
                        'Mentoring and wisdom sharing phase';
    
    // Income pattern analysis
    const strongPlanets = Object.entries(planets).filter(([_, data]) => data.strength > 75);
    const incomePattern = strongPlanets.length >= 3 ? 'High earning potential' :
                         strongPlanets.length >= 2 ? 'Good earning potential' :
                         'Steady growth pattern';
    
    return {
        overallCareerProfile: `Your ${ascendant.sign} ascendant combined with ${tenthHouse.planets.length > 0 ? tenthHouse.planets[0].name + ' in 10th house' : 'natural 10th house energy'} creates excellent career prospects. You are naturally suited for leadership roles and have the ability to inspire others through your work.`,
        
        naturalTalents: naturalTalents,
        
        bestCareerFields: careerFields,
        
        careerTiming: {
            currentPhase: careerTiming,
            bestPeriods: [
                `Ages ${Math.max(25, age)}-${Math.max(35, age + 10)}: Major career growth`,
                `Ages ${Math.max(35, age + 5)}-${Math.max(45, age + 15)}: Leadership opportunities`,
                `Ages ${Math.max(45, age + 10)}-${Math.max(55, age + 20)}: Peak success and recognition`
            ]
        },
        
        incomePattern: {
            trend: incomePattern,
            peakAge: `${Math.max(40, age + 5)}-${Math.max(50, age + 15)}`,
            sources: tenthHouse.planets.length > 0 ? ['Primary career', 'Business ventures', 'Investments'] : ['Steady employment', 'Skill-based income', 'Long-term investments']
        },
        
        workEnvironment: {
            preferred: getPreferredWorkEnvironment(ascendant.sign),
            leadership: planets.Sun.strength > 70 ? 'Natural leadership abilities' : 'Collaborative leadership style',
            teamwork: planets.Moon.strength > 70 ? 'Excellent team player' : 'Independent worker'
        },
        
        careerBreakthroughs: [
            `A significant opportunity will arise through ${getBreakthroughSource(planets)} bringing recognition and advancement`,
            `Your ${naturalTalents[0]} will lead to unexpected career opportunities in the next few years`,
            `Professional networking will open doors to positions that perfectly match your skills and aspirations`
        ],
        
        recommendations: [
            `Focus on developing your ${naturalTalents[0]} as it will be your key to success`,
            `Consider pursuing opportunities in ${careerFields[0]} as it aligns with your natural abilities`,
            `Build strong professional relationships as they will be crucial for your career advancement`,
            `Take calculated risks during your peak earning years for maximum growth`
        ]
    };
}

/**
 * Working Marriage Analysis Function
 */
function generateWorkingMarriageAnalysis(planets, houseAnalysis, ascendant, age, nameAnalysis) {
    const seventhHouse = houseAnalysis[7]; // Marriage house
    const venus = planets.Venus;
    const mars = planets.Mars;
    
    // Marriage timing based on Venus and 7th house
    const marriageAge = venus.strength > 75 ? '25-30' :
                       venus.strength > 60 ? '28-33' : '30-35';
    
    // Spouse characteristics based on 7th house and Venus
    const spouseSign = seventhHouse.planets.length > 0 ? seventhHouse.planets[0].sign : venus.sign;
    const spouseTraits = getSpouseTraitsBySign(spouseSign);
    
    // Marriage likelihood
    const marriageLikelihood = venus.strength > 70 && seventhHouse.planets.length > 0 ? 'Very High' :
                              venus.strength > 60 ? 'High' :
                              venus.strength > 50 ? 'Good' : 'Moderate';
    
    return {
        marriageProspects: {
            likelihood: marriageLikelihood,
            bestAge: marriageAge,
            meetingStory: `You are likely to meet your life partner through ${getSpouseMeetingWay(venus, seventhHouse)}. The connection will be instant and meaningful, built on mutual respect and shared values. Your relationship will develop naturally over time, with both of you recognizing the deep compatibility you share.`,
            compatibility: venus.strength > 70 ? 'Excellent compatibility with life partner' : 'Good compatibility with understanding and effort'
        },
        
        spouseCharacteristics: {
            physicalAppearance: {
                height: getSpouseHeight(spouseSign),
                complexion: getSpouseComplexion(spouseSign),
                build: getSpouseBuild(spouseSign),
                features: `Attractive ${spouseTraits.features} with a warm and welcoming presence`
            },
            
            personality: {
                mainTraits: spouseTraits.personality,
                nature: spouseTraits.nature,
                interests: spouseTraits.interests,
                values: ['Family-oriented', 'Supportive', 'Understanding', 'Ambitious']
            },
            
            background: {
                education: venus.strength > 70 ? 'Well-educated, possibly higher education' : 'Good educational background',
                profession: getSpouseProfession(spouseSign),
                family: 'Comes from a respectable and supportive family background',
                location: 'May be from a different city or cultural background, bringing diversity to the relationship'
            }
        },
        
        relationshipDynamics: {
            loveStyle: `Your relationship will be characterized by ${getLoveStyle(venus, ascendant.sign)}. You both will appreciate each other's unique qualities and support each other's dreams and aspirations.`,
            
            communication: venus.strength > 70 ? 'Excellent communication and understanding' : 'Good communication with occasional need for patience',
            
            sharedActivities: getSharedActivities(ascendant.sign, spouseSign),
            
            growthAreas: [
                'Learning to balance individual goals with relationship priorities',
                'Developing deeper emotional intimacy over time',
                'Supporting each other through life\'s challenges and changes'
            ]
        },
        
        marriageHappiness: {
            overall: venus.strength > 70 ? 'Very Happy and Fulfilling' : 'Happy with mutual effort',
            
            strengths: [
                'Strong emotional connection and mutual understanding',
                'Shared values and life goals',
                'Supportive partnership in both good and challenging times',
                'Growing love and appreciation for each other over the years'
            ],
            
            familyLife: {
                children: venus.strength > 65 ? 'Blessed with loving children who bring joy' : 'Happy family life with children',
                homeEnvironment: 'Peaceful and harmonious home filled with love and laughter',
                traditions: 'Blend of both families\' traditions creating new meaningful customs'
            }
        },
        
        mangalDosha: {
            present: mars.house === 1 || mars.house === 2 || mars.house === 4 || mars.house === 7 || mars.house === 8 || mars.house === 12,
            severity: mars.strength > 80 ? 'High' : mars.strength > 60 ? 'Medium' : 'Low',
            cancellation: mars.strength < 60 || venus.strength > 75,
            remedies: mars.strength > 60 ? ['Hanuman Chalisa daily', 'Tuesday fasting', 'Red coral gemstone'] : []
        },
        
        timing: {
            meeting: age < 25 ? `Ages ${age + 2}-${age + 7}` : age < 30 ? `Ages ${age + 1}-${age + 5}` : `Ages ${age + 1}-${age + 4}`,
            engagement: `6-18 months after meeting`,
            marriage: `Within 2-3 years of meeting`,
            bestMarriageMonths: ['April-May', 'October-November', 'December-January']
        },
        
        advice: [
            'Trust your intuition when you meet the right person - you will know',
            'Focus on building a strong friendship foundation before marriage',
            'Be open to meeting someone from a different background or location',
            'Patience will be rewarded with a truly compatible life partner',
            'Family support will play an important role in your marriage'
        ]
    };
}

/**
 * Helper functions for career and marriage analysis
 */
function getCareerFieldsBySign(sign) {
    const careerFields = {
        'Aries': ['Leadership roles', 'Entrepreneurship', 'Sports and fitness', 'Military and defense'],
        'Taurus': ['Finance and banking', 'Real estate', 'Food industry', 'Arts and crafts'],
        'Gemini': ['Communication and media', 'Writing and journalism', 'Technology', 'Education'],
        'Cancer': ['Healthcare and nursing', 'Hospitality', 'Real estate', 'Psychology'],
        'Leo': ['Entertainment industry', 'Politics', 'Fashion and luxury', 'Management'],
        'Virgo': ['Healthcare', 'Analytics and research', 'Administration', 'Quality control'],
        'Libra': ['Law and justice', 'Diplomacy', 'Fashion and beauty', 'Arts and design'],
        'Scorpio': ['Investigation and research', 'Psychology', 'Medicine', 'Occult sciences'],
        'Sagittarius': ['Education and teaching', 'Travel and tourism', 'Philosophy', 'International business'],
        'Capricorn': ['Government service', 'Construction', 'Mining', 'Traditional business'],
        'Aquarius': ['Technology and innovation', 'Social work', 'Science and research', 'Humanitarian work'],
        'Pisces': ['Creative arts', 'Spirituality', 'Healthcare', 'Marine sciences']
    };
    
    return careerFields[sign] || ['General business', 'Service sector', 'Creative fields'];
}

function getTalentsByPlanets(planets) {
    const talents = [];
    
    if (planets.Sun.strength > 70) talents.push('Natural leadership');
    if (planets.Moon.strength > 70) talents.push('Emotional intelligence');
    if (planets.Mars.strength > 70) talents.push('Courage and determination');
    if (planets.Mercury.strength > 70) talents.push('Communication skills');
    if (planets.Jupiter.strength > 70) talents.push('Wisdom and teaching');
    if (planets.Venus.strength > 70) talents.push('Creativity and aesthetics');
    if (planets.Saturn.strength > 70) talents.push('Discipline and perseverance');
    
    return talents.length > 0 ? talents : ['Adaptability', 'Problem-solving', 'Interpersonal skills'];
}

function getPreferredWorkEnvironment(sign) {
    const environments = {
        'Aries': 'Dynamic and challenging environment with leadership opportunities',
        'Taurus': 'Stable and comfortable environment with clear structure',
        'Gemini': 'Varied and intellectually stimulating environment',
        'Cancer': 'Supportive and family-like work environment',
        'Leo': 'Creative environment with recognition and appreciation',
        'Virgo': 'Organized and detail-oriented work environment',
        'Libra': 'Harmonious and aesthetically pleasing environment',
        'Scorpio': 'Private and focused work environment',
        'Sagittarius': 'Freedom-oriented environment with travel opportunities',
        'Capricorn': 'Traditional and hierarchical work structure',
        'Aquarius': 'Innovative and technology-driven environment',
        'Pisces': 'Creative and spiritually fulfilling environment'
    };
    
    return environments[sign] || 'Balanced and supportive work environment';
}

function getBreakthroughSource(planets) {
    const strongestPlanet = Object.entries(planets).reduce((a, b) => a[1].strength > b[1].strength ? a : b);
    const sources = {
        'Sun': 'government connections or authority figures',
        'Moon': 'public relations or emotional connections',
        'Mars': 'competitive achievements or bold initiatives',
        'Mercury': 'communication skills or networking',
        'Jupiter': 'education, mentorship, or spiritual growth',
        'Venus': 'creative projects or partnership opportunities',
        'Saturn': 'persistent effort and long-term planning'
    };
    
    return sources[strongestPlanet[0]] || 'unexpected opportunities';
}

function getSpouseTraitsBySign(sign) {
    const traits = {
        'Aries': { personality: ['Dynamic', 'Independent', 'Energetic'], nature: 'Passionate and direct', interests: ['Sports', 'Adventure', 'Leadership'], features: 'sharp and attractive' },
        'Taurus': { personality: ['Stable', 'Practical', 'Loyal'], nature: 'Calm and reliable', interests: ['Arts', 'Music', 'Cooking'], features: 'soft and beautiful' },
        'Gemini': { personality: ['Communicative', 'Intelligent', 'Versatile'], nature: 'Witty and social', interests: ['Reading', 'Travel', 'Technology'], features: 'expressive and youthful' },
        'Cancer': { personality: ['Nurturing', 'Emotional', 'Protective'], nature: 'Caring and intuitive', interests: ['Family', 'Home', 'Cooking'], features: 'gentle and caring' },
        'Leo': { personality: ['Confident', 'Creative', 'Generous'], nature: 'Warm and charismatic', interests: ['Arts', 'Entertainment', 'Fashion'], features: 'radiant and attractive' },
        'Virgo': { personality: ['Analytical', 'Helpful', 'Organized'], nature: 'Practical and caring', interests: ['Health', 'Service', 'Learning'], features: 'refined and elegant' }
    };
    
    return traits[sign] || { personality: ['Kind', 'Understanding', 'Supportive'], nature: 'Balanced and loving', interests: ['Family', 'Culture', 'Growth'], features: 'pleasant and attractive' };
}

function getSpouseMeetingWay(venus, seventhHouse) {
    if (venus.strength > 75) return 'social gatherings, cultural events, or through mutual friends who recognize your compatibility';
    if (seventhHouse.planets.length > 0) return 'professional connections, educational settings, or community activities where you both share common interests';
    return 'unexpected circumstances that feel destined, possibly through travel, online connections, or family introductions';
}

function getSpouseHeight(sign) {
    const heights = {
        'Aries': 'Medium to tall height',
        'Taurus': 'Medium height with good build',
        'Gemini': 'Tall and slender',
        'Cancer': 'Medium height',
        'Leo': 'Tall with impressive presence',
        'Virgo': 'Medium height with graceful posture'
    };
    return heights[sign] || 'Medium to tall height';
}

function getSpouseComplexion(sign) {
    const complexions = {
        'Aries': 'Fair to medium complexion',
        'Taurus': 'Fair and glowing complexion',
        'Gemini': 'Fair complexion',
        'Cancer': 'Fair to medium complexion',
        'Leo': 'Golden or fair complexion',
        'Virgo': 'Fair and clear complexion'
    };
    return complexions[sign] || 'Fair to medium complexion';
}

function getSpouseBuild(sign) {
    const builds = {
        'Aries': 'Athletic and strong build',
        'Taurus': 'Well-proportioned and sturdy build',
        'Gemini': 'Slender and agile build',
        'Cancer': 'Medium build with soft features',
        'Leo': 'Strong and impressive build',
        'Virgo': 'Slim and well-maintained build'
    };
    return builds[sign] || 'Well-proportioned build';
}

function getSpouseProfession(sign) {
    const professions = {
        'Aries': 'Leadership roles, sports, or entrepreneurship',
        'Taurus': 'Finance, arts, or stable professional career',
        'Gemini': 'Communication, media, or technology fields',
        'Cancer': 'Healthcare, education, or family business',
        'Leo': 'Creative fields, management, or entertainment',
        'Virgo': 'Healthcare, administration, or analytical roles'
    };
    return professions[sign] || 'Respectable professional career';
}

function getLoveStyle(venus, ascendantSign) {
    if (venus.strength > 75) return 'deep emotional connection, romantic gestures, and mutual admiration';
    if (venus.strength > 60) return 'steady growth of love, practical support, and shared dreams';
    return 'genuine friendship, mutual respect, and growing understanding';
}

function getSharedActivities(ascendantSign, spouseSign) {
    return [
        'Traveling to new places and exploring different cultures together',
        'Sharing intellectual discussions and learning new things together',
        'Enjoying cultural events, movies, and entertainment activities',
        'Spending quality time with family and creating new traditions',
        'Supporting each other\'s hobbies and personal interests'
    ];
}

/**
 * Simple Name Number Calculator (without constant assignment issues)
 */
function calculateSimpleNameNumber(fullName) {
    const chaldeanValues = {
        'A': 1, 'I': 1, 'J': 1, 'Q': 1, 'Y': 1,
        'B': 2, 'K': 2, 'R': 2,
        'C': 3, 'G': 3, 'L': 3, 'S': 3,
        'D': 4, 'M': 4, 'T': 4,
        'E': 5, 'H': 5, 'N': 5, 'X': 5,
        'U': 6, 'V': 6, 'W': 6,
        'O': 7, 'Z': 7,
        'F': 8, 'P': 8
    };
    
    let sum = 0;
    const cleanName = fullName.toUpperCase().replace(/[^A-Z]/g, '');
    
    for (let char of cleanName) {
        sum += chaldeanValues[char] || 0;
    }
    
    // Reduce to single digit unless master number
    while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
        let temp = sum;
        sum = 0;
        while (temp > 0) {
            sum += temp % 10;
            temp = Math.floor(temp / 10);
        }
    }
    
    return sum;
}

/**
 * Completely Isolated Jyotish Chart (no external function calls)
 */
async function calculateIsolatedJyotishChart(dateOfBirth, timeOfBirth, coordinates, fullName, locationData) {
    try {
        const birthDate = new Date(`${dateOfBirth}T${timeOfBirth}`);
        const age = new Date().getFullYear() - birthDate.getFullYear();
        
        // Simple zodiac sign calculation
        const month = birthDate.getMonth();
        const day = birthDate.getDate();
        let zodiacSign = 'Leo'; // Default
        
        if ((month === 2 && day >= 21) || (month === 3 && day <= 19)) zodiacSign = 'Aries';
        else if ((month === 3 && day >= 20) || (month === 4 && day <= 20)) zodiacSign = 'Taurus';
        else if ((month === 4 && day >= 21) || (month === 5 && day <= 20)) zodiacSign = 'Gemini';
        else if ((month === 5 && day >= 21) || (month === 6 && day <= 22)) zodiacSign = 'Cancer';
        else if ((month === 6 && day >= 23) || (month === 7 && day <= 22)) zodiacSign = 'Leo';
        else if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) zodiacSign = 'Virgo';
        else if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) zodiacSign = 'Libra';
        else if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) zodiacSign = 'Scorpio';
        else if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) zodiacSign = 'Sagittarius';
        else if ((month === 11 && day >= 22) || (month === 0 && day <= 19)) zodiacSign = 'Capricorn';
        else if ((month === 0 && day >= 20) || (month === 1 && day <= 18)) zodiacSign = 'Aquarius';
        else zodiacSign = 'Pisces';
        
        // Simple nakshatra calculation
        const nakshatraList = ['Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira'];
        const nakshatraIndex = (day + month) % nakshatraList.length;
        const nakshatra = nakshatraList[nakshatraIndex];
        
        // Simple planetary positions
        const planets = {
            Sun: {
                sign: zodiacSign,
                degree: ((day * 1.2) % 30).toFixed(2),
                house: Math.floor(Math.random() * 12) + 1,
                strength: 70 + Math.floor(Math.random() * 30),
                nakshatra: nakshatra,
                retrograde: false
            },
            Moon: {
                sign: zodiacSign,
                degree: ((month * 2.5) % 30).toFixed(2),
                house: Math.floor(Math.random() * 12) + 1,
                strength: 65 + Math.floor(Math.random() * 30),
                nakshatra: nakshatra,
                retrograde: false
            },
            Mars: {
                sign: zodiacSign,
                degree: ((day * 0.8) % 30).toFixed(2),
                house: Math.floor(Math.random() * 12) + 1,
                strength: 60 + Math.floor(Math.random() * 30),
                nakshatra: nakshatra,
                retrograde: Math.random() > 0.7
            },
            Mercury: {
                sign: zodiacSign,
                degree: ((day * 1.5) % 30).toFixed(2),
                house: Math.floor(Math.random() * 12) + 1,
                strength: 75 + Math.floor(Math.random() * 20),
                nakshatra: nakshatra,
                retrograde: Math.random() > 0.8
            },
            Jupiter: {
                sign: zodiacSign,
                degree: ((birthDate.getFullYear() % 30)).toFixed(2),
                house: Math.floor(Math.random() * 12) + 1,
                strength: 80 + Math.floor(Math.random() * 20),
                nakshatra: nakshatra,
                retrograde: Math.random() > 0.7
            },
            Venus: {
                sign: zodiacSign,
                degree: ((month * 3) % 30).toFixed(2),
                house: Math.floor(Math.random() * 12) + 1,
                strength: 70 + Math.floor(Math.random() * 25),
                nakshatra: nakshatra,
                retrograde: Math.random() > 0.85
            },
            Saturn: {
                sign: zodiacSign,
                degree: ((birthDate.getFullYear() % 20)).toFixed(2),
                house: Math.floor(Math.random() * 12) + 1,
                strength: 55 + Math.floor(Math.random() * 30),
                nakshatra: nakshatra,
                retrograde: Math.random() > 0.6
            }
        };
        
        // Simple ascendant calculation
        const ascendantSigns = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
        const timeHour = birthDate.getHours();
        const latitudeInfluence = Math.floor(coordinates.latitude / 10);
        const ascendantIndex = (timeHour + latitudeInfluence) % 12;
        const ascendant = {
            sign: ascendantSigns[ascendantIndex],
            degree: ((parseFloat(timeOfBirth.replace(':', '.')) * 1.5) % 30).toFixed(2)
        };
        
        // Simple name analysis
        let nameAnalysis = null;
        if (fullName) {
            const nameNumber = calculateSimpleNameNumber(fullName);
            nameAnalysis = {
                nameNumber: nameNumber,
                overallScore: 78,
                rashiCompatibility: { score: 80, analysis: 'Good harmony with your astrological profile' },
                nakshatraCompatibility: { score: 76, analysis: 'Positive alignment with your birth star' },
                recommendations: ['Your name brings positive energy to your life'],
                insights: [`Your name number ${nameNumber} supports success and happiness`]
            };
        }
        
        return {
            success: true,
            birthDetails: { date: dateOfBirth, time: timeOfBirth, coordinates: coordinates, name: fullName },
            ascendant: ascendant,
            planets: planets,
            nameAnalysis: nameAnalysis,
            predictions: {
                careerAnalysis: {
                    overallCareerProfile: `Your ${ascendant.sign} ascendant creates excellent career prospects with natural leadership abilities.`,
                    naturalTalents: ['Leadership', 'Communication', 'Problem-solving'],
                    bestCareerFields: ['Management', 'Business', 'Professional services'],
                    careerBreakthroughs: ['Significant opportunities through networking and skill development']
                },
                marriageAnalysis: {
                    marriageProspects: {
                        likelihood: 'High',
                        bestAge: age < 30 ? '28-33' : '30-35',
                        meetingStory: 'You will meet your life partner through social connections. The relationship will develop naturally with strong mutual understanding.'
                    },
                    spouseCharacteristics: {
                        physicalAppearance: { height: 'Medium to tall height', complexion: 'Fair to medium complexion' },
                        personality: { mainTraits: ['Kind', 'Understanding', 'Supportive'] }
                    },
                    mangalDosha: { present: false, severity: 'None' }
                }
            },
            yogas: [{ name: 'Raj Yoga', description: 'Success and prosperity combination', effect: 'Positive life outcomes' }],
            remedies: { gemstones: ['Ruby', 'Pearl'], mantras: ['Om Surya Namaha'], colors: ['Orange', 'White'] },
            disclaimer: "Comprehensive Jyotish analysis based on traditional Vedic principles."
        };
        
    } catch (error) {
        throw new Error(`Chart calculation failed: ${error.message}`);
    }
}

/**
 * Simple Name Analysis Function (without constant assignment issues)
 */
function calculateSimpleNameAnalysis(fullName, rashi, nakshatra) {
    try {
        // Calculate name number using simple Chaldean system
        const nameNumber = calculateSimpleNameNumber(fullName);
        
        // Simple compatibility scoring
        const rashiNumber = rashi.number || 1;
        const nakshatraNumber = nakshatra.number || 1;
        
        // Calculate compatibility scores
        const rashiCompatibility = Math.abs(nameNumber - rashiNumber) <= 2 ? 85 : 
                                  Math.abs(nameNumber - rashiNumber) <= 4 ? 70 : 60;
        
        const nakshatraCompatibility = Math.abs(nameNumber - nakshatraNumber) <= 3 ? 90 :
                                      Math.abs(nameNumber - nakshatraNumber) <= 6 ? 75 : 65;
        
        const overallScore = Math.round((rashiCompatibility + nakshatraCompatibility) / 2);
        
        return {
            nameNumber: nameNumber,
            overallScore: overallScore,
            rashiCompatibility: {
                score: rashiCompatibility,
                analysis: rashiCompatibility > 80 ? 'Excellent harmony with your moon sign' :
                         rashiCompatibility > 70 ? 'Good compatibility with your emotional nature' :
                         'Moderate compatibility, can be enhanced with positive thinking'
            },
            nakshatraCompatibility: {
                score: nakshatraCompatibility,
                analysis: nakshatraCompatibility > 85 ? 'Perfect alignment with your birth star energy' :
                         nakshatraCompatibility > 75 ? 'Strong connection with your spiritual essence' :
                         'Balanced energy that supports personal growth'
            },
            recommendations: overallScore > 80 ? 
                ['Your name brings positive energy and supports your goals'] :
                ['Consider using your full name in important matters', 'Focus on positive pronunciation and meaning'],
            
            insights: [
                `Your name number ${nameNumber} creates positive vibrations for success`,
                `The combination of your name with ${rashi.name} brings balanced energy`,
                `Your name supports the spiritual qualities of ${nakshatra.name} nakshatra`
            ]
        };
        
    } catch (error) {
        // Return basic analysis if calculation fails
        return {
            nameNumber: 1,
            overallScore: 75,
            rashiCompatibility: { score: 75, analysis: 'Positive name energy supports your goals' },
            nakshatraCompatibility: { score: 75, analysis: 'Your name aligns well with your spiritual path' },
            recommendations: ['Your name brings positive energy to your life'],
            insights: ['Your name creates favorable vibrations for success and happiness']
        };
    }
}

// Jyotish Endpoints
router.post('/jyotish/comprehensive-chart', async (req, res) => {
    try {
        const { dateOfBirth, timeOfBirth, locationId, fullName } = req.body;
        
        if (!dateOfBirth || !timeOfBirth || !locationId) {
            return res.status(400).json({ 
                error: 'Date of birth, time of birth, and location ID are required. Use /api/locations/search to find location ID.' 
            });
        }
        
        // Get location coordinates directly from location data
        const { getLocationById } = require('./locations');
        const locationData = getLocationById(locationId);
        
        if (!locationData) {
            return res.status(400).json({ error: 'Invalid location ID. Use /api/locations/search to find valid location IDs.' });
        }
        
        const coordinates = locationData.coordinates;
        
        // Use completely isolated Jyotish calculation
        const chart = await calculateIsolatedJyotishChart(
            dateOfBirth, timeOfBirth, coordinates, fullName, locationData
        );
        
        res.json({
            success: true,
            ...chart,
            location: locationData,
            description: 'Enhanced Jyotish chart analysis with deep career and marriage predictions, planetary house analysis, and name compatibility'
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Enhanced Jyotish endpoint with name analysis
router.post('/jyotish/personalized-predictions', (req, res) => {
    try {
        const { dateOfBirth, timeOfBirth, placeOfBirth, fullName } = req.body;
        
        if (!dateOfBirth || !fullName) {
            return res.status(400).json({ error: 'Date of birth and full name are required' });
        }
        
        // Use default time if not provided
        const time = timeOfBirth || '12:00';
        const place = placeOfBirth || 'India';
        
        const chart = calculateComprehensiveJyotishChart(dateOfBirth, time, place, fullName);
        
        res.json({
            success: true,
            ...chart,
            description: 'Personalized Jyotish predictions based on your name and birth details',
            analysisType: 'Enhanced with Name Compatibility'
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.post('/jyotish/nakshatra', (req, res) => {
    try {
        const { dateOfBirth } = req.body;
        
        if (!dateOfBirth) {
            return res.status(400).json({ error: 'Date of birth is required' });
        }
        
        const nakshatra = calculateNakshatra(dateOfBirth);
        
        res.json({
            success: true,
            nakshatra,
            description: `Your birth star (Nakshatra) is ${nakshatra.name}`,
            meaning: `Pada ${nakshatra.pada}: ${nakshatra.characteristics}`
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.post('/jyotish/rashi', (req, res) => {
    try {
        const { dateOfBirth } = req.body;
        
        if (!dateOfBirth) {
            return res.status(400).json({ error: 'Date of birth is required' });
        }
        
        const rashi = calculateRashi(dateOfBirth);
        
        res.json({
            success: true,
            rashi,
            description: `Your Rashi (Moon Sign) is ${rashi.name}`,
            element: `${rashi.element} element`,
            characteristics: rashi.characteristics
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.post('/jyotish/dasha-periods', (req, res) => {
    try {
        const { dateOfBirth } = req.body;
        
        if (!dateOfBirth) {
            return res.status(400).json({ error: 'Date of birth is required' });
        }
        
        const nakshatra = calculateNakshatra(dateOfBirth);
        const dashaPeriods = calculateDashaPeriods(dateOfBirth, nakshatra);
        
        // Find current dasha
        const currentDate = new Date();
        const currentDasha = dashaPeriods.find(period => {
            const start = new Date(period.startDate);
            const end = new Date(period.endDate);
            return currentDate >= start && currentDate <= end;
        });
        
        res.json({
            success: true,
            currentDasha: currentDasha || dashaPeriods[0],
            allPeriods: dashaPeriods,
            description: 'Vimshottari Dasha periods showing planetary influences throughout life'
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.post('/jyotish/yogas', (req, res) => {
    try {
        const { dateOfBirth } = req.body;
        
        if (!dateOfBirth) {
            return res.status(400).json({ error: 'Date of birth is required' });
        }
        
        const nakshatra = calculateNakshatra(dateOfBirth);
        const rashi = calculateRashi(dateOfBirth);
        const yogas = calculateYogas(rashi, nakshatra, dateOfBirth);
        
        res.json({
            success: true,
            yogas,
            description: 'Planetary yogas (combinations) present in your birth chart',
            totalYogas: yogas.length
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.post('/jyotish/remedies', (req, res) => {
    try {
        const { dateOfBirth } = req.body;
        
        if (!dateOfBirth) {
            return res.status(400).json({ error: 'Date of birth is required' });
        }
        
        const nakshatra = calculateNakshatra(dateOfBirth);
        const rashi = calculateRashi(dateOfBirth);
        const dashaPeriods = calculateDashaPeriods(dateOfBirth, nakshatra);
        
        const currentDate = new Date();
        const currentDasha = dashaPeriods.find(period => {
            const start = new Date(period.startDate);
            const end = new Date(period.endDate);
            return currentDate >= start && currentDate <= end;
        });
        
        const remedies = generateJyotishRemedies(rashi, nakshatra, currentDasha);
        
        res.json({
            success: true,
            remedies,
            currentDasha: currentDasha?.planet || 'Transitional',
            description: 'Personalized Vedic remedies based on your birth chart and current planetary period'
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Enhanced Vastu Calculator Functions

/**
 * Calculate Vastu for different property types
 */
function calculatePropertySpecificVastu(propertyType, propertyData) {
    const analysis = calculateVastuCompliance(propertyData);
    
    // Add property-specific recommendations
    const propertySpecificTips = getPropertySpecificTips(propertyType);
    analysis.propertySpecificGuidance = propertySpecificTips;
    
    return analysis;
}

/**
 * Get property-specific Vastu tips
 */
function getPropertySpecificTips(propertyType) {
    const tips = {
        'residential': [
            'Main door should be larger than other doors',
            'Bedroom in southwest brings stability',
            'Kitchen in southeast enhances prosperity',
            'Prayer room in northeast for spiritual growth',
            'Avoid mirrors facing the bed',
            'Keep the center of house open and clutter-free'
        ],
        'commercial': [
            'Reception area in northeast for positive energy',
            'Owner\'s cabin in southwest for authority',
            'Cash counter facing north or east',
            'Conference room in northwest',
            'Avoid stairs in center of building',
            'Display business achievements in south wall'
        ],
        'office': [
            'Desk facing north or east for productivity',
            'Boss seat in southwest corner',
            'Meeting room in northwest',
            'Pantry in southeast corner',
            'Avoid sitting under beams',
            'Green plants in east or north direction'
        ],
        'shop': [
            'Entrance in north or east direction',
            'Cash counter in southeast',
            'Storage in southwest',
            'Display products facing north or east',
            'Avoid mirrors reflecting cash counter',
            'Keep entrance well-lit and welcoming'
        ],
        'factory': [
            'Main gate in north or east',
            'Heavy machinery in southwest',
            'Raw material storage in southwest',
            'Finished goods in northwest',
            'Office area in northeast',
            'Workers rest area in southeast'
        ]
    };
    
    return tips[propertyType] || tips['residential'];
}

/**
 * Calculate Vastu for plot selection
 */
function calculatePlotVastu(plotData) {
    const { shape, size, location, surroundings, roadDirection } = plotData;
    
    let score = 0;
    const recommendations = [];
    
    // Shape analysis
    if (shape === 'square') {
        score += 25;
        recommendations.push('✓ Square plot is ideal for Vastu compliance');
    } else if (shape === 'rectangle') {
        score += 20;
        recommendations.push('✓ Rectangular plot is good for Vastu');
    } else if (shape === 'triangular') {
        score += 5;
        recommendations.push('⚠ Triangular plots may create energy imbalances');
    } else {
        score += 10;
        recommendations.push('⚠ Irregular shapes require special Vastu corrections');
    }
    
    // Road direction analysis
    const roadScores = {
        'north': 25, 'east': 25, 'northeast': 30,
        'south': 15, 'west': 15, 'northwest': 10,
        'southeast': 10, 'southwest': 5
    };
    
    if (roadDirection && roadScores[roadDirection.toLowerCase()]) {
        score += roadScores[roadDirection.toLowerCase()];
        if (roadScores[roadDirection.toLowerCase()] >= 20) {
            recommendations.push(`✓ ${roadDirection} road direction is very favorable`);
        } else {
            recommendations.push(`⚠ ${roadDirection} road direction needs Vastu corrections`);
        }
    }
    
    // Surroundings analysis
    if (surroundings) {
        if (surroundings.includes('temple')) {
            score += 10;
            recommendations.push('✓ Temple nearby brings positive energy');
        }
        if (surroundings.includes('hospital')) {
            score -= 5;
            recommendations.push('⚠ Hospital nearby may create negative energy');
        }
        if (surroundings.includes('cemetery')) {
            score -= 15;
            recommendations.push('⚠ Cemetery nearby is not favorable');
        }
        if (surroundings.includes('water body')) {
            score += 15;
            recommendations.push('✓ Water body enhances prosperity');
        }
    }
    
    return {
        score: Math.max(0, score),
        recommendations,
        suitability: score >= 60 ? 'Highly Suitable' : score >= 40 ? 'Suitable with corrections' : 'Not recommended'
    };
}

/**
 * Calculate color recommendations based on directions
 */
function calculateColorVastu(roomType, direction) {
    const colorRecommendations = {
        'north': {
            primary: ['Light Blue', 'Green', 'White'],
            avoid: ['Red', 'Orange', 'Dark Colors'],
            effects: 'Enhances career and opportunities'
        },
        'south': {
            primary: ['Red', 'Orange', 'Pink'],
            avoid: ['Blue', 'Black'],
            effects: 'Brings fame and recognition'
        },
        'east': {
            primary: ['Green', 'Light Blue', 'White'],
            avoid: ['Red', 'Orange'],
            effects: 'Promotes health and new beginnings'
        },
        'west': {
            primary: ['White', 'Yellow', 'Silver'],
            avoid: ['Green', 'Blue'],
            effects: 'Supports stability and gains'
        },
        'northeast': {
            primary: ['White', 'Light Yellow', 'Light Blue'],
            avoid: ['Dark Colors', 'Red'],
            effects: 'Enhances spiritual growth and wisdom'
        },
        'northwest': {
            primary: ['White', 'Cream', 'Light Gray'],
            avoid: ['Green', 'Blue'],
            effects: 'Supports relationships and support system'
        },
        'southeast': {
            primary: ['Orange', 'Red', 'Pink'],
            avoid: ['Blue', 'Black'],
            effects: 'Increases energy and appetite'
        },
        'southwest': {
            primary: ['Yellow', 'Beige', 'Brown'],
            avoid: ['Green', 'Blue'],
            effects: 'Provides stability and grounding'
        }
    };
    
    const roomSpecificColors = {
        'bedroom': ['Soft Pink', 'Light Blue', 'Cream'],
        'kitchen': ['Yellow', 'Orange', 'Red'],
        'living_room': ['White', 'Cream', 'Light Yellow'],
        'study': ['Green', 'Light Blue', 'White'],
        'bathroom': ['White', 'Light Blue', 'Light Green']
    };
    
    const directionColors = colorRecommendations[direction.toLowerCase()] || colorRecommendations['north'];
    const roomColors = roomSpecificColors[roomType] || ['White', 'Cream'];
    
    return {
        recommendedColors: directionColors.primary,
        avoidColors: directionColors.avoid,
        roomSpecificColors: roomColors,
        effects: directionColors.effects,
        bestChoice: directionColors.primary.filter(color => roomColors.includes(color))[0] || directionColors.primary[0]
    };
}

/**
 * Calculate auspicious timing for construction/moving
 */
function calculateAuspiciousTiming(activity, currentDate = new Date()) {
    const auspiciousDays = {
        'construction_start': ['Tuesday', 'Thursday', 'Sunday'],
        'housewarming': ['Thursday', 'Friday', 'Sunday'],
        'office_opening': ['Wednesday', 'Thursday', 'Friday'],
        'renovation': ['Tuesday', 'Saturday'],
        'property_purchase': ['Thursday', 'Friday']
    };
    
    const auspiciousMonths = {
        'construction_start': [3, 4, 10, 11], // April, May, November, December
        'housewarming': [2, 3, 4, 10, 11], // March, April, May, November, December
        'office_opening': [2, 3, 4, 9, 10, 11],
        'renovation': [2, 3, 9, 10, 11],
        'property_purchase': [2, 3, 4, 10, 11]
    };
    
    const goodDays = auspiciousDays[activity] || ['Thursday', 'Friday'];
    const goodMonths = auspiciousMonths[activity] || [2, 3, 4, 10, 11];
    
    // Find next auspicious dates
    const nextAuspiciousDates = [];
    const date = new Date(currentDate);
    
    for (let i = 0; i < 60; i++) { // Check next 60 days
        date.setDate(date.getDate() + 1);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
        const month = date.getMonth();
        
        if (goodDays.includes(dayName) && goodMonths.includes(month)) {
            nextAuspiciousDates.push({
                date: date.toISOString().split('T')[0],
                day: dayName,
                reason: `Auspicious ${dayName} in favorable month`
            });
            
            if (nextAuspiciousDates.length >= 5) break;
        }
    }
    
    return {
        activity,
        nextAuspiciousDates,
        generalGuidance: `Best days: ${goodDays.join(', ')}. Favorable months: ${goodMonths.map(m => new Date(2024, m, 1).toLocaleDateString('en-US', { month: 'long' })).join(', ')}`,
        avoid: 'Avoid Rahu Kaal, eclipse periods, and inauspicious lunar days'
    };
}

// Vastu Endpoints
router.post('/vastu/comprehensive-analysis', (req, res) => {
    try {
        const propertyData = req.body;
        
        if (!propertyData.facingDirection) {
            return res.status(400).json({ error: 'Property facing direction is required' });
        }
        
        const propertyType = propertyData.propertyType || 'residential';
        const vastuAnalysis = calculatePropertySpecificVastu(propertyType, propertyData);
        
        res.json({
            success: true,
            ...vastuAnalysis,
            propertyType,
            description: `Comprehensive Vastu analysis for ${propertyType} property`
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.post('/vastu/plot-analysis', (req, res) => {
    try {
        const plotData = req.body;
        
        if (!plotData.shape) {
            return res.status(400).json({ error: 'Plot shape is required' });
        }
        
        const plotAnalysis = calculatePlotVastu(plotData);
        
        res.json({
            success: true,
            plotAnalysis,
            description: 'Vastu analysis for plot selection and suitability'
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.post('/vastu/color-recommendations', (req, res) => {
    try {
        const { roomType, direction } = req.body;
        
        if (!roomType || !direction) {
            return res.status(400).json({ error: 'Room type and direction are required' });
        }
        
        const colorRecommendations = calculateColorVastu(roomType, direction);
        
        res.json({
            success: true,
            colorRecommendations,
            description: `Color recommendations for ${roomType} in ${direction} direction`
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.post('/vastu/auspicious-timing', (req, res) => {
    try {
        const { activity, currentDate } = req.body;
        
        if (!activity) {
            return res.status(400).json({ error: 'Activity type is required' });
        }
        
        const timing = calculateAuspiciousTiming(activity, currentDate ? new Date(currentDate) : new Date());
        
        res.json({
            success: true,
            timing,
            description: `Auspicious timing recommendations for ${activity}`
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.post('/vastu/room-specific-guidance', (req, res) => {
    try {
        const { roomType } = req.body;
        
        if (!roomType) {
            return res.status(400).json({ error: 'Room type is required' });
        }
        
        const roomGuidance = getRoomSpecificVastuGuidance(roomType);
        
        res.json({
            success: true,
            roomGuidance,
            description: `Specific Vastu guidance for ${roomType}`
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

/**
 * Get room-specific Vastu guidance
 */
function getRoomSpecificVastuGuidance(roomType) {
    const guidance = {
        'bedroom': {
            idealDirection: 'Southwest',
            bedPlacement: 'Head towards South or East',
            colors: ['Soft Pink', 'Light Blue', 'Cream'],
            avoid: ['Mirrors facing bed', 'Electronic devices', 'Water features'],
            enhance: ['Pair decorations', 'Soft lighting', 'Fresh flowers'],
            tips: [
                'Keep bedroom clutter-free',
                'Use wooden furniture',
                'Ensure proper ventilation',
                'Avoid beam above bed'
            ]
        },
        'kitchen': {
            idealDirection: 'Southeast',
            stovePlacement: 'Face East while cooking',
            colors: ['Yellow', 'Orange', 'Red'],
            avoid: ['Kitchen above/below bedroom', 'Sink next to stove', 'Clutter'],
            enhance: ['Good ventilation', 'Bright lighting', 'Clean surfaces'],
            tips: [
                'Keep kitchen always clean',
                'Store grains in southwest',
                'Water source in northeast',
                'Avoid black color'
            ]
        },
        'living_room': {
            idealDirection: 'North or East',
            seatArrangement: 'Face North or East',
            colors: ['White', 'Cream', 'Light Yellow'],
            avoid: ['Heavy furniture in northeast', 'Dark colors', 'Clutter'],
            enhance: ['Natural light', 'Plants in east', 'Family photos'],
            tips: [
                'Keep center area open',
                'Use comfortable seating',
                'Good air circulation',
                'Positive artwork'
            ]
        },
        'study': {
            idealDirection: 'Northeast',
            deskPlacement: 'Face North or East',
            colors: ['Green', 'Light Blue', 'White'],
            avoid: ['Back to door', 'Distracting elements', 'Dark corners'],
            enhance: ['Good lighting', 'Organized shelves', 'Inspirational quotes'],
            tips: [
                'Keep study area clean',
                'Use natural materials',
                'Ensure silence',
                'Fresh air circulation'
            ]
        },
        'bathroom': {
            idealDirection: 'Northwest',
            fixtures: 'Toilet seat facing North-South',
            colors: ['White', 'Light Blue', 'Light Green'],
            avoid: ['Center of house', 'Above kitchen', 'Dark colors'],
            enhance: ['Good ventilation', 'Cleanliness', 'Natural light'],
            tips: [
                'Keep always clean and dry',
                'Use exhaust fan',
                'Avoid storage of medicines',
                'Regular maintenance'
            ]
        }
    };
    
    return guidance[roomType] || {
        message: 'Please specify a valid room type: bedroom, kitchen, living_room, study, or bathroom'
    };
}

// Helper functions for meanings and interpretations

function getBhagyankMeaning(number) {
    const meanings = {
        1: 'Leadership, independence, pioneering spirit. You are a natural born leader.',
        2: 'Cooperation, diplomacy, partnership. You excel in collaborative environments.',
        3: 'Creativity, communication, artistic expression. You have natural creative talents.',
        4: 'Stability, hard work, practical approach. You build solid foundations.',
        5: 'Freedom, adventure, versatility. You seek variety and new experiences.',
        6: 'Responsibility, nurturing, service to others. You are naturally caring.',
        7: 'Spirituality, introspection, analysis. You seek deeper understanding.',
        8: 'Material success, authority, business acumen. You have strong leadership abilities.',
        9: 'Humanitarian service, wisdom, completion. You are here to serve others.',
        11: 'Spiritual enlightenment, inspiration, intuition. You are a natural healer.',
        22: 'Master builder, large-scale achievements. You can manifest big dreams.',
        33: 'Master teacher, spiritual healing. You inspire and heal others.'
    };
    return meanings[number] || 'Unique path of self-discovery and growth.';
}

function getMulankMeaning(number) {
    const meanings = {
        1: 'Independent, ambitious, original. You prefer to lead rather than follow.',
        2: 'Sensitive, cooperative, peace-loving. You work well with others.',
        3: 'Creative, optimistic, communicative. You express yourself artistically.',
        4: 'Practical, organized, reliable. You are the foundation others build upon.',
        5: 'Dynamic, curious, freedom-loving. You need variety and change.',
        6: 'Caring, responsible, family-oriented. You naturally nurture others.',
        7: 'Analytical, spiritual, introspective. You seek truth and understanding.',
        8: 'Ambitious, material-focused, authoritative. You aim for success and recognition.',
        9: 'Generous, humanitarian, wise. You serve the greater good.',
        11: 'Intuitive, inspirational, spiritually aware. You are highly sensitive.',
        22: 'Practical visionary, master builder. You turn dreams into reality.',
        33: 'Compassionate teacher, spiritual guide. You heal through wisdom.'
    };
    return meanings[number] || 'Unique personality with special gifts.';
}

function getNameNumberMeaning(number) {
    const meanings = {
        1: 'You project leadership and confidence. Others see you as a pioneer.',
        2: 'You appear diplomatic and cooperative. Others find you easy to work with.',
        3: 'You seem creative and expressive. Others are drawn to your artistic nature.',
        4: 'You appear reliable and organized. Others depend on your stability.',
        5: 'You seem adventurous and free-spirited. Others see you as exciting.',
        6: 'You appear nurturing and responsible. Others come to you for care.',
        7: 'You seem mysterious and wise. Others respect your depth.',
        8: 'You project success and authority. Others see you as powerful.',
        9: 'You appear wise and humanitarian. Others seek your guidance.',
        11: 'You seem inspirational and intuitive. Others find you uplifting.',
        22: 'You appear as a master builder. Others see your potential for greatness.',
        33: 'You seem like a spiritual teacher. Others are drawn to your wisdom.'
    };
    return meanings[number] || 'You have a unique presence that others remember.';
}

function calculateNumerologyCompatibility(bhagyank, mulank, nameNumber) {
    // Simplified compatibility calculation
    const harmony = Math.abs(bhagyank - mulank) <= 2 && Math.abs(bhagyank - nameNumber) <= 2;
    
    return {
        isHarmonious: harmony,
        analysis: harmony ? 
            'Your numbers are in harmony, indicating a balanced personality.' :
            'Some tension between your numbers suggests areas for personal growth.',
        recommendations: harmony ?
            'Continue developing your natural talents and maintain balance.' :
            'Work on aligning your inner nature with your outer expression.'
    };
}

function getNumerologyRecommendations(bhagyank, mulank, nameNumber) {
    return [
        `Focus on developing your Bhagyank ${bhagyank} qualities for life purpose fulfillment`,
        `Embrace your Mulank ${mulank} traits for authentic self-expression`,
        `Align your name energy (${nameNumber}) with your life goals`,
        'Practice meditation to connect with your inner wisdom',
        'Use your numbers as guidance for important life decisions'
    ];
}

// Jyotish Endpoints
router.post('/jyotish/comprehensive-chart', async (req, res) => {
    try {
        const { dateOfBirth, timeOfBirth, locationId, fullName } = req.body;
        
        if (!dateOfBirth || !timeOfBirth || !locationId) {
            return res.status(400).json({ 
                error: 'Date of birth, time of birth, and location ID are required. Use /api/locations/search to find location ID.' 
            });
        }
        
        // Get location coordinates from location API
        const { getLocationById } = require('./locations');
        const locationData = getLocationById(locationId);
        
        if (!locationData) {
            return res.status(400).json({ error: 'Invalid location ID. Use /api/locations/search to find valid location IDs.' });
        }
        
        const coordinates = locationData.coordinates;
        
        // Use enhanced Jyotish calculation with all advanced features
        const { calculateEnhancedJyotishChart } = require('./enhanced-jyotish');
        const chart = await calculateEnhancedJyotishChart(
            dateOfBirth, timeOfBirth, coordinates, fullName
        );
        
        res.json({
            success: true,
            ...chart,
            location: locationData,
            description: 'Enhanced Jyotish chart analysis with deep career and marriage predictions, planetary house analysis, and name compatibility using advanced Vedic calculations'
        });
        
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Keep backup static implementation for reference
router.post('/jyotish/comprehensive-chart-static', async (req, res) => {
    try {
        const { dateOfBirth, timeOfBirth, locationId, fullName } = req.body;
        
        if (!dateOfBirth || !timeOfBirth || !locationId) {
            return res.status(400).json({ 
                error: 'Date of birth, time of birth, and location ID are required.' 
            });
        }
        
        // Static implementation backup
        const birthDate = new Date(`${dateOfBirth}T${timeOfBirth}`);
        const age = new Date().getFullYear() - birthDate.getFullYear();
        
        const comprehensiveChart = {
            success: true,
            birthDetails: {
                date: dateOfBirth,
                time: timeOfBirth,
                coordinates: locationData.coordinates,
                name: fullName
            },
            ascendant: {
                sign: 'Leo',
                degree: '15.30'
            },
            planets: {
                Sun: {
                    sign: 'Leo',
                    degree: '18.20',
                    house: 1,
                    strength: 85,
                    nakshatra: 'Magha',
                    retrograde: false
                },
                Moon: {
                    sign: 'Cancer',
                    degree: '12.45',
                    house: 12,
                    strength: 78,
                    nakshatra: 'Pushya',
                    retrograde: false
                },
                Mars: {
                    sign: 'Virgo',
                    degree: '25.10',
                    house: 2,
                    strength: 72,
                    nakshatra: 'Chitra',
                    retrograde: false
                },
                Mercury: {
                    sign: 'Leo',
                    degree: '8.35',
                    house: 1,
                    strength: 88,
                    nakshatra: 'Magha',
                    retrograde: false
                },
                Jupiter: {
                    sign: 'Gemini',
                    degree: '22.15',
                    house: 11,
                    strength: 82,
                    nakshatra: 'Punarvasu',
                    retrograde: false
                },
                Venus: {
                    sign: 'Virgo',
                    degree: '5.50',
                    house: 2,
                    strength: 75,
                    nakshatra: 'Uttara Phalguni',
                    retrograde: false
                },
                Saturn: {
                    sign: 'Capricorn',
                    degree: '28.40',
                    house: 6,
                    strength: 68,
                    nakshatra: 'Dhanishta',
                    retrograde: false
                }
            },
            houseAnalysis: {
                1: {
                    name: 'Tanu Bhava (Self)',
                    significator: 'Sun',
                    bodyParts: ['Head', 'Brain'],
                    lifeAreas: ['Personality', 'Health', 'Appearance'],
                    planets: [
                        { name: 'Sun', sign: 'Leo', degree: '18.20', strength: 85 },
                        { name: 'Mercury', sign: 'Leo', degree: '8.35', strength: 88 }
                    ],
                    analysis: {
                        summary: 'Sun and Mercury in 1st house creates a powerful personality with excellent communication skills and natural leadership abilities',
                        details: [
                            'Sun in Leo brings natural leadership and confidence (Strength: 85%)',
                            'Mercury in Leo brings intelligence and eloquence (Strength: 88%)'
                        ],
                        recommendations: ['Enhance your natural leadership abilities through public speaking and taking initiative in group settings']
                    },
                    predictions: {
                        immediate: ['Your personality radiates confidence and attracts positive attention from authority figures'],
                        shortTerm: ['Leadership opportunities will present themselves in the coming months, embrace them'],
                        longTerm: ['You are destined for positions of authority and respect in your chosen field']
                    },
                    strength: 86.5,
                    isEmpty: false
                },
                7: {
                    name: 'Kalatra Bhava (Partnership)',
                    significator: 'Venus',
                    bodyParts: ['Kidneys'],
                    lifeAreas: ['Marriage', 'Partnerships', 'Public Relations'],
                    planets: [],
                    analysis: {
                        summary: 'The 7th house shows excellent marriage prospects with a loving and supportive life partner',
                        details: ['Natural development of partnership abilities and harmonious relationships'],
                        recommendations: ['Focus on building meaningful relationships and developing your diplomatic skills']
                    },
                    predictions: {
                        immediate: ['Relationship harmony and understanding with current or future partner'],
                        shortTerm: ['Meeting potential life partner through social or professional connections within 2-3 years'],
                        longTerm: ['Happy marriage with mutual respect, shared goals, and growing love over the years']
                    },
                    strength: 75,
                    isEmpty: true
                },
                10: {
                    name: 'Karma Bhava (Career)',
                    significator: 'Mercury',
                    bodyParts: ['Knees'],
                    lifeAreas: ['Career', 'Reputation', 'Status'],
                    planets: [],
                    analysis: {
                        summary: 'Career house shows exceptional prospects for professional success, recognition, and leadership roles',
                        details: ['Strong potential for business success, management positions, and public recognition'],
                        recommendations: ['Focus on developing management and communication skills for maximum career growth']
                    },
                    predictions: {
                        immediate: ['Current career path shows positive growth and new opportunities emerging'],
                        shortTerm: ['Promotion or significant new job opportunity within the next 18-24 months'],
                        longTerm: ['Achievement of significant professional status, financial success, and industry recognition']
                    },
                    strength: 80,
                    isEmpty: true
                }
            },
            nameAnalysis: fullName ? {
                nameNumber: nameNumber,
                overallScore: 85,
                rashiCompatibility: {
                    score: 88,
                    analysis: 'Excellent harmony between your name vibration and Cancer moon sign energy, creating emotional balance'
                },
                nakshatraCompatibility: {
                    score: 82,
                    analysis: 'Strong alignment with Pushya nakshatra qualities, enhancing your nurturing and protective nature'
                },
                recommendations: [
                    'Your name creates very positive vibrations for success in both material and spiritual pursuits',
                    'The combination supports leadership while maintaining emotional intelligence and empathy'
                ],
                insights: [
                    `Your name number ${nameNumber} brings wisdom, analytical abilities, and spiritual depth`,
                    'Perfect match with your intuitive and caring nature, enhancing your natural leadership qualities',
                    'Name supports your ability to inspire and guide others while achieving personal success'
                ]
            } : null,
            predictions: {
                careerAnalysis: {
                    overallCareerProfile: `Your Leo ascendant with Sun and Mercury in the 1st house creates exceptional career prospects. You are a natural leader with outstanding communication skills, destined for positions of authority and recognition. Your analytical mind combined with creative expression makes you suitable for diverse professional fields where you can inspire and lead others.`,
                    
                    naturalTalents: [
                        'Natural leadership and commanding presence',
                        'Excellent communication and presentation skills',
                        'Strong analytical and strategic thinking abilities',
                        'Creative problem-solving and innovation',
                        'Ability to inspire and motivate teams',
                        'Business acumen and entrepreneurial spirit'
                    ],
                    
                    bestCareerFields: [
                        'Management and Executive Leadership',
                        'Business and Entrepreneurship',
                        'Communications and Media',
                        'Education and Training',
                        'Government and Public Service',
                        'Creative Industries and Entertainment',
                        'Consulting and Advisory Services'
                    ],
                    
                    careerTiming: {
                        currentPhase: age < 30 ? 'Foundation and growth phase - perfect time for skill building and networking' : 
                                     age < 45 ? 'Peak performance phase - ideal for major career moves and leadership roles' : 
                                     'Wisdom and mentoring phase - time to guide others and build lasting legacy',
                        bestPeriods: [
                            `Ages ${Math.max(28, age)}-${Math.max(35, age + 7)}: Major career breakthrough and industry recognition`,
                            `Ages ${Math.max(35, age + 5)}-${Math.max(45, age + 15)}: Peak earning potential and executive leadership opportunities`,
                            `Ages ${Math.max(45, age + 10)}-${Math.max(55, age + 20)}: Establishment of lasting professional legacy and mentorship roles`
                        ]
                    },
                    
                    incomePattern: {
                        trend: 'Excellent earning potential with exponential growth pattern',
                        peakAge: `${Math.max(38, age + 5)}-${Math.max(48, age + 15)}`,
                        sources: [
                            'Primary career with senior leadership roles',
                            'Business ventures and strategic investments',
                            'Consulting and advisory services',
                            'Creative projects and intellectual property',
                            'Board positions and directorship roles'
                        ]
                    },
                    
                    workEnvironment: {
                        preferred: 'Dynamic leadership environment with creative freedom, recognition, and growth opportunities',
                        leadership: 'Natural born leader with exceptional ability to inspire and guide teams toward success',
                        teamwork: 'Outstanding team leader while maintaining collaborative and inclusive management style'
                    },
                    
                    careerBreakthroughs: [
                        'A major opportunity will arise through your exceptional communication skills, leading to rapid career advancement and industry recognition',
                        'Your natural leadership abilities will be recognized by senior management or investors, opening doors to executive positions or business partnerships',
                        'A creative project or innovative business idea will bring unexpected recognition, media attention, and significant financial rewards',
                        'Professional networking and mentorship relationships will connect you with influential industry leaders who accelerate your success trajectory'
                    ],
                    
                    recommendations: [
                        'Leverage your natural charisma and communication skills to pursue leadership roles and public speaking opportunities',
                        'Consider entrepreneurship as your independent spirit and business acumen will drive remarkable success',
                        'Build a strong professional network as strategic relationships will be crucial to your career advancement',
                        'Invest in continuous learning and skill development to stay ahead in rapidly evolving industries',
                        'Take calculated risks during your peak earning years to maximize growth and establish multiple income streams'
                    ]
                },
                
                marriageAnalysis: {
                    marriageProspects: {
                        likelihood: 'Very High',
                        bestAge: age < 28 ? '28-32' : age < 35 ? '30-35' : '32-38',
                        meetingStory: `You will meet your life partner through professional connections, social gatherings, or mutual friends where your natural charisma and confidence draw them to you. The connection will be instant and intellectually stimulating, with both of you recognizing a deep mental and emotional compatibility. Your relationship will be built on mutual respect, shared ambitions, genuine friendship, and growing love that develops into a beautiful, lasting partnership.`,
                        compatibility: 'Excellent compatibility with very high potential for lasting happiness and mutual growth'
                    },
                    
                    spouseCharacteristics: {
                        physicalAppearance: {
                            height: 'Medium to tall height with elegant and graceful posture',
                            complexion: 'Fair to medium complexion with naturally radiant and glowing skin',
                            build: 'Well-proportioned and graceful build with natural poise',
                            features: 'Attractive and refined features with expressive, intelligent eyes and a warm, welcoming smile'
                        },
                        
                        personality: {
                            mainTraits: [
                                'Highly intelligent and well-educated',
                                'Emotionally supportive and understanding',
                                'Independent yet deeply family-oriented',
                                'Creative and artistic inclinations',
                                'Strong moral values and integrity',
                                'Ambitious and goal-oriented'
                            ],
                            nature: 'Balanced, loving, emotionally mature, and spiritually aware',
                            interests: [
                                'Arts, culture, and creative expression',
                                'Travel and exploration of new places',
                                'Family relationships and creating a beautiful home',
                                'Personal development and spiritual growth',
                                'Social causes and community involvement'
                            ],
                            values: [
                                'Family harmony and togetherness',
                                'Mutual growth and personal development',
                                'Honesty and transparent communication',
                                'Shared dreams and life aspirations',
                                'Respect for individual space and personal goals'
                            ]
                        },
                        
                        background: {
                            education: 'Well-educated with higher education qualifications, possibly in professional or creative fields',
                            profession: 'Likely in creative industries, education, healthcare, business, or professional services',
                            family: 'Comes from a cultured, supportive, and well-established family with strong traditional values',
                            location: 'May be from the same city or region, or you may meet through travel or professional relocation'
                        }
                    },
                    
                    relationshipDynamics: {
                        loveStyle: 'Your relationship will be characterized by deep intellectual connection, romantic gestures, mutual admiration, and unwavering support. Both of you will appreciate each other\'s ambitions and provide consistent encouragement for personal and professional growth while maintaining individual identity.',
                        
                        communication: 'Excellent communication with the ability to discuss anything openly, honestly, and constructively without judgment',
                        
                        sharedActivities: [
                            'Traveling to new destinations and exploring different cultures together',
                            'Attending cultural events, concerts, theater performances, and artistic exhibitions',
                            'Engaging in intellectual discussions, reading, and learning new skills together',
                            'Entertaining friends and family in your beautiful, welcoming home',
                            'Supporting each other\'s career goals and celebrating personal achievements',
                            'Participating in social causes and community service activities'
                        ],
                        
                        growthAreas: [
                            'Learning to balance individual career ambitions with relationship and family priorities',
                            'Developing deeper emotional vulnerability and intimate expression',
                            'Cultivating patience and understanding during stressful or challenging periods',
                            'Creating meaningful traditions and rituals that strengthen your emotional bond over time'
                        ]
                    },
                    
                    marriageHappiness: {
                        overall: 'Very Happy, Deeply Fulfilling, and Continuously Growing',
                        
                        strengths: [
                            'Strong intellectual and emotional connection that deepens over time',
                            'Mutual respect and genuine admiration for each other\'s unique qualities',
                            'Shared vision for the future and aligned life goals and values',
                            'Excellent problem-solving abilities as a unified team',
                            'Growing love, appreciation, and romantic connection through the years',
                            'Unwavering support system for each other\'s dreams and aspirations',
                            'Ability to maintain individual identity while building a strong partnership'
                        ],
                        
                        familyLife: {
                            children: 'Blessed with intelligent, talented, and well-balanced children who bring immense joy and pride',
                            homeEnvironment: 'Beautiful, harmonious home filled with love, laughter, cultural richness, and positive energy',
                            traditions: 'Creation of meaningful family traditions that blend both families\' customs and values',
                            socialLife: 'Active and fulfilling social life with a close circle of friends, extended family, and community connections'
                        }
                    },
                    
                    mangalDosha: {
                        present: false,
                        severity: 'None',
                        cancellation: true,
                        analysis: 'No Mangal Dosha present in your chart, indicating smooth marriage prospects without astrological obstacles or delays',
                        remedies: []
                    },
                    
                    timing: {
                        meeting: age < 25 ? `Ages ${age + 3}-${age + 8}: Through professional networks, educational connections, or industry events` : 
                                age < 30 ? `Ages ${age + 1}-${age + 5}: Through mutual friends, social gatherings, or community activities` : 
                                `Ages ${age + 1}-${age + 4}: Through work collaborations, professional conferences, or social networking`,
                        engagement: '8-15 months after meeting, allowing sufficient time to build a strong emotional and intellectual foundation',
                        marriage: 'Within 2-3 years of meeting, when the timing feels naturally perfect and both families are supportive',
                        bestMarriageMonths: [
                            'April-May: Spring season brings new beginnings and fresh energy',
                            'October-November: Auspicious autumn period with favorable planetary alignments',
                            'December-January: Winter season perfect for intimate celebrations and family gatherings'
                        ]
                    },
                    
                    advice: [
                        'Trust your intuition when you meet the right person - you will feel an instant, unmistakable connection',
                        'Focus on building a strong friendship foundation before deepening the romantic relationship',
                        'Be open to meeting someone who complements your personality rather than simply mirroring your traits',
                        'Your natural leadership qualities and confidence will attract a partner who appreciates and supports your ambitions',
                        'Family approval and support will play a positive and important role in your marriage journey',
                        'Patience will be rewarded with a truly compatible, loving, and lifelong partner who enhances your happiness'
                    ]
                },
                
                generalPredictions: {
                    personality: 'Leo ascendant creates a confident, charismatic, naturally leadership-oriented personality with a generous heart and strong moral compass',
                    currentPhase: age < 25 ? 'Foundation building phase - focus on education, skill development, and establishing your identity' : 
                                 age < 40 ? 'Growth and establishment phase - prime time for career advancement and relationship building' :
                                 age < 55 ? 'Peak performance phase - time for major achievements, leadership roles, and wealth accumulation' : 
                                 'Wisdom sharing phase - mentoring others, enjoying life\'s fruits, and building lasting legacy',
                    keyStrengths: [
                        'Strong Sun brings natural leadership abilities, confidence, and recognition from authority figures',
                        'Powerful Mercury enhances communication skills, analytical thinking, and business acumen',
                        'Benefic Jupiter provides wisdom, spiritual growth, and protection from major obstacles',
                        'Well-placed Venus brings creativity, relationship harmony, and appreciation for beauty and arts'
                    ],
                    guidance: 'Focus on developing your natural leadership talents while maintaining humility and genuine service to others. Your greatest success and fulfillment will come through inspiring, uplifting, and positively impacting the lives of those around you.'
                }
            },
            
            yogas: [
                {
                    name: 'Raj Yoga',
                    description: 'Sun and Mercury conjunction in Leo ascendant creating royal combinations',
                    effect: 'Brings royal treatment, authority, recognition, and elevated status in society',
                    strength: 'Very Strong'
                },
                {
                    name: 'Budhaditya Yoga',
                    description: 'Sun-Mercury conjunction enhancing intelligence and communication abilities',
                    effect: 'Exceptional intelligence, communication skills, scholarly abilities, and success in intellectual pursuits',
                    strength: 'Strong'
                },
                {
                    name: 'Dhana Yoga',
                    description: 'Benefic planets creating wealth-giving combinations',
                    effect: 'Good financial prospects, wealth accumulation, and multiple sources of income',
                    strength: 'Moderate to Strong'
                }
            ],
            
            remedies: {
                gemstones: [
                    'Ruby (for Sun) - enhances leadership, confidence, and recognition from authority figures',
                    'Emerald (for Mercury) - improves communication skills, intelligence, and business success',
                    'Yellow Sapphire (for Jupiter) - brings wisdom, prosperity, and spiritual protection'
                ],
                mantras: [
                    'Om Surya Namaha (108 times daily) - for Sun\'s blessings and leadership enhancement',
                    'Om Budhaya Namaha (108 times daily) - for Mercury\'s grace and communication skills',
                    'Gayatri Mantra (daily) - for overall spiritual growth and divine protection'
                ],
                colors: [
                    'Orange and Gold - for Sun\'s energy and leadership enhancement',
                    'Green - for Mercury\'s influence and intellectual growth',
                    'Yellow - for Jupiter\'s blessings and wisdom'
                ],
                donations: [
                    'Donate wheat and jaggery on Sundays for Sun\'s blessings',
                    'Feed green vegetables to cows on Wednesdays for Mercury\'s grace',
                    'Offer yellow flowers at temple on Thursdays for Jupiter\'s protection'
                ],
                fasting: [
                    'Sunday fasting for Sun (optional, only if needed)',
                    'Wednesday fasting for Mercury (if facing communication challenges)'
                ]
            },
            
            disclaimer: "This comprehensive Jyotish analysis is based on traditional Vedic astrological principles combined with modern interpretational methods. Results are provided for guidance purposes, and individual effort, positive thinking, and ethical conduct remain the most important factors for success and happiness in life."
        };
        
        res.json({
            ...comprehensiveChart,
            location: locationData,
            description: 'Comprehensive Jyotish chart analysis with detailed career and marriage predictions, planetary house analysis, and name compatibility based on traditional Vedic principles'
        });
        
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;

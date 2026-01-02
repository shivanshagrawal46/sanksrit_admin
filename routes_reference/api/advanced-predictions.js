/**
 * ADVANCED CAREER AND MARRIAGE PREDICTIONS
 * Deep analysis that will amaze users with accuracy
 */

/**
 * Generate Deep Career Analysis - Amazing Predictions
 */
function generateDeepCareerAnalysis(planets, houseAnalysis, ascendant, age, nameAnalysis) {
    const careerAnalysis = {
        overallCareerProfile: '',
        naturalTalents: [],
        careerFields: {
            primary: [],
            secondary: [],
            avoid: []
        },
        careerPhases: {
            earlyCareer: '',
            midCareer: '',
            lateCareer: ''
        },
        businessVsJob: {
            recommendation: '',
            analysis: '',
            timing: ''
        },
        promotionTiming: [],
        careerChallenges: [],
        careerRemedies: [],
        incomePattern: '',
        workEnvironment: '',
        leadership: {
            potential: '',
            style: '',
            timing: ''
        },
        internationalCareer: {
            prospects: '',
            countries: [],
            timing: ''
        },
        careerChanges: {
            likelihood: '',
            timing: [],
            reasons: []
        },
        retirementAnalysis: {
            timing: '',
            lifestyle: '',
            activities: []
        },
        specificPredictions: []
    };
    
    // Analyze 10th house (Career) in detail
    const tenthHouse = houseAnalysis[10];
    const tenthLord = getTenthHouseLord(ascendant.sign);
    const tenthLordPosition = planets[tenthLord];
    
    // Analyze Atmakaraka (Soul's desire for career)
    const atmakaraka = findAtmakaraka(planets);
    
    // Overall Career Profile with Amazing Detail
    careerAnalysis.overallCareerProfile = generateAmazingCareerProfile(
        tenthHouse, tenthLordPosition, atmakaraka, planets, ascendant, nameAnalysis, age
    );
    
    // Natural Talents Analysis
    careerAnalysis.naturalTalents = analyzeNaturalTalents(planets, ascendant, nameAnalysis);
    
    // Career Fields Analysis
    careerAnalysis.careerFields = analyzeDetailedCareerFields(
        planets, tenthHouse, tenthLordPosition, atmakaraka, ascendant
    );
    
    // Career Phases with Specific Timing
    careerAnalysis.careerPhases = analyzeDetailedCareerPhases(planets, age, tenthLordPosition);
    
    // Business vs Job Analysis
    careerAnalysis.businessVsJob = analyzeBusinessVsJobDetailed(planets, houseAnalysis, ascendant);
    
    // Promotion Timing with Exact Periods
    careerAnalysis.promotionTiming = analyzePromotionTimingDetailed(planets, tenthLordPosition, age);
    
    // Career Challenges with Solutions
    careerAnalysis.careerChallenges = analyzeCareerChallengesDetailed(planets, tenthHouse, tenthLordPosition);
    
    // Income Pattern Analysis
    careerAnalysis.incomePattern = analyzeIncomePatternDetailed(planets, houseAnalysis);
    
    // Work Environment Prediction
    careerAnalysis.workEnvironment = analyzeWorkEnvironmentDetailed(planets, tenthHouse);
    
    // Leadership Analysis
    careerAnalysis.leadership = analyzeLeadershipPotentialDetailed(planets, ascendant, atmakaraka);
    
    // International Career
    careerAnalysis.internationalCareer = analyzeInternationalCareerDetailed(planets, houseAnalysis);
    
    // Career Changes
    careerAnalysis.careerChanges = analyzeCareerChangesDetailed(planets, age, tenthLordPosition);
    
    // Retirement Analysis
    careerAnalysis.retirementAnalysis = analyzeRetirementDetailed(planets, age, houseAnalysis);
    
    // Specific Amazing Predictions
    careerAnalysis.specificPredictions = generateSpecificCareerPredictions(
        planets, tenthHouse, tenthLordPosition, atmakaraka, age, nameAnalysis
    );
    
    // Career Remedies
    careerAnalysis.careerRemedies = generateAdvancedCareerRemedies(planets, tenthHouse, tenthLordPosition);
    
    return careerAnalysis;
}

/**
 * Generate Amazing Career Profile
 */
function generateAmazingCareerProfile(tenthHouse, tenthLordPosition, atmakaraka, planets, ascendant, nameAnalysis, age) {
    let profile = "";
    
    // Start with soul-level career analysis
    profile += `Your soul's deepest career calling is revealed through ${atmakaraka.planet} as your Atmakaraka, positioned in ${atmakaraka.sign} in the ${atmakaraka.house}th house. `;
    
    // Add 10th house analysis
    if (tenthHouse.planets.length > 0) {
        const mainCareerPlanet = tenthHouse.planets[0];
        profile += `${mainCareerPlanet.name} in your 10th house of career in ${mainCareerPlanet.sign} reveals that `;
        
        switch(mainCareerPlanet.name) {
            case 'Sun':
                profile += `you are destined for leadership roles and government positions. Your natural authority and commanding presence will open doors to high-status careers. `;
                break;
            case 'Moon':
                profile += `your career will involve public interaction, emotional intelligence, and nurturing others. You'll excel in fields that require intuition and care. `;
                break;
            case 'Mars':
                profile += `you're meant for action-oriented, competitive careers. Your energy and courage will lead you to success in challenging fields. `;
                break;
            case 'Mercury':
                profile += `communication, intellect, and business acumen are your career strengths. You'll excel in fields requiring quick thinking and adaptability. `;
                break;
            case 'Jupiter':
                profile += `wisdom, teaching, and guidance are your career calling. You're destined to be a mentor and advisor to others. `;
                break;
            case 'Venus':
                profile += `creativity, beauty, and harmony will define your career path. Artistic and diplomatic fields will bring you success. `;
                break;
            case 'Saturn':
                profile += `discipline, service, and long-term vision are your career foundations. You'll build a lasting legacy through persistent effort. `;
                break;
            case 'Rahu':
                profile += `unconventional, innovative, and foreign-connected careers await you. You'll pioneer new fields and break traditional boundaries. `;
                break;
            case 'Ketu':
                profile += `spiritual, research-oriented, and detached service will define your career. You'll find success in behind-the-scenes roles. `;
                break;
        }
    } else {
        profile += `Your 10th house being empty indicates that career development will happen gradually, influenced by the lord of the 10th house, ${tenthLordPosition ? tenthLordPosition.sign : 'which'} positioned in ${tenthLordPosition ? tenthLordPosition.house : 'a specific'} house. `;
    }
    
    // Add name influence
    if (nameAnalysis && nameAnalysis.overallScore > 70) {
        profile += `Your name creates ${nameAnalysis.overallScore}% harmony with your birth chart, significantly enhancing your career prospects and professional recognition. `;
    } else if (nameAnalysis && nameAnalysis.overallScore < 50) {
        profile += `Your name creates only ${nameAnalysis.overallScore}% harmony with your birth chart, which may create some obstacles in career recognition that can be overcome with proper remedies. `;
    }
    
    // Add age-specific guidance
    if (age < 25) {
        profile += `At your current age of ${age}, you're in the foundation-building phase. Focus on skill development and education. `;
    } else if (age < 40) {
        profile += `At ${age}, you're in your career establishment phase. This is the time for taking calculated risks and building your professional network. `;
    } else if (age < 55) {
        profile += `At ${age}, you're in your peak performance phase. Your experience and expertise will open doors to leadership and mentoring roles. `;
    } else {
        profile += `At ${age}, you're in the wisdom-sharing phase. Your accumulated knowledge makes you valuable as a consultant and advisor. `;
    }
    
    return profile;
}

/**
 * Analyze Detailed Career Fields
 */
function analyzeDetailedCareerFields(planets, tenthHouse, tenthLordPosition, atmakaraka, ascendant) {
    const fields = {
        primary: [],
        secondary: [],
        avoid: []
    };
    
    // Analyze based on multiple factors
    const careerInfluences = [];
    
    // 10th house planets
    tenthHouse.planets.forEach(planet => {
        careerInfluences.push({
            planet: planet.name,
            strength: planet.strength,
            sign: planet.sign,
            weight: 3
        });
    });
    
    // 10th lord
    if (tenthLordPosition) {
        careerInfluences.push({
            planet: getTenthLordPlanet(ascendant.sign),
            strength: tenthLordPosition.strength,
            sign: tenthLordPosition.sign,
            weight: 2
        });
    }
    
    // Atmakaraka
    careerInfluences.push({
        planet: atmakaraka.planet,
        strength: atmakaraka.strength,
        sign: atmakaraka.sign,
        weight: 2
    });
    
    // Strongest planet overall
    let strongestPlanet = null;
    let maxStrength = 0;
    Object.entries(planets).forEach(([name, data]) => {
        if (data.strength > maxStrength) {
            maxStrength = data.strength;
            strongestPlanet = { name, ...data, weight: 1 };
        }
    });
    if (strongestPlanet) careerInfluences.push(strongestPlanet);
    
    // Generate career fields based on weighted influences
    careerInfluences.forEach(influence => {
        const planetFields = getDetailedCareerFieldsByPlanet(
            influence.planet, influence.sign, influence.strength
        );
        
        // Add to primary or secondary based on weight and strength
        if (influence.weight >= 2 && influence.strength > 60) {
            fields.primary.push(...planetFields.primary);
            fields.secondary.push(...planetFields.secondary);
        } else {
            fields.secondary.push(...planetFields.primary);
        }
    });
    
    // Remove duplicates and prioritize
    fields.primary = [...new Set(fields.primary)].slice(0, 6);
    fields.secondary = [...new Set(fields.secondary)].slice(0, 8);
    
    // Fields to avoid based on afflicted planets
    const afflictedPlanets = Object.entries(planets).filter(([name, data]) => 
        data.strength < 30 || (data.house === 6 || data.house === 8 || data.house === 12)
    );
    
    afflictedPlanets.forEach(([name, data]) => {
        const avoidFields = getFieldsToAvoid(name, data.sign);
        fields.avoid.push(...avoidFields);
    });
    
    fields.avoid = [...new Set(fields.avoid)].slice(0, 4);
    
    return fields;
}

/**
 * Get detailed career fields by planet
 */
function getDetailedCareerFieldsByPlanet(planetName, sign, strength) {
    const baseFields = {
        Sun: {
            primary: ['Government Administration', 'Political Leadership', 'Public Sector Management', 'Authority Positions', 'Executive Roles'],
            secondary: ['Medicine (Cardiology)', 'Pharmacy', 'Gold Trading', 'Temple Management', 'Public Relations']
        },
        Moon: {
            primary: ['Psychology & Counseling', 'Hospitality & Tourism', 'Food & Beverage Industry', 'Public Relations', 'Healthcare (Nursing)'],
            secondary: ['Water Business', 'Dairy Industry', 'Textile Business', 'Travel Agency', 'Women & Children Services']
        },
        Mars: {
            primary: ['Military & Defense', 'Police & Security', 'Sports & Athletics', 'Civil Engineering', 'Real Estate Development'],
            secondary: ['Surgery (Orthopedic)', 'Metallurgy', 'Fire Safety', 'Competitive Sports', 'Adventure Tourism']
        },
        Mercury: {
            primary: ['Mass Communication', 'Digital Media', 'Content Writing', 'Business Management', 'Information Technology'],
            secondary: ['Accounting & Finance', 'Publishing', 'Education Technology', 'Sales & Marketing', 'Data Analysis']
        },
        Jupiter: {
            primary: ['Education & Teaching', 'Legal Practice', 'Banking & Finance', 'Religious Services', 'Philosophical Research'],
            secondary: ['Counseling & Therapy', 'Financial Advisory', 'Judicial Services', 'Research & Development', 'Wisdom-based Consulting']
        },
        Venus: {
            primary: ['Creative Arts', 'Entertainment Industry', 'Fashion & Design', 'Beauty & Cosmetics', 'Luxury Retail'],
            secondary: ['Music & Dance', 'Interior Design', 'Jewelry Business', 'Event Management', 'Diplomatic Services']
        },
        Saturn: {
            primary: ['Social Services', 'Construction Industry', 'Mining Operations', 'Labor Relations', 'Elderly Care'],
            secondary: ['Agriculture', 'Oil & Gas Industry', 'Discipline-related Work', 'Long-term Research', 'Infrastructure Development']
        },
        Rahu: {
            primary: ['Information Technology', 'Foreign Trade', 'Innovation & Startups', 'Unconventional Careers', 'Digital Media'],
            secondary: ['Aviation Industry', 'Electronics', 'Internet Business', 'Photography', 'Unusual Professions']
        },
        Ketu: {
            primary: ['Spiritual Services', 'Research & Development', 'Occult Sciences', 'Alternative Healing', 'Mystical Studies'],
            secondary: ['Philosophy', 'Meditation Teaching', 'Alternative Medicine', 'Detached Service', 'Liberation Work']
        }
    };
    
    let fields = baseFields[planetName] || { primary: [], secondary: [] };
    
    // Modify based on sign placement
    if (sign) {
        const signModifications = getCareerModificationsBySign(planetName, sign);
        if (signModifications) {
            fields = {
                primary: [...fields.primary, ...signModifications.additional],
                secondary: [...fields.secondary, ...signModifications.enhanced]
            };
        }
    }
    
    // Enhance based on strength
    if (strength > 80) {
        fields.primary.push(`Exceptional success in ${planetName}-related fields`);
    } else if (strength < 40) {
        fields.secondary = fields.secondary.map(field => `${field} (with effort and remedies)`);
    }
    
    return fields;
}

/**
 * Generate Specific Career Predictions
 */
function generateSpecificCareerPredictions(planets, tenthHouse, tenthLordPosition, atmakaraka, age, nameAnalysis) {
    const predictions = [];
    
    // Age-based specific predictions
    if (age < 25) {
        predictions.push("Between ages 24-26, you'll experience a significant career breakthrough that sets the foundation for your future success.");
        predictions.push("Your first major professional recognition will come through your communication skills and innovative ideas.");
    } else if (age >= 25 && age < 35) {
        predictions.push("A major career transition between ages 28-32 will lead you to your true calling and significantly increase your income.");
        predictions.push("You'll receive an important opportunity from someone in a position of authority who recognizes your unique talents.");
    } else if (age >= 35 && age < 45) {
        predictions.push("This decade will establish you as an expert in your field, with opportunities to mentor others and lead teams.");
        predictions.push("International connections or foreign assignments will play a crucial role in your career advancement.");
    } else if (age >= 45 && age < 55) {
        predictions.push("Your accumulated wisdom will open doors to advisory roles and board positions in prestigious organizations.");
        predictions.push("You'll be recognized as a thought leader in your industry, with opportunities for speaking and writing.");
    } else {
        predictions.push("Your experience will be highly valued, leading to consulting opportunities and the chance to share your knowledge.");
        predictions.push("A second career or passion project will bring both fulfillment and additional income streams.");
    }
    
    // Planet-specific predictions
    if (tenthHouse.planets.length > 0) {
        const mainPlanet = tenthHouse.planets[0];
        switch(mainPlanet.name) {
            case 'Sun':
                predictions.push("You're destined for a position where you'll be recognized as an authority figure and decision-maker.");
                predictions.push("Government connections or public sector opportunities will significantly boost your career trajectory.");
                break;
            case 'Jupiter':
                predictions.push("Your career will involve teaching, guiding, or advising others, bringing both respect and financial rewards.");
                predictions.push("Educational qualifications or certifications will be key to unlocking your highest career potential.");
                break;
            case 'Venus':
                predictions.push("Your creative talents and aesthetic sense will be the foundation of your professional success.");
                predictions.push("Collaborations with artists, designers, or creative professionals will lead to breakthrough opportunities.");
                break;
        }
    }
    
    // Atmakaraka-based soul-level predictions
    switch(atmakaraka.planet) {
        case 'Sun':
            predictions.push("Your soul's purpose is to lead and inspire others, which will manifest through increasing positions of responsibility.");
            break;
        case 'Moon':
            predictions.push("Your intuitive abilities and emotional intelligence will become your greatest professional assets.");
            break;
        case 'Mercury':
            predictions.push("Your ability to communicate complex ideas simply will make you invaluable in your chosen field.");
            break;
    }
    
    // Name-based predictions
    if (nameAnalysis) {
        if (nameAnalysis.overallScore > 80) {
            predictions.push("Your name creates powerful vibrations that will attract career opportunities and professional recognition.");
        } else if (nameAnalysis.overallScore < 50) {
            predictions.push("Adjusting your name or using a professional name could significantly enhance your career prospects.");
        }
    }
    
    return predictions.slice(0, 8); // Return top 8 predictions
}

/**
 * Generate Deep Marriage Analysis - Life Partner Predictions
 */
function generateDeepMarriageAnalysis(planets, houseAnalysis, ascendant, age, nameAnalysis) {
    const marriageAnalysis = {
        marriageProspects: {
            likelihood: '',
            timing: {
                bestPeriods: [],
                avoidPeriods: [],
                ageRange: '',
                specificYears: []
            },
            circumstances: '',
            meetingStory: ''
        },
        spouseCharacteristics: {
            physicalAppearance: {
                height: '',
                complexion: '',
                build: '',
                features: '',
                style: '',
                attractiveness: ''
            },
            personality: {
                nature: '',
                temperament: '',
                intelligence: '',
                interests: [],
                strengths: [],
                weaknesses: [],
                communication: '',
                socialNature: ''
            },
            background: {
                family: '',
                education: '',
                profession: [],
                socialStatus: '',
                financialStatus: '',
                culturalBackground: '',
                location: ''
            },
            compatibility: {
                emotional: 0,
                intellectual: 0,
                physical: 0,
                spiritual: 0,
                overall: 0,
                analysis: ''
            }
        },
        marriageType: {
            arrangement: '',
            meetingCircumstances: '',
            courtshipPeriod: '',
            ceremony: '',
            location: ''
        },
        marriageLife: {
            harmony: '',
            challenges: [],
            growth: [],
            intimacy: '',
            communication: '',
            financialHarmony: '',
            familyLife: ''
        },
        children: {
            prospects: '',
            number: '',
            timing: [],
            characteristics: [],
            relationship: '',
            education: ''
        },
        inLaws: {
            relationship: '',
            influence: '',
            support: '',
            challenges: [],
            living: ''
        },
        separationDivorce: {
            likelihood: '',
            reasons: [],
            timing: '',
            prevention: [],
            reconciliation: ''
        },
        secondMarriage: {
            prospects: '',
            timing: '',
            characteristics: '',
            success: '',
            comparison: ''
        },
        marriageRemedies: [],
        luckyFactors: {
            directions: [],
            colors: [],
            dates: [],
            gemstones: [],
            timing: []
        },
        amazingPredictions: []
    };
    
    // Analyze 7th house (Marriage) in detail
    const seventhHouse = houseAnalysis[7];
    const seventhLord = getSeventhHouseLord(ascendant.sign);
    const seventhLordPosition = planets[seventhLord];
    
    // Analyze Venus (Karaka for marriage)
    const venus = planets.Venus;
    
    // Analyze Jupiter (Karaka for husband in female charts)
    const jupiter = planets.Jupiter;
    
    // Analyze Mars (Mangal Dosha)
    const mars = planets.Mars;
    const mangalDosha = analyzeMangalDosha(mars, planets, ascendant);
    
    // Marriage Prospects with Amazing Detail
    marriageAnalysis.marriageProspects = analyzeAmazingMarriageProspects(
        seventhHouse, seventhLordPosition, venus, jupiter, age, mangalDosha, nameAnalysis
    );
    
    // Spouse Characteristics with Incredible Detail
    marriageAnalysis.spouseCharacteristics = analyzeAmazingSpouseCharacteristics(
        seventhHouse, seventhLordPosition, venus, jupiter, planets, ascendant
    );
    
    // Marriage Type and Circumstances
    marriageAnalysis.marriageType = analyzeDetailedMarriageType(
        seventhHouse, seventhLordPosition, venus, planets, age
    );
    
    // Marriage Life Analysis
    marriageAnalysis.marriageLife = analyzeDetailedMarriageLife(
        seventhHouse, seventhLordPosition, venus, jupiter, planets, mangalDosha
    );
    
    // Children Analysis
    marriageAnalysis.children = analyzeDetailedChildrenProspects(
        houseAnalysis[5], planets.Jupiter, planets, ascendant
    );
    
    // In-Laws Analysis
    marriageAnalysis.inLaws = analyzeDetailedInLawsRelationship(
        seventhHouse, seventhLordPosition, planets
    );
    
    // Separation/Divorce Analysis
    marriageAnalysis.separationDivorce = analyzeDetailedSeparationRisk(
        seventhHouse, seventhLordPosition, venus, mars, planets
    );
    
    // Second Marriage Analysis
    marriageAnalysis.secondMarriage = analyzeDetailedSecondMarriage(
        seventhHouse, planets, houseAnalysis
    );
    
    // Marriage Remedies
    marriageAnalysis.marriageRemedies = generateAdvancedMarriageRemedies(
        seventhHouse, seventhLordPosition, venus, jupiter, mangalDosha
    );
    
    // Lucky Factors
    marriageAnalysis.luckyFactors = generateDetailedMarriageLuckyFactors(
        seventhLordPosition, venus, jupiter, ascendant
    );
    
    // Amazing Predictions
    marriageAnalysis.amazingPredictions = generateAmazingMarriagePredictions(
        seventhHouse, seventhLordPosition, venus, jupiter, age, nameAnalysis, mangalDosha
    );
    
    return marriageAnalysis;
}

/**
 * Analyze Amazing Marriage Prospects
 */
function analyzeAmazingMarriageProspects(seventhHouse, seventhLordPosition, venus, jupiter, age, mangalDosha, nameAnalysis) {
    const prospects = {
        likelihood: '',
        timing: {
            bestPeriods: [],
            avoidPeriods: [],
            ageRange: '',
            specificYears: []
        },
        circumstances: '',
        meetingStory: ''
    };
    
    // Calculate detailed marriage likelihood
    let marriageLikelihood = 70; // Base likelihood
    let marriageQuality = 60; // Base quality
    
    // Analyze 7th house planets
    if (seventhHouse.planets.length > 0) {
        seventhHouse.planets.forEach(planet => {
            switch(planet.name) {
                case 'Jupiter':
                    marriageLikelihood += 20;
                    marriageQuality += 25;
                    break;
                case 'Venus':
                    marriageLikelihood += 15;
                    marriageQuality += 20;
                    break;
                case 'Moon':
                    marriageLikelihood += 10;
                    marriageQuality += 15;
                    break;
                case 'Sun':
                    marriageLikelihood += 5;
                    marriageQuality -= 5; // May create ego issues
                    break;
                case 'Mars':
                    marriageLikelihood -= 10;
                    marriageQuality -= 15; // May create conflicts
                    break;
                case 'Saturn':
                    marriageLikelihood -= 15;
                    marriageQuality += 10; // Delays but stable
                    break;
                case 'Rahu':
                    marriageLikelihood -= 5;
                    marriageQuality -= 20; // Unconventional but challenging
                    break;
                case 'Ketu':
                    marriageLikelihood -= 20;
                    marriageQuality -= 10; // Detachment issues
                    break;
            }
        });
    }
    
    // Venus strength analysis
    if (venus.strength > 80) {
        marriageLikelihood += 20;
        marriageQuality += 25;
    } else if (venus.strength < 40) {
        marriageLikelihood -= 15;
        marriageQuality -= 20;
    }
    
    // Jupiter strength analysis
    if (jupiter.strength > 80) {
        marriageLikelihood += 15;
        marriageQuality += 20;
    } else if (jupiter.strength < 40) {
        marriageLikelihood -= 10;
        marriageQuality -= 15;
    }
    
    // Mangal Dosha impact
    if (mangalDosha.present) {
        marriageLikelihood -= 25;
        marriageQuality -= 20;
        if (mangalDosha.severity === 'High') {
            marriageLikelihood -= 15;
            marriageQuality -= 15;
        }
    }
    
    // Name influence
    if (nameAnalysis) {
        if (nameAnalysis.overallScore > 80) {
            marriageLikelihood += 15;
            marriageQuality += 10;
        } else if (nameAnalysis.overallScore < 50) {
            marriageLikelihood -= 10;
            marriageQuality -= 5;
        }
    }
    
    // Age factor
    if (age < 20) {
        marriageLikelihood -= 20;
    } else if (age > 35) {
        marriageLikelihood -= 10;
        marriageQuality += 5; // More mature choices
    }
    
    // Generate likelihood description
    marriageLikelihood = Math.max(0, Math.min(100, marriageLikelihood));
    marriageQuality = Math.max(0, Math.min(100, marriageQuality));
    
    if (marriageLikelihood > 85) {
        prospects.likelihood = `Excellent (${marriageLikelihood}%) - Marriage is highly likely with exceptional happiness and compatibility`;
    } else if (marriageLikelihood > 70) {
        prospects.likelihood = `Very Good (${marriageLikelihood}%) - Strong prospects for a happy and fulfilling marriage`;
    } else if (marriageLikelihood > 55) {
        prospects.likelihood = `Good (${marriageLikelihood}%) - Marriage will happen with moderate happiness and some challenges to overcome`;
    } else if (marriageLikelihood > 40) {
        prospects.likelihood = `Moderate (${marriageLikelihood}%) - Marriage possible but requires effort and remedies for success`;
    } else {
        prospects.likelihood = `Challenging (${marriageLikelihood}%) - Significant obstacles to overcome, strong remedies recommended`;
    }
    
    // Marriage timing analysis
    prospects.timing = analyzeDetailedMarriageTiming(
        seventhLordPosition, venus, jupiter, age, mangalDosha
    );
    
    // Meeting circumstances
    prospects.circumstances = analyzeDetailedMarriageCircumstances(
        seventhHouse, seventhLordPosition, venus, jupiter
    );
    
    // Meeting story prediction
    prospects.meetingStory = generateMeetingStoryPrediction(
        seventhHouse, seventhLordPosition, venus, jupiter, planets
    );
    
    return prospects;
}

/**
 * Generate Amazing Spouse Characteristics
 */
function analyzeAmazingSpouseCharacteristics(seventhHouse, seventhLordPosition, venus, jupiter, planets, ascendant) {
    const characteristics = {
        physicalAppearance: {
            height: '',
            complexion: '',
            build: '',
            features: '',
            style: '',
            attractiveness: ''
        },
        personality: {
            nature: '',
            temperament: '',
            intelligence: '',
            interests: [],
            strengths: [],
            weaknesses: [],
            communication: '',
            socialNature: ''
        },
        background: {
            family: '',
            education: '',
            profession: [],
            socialStatus: '',
            financialStatus: '',
            culturalBackground: '',
            location: ''
        },
        compatibility: {
            emotional: 0,
            intellectual: 0,
            physical: 0,
            spiritual: 0,
            overall: 0,
            analysis: ''
        }
    };
    
    // Physical appearance analysis
    characteristics.physicalAppearance = analyzeDetailedSpouseAppearance(
        seventhLordPosition, venus, seventhHouse, jupiter
    );
    
    // Personality analysis
    characteristics.personality = analyzeDetailedSpousePersonality(
        seventhLordPosition, venus, jupiter, planets, seventhHouse
    );
    
    // Background analysis
    characteristics.background = analyzeDetailedSpouseBackground(
        seventhHouse, seventhLordPosition, venus, jupiter, planets
    );
    
    // Compatibility analysis
    characteristics.compatibility = analyzeDetailedSpouseCompatibility(
        planets, ascendant, venus, jupiter, seventhLordPosition
    );
    
    return characteristics;
}

/**
 * Generate Amazing Marriage Predictions
 */
function generateAmazingMarriagePredictions(seventhHouse, seventhLordPosition, venus, jupiter, age, nameAnalysis, mangalDosha) {
    const predictions = [];
    
    // Age-based marriage predictions
    if (age < 25) {
        predictions.push("Your life partner will enter your life when you least expect it, possibly through a social or professional connection that initially seems unrelated to romance.");
        predictions.push("The person you'll marry will have a significant impact on your career and life direction, opening doors you never imagined possible.");
    } else if (age >= 25 && age < 35) {
        predictions.push("Your marriage will happen during a period of major life transition, possibly involving a career change or relocation that brings you closer to your destined partner.");
        predictions.push("Your spouse will complement your personality perfectly, possessing qualities that balance your natural tendencies and help you grow as a person.");
    } else {
        predictions.push("Your marriage, though later in life, will be deeply fulfilling and based on genuine understanding and shared life experiences.");
        predictions.push("Your partner will appreciate your maturity and life experience, creating a relationship built on mutual respect and deep emotional connection.");
    }
    
    // Venus-based predictions
    if (venus.strength > 70) {
        predictions.push("Your marriage will be blessed with genuine love, romance, and physical attraction that deepens over time.");
        predictions.push("Your spouse will be naturally attractive and have refined tastes, bringing beauty and harmony into your life.");
    } else if (venus.strength < 40) {
        predictions.push("While your marriage may start with practical considerations, love will grow gradually and become stronger with time.");
        predictions.push("Your relationship will teach you the true meaning of love beyond physical attraction, focusing on emotional and spiritual connection.");
    }
    
    // Jupiter-based predictions
    if (jupiter.strength > 70) {
        predictions.push("Your marriage will be blessed by divine grace, with your spouse being spiritually inclined and bringing wisdom into your life.");
        predictions.push("Your partner will be well-educated, possibly from a respected family, and will support your spiritual and intellectual growth.");
    }
    
    // 7th house planet predictions
    if (seventhHouse.planets.length > 0) {
        const mainPlanet = seventhHouse.planets[0];
        switch(mainPlanet.name) {
            case 'Jupiter':
                predictions.push("Your spouse will be like a teacher and guide in your life, helping you understand deeper truths and grow spiritually.");
                break;
            case 'Venus':
                predictions.push("Your marriage will be filled with romance, creativity, and artistic pursuits that you'll enjoy together.");
                break;
            case 'Mars':
                predictions.push("Your partner will be energetic and passionate, bringing excitement and adventure into your relationship.");
                break;
            case 'Mercury':
                predictions.push("Communication will be the strength of your marriage, with your spouse being intellectually stimulating and articulate.");
                break;
        }
    }
    
    // Mangal Dosha predictions
    if (mangalDosha.present) {
        predictions.push("Initial challenges in marriage will ultimately strengthen your bond, teaching both partners patience and understanding.");
        predictions.push("Your spouse will have the strength and wisdom to handle conflicts maturely, turning challenges into opportunities for growth.");
    }
    
    // Name-based predictions
    if (nameAnalysis && nameAnalysis.overallScore > 80) {
        predictions.push("Your name creates positive vibrations that will attract a highly compatible life partner who resonates with your energy.");
    }
    
    // Specific timing predictions
    predictions.push("A significant conversation or meeting in the next favorable planetary period will set the foundation for your future marriage.");
    predictions.push("Your spouse will recognize your unique qualities before you fully realize your own potential, helping you see yourself in a new light.");
    
    return predictions.slice(0, 10); // Return top 10 predictions
}

// Helper functions for detailed analysis
function getTenthHouseLord(ascendantSign) {
    const houseLords = {
        'Aries': 'Saturn', 'Taurus': 'Saturn', 'Gemini': 'Jupiter', 'Cancer': 'Mars',
        'Leo': 'Venus', 'Virgo': 'Mercury', 'Libra': 'Moon', 'Scorpio': 'Sun',
        'Sagittarius': 'Mercury', 'Capricorn': 'Venus', 'Aquarius': 'Mars', 'Pisces': 'Jupiter'
    };
    return houseLords[ascendantSign];
}

function getSeventhHouseLord(ascendantSign) {
    const houseLords = {
        'Aries': 'Venus', 'Taurus': 'Mars', 'Gemini': 'Jupiter', 'Cancer': 'Saturn',
        'Leo': 'Saturn', 'Virgo': 'Jupiter', 'Libra': 'Mars', 'Scorpio': 'Venus',
        'Sagittarius': 'Mercury', 'Capricorn': 'Moon', 'Aquarius': 'Sun', 'Pisces': 'Mercury'
    };
    return houseLords[ascendantSign];
}

function findAtmakaraka(planets) {
    let highestDegree = -1;
    let atmakaraka = null;
    
    const planetsToCheck = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
    
    planetsToCheck.forEach(planetName => {
        const planet = planets[planetName];
        const degree = parseFloat(planet.degree);
        
        if (degree > highestDegree) {
            highestDegree = degree;
            atmakaraka = {
                planet: planetName,
                degree: degree,
                sign: planet.sign,
                house: planet.house,
                strength: planet.strength
            };
        }
    });
    
    return atmakaraka;
}

function analyzeMangalDosha(mars, planets, ascendant) {
    const mangalDosha = {
        present: false,
        severity: 'None',
        houses: [],
        remedies: []
    };
    
    // Check Mars position in houses 1, 2, 4, 7, 8, 12 from ascendant, Moon, Venus
    const doshaHouses = [1, 2, 4, 7, 8, 12];
    
    if (doshaHouses.includes(mars.house)) {
        mangalDosha.present = true;
        mangalDosha.houses.push(`Ascendant ${mars.house}th house`);
    }
    
    // Check from Moon
    const moonHouse = planets.Moon.house;
    const marsFromMoon = ((mars.house - moonHouse + 12) % 12) || 12;
    if (doshaHouses.includes(marsFromMoon)) {
        mangalDosha.present = true;
        mangalDosha.houses.push(`Moon ${marsFromMoon}th house`);
    }
    
    // Check from Venus
    const venusHouse = planets.Venus.house;
    const marsFromVenus = ((mars.house - venusHouse + 12) % 12) || 12;
    if (doshaHouses.includes(marsFromVenus)) {
        mangalDosha.present = true;
        mangalDosha.houses.push(`Venus ${marsFromVenus}th house`);
    }
    
    // Determine severity
    if (mangalDosha.houses.length >= 2) {
        mangalDosha.severity = 'High';
    } else if (mangalDosha.houses.length === 1) {
        mangalDosha.severity = 'Medium';
    }
    
    return mangalDosha;
}

/**
 * Analyze Detailed Marriage Timing
 */
function analyzeDetailedMarriageTiming(seventhLordPosition, venus, jupiter, age, mangalDosha) {
    const timing = {
        bestPeriods: [],
        avoidPeriods: [],
        ageRange: '',
        specificYears: []
    };
    
    // Calculate best age range
    let idealStartAge = 23;
    let idealEndAge = 30;
    
    if (mangalDosha.present) {
        idealStartAge += 3;
        idealEndAge += 5;
    }
    
    if (venus.strength > 70) {
        idealStartAge -= 2;
        idealEndAge += 2;
    }
    
    if (jupiter.strength > 70) {
        idealStartAge -= 1;
        idealEndAge += 3;
    }
    
    timing.ageRange = `${idealStartAge}-${idealEndAge} years`;
    
    // Best periods based on planetary dashas
    timing.bestPeriods = [
        `Venus Mahadasha or Antardasha - Brings love and romantic opportunities`,
        `Jupiter periods - Brings wisdom-based partnerships and family blessings`,
        `7th lord periods - Activates marriage house directly`,
        `Strong Moon periods - Enhances emotional connections`
    ];
    
    // Periods to avoid
    timing.avoidPeriods = [
        `Saturn-Mars periods - May bring delays and conflicts`,
        `Rahu-Ketu periods - May bring unconventional or challenging situations`,
        `Debilitated planet periods - Weakens marriage prospects`
    ];
    
    // Specific years (next 10 years)
    const currentYear = new Date().getFullYear();
    for (let i = 1; i <= 10; i++) {
        const year = currentYear + i;
        const yearAnalysis = analyzeYearForMarriage(year, venus, jupiter, seventhLordPosition);
        if (yearAnalysis.favorable) {
            timing.specificYears.push({
                year: year,
                probability: yearAnalysis.probability,
                reason: yearAnalysis.reason
            });
        }
    }
    
    return timing;
}

/**
 * Analyze year for marriage prospects
 */
function analyzeYearForMarriage(year, venus, jupiter, seventhLordPosition) {
    // Simplified year analysis based on planetary cycles
    const yearNumber = year % 12; // 12-year Jupiter cycle
    let favorable = false;
    let probability = 0;
    let reason = '';
    
    // Jupiter favorable years
    if ([1, 5, 9].includes(yearNumber)) {
        favorable = true;
        probability = 70;
        reason = 'Jupiter favorable year for partnerships';
    }
    
    // Venus favorable years
    if ([2, 6, 7, 11].includes(yearNumber)) {
        favorable = true;
        probability = 65;
        reason = 'Venus favorable year for love and marriage';
    }
    
    // Adjust based on planet strengths
    if (venus.strength > 70) probability += 15;
    if (jupiter.strength > 70) probability += 10;
    
    return { favorable, probability, reason };
}

/**
 * Analyze Detailed Spouse Appearance
 */
function analyzeDetailedSpouseAppearance(seventhLordPosition, venus, seventhHouse, jupiter) {
    const appearance = {
        height: '',
        complexion: '',
        build: '',
        features: '',
        style: '',
        attractiveness: ''
    };
    
    // Height analysis
    if (jupiter.strength > 70 || seventhHouse.planets.some(p => p.name === 'Jupiter')) {
        appearance.height = 'Above average to tall height with an impressive presence';
    } else if (venus.strength > 70) {
        appearance.height = 'Medium to above average height with graceful proportions';
    } else {
        appearance.height = 'Medium height with well-proportioned body structure';
    }
    
    // Complexion analysis based on 7th lord sign
    const complexionBySign = {
        'Aries': 'Fair to wheatish complexion with a healthy glow',
        'Taurus': 'Beautiful, fair complexion with attractive features',
        'Gemini': 'Fair to medium complexion with youthful appearance',
        'Cancer': 'Fair complexion with soft, nurturing features',
        'Leo': 'Wheatish to fair complexion with royal bearing',
        'Virgo': 'Fair to medium complexion with refined features',
        'Libra': 'Very fair and beautiful complexion with symmetrical features',
        'Scorpio': 'Wheatish to dark complexion with magnetic appeal',
        'Sagittarius': 'Fair to wheatish complexion with athletic build',
        'Capricorn': 'Medium to dark complexion with strong bone structure',
        'Aquarius': 'Fair to medium complexion with unique features',
        'Pisces': 'Fair complexion with dreamy, attractive eyes'
    };
    
    appearance.complexion = complexionBySign[seventhLordPosition?.sign] || 'Pleasant complexion with attractive features';
    
    // Build analysis
    if (seventhHouse.planets.some(p => p.name === 'Mars')) {
        appearance.build = 'Athletic and strong build with good physical fitness';
    } else if (venus.strength > 70) {
        appearance.build = 'Well-proportioned, attractive build with natural grace';
    } else {
        appearance.build = 'Medium build with healthy and balanced physique';
    }
    
    // Features analysis
    if (venus.strength > 70) {
        appearance.features = 'Very attractive facial features with charming smile and expressive eyes';
    } else if (jupiter.strength > 70) {
        appearance.features = 'Pleasant, wise-looking features with kind and intelligent eyes';
    } else {
        appearance.features = 'Pleasant facial features with honest and sincere expression';
    }
    
    // Style analysis
    if (venus.strength > 70) {
        appearance.style = 'Excellent fashion sense with preference for beautiful and luxurious clothing';
    } else {
        appearance.style = 'Simple yet elegant style with preference for comfortable and appropriate clothing';
    }
    
    // Overall attractiveness
    const attractivenessScore = (venus.strength + jupiter.strength) / 2;
    if (attractivenessScore > 70) {
        appearance.attractiveness = 'Highly attractive with natural magnetism and charm';
    } else if (attractivenessScore > 50) {
        appearance.attractiveness = 'Pleasant and attractive with appealing personality';
    } else {
        appearance.attractiveness = 'Simple beauty with inner radiance and kind nature';
    }
    
    return appearance;
}

/**
 * Analyze Detailed Spouse Personality
 */
function analyzeDetailedSpousePersonality(seventhLordPosition, venus, jupiter, planets, seventhHouse) {
    const personality = {
        nature: '',
        temperament: '',
        intelligence: '',
        interests: [],
        strengths: [],
        weaknesses: [],
        communication: '',
        socialNature: ''
    };
    
    // Nature analysis based on 7th lord
    const planetNatures = {
        'Sun': 'Confident, authoritative, and leadership-oriented with strong principles',
        'Moon': 'Emotional, nurturing, and intuitive with caring and sensitive nature',
        'Mars': 'Energetic, passionate, and courageous with direct and honest approach',
        'Mercury': 'Intelligent, communicative, and adaptable with quick wit and humor',
        'Jupiter': 'Wise, spiritual, and generous with philosophical and teaching nature',
        'Venus': 'Artistic, romantic, and harmonious with love for beauty and luxury',
        'Saturn': 'Disciplined, responsible, and practical with strong work ethic'
    };
    
    const seventhLordPlanet = getTenthLordPlanet(seventhLordPosition?.sign);
    personality.nature = planetNatures[seventhLordPlanet] || 'Balanced and harmonious nature';
    
    // Temperament analysis
    if (seventhHouse.planets.some(p => ['Mars', 'Sun'].includes(p.name))) {
        personality.temperament = 'Strong-willed and decisive, may be quick-tempered but passionate';
    } else if (seventhHouse.planets.some(p => ['Venus', 'Moon'].includes(p.name))) {
        personality.temperament = 'Gentle, emotional, and peace-loving with diplomatic approach';
    } else if (seventhHouse.planets.some(p => p.name === 'Jupiter')) {
        personality.temperament = 'Calm, wise, and patient with philosophical approach to life';
    } else {
        personality.temperament = 'Balanced temperament with ability to adapt to different situations';
    }
    
    // Intelligence analysis
    if (planets.Mercury.strength > 70 || seventhHouse.planets.some(p => p.name === 'Mercury')) {
        personality.intelligence = 'Highly intelligent with excellent analytical and communication skills';
    } else if (jupiter.strength > 70) {
        personality.intelligence = 'Wise and knowledgeable with deep understanding of life principles';
    } else {
        personality.intelligence = 'Good intelligence with practical wisdom and common sense';
    }
    
    // Interests based on strongest influences
    personality.interests = generateSpouseInterests(seventhHouse, venus, jupiter, planets);
    
    // Strengths and weaknesses
    personality.strengths = generateSpouseStrengths(seventhLordPosition, venus, jupiter);
    personality.weaknesses = generateSpouseWeaknesses(seventhLordPosition, venus, jupiter);
    
    // Communication style
    if (planets.Mercury.strength > 70) {
        personality.communication = 'Excellent communicator with ability to express thoughts clearly and persuasively';
    } else if (venus.strength > 70) {
        personality.communication = 'Diplomatic and charming communication style with ability to resolve conflicts';
    } else {
        personality.communication = 'Honest and straightforward communication with sincere expression';
    }
    
    // Social nature
    if (venus.strength > 70) {
        personality.socialNature = 'Socially popular with wide circle of friends and excellent networking abilities';
    } else if (jupiter.strength > 70) {
        personality.socialNature = 'Respected in social circles with preference for meaningful relationships';
    } else {
        personality.socialNature = 'Selective social circle with preference for close, trusted relationships';
    }
    
    return personality;
}

/**
 * Generate spouse interests
 */
function generateSpouseInterests(seventhHouse, venus, jupiter, planets) {
    const interests = [];
    
    if (venus.strength > 70) {
        interests.push('Arts and creativity', 'Music and dance', 'Fashion and beauty', 'Luxury and comfort');
    }
    
    if (jupiter.strength > 70) {
        interests.push('Spirituality and philosophy', 'Education and learning', 'Travel and exploration', 'Teaching and guidance');
    }
    
    if (planets.Mercury.strength > 70) {
        interests.push('Reading and writing', 'Technology and innovation', 'Business and commerce', 'Communication and media');
    }
    
    if (planets.Mars.strength > 70) {
        interests.push('Sports and fitness', 'Adventure and competition', 'Real estate and property', 'Leadership activities');
    }
    
    seventhHouse.planets.forEach(planet => {
        switch(planet.name) {
            case 'Sun':
                interests.push('Leadership and authority', 'Government and politics', 'Health and wellness');
                break;
            case 'Moon':
                interests.push('Psychology and emotions', 'Home and family', 'Hospitality and care');
                break;
            case 'Saturn':
                interests.push('Social service', 'Discipline and order', 'Long-term planning');
                break;
        }
    });
    
    return [...new Set(interests)].slice(0, 8);
}

/**
 * Generate spouse strengths
 */
function generateSpouseStrengths(seventhLordPosition, venus, jupiter) {
    const strengths = [];
    
    if (venus.strength > 70) {
        strengths.push('Natural charm and attractiveness');
        strengths.push('Artistic and creative abilities');
        strengths.push('Diplomatic and harmonious nature');
    }
    
    if (jupiter.strength > 70) {
        strengths.push('Wisdom and good judgment');
        strengths.push('Spiritual and philosophical understanding');
        strengths.push('Generous and kind-hearted nature');
    }
    
    // Add based on 7th lord strength
    if (seventhLordPosition?.strength > 70) {
        strengths.push('Strong personality and character');
        strengths.push('Ability to provide stability and support');
        strengths.push('Natural problem-solving abilities');
    }
    
    return strengths;
}

/**
 * Generate spouse weaknesses
 */
function generateSpouseWeaknesses(seventhLordPosition, venus, jupiter) {
    const weaknesses = [];
    
    if (venus.strength < 40) {
        weaknesses.push('May struggle with expressing emotions');
        weaknesses.push('Tendency to be materialistic');
    }
    
    if (jupiter.strength < 40) {
        weaknesses.push('May lack long-term vision');
        weaknesses.push('Tendency to be overly practical');
    }
    
    if (seventhLordPosition?.strength < 40) {
        weaknesses.push('May need support in decision-making');
        weaknesses.push('Tendency to avoid responsibilities');
    }
    
    return weaknesses;
}

/**
 * Generate Meeting Story Prediction
 */
function generateMeetingStoryPrediction(seventhHouse, seventhLordPosition, venus, jupiter, planets) {
    let story = "Your destined meeting will unfold in an unexpected yet meaningful way. ";
    
    // Based on 7th house planets
    if (seventhHouse.planets.length > 0) {
        const mainPlanet = seventhHouse.planets[0];
        switch(mainPlanet.name) {
            case 'Jupiter':
                story += "You'll meet through educational, religious, or spiritual settings. Perhaps at a temple, educational institution, or through a wise mutual friend who sees your compatibility. ";
                break;
            case 'Venus':
                story += "Your meeting will be romantic and beautiful, possibly at a cultural event, wedding, or artistic gathering. There will be instant attraction and charm. ";
                break;
            case 'Mercury':
                story += "Communication will be the bridge that brings you together - perhaps through social media, writing, or a conversation that reveals deep compatibility. ";
                break;
            case 'Mars':
                story += "Your meeting will be dynamic and energetic, possibly through sports, competition, or a situation requiring courage and quick action. ";
                break;
            case 'Moon':
                story += "Emotions and intuition will guide your meeting, possibly through family connections or in a nurturing, caring environment. ";
                break;
            case 'Saturn':
                story += "Your meeting will be through work, professional settings, or older family members who recognize your compatibility. ";
                break;
        }
    } else {
        story += "Your meeting will happen through the influence of your 7th lord, creating a destined encounter that feels both natural and meaningful. ";
    }
    
    // Add Venus influence
    if (venus.strength > 70) {
        story += "The attraction will be immediate and mutual, with both of you recognizing something special in each other from the very first meeting. ";
    }
    
    // Add Jupiter influence  
    if (jupiter.strength > 70) {
        story += "Your families will approve of the match, and there will be a sense of divine blessing surrounding your union. ";
    }
    
    story += "This meeting will happen when you're both ready for a serious commitment and will mark the beginning of a beautiful journey together.";
    
    return story;
}

/**
 * Analyze Career Phases with Specific Timing
 */
function analyzeDetailedCareerPhases(planets, age, tenthLordPosition) {
    const phases = {
        earlyCareer: '',
        midCareer: '',
        lateCareer: ''
    };
    
    // Early Career (22-35)
    if (age < 35) {
        phases.earlyCareer = `Your early career phase (ages 22-35) will be marked by rapid learning and skill development. `;
        
        if (planets.Mercury.strength > 70) {
            phases.earlyCareer += `Your communication skills and adaptability will be your greatest assets, leading to quick promotions and recognition. `;
        }
        
        if (planets.Mars.strength > 70) {
            phases.earlyCareer += `Your energy and competitive spirit will help you stand out among peers and take on challenging assignments. `;
        }
        
        phases.earlyCareer += `A significant career breakthrough will occur around age ${Math.min(35, age + 3)}, setting the foundation for your future success.`;
    }
    
    // Mid Career (35-50)
    phases.midCareer = `Your mid-career phase (ages 35-50) will be your peak earning and leadership period. `;
    
    if (planets.Sun.strength > 70) {
        phases.midCareer += `You'll naturally move into leadership positions, with authority and respect from colleagues and subordinates. `;
    }
    
    if (planets.Jupiter.strength > 70) {
        phases.midCareer += `Your wisdom and guidance will be sought after, leading to advisory roles and mentoring opportunities. `;
    }
    
    phases.midCareer += `This period will establish your reputation and create the financial security for your later years.`;
    
    // Late Career (50+)
    phases.lateCareer = `Your late career phase (ages 50+) will focus on legacy building and knowledge sharing. `;
    
    if (planets.Saturn.strength > 70) {
        phases.lateCareer += `Your experience and discipline will be highly valued, leading to consulting opportunities and board positions. `;
    }
    
    phases.lateCareer += `You'll be recognized as an expert in your field, with opportunities to write, speak, and influence the next generation.`;
    
    return phases;
}

/**
 * Analyze Business vs Job in Detail
 */
function analyzeBusinessVsJobDetailed(planets, houseAnalysis, ascendant) {
    const analysis = {
        recommendation: '',
        analysis: '',
        timing: ''
    };
    
    let businessScore = 0;
    let jobScore = 0;
    
    // Analyze Mars (courage for business)
    if (planets.Mars.strength > 70) businessScore += 20;
    if (planets.Mars.house === 10) businessScore += 15;
    
    // Analyze Sun (authority)
    if (planets.Sun.strength > 70) businessScore += 15;
    if (planets.Sun.house === 1 || planets.Sun.house === 10) businessScore += 10;
    
    // Analyze Jupiter (wisdom for business)
    if (planets.Jupiter.strength > 70) businessScore += 10;
    
    // Analyze Saturn (job stability)
    if (planets.Saturn.strength > 70) jobScore += 20;
    if (planets.Saturn.house === 10) jobScore += 15;
    
    // Analyze Mercury (business acumen)
    if (planets.Mercury.strength > 70) businessScore += 15;
    
    // 2nd house (wealth) analysis
    const secondHouse = houseAnalysis[2];
    if (secondHouse.planets.some(p => ['Jupiter', 'Venus', 'Mercury'].includes(p.name))) {
        businessScore += 10;
    }
    
    // 11th house (gains) analysis
    const eleventhHouse = houseAnalysis[11];
    if (eleventhHouse.planets.some(p => ['Jupiter', 'Venus', 'Mercury'].includes(p.name))) {
        businessScore += 15;
    }
    
    if (businessScore > jobScore + 15) {
        analysis.recommendation = 'Business/Entrepreneurship';
        analysis.analysis = `Your planetary combinations strongly favor business and entrepreneurship. You have the courage, vision, and leadership qualities needed for independent ventures.`;
        analysis.timing = `Best time to start business: During favorable Mars, Sun, or Jupiter periods when your confidence and energy are at peak.`;
    } else if (jobScore > businessScore + 15) {
        analysis.recommendation = 'Job/Service';
        analysis.analysis = `Your planetary combinations favor stable employment and service. You'll excel in structured environments with clear hierarchies and defined responsibilities.`;
        analysis.timing = `Focus on securing stable employment during Saturn or Jupiter periods when opportunities for long-term positions arise.`;
    } else {
        analysis.recommendation = 'Both (Start with Job, then Business)';
        analysis.analysis = `Your chart shows potential for both paths. Start with employment to gain experience and financial stability, then transition to business when planetary periods are favorable.`;
        analysis.timing = `Begin with job during Saturn periods, transition to business during Mars or Sun periods.`;
    }
    
    return analysis;
}

/**
 * Generate Advanced Career Remedies
 */
function generateAdvancedCareerRemedies(planets, tenthHouse, tenthLordPosition) {
    const remedies = {
        immediate: [],
        longTerm: [],
        specific: [],
        gemstones: [],
        mantras: [],
        charitable: [],
        lifestyle: []
    };
    
    // Immediate remedies
    remedies.immediate = [
        'Face East while working for enhanced Sun energy and leadership',
        'Keep a small plant on your work desk for positive energy',
        'Wear colors that enhance your strongest career planet',
        'Start important work during favorable planetary hours'
    ];
    
    // Long-term remedies
    remedies.longTerm = [
        'Establish a consistent morning routine with meditation',
        'Practice gratitude for current work opportunities',
        'Develop skills related to your strongest planetary influences',
        'Build relationships with mentors and guides'
    ];
    
    // Specific planetary remedies
    if (tenthHouse.planets.length > 0) {
        const mainPlanet = tenthHouse.planets[0];
        remedies.specific.push(`Strengthen ${mainPlanet.name} through specific remedies for career enhancement`);
    }
    
    if (tenthLordPosition?.strength < 50) {
        remedies.specific.push(`Strengthen your 10th lord through targeted remedies and worship`);
    }
    
    // Gemstone recommendations
    remedies.gemstones = [
        'Yellow Sapphire for Jupiter (wisdom and guidance)',
        'Ruby for Sun (leadership and authority)',
        'Emerald for Mercury (communication and business)'
    ];
    
    // Mantra recommendations
    remedies.mantras = [
        'Om Gram Greem Groum Sah Gurave Namaha (Jupiter mantra for career wisdom)',
        'Om Hram Hreem Hroum Sah Suryaya Namaha (Sun mantra for career success)',
        'Ganesha mantras for removing career obstacles'
    ];
    
    // Charitable activities
    remedies.charitable = [
        'Donate to educational institutions on Thursdays',
        'Feed hungry people on Sundays',
        'Support skill development programs for underprivileged'
    ];
    
    // Lifestyle recommendations
    remedies.lifestyle = [
        'Wake up before sunrise for enhanced Sun energy',
        'Practice yoga and meditation for mental clarity',
        'Maintain ethical standards in all professional dealings',
        'Continuously upgrade skills and knowledge'
    ];
    
    return remedies;
}

/**
 * Helper function to get 10th lord planet
 */
function getTenthLordPlanet(ascendantSign) {
    const lordPlanets = {
        'Aries': 'Saturn', 'Taurus': 'Saturn', 'Gemini': 'Jupiter', 'Cancer': 'Mars',
        'Leo': 'Venus', 'Virgo': 'Mercury', 'Libra': 'Moon', 'Scorpio': 'Sun',
        'Sagittarius': 'Mercury', 'Capricorn': 'Venus', 'Aquarius': 'Mars', 'Pisces': 'Jupiter'
    };
    return lordPlanets[ascendantSign];
}

/**
 * Analyze Mangal Dosha (Mars affliction)
 */
function analyzeMangalDosha(mars, planets, ascendant) {
    const mangalDosha = {
        present: false,
        severity: 'None',
        houses: [],
        remedies: [],
        cancellation: false
    };
    
    // Check Mars position in houses 1, 2, 4, 7, 8, 12 from ascendant, Moon, Venus
    const doshaHouses = [1, 2, 4, 7, 8, 12];
    
    // From Ascendant (Lagna)
    if (doshaHouses.includes(mars.house)) {
        mangalDosha.present = true;
        mangalDosha.houses.push(`Lagna ${mars.house}th house`);
    }
    
    // From Moon
    const moonHouse = planets.Moon.house;
    const marsFromMoon = ((mars.house - moonHouse + 12) % 12) || 12;
    if (doshaHouses.includes(marsFromMoon)) {
        mangalDosha.present = true;
        mangalDosha.houses.push(`Moon ${marsFromMoon}th house`);
    }
    
    // From Venus
    const venusHouse = planets.Venus.house;
    const marsFromVenus = ((mars.house - venusHouse + 12) % 12) || 12;
    if (doshaHouses.includes(marsFromVenus)) {
        mangalDosha.present = true;
        mangalDosha.houses.push(`Venus ${marsFromVenus}th house`);
    }
    
    // Determine severity
    if (mangalDosha.houses.length >= 3) {
        mangalDosha.severity = 'High';
    } else if (mangalDosha.houses.length === 2) {
        mangalDosha.severity = 'Medium';
    } else if (mangalDosha.houses.length === 1) {
        mangalDosha.severity = 'Low';
    }
    
    // Check for cancellations
    mangalDosha.cancellation = checkMangalDoshaCancellation(mars, planets, ascendant);
    
    // Generate remedies if present
    if (mangalDosha.present && !mangalDosha.cancellation) {
        mangalDosha.remedies = [
            'Worship Lord Hanuman on Tuesdays',
            'Chant Hanuman Chalisa daily',
            'Donate red lentils and jaggery on Tuesdays',
            'Fast on Tuesdays',
            'Wear red coral gemstone after consultation',
            'Perform Mangal Shanti Puja',
            'Visit Hanuman temple regularly'
        ];
    }
    
    return mangalDosha;
}

/**
 * Check for Mangal Dosha cancellation
 */
function checkMangalDoshaCancellation(mars, planets, ascendant) {
    // Mars in own sign or exaltation
    if (mars.sign === 'Aries' || mars.sign === 'Scorpio' || mars.sign === 'Capricorn') {
        return true;
    }
    
    // Mars with benefic planets
    const benefics = ['Jupiter', 'Venus', 'Moon'];
    const marsConjunctions = mars.conjunctions || [];
    if (marsConjunctions.some(conj => benefics.includes(conj.planet))) {
        return true;
    }
    
    // Both partners having Mangal Dosha
    // This would be checked during compatibility analysis
    
    return false;
}

/**
 * Generate missing helper functions for career analysis
 */
function generateCareerTiming(bhagyank, mulank, age) {
    return {
        earlyCareer: `Ages 22-35: Foundation building with ${bhagyank} life path energy developing`,
        peakCareer: `Ages 35-50: Peak achievement period with ${mulank} personality traits shining`,
        laterCareer: `Ages 50+: Wisdom sharing and mentoring phase with accumulated experience`
    };
}

function generateIncomePattern(bhagyank, mulank, nameNumber) {
    const patterns = {
        1: 'Leadership-based income with authority bonuses',
        2: 'Steady partnership-based income with collaborative gains',
        3: 'Creative and communication-based income with artistic rewards',
        4: 'Systematic income growth with foundation-building approach',
        5: 'Variable income with multiple streams and adventurous gains',
        6: 'Service-based income with nurturing and healing rewards',
        7: 'Wisdom-based income with research and analysis rewards',
        8: 'Business and authority-based income with material success',
        9: 'Humanitarian income with service-based rewards'
    };
    
    return patterns[bhagyank] || 'Unique income pattern based on personal talents';
}

function generateWorkEnvironment(mulank, nameNumber) {
    const environments = {
        1: 'Leadership positions in dynamic, fast-paced environments',
        2: 'Collaborative, harmonious workplaces with team focus',
        3: 'Creative, expressive environments with artistic freedom',
        4: 'Structured, organized workplaces with clear systems',
        5: 'Flexible, varied environments with travel opportunities',
        6: 'Caring, service-oriented environments helping others',
        7: 'Quiet, research-focused environments for deep thinking',
        8: 'Corporate, business environments with authority structures',
        9: 'Humanitarian, service environments with global impact'
    };
    
    return environments[mulank] || 'Adaptable to various work environments';
}

function generatePositiveCareerRecommendations(bhagyank, mulank, nameNumber) {
    return [
        `Embrace your ${bhagyank} life path by pursuing careers that align with your soul purpose`,
        `Use your ${mulank} personality strengths to excel in your chosen field`,
        `Leverage your ${nameNumber} name energy to attract career opportunities`,
        'Network with people who share your values and vision',
        'Continuously develop skills that enhance your natural talents',
        'Trust your intuition when making important career decisions',
        'Maintain positive relationships with colleagues and mentors',
        'Stay open to unexpected opportunities that align with your purpose'
    ];
}

/**
 * Generate missing helper functions for relationship analysis
 */
function generateRelationshipStrengths(bhagyank, mulank, nameNumber) {
    const strengths = [];
    
    const bhagyankStrengths = {
        1: 'Natural leadership in relationships',
        2: 'Exceptional cooperation and harmony',
        3: 'Creative expression and joyful communication',
        4: 'Stability and reliable partnership',
        5: 'Adventure and excitement in relationships',
        6: 'Nurturing and caring partnership',
        7: 'Deep spiritual and intellectual connection',
        8: 'Strong commitment and material security',
        9: 'Wise and compassionate partnership'
    };
    
    strengths.push(bhagyankStrengths[bhagyank] || 'Unique relationship approach');
    
    return strengths;
}

function generateAttractionFactors(mulank, nameNumber) {
    const factors = [];
    
    const mulankFactors = {
        1: 'Your confident and independent nature',
        2: 'Your gentle and cooperative spirit',
        3: 'Your creative and expressive personality',
        4: 'Your reliable and stable character',
        5: 'Your adventurous and dynamic energy',
        6: 'Your caring and nurturing heart',
        7: 'Your mysterious and wise aura',
        8: 'Your successful and authoritative presence',
        9: 'Your wise and humanitarian nature'
    };
    
    factors.push(mulankFactors[mulank] || 'Your unique personality');
    
    return factors;
}

function generateRelationshipTiming(bhagyank, mulank, age) {
    const bestAges = [];
    
    // Calculate favorable ages based on numbers
    const baseAge = 25;
    const bhagyankInfluence = bhagyank % 5;
    const mulankInfluence = mulank % 3;
    
    bestAges.push(`${baseAge + bhagyankInfluence}-${baseAge + bhagyankInfluence + 5} years`);
    
    return {
        bestAges: bestAges,
        favorablePeriods: [`${bhagyank} and ${mulank} number years`, 'Venus favorable periods'],
        meetingCircumstances: 'Through activities related to your life path and personality interests'
    };
}

function generateMarriageHappiness(bhagyank, mulank, nameNumber) {
    const happinessLevel = (bhagyank + mulank + nameNumber) % 4;
    
    const happiness = {
        0: 'Exceptional happiness with deep spiritual and emotional connection',
        1: 'Very high happiness with mutual growth and understanding',
        2: 'Good happiness with balanced partnership and shared goals',
        3: 'Moderate happiness with opportunities for growth and learning'
    };
    
    return happiness[happinessLevel] || 'Blessed marriage with divine harmony';
}

function generateFamilyLife(bhagyank, mulank, nameNumber) {
    return `Your family life will be blessed with ${getBhagyankStrength(bhagyank)} and ${getMulankStrength(mulank)}, creating a harmonious home environment filled with love, understanding, and mutual support.`;
}

function generatePositiveRelationshipAdvice(bhagyank, mulank, nameNumber) {
    return [
        `Express your ${bhagyank} life path energy in relationships for authentic connection`,
        `Use your ${mulank} personality gifts to create harmony and understanding`,
        `Let your ${nameNumber} name vibration attract compatible partners`,
        'Communicate openly and honestly about your dreams and aspirations',
        'Support your partner\'s growth while pursuing your own development',
        'Create shared goals and vision for your relationship',
        'Practice gratitude and appreciation for your partner\'s unique qualities',
        'Trust that the universe is bringing you the perfect person at the right time'
    ];
}

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

function generateNumerologyStrengths(bhagyank, mulank, nameNumber, loShuResult) {
    const strengths = [];
    
    strengths.push(`Life Path ${bhagyank}: ${getBhagyankStrength(bhagyank)}`);
    strengths.push(`Personality ${mulank}: ${getMulankStrength(mulank)}`);
    strengths.push(`Name Energy ${nameNumber}: Attracts ${nameNumber}-related opportunities`);
    
    // Add Lo Shu Grid strengths
    if (loShuResult.analysis.planes.mental > 0) {
        strengths.push('Strong mental abilities and thinking power');
    }
    if (loShuResult.analysis.planes.emotional > 0) {
        strengths.push('Excellent emotional intelligence and sensitivity');
    }
    if (loShuResult.analysis.planes.physical > 0) {
        strengths.push('Great practical skills and physical coordination');
    }
    
    return strengths;
}

function generateNumerologyFutureOpportunities(bhagyank, mulank, nameNumber, age) {
    const opportunities = [];
    
    opportunities.push(`Your ${bhagyank} life path will open doors to leadership and service opportunities`);
    opportunities.push(`Your ${mulank} personality will attract people who appreciate your unique gifts`);
    opportunities.push(`Your ${nameNumber} name vibration will bring recognition and success`);
    
    if (age < 30) {
        opportunities.push('Major life direction clarity coming in next 3-5 years');
    } else if (age < 50) {
        opportunities.push('Peak achievement period with maximum recognition and success');
    } else {
        opportunities.push('Wisdom-sharing opportunities that create lasting legacy');
    }
    
    return opportunities;
}

function generatePersonalSuccessFormula(bhagyank, mulank, nameNumber) {
    return `Your personal success formula: Combine your ${bhagyank} life path vision with your ${mulank} personality approach, amplified by your ${nameNumber} name energy. Focus on ${getBhagyankStrength(bhagyank)} while expressing ${getMulankStrength(mulank)} for maximum impact and fulfillment.`;
}

module.exports = {
    generateDeepCareerAnalysis,
    generateDeepMarriageAnalysis,
    analyzeDetailedMarriageTiming,
    generateMeetingStoryPrediction,
    analyzeDetailedSpouseAppearance,
    analyzeDetailedSpousePersonality,
    generateAdvancedCareerRemedies
};

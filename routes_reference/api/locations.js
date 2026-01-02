const express = require('express');
const router = express.Router();

// Comprehensive Indian cities database with coordinates for accurate Jyotish calculations
const INDIAN_CITIES = [
    // Major Metropolitan Cities
    { id: 1, name: 'Mumbai', state: 'Maharashtra', latitude: 19.0760, longitude: 72.8777, timezone: 'Asia/Kolkata' },
    { id: 2, name: 'Delhi', state: 'Delhi', latitude: 28.7041, longitude: 77.1025, timezone: 'Asia/Kolkata' },
    { id: 3, name: 'Bengaluru', state: 'Karnataka', latitude: 12.9716, longitude: 77.5946, timezone: 'Asia/Kolkata' },
    { id: 4, name: 'Hyderabad', state: 'Telangana', latitude: 17.3850, longitude: 78.4867, timezone: 'Asia/Kolkata' },
    { id: 5, name: 'Ahmedabad', state: 'Gujarat', latitude: 23.0225, longitude: 72.5714, timezone: 'Asia/Kolkata' },
    { id: 6, name: 'Chennai', state: 'Tamil Nadu', latitude: 13.0827, longitude: 80.2707, timezone: 'Asia/Kolkata' },
    { id: 7, name: 'Kolkata', state: 'West Bengal', latitude: 22.5726, longitude: 88.3639, timezone: 'Asia/Kolkata' },
    { id: 8, name: 'Surat', state: 'Gujarat', latitude: 21.1702, longitude: 72.8311, timezone: 'Asia/Kolkata' },
    { id: 9, name: 'Pune', state: 'Maharashtra', latitude: 18.5204, longitude: 73.8567, timezone: 'Asia/Kolkata' },
    { id: 10, name: 'Jaipur', state: 'Rajasthan', latitude: 26.9124, longitude: 75.7873, timezone: 'Asia/Kolkata' },

    // State Capitals
    { id: 11, name: 'Lucknow', state: 'Uttar Pradesh', latitude: 26.8467, longitude: 80.9462, timezone: 'Asia/Kolkata' },
    { id: 12, name: 'Kanpur', state: 'Uttar Pradesh', latitude: 26.4499, longitude: 80.3319, timezone: 'Asia/Kolkata' },
    { id: 13, name: 'Nagpur', state: 'Maharashtra', latitude: 21.1458, longitude: 79.0882, timezone: 'Asia/Kolkata' },
    { id: 14, name: 'Indore', state: 'Madhya Pradesh', latitude: 22.7196, longitude: 75.8577, timezone: 'Asia/Kolkata' },
    { id: 15, name: 'Thane', state: 'Maharashtra', latitude: 19.2183, longitude: 72.9781, timezone: 'Asia/Kolkata' },
    { id: 16, name: 'Bhopal', state: 'Madhya Pradesh', latitude: 23.2599, longitude: 77.4126, timezone: 'Asia/Kolkata' },
    { id: 17, name: 'Visakhapatnam', state: 'Andhra Pradesh', latitude: 17.6868, longitude: 83.2185, timezone: 'Asia/Kolkata' },
    { id: 18, name: 'Pimpri-Chinchwad', state: 'Maharashtra', latitude: 18.6298, longitude: 73.7997, timezone: 'Asia/Kolkata' },
    { id: 19, name: 'Patna', state: 'Bihar', latitude: 25.5941, longitude: 85.1376, timezone: 'Asia/Kolkata' },
    { id: 20, name: 'Vadodara', state: 'Gujarat', latitude: 22.3072, longitude: 73.1812, timezone: 'Asia/Kolkata' },

    // Important Religious Cities
    { id: 21, name: 'Varanasi', state: 'Uttar Pradesh', latitude: 25.3176, longitude: 82.9739, timezone: 'Asia/Kolkata' },
    { id: 22, name: 'Haridwar', state: 'Uttarakhand', latitude: 29.9457, longitude: 78.1642, timezone: 'Asia/Kolkata' },
    { id: 23, name: 'Rishikesh', state: 'Uttarakhand', latitude: 30.0869, longitude: 78.2676, timezone: 'Asia/Kolkata' },
    { id: 24, name: 'Mathura', state: 'Uttar Pradesh', latitude: 27.4924, longitude: 77.6737, timezone: 'Asia/Kolkata' },
    { id: 25, name: 'Vrindavan', state: 'Uttar Pradesh', latitude: 27.5820, longitude: 77.7064, timezone: 'Asia/Kolkata' },
    { id: 26, name: 'Ayodhya', state: 'Uttar Pradesh', latitude: 26.7922, longitude: 82.1998, timezone: 'Asia/Kolkata' },
    { id: 27, name: 'Tirupati', state: 'Andhra Pradesh', latitude: 13.6288, longitude: 79.4192, timezone: 'Asia/Kolkata' },
    { id: 28, name: 'Ujjain', state: 'Madhya Pradesh', latitude: 23.1765, longitude: 75.7885, timezone: 'Asia/Kolkata' },
    { id: 29, name: 'Nashik', state: 'Maharashtra', latitude: 19.9975, longitude: 73.7898, timezone: 'Asia/Kolkata' },
    { id: 30, name: 'Dwarka', state: 'Gujarat', latitude: 22.2394, longitude: 68.9678, timezone: 'Asia/Kolkata' },

    // Major Cities by State
    // Uttar Pradesh
    { id: 31, name: 'Agra', state: 'Uttar Pradesh', latitude: 27.1767, longitude: 78.0081, timezone: 'Asia/Kolkata' },
    { id: 32, name: 'Meerut', state: 'Uttar Pradesh', latitude: 28.9845, longitude: 77.7064, timezone: 'Asia/Kolkata' },
    { id: 33, name: 'Allahabad', state: 'Uttar Pradesh', latitude: 25.4358, longitude: 81.8463, timezone: 'Asia/Kolkata' },
    { id: 34, name: 'Bareilly', state: 'Uttar Pradesh', latitude: 28.3670, longitude: 79.4304, timezone: 'Asia/Kolkata' },
    { id: 35, name: 'Aligarh', state: 'Uttar Pradesh', latitude: 27.8974, longitude: 78.0880, timezone: 'Asia/Kolkata' },

    // Gujarat
    { id: 36, name: 'Rajkot', state: 'Gujarat', latitude: 22.3039, longitude: 70.8022, timezone: 'Asia/Kolkata' },
    { id: 37, name: 'Bhavnagar', state: 'Gujarat', latitude: 21.7645, longitude: 72.1519, timezone: 'Asia/Kolkata' },
    { id: 38, name: 'Jamnagar', state: 'Gujarat', latitude: 22.4707, longitude: 70.0577, timezone: 'Asia/Kolkata' },

    // Rajasthan
    { id: 39, name: 'Jodhpur', state: 'Rajasthan', latitude: 26.2389, longitude: 73.0243, timezone: 'Asia/Kolkata' },
    { id: 40, name: 'Udaipur', state: 'Rajasthan', latitude: 24.5854, longitude: 73.7125, timezone: 'Asia/Kolkata' },
    { id: 41, name: 'Kota', state: 'Rajasthan', latitude: 25.2138, longitude: 75.8648, timezone: 'Asia/Kolkata' },
    { id: 42, name: 'Bikaner', state: 'Rajasthan', latitude: 28.0229, longitude: 73.3119, timezone: 'Asia/Kolkata' },
    { id: 43, name: 'Ajmer', state: 'Rajasthan', latitude: 26.4499, longitude: 74.6399, timezone: 'Asia/Kolkata' },

    // Tamil Nadu
    { id: 44, name: 'Coimbatore', state: 'Tamil Nadu', latitude: 11.0168, longitude: 76.9558, timezone: 'Asia/Kolkata' },
    { id: 45, name: 'Madurai', state: 'Tamil Nadu', latitude: 9.9252, longitude: 78.1198, timezone: 'Asia/Kolkata' },
    { id: 46, name: 'Salem', state: 'Tamil Nadu', latitude: 11.6643, longitude: 78.1460, timezone: 'Asia/Kolkata' },
    { id: 47, name: 'Tiruchirappalli', state: 'Tamil Nadu', latitude: 10.7905, longitude: 78.7047, timezone: 'Asia/Kolkata' },

    // Karnataka
    { id: 48, name: 'Mysore', state: 'Karnataka', latitude: 12.2958, longitude: 76.6394, timezone: 'Asia/Kolkata' },
    { id: 49, name: 'Hubli', state: 'Karnataka', latitude: 15.3647, longitude: 75.1240, timezone: 'Asia/Kolkata' },
    { id: 50, name: 'Mangalore', state: 'Karnataka', latitude: 12.9141, longitude: 74.8560, timezone: 'Asia/Kolkata' },

    // Kerala
    { id: 51, name: 'Kochi', state: 'Kerala', latitude: 9.9312, longitude: 76.2673, timezone: 'Asia/Kolkata' },
    { id: 52, name: 'Thiruvananthapuram', state: 'Kerala', latitude: 8.5241, longitude: 76.9366, timezone: 'Asia/Kolkata' },
    { id: 53, name: 'Kozhikode', state: 'Kerala', latitude: 11.2588, longitude: 75.7804, timezone: 'Asia/Kolkata' },

    // West Bengal
    { id: 54, name: 'Howrah', state: 'West Bengal', latitude: 22.5958, longitude: 88.2636, timezone: 'Asia/Kolkata' },
    { id: 55, name: 'Durgapur', state: 'West Bengal', latitude: 23.4800, longitude: 87.3119, timezone: 'Asia/Kolkata' },
    { id: 56, name: 'Asansol', state: 'West Bengal', latitude: 23.6739, longitude: 86.9524, timezone: 'Asia/Kolkata' },

    // Punjab
    { id: 57, name: 'Ludhiana', state: 'Punjab', latitude: 30.9010, longitude: 75.8573, timezone: 'Asia/Kolkata' },
    { id: 58, name: 'Amritsar', state: 'Punjab', latitude: 31.6340, longitude: 74.8723, timezone: 'Asia/Kolkata' },
    { id: 59, name: 'Jalandhar', state: 'Punjab', latitude: 31.3260, longitude: 75.5762, timezone: 'Asia/Kolkata' },

    // Haryana
    { id: 60, name: 'Faridabad', state: 'Haryana', latitude: 28.4089, longitude: 77.3178, timezone: 'Asia/Kolkata' },
    { id: 61, name: 'Gurgaon', state: 'Haryana', latitude: 28.4595, longitude: 77.0266, timezone: 'Asia/Kolkata' },
    { id: 62, name: 'Panipat', state: 'Haryana', latitude: 29.3909, longitude: 76.9635, timezone: 'Asia/Kolkata' },

    // Odisha
    { id: 63, name: 'Bhubaneswar', state: 'Odisha', latitude: 20.2961, longitude: 85.8245, timezone: 'Asia/Kolkata' },
    { id: 64, name: 'Cuttack', state: 'Odisha', latitude: 20.4625, longitude: 85.8828, timezone: 'Asia/Kolkata' },

    // Jharkhand
    { id: 65, name: 'Ranchi', state: 'Jharkhand', latitude: 23.3441, longitude: 85.3096, timezone: 'Asia/Kolkata' },
    { id: 66, name: 'Dhanbad', state: 'Jharkhand', latitude: 23.7957, longitude: 86.4304, timezone: 'Asia/Kolkata' },

    // Assam
    { id: 67, name: 'Guwahati', state: 'Assam', latitude: 26.1445, longitude: 91.7362, timezone: 'Asia/Kolkata' },
    { id: 68, name: 'Dibrugarh', state: 'Assam', latitude: 27.4728, longitude: 94.9120, timezone: 'Asia/Kolkata' },

    // Uttarakhand
    { id: 69, name: 'Dehradun', state: 'Uttarakhand', latitude: 30.3165, longitude: 78.0322, timezone: 'Asia/Kolkata' },
    { id: 70, name: 'Nainital', state: 'Uttarakhand', latitude: 29.3803, longitude: 79.4636, timezone: 'Asia/Kolkata' },

    // Himachal Pradesh
    { id: 71, name: 'Shimla', state: 'Himachal Pradesh', latitude: 31.1048, longitude: 77.1734, timezone: 'Asia/Kolkata' },
    { id: 72, name: 'Manali', state: 'Himachal Pradesh', latitude: 32.2432, longitude: 77.1892, timezone: 'Asia/Kolkata' },

    // Jammu & Kashmir
    { id: 73, name: 'Jammu', state: 'Jammu & Kashmir', latitude: 32.7266, longitude: 74.8570, timezone: 'Asia/Kolkata' },
    { id: 74, name: 'Srinagar', state: 'Jammu & Kashmir', latitude: 34.0837, longitude: 74.7973, timezone: 'Asia/Kolkata' },

    // Madhya Pradesh
    { id: 75, name: 'Gwalior', state: 'Madhya Pradesh', latitude: 26.2183, longitude: 78.1828, timezone: 'Asia/Kolkata' },
    { id: 76, name: 'Jabalpur', state: 'Madhya Pradesh', latitude: 23.1815, longitude: 79.9864, timezone: 'Asia/Kolkata' },

    // Chhattisgarh
    { id: 77, name: 'Raipur', state: 'Chhattisgarh', latitude: 21.2514, longitude: 81.6296, timezone: 'Asia/Kolkata' },
    { id: 78, name: 'Bilaspur', state: 'Chhattisgarh', latitude: 22.0797, longitude: 82.1391, timezone: 'Asia/Kolkata' },

    // Andhra Pradesh
    { id: 79, name: 'Vijayawada', state: 'Andhra Pradesh', latitude: 16.5062, longitude: 80.6480, timezone: 'Asia/Kolkata' },
    { id: 80, name: 'Guntur', state: 'Andhra Pradesh', latitude: 16.3067, longitude: 80.4365, timezone: 'Asia/Kolkata' },

    // Union Territories
    { id: 81, name: 'Chandigarh', state: 'Chandigarh', latitude: 30.7333, longitude: 76.7794, timezone: 'Asia/Kolkata' },
    { id: 82, name: 'Pondicherry', state: 'Puducherry', latitude: 11.9416, longitude: 79.8083, timezone: 'Asia/Kolkata' },
    { id: 83, name: 'Port Blair', state: 'Andaman & Nicobar', latitude: 11.6234, longitude: 92.7265, timezone: 'Asia/Kolkata' },

    // International Cities (for NRIs)
    { id: 84, name: 'London', state: 'United Kingdom', latitude: 51.5074, longitude: -0.1278, timezone: 'Europe/London' },
    { id: 85, name: 'New York', state: 'United States', latitude: 40.7128, longitude: -74.0060, timezone: 'America/New_York' },
    { id: 86, name: 'Dubai', state: 'UAE', latitude: 25.2048, longitude: 55.2708, timezone: 'Asia/Dubai' },
    { id: 87, name: 'Singapore', state: 'Singapore', latitude: 1.3521, longitude: 103.8198, timezone: 'Asia/Singapore' },
    { id: 88, name: 'Toronto', state: 'Canada', latitude: 43.6532, longitude: -79.3832, timezone: 'America/Toronto' },
    { id: 89, name: 'Sydney', state: 'Australia', latitude: -33.8688, longitude: 151.2093, timezone: 'Australia/Sydney' },
    { id: 90, name: 'Los Angeles', state: 'United States', latitude: 34.0522, longitude: -118.2437, timezone: 'America/Los_Angeles' }
];

/**
 * Search cities by name or state
 */
router.get('/search', (req, res) => {
    try {
        const { query, limit = 10 } = req.query;
        
        if (!query || query.length < 2) {
            return res.status(400).json({
                success: false,
                error: 'Query must be at least 2 characters long'
            });
        }
        
        const searchTerm = query.toLowerCase();
        const results = INDIAN_CITIES
            .filter(city => 
                city.name.toLowerCase().includes(searchTerm) || 
                city.state.toLowerCase().includes(searchTerm)
            )
            .slice(0, parseInt(limit))
            .map(city => ({
                id: city.id,
                name: city.name,
                state: city.state,
                displayName: `${city.name}, ${city.state}`,
                coordinates: {
                    latitude: city.latitude,
                    longitude: city.longitude
                },
                timezone: city.timezone
            }));
        
        res.json({
            success: true,
            results,
            count: results.length,
            query: query
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Get city details by ID
 */
router.get('/city/:id', (req, res) => {
    try {
        const cityId = parseInt(req.params.id);
        const city = INDIAN_CITIES.find(c => c.id === cityId);
        
        if (!city) {
            return res.status(404).json({
                success: false,
                error: 'City not found'
            });
        }
        
        res.json({
            success: true,
            city: {
                id: city.id,
                name: city.name,
                state: city.state,
                displayName: `${city.name}, ${city.state}`,
                coordinates: {
                    latitude: city.latitude,
                    longitude: city.longitude
                },
                timezone: city.timezone
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Get popular cities (most commonly used for Jyotish)
 */
router.get('/popular', (req, res) => {
    try {
        const popularCities = INDIAN_CITIES
            .filter(city => [1, 2, 3, 4, 5, 6, 7, 10, 21, 22, 23, 24, 25, 26, 27, 28].includes(city.id))
            .map(city => ({
                id: city.id,
                name: city.name,
                state: city.state,
                displayName: `${city.name}, ${city.state}`,
                coordinates: {
                    latitude: city.latitude,
                    longitude: city.longitude
                },
                timezone: city.timezone,
                category: city.id <= 10 ? 'metro' : 'religious'
            }));
        
        res.json({
            success: true,
            cities: popularCities,
            count: popularCities.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Get all states
 */
router.get('/states', (req, res) => {
    try {
        const states = [...new Set(INDIAN_CITIES.map(city => city.state))]
            .sort()
            .map(state => ({
                name: state,
                cities: INDIAN_CITIES.filter(city => city.state === state).length
            }));
        
        res.json({
            success: true,
            states,
            count: states.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Get cities by state
 */
router.get('/state/:stateName', (req, res) => {
    try {
        const stateName = decodeURIComponent(req.params.stateName);
        const cities = INDIAN_CITIES
            .filter(city => city.state.toLowerCase() === stateName.toLowerCase())
            .map(city => ({
                id: city.id,
                name: city.name,
                state: city.state,
                displayName: `${city.name}, ${city.state}`,
                coordinates: {
                    latitude: city.latitude,
                    longitude: city.longitude
                },
                timezone: city.timezone
            }))
            .sort((a, b) => a.name.localeCompare(b.name));
        
        if (cities.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'State not found or no cities available'
            });
        }
        
        res.json({
            success: true,
            state: stateName,
            cities,
            count: cities.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Validate coordinates and suggest nearest city
 */
router.post('/nearest', (req, res) => {
    try {
        const { latitude, longitude } = req.body;
        
        if (!latitude || !longitude) {
            return res.status(400).json({
                success: false,
                error: 'Latitude and longitude are required'
            });
        }
        
        // Calculate distance using Haversine formula
        function calculateDistance(lat1, lon1, lat2, lon2) {
            const R = 6371; // Earth's radius in kilometers
            const dLat = (lat2 - lat1) * Math.PI / 180;
            const dLon = (lon2 - lon1) * Math.PI / 180;
            const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                      Math.sin(dLon/2) * Math.sin(dLon/2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            return R * c;
        }
        
        let nearestCity = null;
        let minDistance = Infinity;
        
        INDIAN_CITIES.forEach(city => {
            const distance = calculateDistance(
                parseFloat(latitude),
                parseFloat(longitude),
                city.latitude,
                city.longitude
            );
            
            if (distance < minDistance) {
                minDistance = distance;
                nearestCity = city;
            }
        });
        
        res.json({
            success: true,
            nearestCity: {
                id: nearestCity.id,
                name: nearestCity.name,
                state: nearestCity.state,
                displayName: `${nearestCity.name}, ${nearestCity.state}`,
                coordinates: {
                    latitude: nearestCity.latitude,
                    longitude: nearestCity.longitude
                },
                timezone: nearestCity.timezone,
                distance: Math.round(minDistance * 100) / 100 // Round to 2 decimal places
            },
            inputCoordinates: {
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Get location by ID (for internal use)
 */
function getLocationById(locationId) {
    const city = INDIAN_CITIES.find(c => c.id === parseInt(locationId));
    
    if (!city) {
        return null;
    }
    
    return {
        id: city.id,
        name: city.name,
        state: city.state,
        displayName: `${city.name}, ${city.state}`,
        coordinates: {
            latitude: city.latitude,
            longitude: city.longitude
        },
        timezone: city.timezone
    };
}

module.exports = {
    router,
    getLocationById
};

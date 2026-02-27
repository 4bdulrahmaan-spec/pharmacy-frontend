import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import CheckoutSteps from '../components/CheckoutSteps';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

const libraries = ['places'];
const mapContainerStyle = { width: '100%', height: '100%' };
const defaultCenter = { lat: 28.6139, lng: 77.2090 };

const Shipping = () => {
    const { shippingAddress, saveShippingAddress } = useStore();
    const navigate = useNavigate();

    const [address, setAddress] = useState({
        street: shippingAddress.street || '',
        city: shippingAddress.city || '',
        state: shippingAddress.state || '',
        zipCode: shippingAddress.zipCode || '',
        country: shippingAddress.country || '',
    });
    const [locating, setLocating] = useState(false);

    // Map State
    const [position, setPosition] = useState(defaultCenter); // Default to New Delhi or a central location

    const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries,
    });

    const submitHandler = (e) => {
        e.preventDefault();
        saveShippingAddress(address);
        navigate('/payment');
    };

    const handleChange = (e) => {
        setAddress({ ...address, [e.target.name]: e.target.value });
    };

    // Helper to fetch address from coordinates
    const fetchAddressFromCoords = (lat, lng) => {
        if (!window.google) return;
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            if (status === 'OK' && results[0]) {
                const addressComponents = results[0].address_components;
                let streetNumber = '', route = '', locality = '', sublocality = '', state = '', zip = '', ctry = '';

                addressComponents.forEach(component => {
                    const types = component.types;
                    if (types.includes('street_number')) streetNumber = component.long_name;
                    if (types.includes('route')) route = component.long_name;
                    if (types.includes('sublocality')) sublocality = component.long_name;
                    if (types.includes('locality')) locality = component.long_name;
                    if (types.includes('administrative_area_level_1')) state = component.long_name;
                    if (types.includes('postal_code')) zip = component.long_name;
                    if (types.includes('country')) ctry = component.long_name;
                });

                const street = `${streetNumber} ${route}`.trim() || sublocality || results[0].formatted_address.split(',')[0] || '';

                setAddress(prev => ({
                    ...prev,
                    street: street || prev.street,
                    city: locality || prev.city,
                    state: state || prev.state,
                    zipCode: zip || prev.zipCode,
                    country: ctry || prev.country
                }));
            } else {
                console.error("Geocoder failed due to:", status);
            }
        });
    };

    // Marker Drag Handler
    const onMarkerDragEnd = (e) => {
        const newLat = e.latLng.lat();
        const newLng = e.latLng.lng();
        setPosition({ lat: newLat, lng: newLng });
        fetchAddressFromCoords(newLat, newLng);
    };

    const getLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }
        setLocating(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    setPosition({ lat: latitude, lng: longitude });
                    fetchAddressFromCoords(latitude, longitude);
                } finally {
                    setLocating(false);
                }
            },
            (error) => {
                let msg = "Unable to retrieve your location";
                if (error.code === 1) msg = "Location permission denied. Please allow location access in your browser.";
                alert(msg);
                setLocating(false);
            }
        );
    };

    return (
        <div className="px-4 py-4 pb-20">
            <CheckoutSteps step1 step2 />

            <div className="bg-white dark:bg-gray-800 p-4 sm:p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 mt-6 sm:mt-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Shipping Address</h1>
                    <button
                        type="button"
                        onClick={getLocation}
                        disabled={locating}
                        className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 text-sm font-medium rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors w-full justify-center sm:w-auto"
                    >
                        {locating ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-blue-600 dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                Locating...
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                Use Current Location
                            </>
                        )}
                    </button>
                </div>

                <div className="flex flex-col gap-8">
                    {/* Left Side: Map */}
                    <div className="w-full h-64 sm:h-80 border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden z-0 relative">
                        {loadError && <div>Error loading maps widget. Did you configure VITE_GOOGLE_MAPS_API_KEY?</div>}
                        {!isLoaded && <div className="p-4">Loading Map...</div>}
                        {isLoaded && (
                            <GoogleMap
                                mapContainerStyle={mapContainerStyle}
                                zoom={15}
                                center={position}
                                options={{ disableDefaultUI: true, zoomControl: true }}
                            >
                                <Marker
                                    position={position}
                                    draggable={true}
                                    onDragEnd={onMarkerDragEnd}
                                />
                            </GoogleMap>
                        )}
                        <div className="absolute bottom-2 left-2 z-[1000] bg-white/90 dark:bg-gray-800/90 px-3 py-1.5 rounded-lg text-xs font-medium shadow-sm border border-gray-200 dark:border-gray-700 pointer-events-none text-gray-700 dark:text-gray-300">
                            Drag the marker to pinpoint your exact location
                        </div>
                    </div>

                    {/* Right Side: Form text fields */}
                    <form onSubmit={submitHandler} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Street Address</label>
                            <input
                                type="text"
                                name="street"
                                required
                                className="input-field"
                                value={address.street}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City</label>
                            <input
                                type="text"
                                name="city"
                                required
                                className="input-field"
                                value={address.city}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">State</label>
                            <input
                                type="text"
                                name="state"
                                required
                                className="input-field"
                                value={address.state}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Postal Code</label>
                            <input
                                type="text"
                                name="zipCode"
                                required
                                className="input-field"
                                value={address.zipCode}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Country</label>
                            <input
                                type="text"
                                name="country"
                                required
                                className="input-field"
                                value={address.country}
                                onChange={handleChange}
                            />
                        </div>

                        <button type="submit" className="w-full btn-primary py-3 text-lg">
                            Continue to Payment
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Shipping;

// System notifications
const notify = (msg, success = true) => {
    const existing = document.getElementById('kps-alert');
    if (existing) existing.remove();

    const alert = document.createElement('div');
    alert.id = 'kps-alert';
    alert.style.cssText = `
        position: fixed; bottom: 2rem; left: 50%; transform: translateX(-50%);
        background: ${success ? '#2ecc71' : '#e74c3c'}; color: white;
        padding: 1rem 2rem; border-radius: 8px; font-size: 1rem;
        font-family: 'Outfit', sans-serif; font-weight: 600;
        box-shadow: 0 4px 20px rgba(0,0,0,0.2); z-index: 10000;
        animation: fadeInUp 0.4s ease;
    `;
    alert.textContent = msg;
    document.body.appendChild(alert);
    setTimeout(() => alert.remove(), 4000);
};

// Alias used by feedback form
const showToast = (msg, success = true) => notify(msg, success);


const submitInquiry = async (data, button) => {
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';
    button.disabled = true;

    try {
        const response = await fetch('api/submit_inquiry.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            notify('✅ Enquiry sent successfully!');
            return true;
        } else {
            throw new Error('Server error');
        }
    } catch (error) {
        console.error("Submission error:", error);
        notify('❌ Connection error. Please try calling us.', false);
        return false;
    } finally {
        button.innerHTML = originalText;
        button.disabled = false;
    }
};


// Initialization and Event Listeners

document.addEventListener('DOMContentLoaded', () => {

    // Set default travel date to today

    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;
    const timeStr = `${hh}:${min}`;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tyyyy = tomorrow.getFullYear();
    const tmm = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const tdd = String(tomorrow.getDate()).padStart(2, '0');
    const tomorrowStr = `${tyyyy}-${tmm}-${tdd}`;

    // Auto-fill time and dates
    ['qb-time', 'mb-time'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = timeStr;
    });

    ['qb-date', 'mb-date', 'mb-end-date'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.value = todayStr;
            el.setAttribute('value', todayStr);
        }
    });

    // Navigation handling

    const navbar = document.getElementById('navbar');
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a');

    const updateActiveLink = () => {
        const path = window.location.pathname.split('/').pop() || 'index.html';
        const scrollPos = window.scrollY;

        // On index.html, use scrollspy
        if (path === 'index.html' || path === '') {
            let current = 'home';
            sections.forEach(section => {
                if (scrollPos >= (section.offsetTop - 250)) {
                    current = section.getAttribute('id');
                }
            });

            navLinks.forEach(a => {
                const href = a.getAttribute('href');
                a.classList.remove('active');
                if (href === `index.html#${current}` || href === `#${current}` || (current === 'home' && href === 'index.html')) {
                    a.classList.add('active');
                }
            });
        } else {
            // On sub-pages, highlight based on filename
            navLinks.forEach(a => {
                const href = a.getAttribute('href');
                a.classList.remove('active');
                if (href === path) {
                    a.classList.add('active');
                }
            });
        }
    };

    window.addEventListener('scroll', () => {
        if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 50);
        updateActiveLink();
    });
    updateActiveLink();

    // --- Mobile Menu Toggle ---
    const mobileMenuBtn = document.getElementById('mobile-menu');
    const navLinksList = document.getElementById('nav-links');

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinksList.classList.toggle('active');
            const icon = mobileMenuBtn.querySelector('i');
            if (navLinksList.classList.contains('active')) {
                icon.classList.replace('fa-bars', 'fa-xmark');
            } else {
                icon.classList.replace('fa-xmark', 'fa-bars');
            }
        });
    }

    // Close mobile menu on link click
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            if (navLinksList && navLinksList.classList.contains('active')) {
                navLinksList.classList.remove('active');
                if (mobileMenuBtn) {
                    mobileMenuBtn.querySelector('i').classList.replace('fa-xmark', 'fa-bars');
                }
            }
        });
    });

    // --- Scroll Reveals ---
    const reveals = document.querySelectorAll('.reveal');
    const revealOnScroll = () => {
        const windowHeight = window.innerHeight;
        reveals.forEach(reveal => {
            if (reveal.getBoundingClientRect().top < windowHeight - 100) {
                reveal.classList.add('active');
            }
        });
    };
    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll();

    // Legacy Smart Pre-selection removed: Native <a> href attributes now securely handle navigation to #home across pages.


    // --- ESTIMATE LOGIC (NOMINATIM + OSRM) ---
    const CAR_RATES = {
        'Sedan': {
            oneWay: 14,
            roundTrip: 13,
            minOneWay: 130,
            minRoundTrip: 250,
            driverAllowance: 400
        },
        'SUV': {
            oneWay: 19,
            roundTrip: 18,
            minOneWay: 130,
            minRoundTrip: 250,
            driverAllowance: 400
        },
        'MUV': {
            oneWay: 23,
            roundTrip: 21,
            minOneWay: 130,
            minRoundTrip: 250,
            driverAllowance: 400
        }
    };

    const getCoordinates = async (cityName) => {
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityName)}&limit=1`);
            const data = await res.json();
            if (data && data.length > 0) {
                return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
            }
            return null;
        } catch (e) {
            console.error("Geocoding error:", e);
            return null;
        }
    };

    const getDrivingDistance = async (lat1, lon1, lat2, lon2) => {
        try {
            const url = `https://router.project-osrm.org/route/v1/driving/${lon1.toFixed(6)},${lat1.toFixed(6)};${lon2.toFixed(6)},${lat2.toFixed(6)}?overview=false`;
            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                if (data && data.routes && data.routes.length > 0) {
                    return (data.routes[0].distance / 1000) * 1.05;
                }
            }
        } catch (e) {
            console.error("Routing error from OSRM:", e);
        }

        // Fallback
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c * 1.35;
    };

    // Calculate Distance and Fare
    const calculateEstimate = async (pickup, drop, carType, tripType, elements) => {
        if (!pickup || !drop || !carType) {
            elements.error.textContent = "Please fill in all details to get an estimate.";
            elements.error.style.display = 'block';
            return;
        }

        elements.btnEstimate.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Calculating...';
        elements.btnEstimate.disabled = true;
        elements.error.style.display = 'none';

        const pickupCoords = await getCoordinates(pickup);
        await new Promise(r => setTimeout(r, 600)); // Nominatim: 1 req/sec
        const dropCoords = await getCoordinates(drop);

        if (!pickupCoords || !dropCoords) {
            elements.btnEstimate.innerHTML = 'Get Estimate <i class="fa-solid fa-calculator"></i>';
            elements.btnEstimate.disabled = false;
            elements.error.textContent = "Could not locate one or both cities. Check spelling.";
            elements.error.style.display = 'block';
            return;
        }

        let distanceValue = await getDrivingDistance(pickupCoords.lat, pickupCoords.lon, dropCoords.lat, dropCoords.lon);

        // If it's a round trip, driving distance is technically double
        if (tripType === 'Round Trip') {
            distanceValue *= 2;
        }

        elements.btnEstimate.innerHTML = 'Get Estimate <i class="fa-solid fa-calculator"></i>';
        elements.btnEstimate.disabled = false;

        const rateProfile = CAR_RATES[carType];

        const daysGroup = document.getElementById('qb-days-group');
        let numDays = 1;
        if (daysGroup && daysGroup.style.display !== 'none') {
            const daysVal = document.getElementById('qb-days').value;
            numDays = parseInt(daysVal) || 1;
        }

        let fare = 0;
        let billableDistance = distanceValue;

        if (tripType === 'One Way') {
            billableDistance = Math.max(distanceValue, rateProfile.minOneWay);
            fare = (billableDistance * rateProfile.oneWay) + rateProfile.driverAllowance;
        } else {
            // Round Trip usually mandates min km per day
            billableDistance = Math.max(distanceValue, rateProfile.minRoundTrip * numDays);
            fare = (billableDistance * rateProfile.roundTrip) + (rateProfile.driverAllowance * numDays);
        }

        fare = Math.round(fare);

        elements.distance.textContent = Math.round(distanceValue) + ' km (' + tripType + ')';
        elements.fare.textContent = '₹' + fare.toLocaleString('en-IN') + ' *';
        elements.box.style.display = 'block';

        elements.btnEstimate.style.display = 'none';
        elements.btnConfirm.style.display = 'block';
    };

    // --- Quick Quote Form (Hero Section) ---
    const quickForm = document.getElementById('quick-booking-form');
    if (quickForm) {
        const els = {
            box: document.getElementById('qb-estimate-box'),
            distance: document.getElementById('qb-distance'),
            fare: document.getElementById('qb-fare'),
            error: document.getElementById('qb-error'),
            btnEstimate: document.getElementById('qb-btn-estimate'),
            btnConfirm: document.getElementById('qb-btn-confirm')
        };

        // Cache last computed raw distance (one-way km) for instant recalc
        let qbCachedRawKm = null;

        const qbRecalcFare = () => {
            if (qbCachedRawKm === null) return;
            const car = document.getElementById('qb-car').value;
            const tripType = document.querySelector('input[name="qb-trip-type"]:checked').value;
            if (!car) return;
            const rateProfile = CAR_RATES[car];
            let distanceValue = qbCachedRawKm;
            if (tripType === 'Round Trip') distanceValue *= 2;

            const daysGroup = document.getElementById('qb-days-group');
            let numDays = 1;
            if (daysGroup && daysGroup.style.display !== 'none') {
                const daysVal = document.getElementById('qb-days').value;
                numDays = parseInt(daysVal) || 1;
            }

            let billableDistance;
            let fare;

            if (tripType === 'One Way') {
                billableDistance = Math.max(distanceValue, rateProfile.minOneWay);
                fare = (billableDistance * rateProfile.oneWay) + rateProfile.driverAllowance;
            } else {
                billableDistance = Math.max(distanceValue, rateProfile.minRoundTrip * numDays);
                fare = (billableDistance * rateProfile.roundTrip) + (rateProfile.driverAllowance * numDays);
            }

            fare = Math.round(fare);
            els.distance.textContent = Math.round(distanceValue) + ' km (' + tripType + ')';
            els.fare.textContent = '\u20b9' + fare.toLocaleString('en-IN') + ' *';
        };

        els.btnEstimate.addEventListener('click', async () => {
            const pickup = document.getElementById('qb-pickup').value.trim();
            const drop = document.getElementById('qb-drop').value.trim();
            const car = document.getElementById('qb-car').value;
            const tripType = document.querySelector('input[name="qb-trip-type"]:checked').value;

            await calculateEstimate(pickup, drop, car, tripType, els);
            // Parse the displayed km back to store as raw one-way distance
            const kmText = els.distance.textContent;
            const km = parseInt(kmText);
            if (!isNaN(km)) {
                qbCachedRawKm = tripType === 'Round Trip' ? km / 2 : km;
            }
        });

        // Reset if city/date/time inputs change (need to re-fetch route)
        ['qb-pickup', 'qb-drop', 'qb-date', 'qb-end-date', 'qb-time'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('input', () => {
                    qbCachedRawKm = null;
                    els.box.style.display = 'none';
                    els.btnConfirm.style.display = 'none';
                    els.btnEstimate.style.display = 'block';
                    els.error.style.display = 'none';
                });
            }
        });

        // Car type change: instantly recalc fare if we already have a distance
        document.getElementById('qb-car').addEventListener('change', () => {
            if (qbCachedRawKm !== null && els.box.style.display !== 'none') {
                qbRecalcFare();
            } else {
                els.box.style.display = 'none';
                els.btnConfirm.style.display = 'none';
                els.btnEstimate.style.display = 'block';
                els.error.style.display = 'none';
            }
        });

        // Trip type change: instantly recalc fare if we already have a distance
        document.querySelectorAll('input[name="qb-trip-type"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                const isRound = e.target.value === 'Round Trip';
                const daysGroup = document.getElementById('qb-days-group');
                const endDateInput = document.getElementById('qb-end-date');
                if (daysGroup) daysGroup.style.display = isRound ? 'block' : 'none';
                if (endDateInput) {
                    endDateInput.disabled = !isRound;
                    if (!isRound) {
                        endDateInput.value = '';
                        endDateInput.type = 'text';
                    }
                }

                if (qbCachedRawKm !== null && els.box.style.display !== 'none') {
                    qbRecalcFare();
                } else {
                    els.box.style.display = 'none';
                    els.btnConfirm.style.display = 'none';
                    els.btnEstimate.style.display = 'block';
                    els.error.style.display = 'none';
                }
            });
        });

        // Days input change: instantly recalc fare
        document.getElementById('qb-days').addEventListener('input', () => {
            if (qbCachedRawKm !== null && els.box.style.display !== 'none') {
                qbRecalcFare();
            }
        });

        quickForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const tripType = document.querySelector('input[name="qb-trip-type"]:checked').value;
            let finalCar = document.getElementById('qb-car').value;
            let daysText = '';
            let dateText = `Date: ${document.getElementById('qb-date').value} ${document.getElementById('qb-time').value}`;
            
            if (tripType === 'Round Trip') {
                const days = parseInt(document.getElementById('qb-days').value) || 1;
                finalCar += ` (Round - ${days} Days)`;
                daysText = `\nDays: ${days}`;
                dateText = `Start: ${document.getElementById('qb-date').value}\nEnd: ${document.getElementById('qb-end-date').value}\nTime: ${document.getElementById('qb-time').value}`;
            } else {
                finalCar += ` (One Way)`;
            }

            const data = {
                name: document.getElementById('qb-name').value.trim(),
                phone: document.getElementById('qb-phone').value.trim(),
                pickup: document.getElementById('qb-pickup').value.trim(),
                drop: document.getElementById('qb-drop').value.trim(),
                car: finalCar,
                date: document.getElementById('qb-date').value + " " + document.getElementById('qb-time').value,
                endDate: tripType === 'Round Trip' ? document.getElementById('qb-end-date').value : '',
                message: `Trip: ${tripType}, Estimated distance: ${els.distance.textContent}, Fare: ${els.fare.textContent}`,
                formType: 'Quick Quote'
            };
            const success = await submitInquiry(data, els.btnConfirm);
            if (success) {
                // Formatting WhatsApp message
                const waText = encodeURIComponent(`*New Booking Enquiry*\nName: ${data.name}\nPhone: ${data.phone}\nFrom: ${data.pickup}\nTo: ${data.drop}\nTrip: ${tripType}${daysText}\nCar: ${data.car}\n${dateText}\nEstimate: ${els.fare.textContent}\nDistance: ${els.distance.textContent}`);
                window.open(`https://wa.me/919442173548?text=${waText}`, '_blank');
                quickForm.reset();
                els.box.style.display = 'none';
                els.btnConfirm.style.display = 'none';
                els.btnEstimate.style.display = 'block';
            }
        });
    }

    // --- Main Booking Form (Contact Section) ---
    const mainForm = document.getElementById('main-booking-form');
    if (mainForm) {
        const els = {
            box: document.getElementById('mb-estimate-box'),
            distance: document.getElementById('mb-distance'),
            fare: document.getElementById('mb-fare'),
            error: document.getElementById('mb-error'),
            btnEstimate: document.getElementById('mb-btn-estimate'),
            btnConfirm: document.getElementById('mb-btn-confirm')
        };

        // Cache last computed raw distance (one-way km) for instant recalc
        let mbCachedRawKm = null;

        const mbRecalcFare = () => {
            if (mbCachedRawKm === null) return;
            const car = document.getElementById('mb-car').value;
            const tripType = document.querySelector('input[name="mb-trip-type"]:checked').value;
            if (!car) return;
            const rateProfile = CAR_RATES[car];
            let distanceValue = mbCachedRawKm;
            if (tripType === 'Round Trip') distanceValue *= 2;

            const daysGroup = document.getElementById('mb-days-group');
            let numDays = 1;
            if (daysGroup && daysGroup.style.display !== 'none') {
                const daysVal = document.getElementById('mb-days').value;
                numDays = parseInt(daysVal) || 1;
            }

            let billableDistance;
            let fare;

            if (tripType === 'One Way') {
                billableDistance = Math.max(distanceValue, rateProfile.minOneWay);
                fare = (billableDistance * rateProfile.oneWay) + rateProfile.driverAllowance;
            } else {
                billableDistance = Math.max(distanceValue, rateProfile.minRoundTrip * numDays);
                fare = (billableDistance * rateProfile.roundTrip) + (rateProfile.driverAllowance * numDays);
            }

            fare = Math.round(fare);
            els.distance.textContent = Math.round(distanceValue) + ' km (' + tripType + ')';
            els.fare.textContent = '\u20b9' + fare.toLocaleString('en-IN') + ' *';
        };

        els.btnEstimate.addEventListener('click', async () => {
            const pickup = document.getElementById('mb-pickup').value.trim();
            const drop = document.getElementById('mb-drop').value.trim();
            const car = document.getElementById('mb-car').value;
            const tripType = document.querySelector('input[name="mb-trip-type"]:checked').value;
            await calculateEstimate(pickup, drop, car, tripType, els);
            const km = parseInt(els.distance.textContent);
            if (!isNaN(km)) {
                mbCachedRawKm = tripType === 'Round Trip' ? km / 2 : km;
            }
        });

        // Reset if city/date/time inputs change
        ['mb-pickup', 'mb-drop', 'mb-date', 'mb-days', 'mb-time'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('input', () => {
                    mbCachedRawKm = null;
                    els.box.style.display = 'none';
                    els.btnConfirm.style.display = 'none';
                    els.btnEstimate.style.display = 'block';
                    els.error.style.display = 'none';
                });
            }
        });

        // --- Clear & Swap Logic for Main Form ---
        document.getElementById('mb-clear-pickup')?.addEventListener('click', () => {
            const inp = document.getElementById('mb-pickup');
            if (inp) { inp.value = ''; inp.focus(); }
        });
        document.getElementById('mb-clear-drop')?.addEventListener('click', () => {
            const inp = document.getElementById('mb-drop');
            if (inp) { inp.value = ''; inp.focus(); }
        });
        document.getElementById('mb-swap-btn')?.addEventListener('click', () => {
            const pkp = document.getElementById('mb-pickup');
            const drp = document.getElementById('mb-drop');
            if (pkp && drp) {
                const temp = pkp.value;
                pkp.value = drp.value;
                drp.value = temp;
                mbCachedRawKm = null; // Reset estimate on swap
                els.box.style.display = 'none';
                els.btnConfirm.style.display = 'none';
                els.btnEstimate.style.display = 'block';
                els.error.style.display = 'none';
            }
        });
        // ----------------------------------------

        // Car type change: instantly recalc fare, no need to re-fetch route
        document.getElementById('mb-car').addEventListener('change', () => {
            if (mbCachedRawKm !== null && els.box.style.display !== 'none') {
                mbRecalcFare();
            } else {
                els.box.style.display = 'none';
                els.btnConfirm.style.display = 'none';
                els.btnEstimate.style.display = 'block';
                els.error.style.display = 'none';
            }
        });

        // Trip type change: instantly recalc fare
        document.querySelectorAll('input[name="mb-trip-type"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                const isRound = e.target.value === 'Round Trip';
                const daysGroup = document.getElementById('mb-days-group');
                if (daysGroup) daysGroup.style.display = isRound ? 'block' : 'none';
                
                if (mbCachedRawKm !== null && els.box.style.display !== 'none') {
                    mbRecalcFare();
                } else {
                    els.box.style.display = 'none';
                    els.btnConfirm.style.display = 'none';
                    els.btnEstimate.style.display = 'block';
                    els.error.style.display = 'none';
                }
            });
        });

        // Days input change: instantly recalc fare
        document.getElementById('mb-days')?.addEventListener('input', () => {
            if (mbCachedRawKm !== null && els.box.style.display !== 'none') {
                mbRecalcFare();
            }
        });

        mainForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const tripType = document.querySelector('input[name="mb-trip-type"]:checked').value;
            let finalCar = document.getElementById('mb-car').value;
            let daysText = '';
            let dateText = `Date: ${document.getElementById('mb-date').value}\nTime: ${document.getElementById('mb-time').value}`;
            
            if (tripType === 'Round Trip') {
                const daysEl = document.getElementById('mb-days');
                const days = daysEl ? parseInt(daysEl.value) || 1 : 1;
                finalCar += ` (Round - ${days} Days)`;
                daysText = `\nDays: ${days}`;
                dateText = `Date: ${document.getElementById('mb-date').value}\nTime: ${document.getElementById('mb-time').value}`;
            } else {
                finalCar += ` (One Way)`;
            }

            const data = {
                name: document.getElementById('mb-name').value.trim(),
                phone: document.getElementById('mb-phone').value.trim(),
                pickup: document.getElementById('mb-pickup').value.trim(),
                drop: document.getElementById('mb-drop').value.trim(),
                car: finalCar,
                date: document.getElementById('mb-date').value + " " + document.getElementById('mb-time').value,
                endDate: '', // Legacy
                message: `Trip: ${tripType}, Estimated distance: ${els.distance.textContent}, Fare: ${els.fare.textContent}.`,
                formType: 'Booking Request'
            };
            const success = await submitInquiry(data, els.btnConfirm);
            if (success) {
                // Formatting WhatsApp message
                const waText = encodeURIComponent(`*New Full Booking*\nName: ${data.name}\nPhone: ${data.phone}\n${dateText}\nFrom: ${data.pickup}\nTo: ${data.drop}\nTrip: ${tripType}${daysText}\nCar: ${data.car}\nEstimate: ${els.fare.textContent}\nDistance: ${els.distance.textContent}`);
                window.open(`https://wa.me/919442173548?text=${waText}`, '_blank');
                mainForm.reset();
                els.box.style.display = 'none';
                els.btnConfirm.style.display = 'none';
                els.btnEstimate.style.display = 'block';
            }
        });
    }

    // Helper functions for feedback rendering
    const escapeHTML = (str) => {
        const div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    };

    const renderStars = (rating) => {
        return '★'.repeat(rating) + '☆'.repeat(5 - rating);
    };

    // --- Feedback System ---
    const feedbackForm = document.getElementById('feedback-form');
    const feedbacksContainer = document.getElementById('feedbacks-container');

    const loadFeedbacks = async () => {
        if (!feedbacksContainer) return;
        feedbacksContainer.innerHTML = '<div style="text-align:center;padding:2rem;color:#94a3b8;"><i class="fa-solid fa-spinner fa-spin"></i> Loading reviews...</div>';
        try {
            const res = await fetch('api/get_feedbacks.php?t=' + Date.now()); // cache-bust
            const data = await res.json();

            if (!data || data.error || !Array.isArray(data) || data.length === 0) {
                feedbacksContainer.innerHTML = '<div style="text-align:center;padding:2rem;color:#94a3b8;">No reviews yet. Be the first to review!</div>';
                return;
            }

            feedbacksContainer.innerHTML = data.map(fb => `
                <div class="feedback-card">
                    <div class="feedback-header">
                        <div class="feedback-user"><i class="fa-solid fa-user-circle"></i> ${escapeHTML(fb.user_name)}</div>
                        <div class="feedback-rating">${renderStars(parseInt(fb.rating))}</div>
                    </div>
                    <div class="feedback-message">"${escapeHTML(fb.message)}"</div>
                    <div class="feedback-date">${new Date(fb.created_at).toLocaleDateString('en-IN', {day:'numeric',month:'short',year:'numeric'})}</div>
                </div>
            `).join('');

        } catch (e) {
            console.error('Error loading feedbacks', e);
            feedbacksContainer.innerHTML = '<div style="text-align:center;padding:2rem;color:#e74c3c;">Could not load reviews. Please refresh.</div>';
        }
    };

    if (feedbacksContainer) {
        loadFeedbacks();
    }

    if (feedbackForm) {
        feedbackForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('fb-btn-submit');
            const origText = btn.innerHTML;
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Submitting...';
            btn.disabled = true;

            const name = document.getElementById('fb-name').value.trim();
            const rating = document.getElementById('fb-rating').value;
            const message = document.getElementById('fb-message').value.trim();

            try {
                const res = await fetch('api/submit_feedback.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, rating, message })
                });

                const contentType = res.headers.get("content-type");
                if (res.ok && contentType && contentType.indexOf("application/json") !== -1) {
                    const data = await res.json();
                    if (data.success) {
                        showToast('✅ Feedback submitted successfully!');
                        feedbackForm.reset();
                        loadFeedbacks();
                    } else {
                        throw new Error(data.error || 'Server reported failure');
                    }
                } else {
                    const text = await res.text();
                    console.error("Non-JSON response:", text);
                    throw new Error('Invalid server response');
                }
            } catch (err) {
                console.error(err);
                showToast('❌ Failed to submit feedback', false);
            } finally {
                btn.innerHTML = origText;
                btn.disabled = false;
            }
        });
    }
    // --- SWIPER CAROUSELS ---
    const GMAP_KEY = 'AIzaSyAdK3ME-SLn3S89x7fA3W04_X8TyJ9Us2I';

    const citiesData = [
        { name: "Coimbatore",  icon: "fa-city",           wiki: "Coimbatore",
          desc: "The Manchester of South India, known for its textile industry and pleasant climate.", spots: ["Marudhamalai","Isha Yoga","Vydehi Falls"] },
        { name: "Ooty",        icon: "fa-mountain",       wiki: "Ooty",
          desc: "The Queen of Hill Stations, offering lush green landscapes and cool mountain air.", spots: ["Botanical Garden","Ooty Lake","Doddabetta"] },
        { name: "Rameshwaram", icon: "fa-gopuram",        wiki: "Ramanathaswamy_Temple",
          desc: "A sacred island town and pilgrimage center at the tip of the Indian peninsula.", spots: ["Ramanathaswamy","Dhanushkodi","Agni Theertham"] },
        { name: "Kodaikanal",  icon: "fa-tree",           wiki: "Kodaikanal",
          desc: "The Princess of Hill Stations, featuring beautiful lakes, waterfalls, and scenic viewpoints.", spots: ["Kodai Lake","Coker's Walk","Pillar Rocks"] },
        { name: "Madurai",     icon: "fa-om",             wiki: "Meenakshi_Amman_Temple",
          desc: "The Temple City, famous for the Meenakshi Amman Temple and ancient heritage.", spots: ["Meenakshi Temple","Thirumalai Nayak","Gandhi Museum"] },
        { name: "Alleppey",    icon: "fa-ship",           wiki: "Alleppey",
          desc: "The Venice of the East, world-renowned for its tranquil backwaters and houseboat stays.", spots: ["Alappuzha Beach","Backwaters","Marari Beach"] },
        { name: "Varkala",     icon: "fa-umbrella-beach", wiki: "Varkala",
          desc: "A coastal town known for its unique red cliffs and pristine Papanasam Beach.", spots: ["Varkala Cliff","Janardhana Temple","Kappil Lake"] },
        { name: "Kochi",       icon: "fa-anchor",         wiki: "Kochi",
          desc: "A vibrant port city blending colonial history with modern Kerala charm.", spots: ["Fort Kochi","Marine Drive","Jewish Synagogue"] },
        { name: "Munnar",      icon: "fa-leaf",           wiki: "Munnar",
          desc: "Verdant tea plantations and wildlife sanctuaries in the heart of the Western Ghats.", spots: ["Eravikulam","Periyar Lake","Tea Museum"] },
        { name: "Wayanad",     icon: "fa-water",          wiki: "Wayanad_district",
          desc: "A high-altitude district with misty mountains, spice plantations, and tribal history.", spots: ["Banasura Sagar","Edakkal Caves","Soochipara Falls"] },
        { name: "Calicut",     icon: "fa-utensils",       wiki: "Kozhikode",
          desc: "The City of Spices, where historic trade meets incredible Kerala cuisine.", spots: ["Kozhikode Beach","Beypore Port","Kappad Beach"] },
        { name: "Vagamon",     icon: "fa-cloud-sun",      wiki: "Vagamon",
          desc: "An offbeat hill station with pine forests, rolling meadows, and serene valleys.", spots: ["Pine Forests","Marmala Waterfalls","Meadows"] },
        { name: "Tirupati",    icon: "fa-hands-praying",  wiki: "Tirupati",
          desc: "One of the most visited pilgrimage centers, home to Lord Venkateswara.", spots: ["Tirumala Temple","Silathoranam","Talakona Falls"] },
        { name: "Tirumala",    icon: "fa-sun",            wiki: "Tirumala",
          desc: "The sacred Seven Hills offering a divine atmosphere and spiritual enlightenment.", spots: ["Venkateswara Temple","Akasa Ganga","Srivari Padalu"] },
        { name: "Kalahasti",   icon: "fa-dharmachakra",   wiki: "Sri_Kalahastiswara_Temple",
          desc: "Famous for the Srikalahasteeswarar Temple, representing the 'Vayu' element.", spots: ["Vayu Lingam","Pathala Vinayaka","Bharadwaja"] },
        { name: "Coorg",       icon: "fa-coffee",         wiki: "Kodagu_district",
          desc: "Scotland of India, famous for coffee plantations and Kodava culture.", spots: ["Abbey Falls","Raja's Seat","Talakaveri"] },
        { name: "Mysore",      icon: "fa-fort-awesome",   wiki: "Mysore_Palace",
          desc: "Cultural Capital of Karnataka, renowned for its majestic palaces and festivals.", spots: ["Mysore Palace","Chamundi Hill","Brindavan Gardens"] },
        { name: "Bangalore",   icon: "fa-laptop-code",    wiki: "Bangalore",
          desc: "The Silicon Valley of India, a mix of heritage gardens and high-tech urban life.", spots: ["Lalbagh","Cubbon Park","Bangalore Palace"] }
    ];

    const routesData = [
        { from: "Coimbatore", to: "Bangalore",  dist: "360 km", wiki: "Bangalore",
          desc: "A comfortable interstate journey connecting the textile city to the IT capital." },
        { from: "Coimbatore", to: "Chennai",    dist: "500 km", wiki: "Chennai",
          desc: "A premium journey across Tamil Nadu connecting two major industrial hubs." },
        { from: "Coimbatore", to: "Ooty",       dist: "90 km",  wiki: "Ooty",
          desc: "A beautiful uphill scenic drive through the Nilgiri mountains." },
        { from: "Coimbatore", to: "Kochi",      dist: "190 km", wiki: "Kochi",
          desc: "A pleasant cross-state journey from Tamil Nadu to the backwaters of Kerala." },
        { from: "Coimbatore", to: "Kodaikanal", dist: "175 km", wiki: "Kodaikanal",
          desc: "Through mist-covered mountains to the soul-soothing 'Princess of Hill Stations'." }
    ];


    const renderSliders = () => {
        const cityWrapper = document.getElementById('cities-swiper-wrapper');
        const routeWrapper = document.getElementById('routes-swiper-wrapper');

        if (cityWrapper) {
            cityWrapper.innerHTML = citiesData.map(city => `
                <div class="swiper-slide">
                    <div class="city-slide-card" style="overflow:hidden; border-radius:16px; background:#fff; box-shadow:0 4px 20px rgba(0,0,0,0.08);">
                        <div style="position:relative; height:170px; overflow:hidden; background:linear-gradient(135deg,#0077B6,#03045E);">
                            <img src="" alt="${city.name}"
                                class="city-img-wp"
                                style="width:100%; height:100%; object-fit:cover; display:block; opacity:0; transition:opacity 0.6s ease;"
                                data-wiki="${city.wiki}">
                            <div style="position:absolute; inset:0; background:linear-gradient(to top,rgba(0,0,0,0.3) 0%,transparent 60%);"></div>
                            <div style="position:absolute; bottom:10px; left:14px; color:#fff; font-weight:800; font-size:1.05rem; text-shadow:0 1px 4px rgba(0,0,0,0.6);">${city.name}</div>
                            <div style="position:absolute; top:10px; right:10px; background:rgba(0,180,216,0.9); color:#fff; font-size:0.65rem; font-weight:700; padding:3px 9px; border-radius:20px; text-transform:uppercase; letter-spacing:0.5px;">
                                <i class="fa-solid ${city.icon}"></i>
                            </div>
                        </div>
                        <div class="city-card-body">
                            <p>${city.desc}</p>
                            <div class="popular-spots-title">Popular Spots</div>
                            <div class="spots-container">
                                ${city.spots.map(spot => `<span class="spot-tag">${spot}</span>`).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');
        }


        if (routeWrapper) {
            routeWrapper.innerHTML = routesData.map(route => `
                <div class="swiper-slide">
                    <div class="route-slide-card" style="overflow:hidden; border-radius:16px; background:#fff; box-shadow:0 4px 20px rgba(0,0,0,0.08);">
                        <div style="position:relative; height:160px; overflow:hidden; background:linear-gradient(135deg,#0077B6,#03045E);">
                            <img src="" alt="${route.from} to ${route.to}"
                                class="city-img-wp"
                                style="width:100%; height:100%; object-fit:cover; display:block; opacity:0; transition:opacity 0.6s ease;"
                                data-wiki="${route.wiki}">
                            <div style="position:absolute; inset:0; background:linear-gradient(to top,rgba(0,0,0,0.3) 0%,transparent 60%);"></div>
                            <div style="position:absolute; bottom:10px; left:14px; color:#fff; font-weight:800; font-size:0.9rem; text-shadow:0 1px 4px rgba(0,0,0,0.6);">${route.from} → ${route.to}</div>
                            <div style="position:absolute; top:10px; right:10px; background:rgba(0,0,0,0.45); backdrop-filter:blur(4px); color:#00D4FF; font-size:0.72rem; font-weight:700; padding:3px 10px; border-radius:20px; border:1px solid rgba(0,212,255,0.4);">${route.dist}</div>
                        </div>
                        <div class="route-card-body">
                            <div class="route-title">${route.from} <i class="fa-solid fa-arrow-right-long"></i> ${route.to}</div>
                            <a href="index.html?pickup=${encodeURIComponent(route.from)}&drop=${encodeURIComponent(route.to)}#home" class="route-btn" data-from="${route.from}" data-to="${route.to}">Book Now</a>
                            <p class="route-desc">${route.desc}</p>
                        </div>
                    </div>
                </div>
            `).join('');
        }


        // Add Route Button Pre-fill Logic
        // Route buttons now use href="index.html?..." straight to the hero form.
    };

    renderSliders();

    // ── Load real city photos from Wikipedia API ────────────────────────────
    function loadCityImages() {
        document.querySelectorAll('img.city-img-wp').forEach(function(img) {
            var wiki = img.getAttribute('data-wiki');
            if (!wiki) return;
            fetch('https://en.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(wiki))
                .then(function(r) { return r.json(); })
                .then(function(d) {
                    var url = (d.originalimage && d.originalimage.source)
                              ? d.originalimage.source
                              : (d.thumbnail && d.thumbnail.source ? d.thumbnail.source : null);
                    if (url) {
                        img.onload = function() { img.style.opacity = '1'; };
                        img.src = url;
                    }
                })
                .catch(function() {});
        });
    }
    loadCityImages();

    // SWIPER INITIALIZATION
    new Swiper(".citiesSwiper", {
        slidesPerView: 1,
        spaceBetween: 25,
        loop: true,
        autoplay: { delay: 4000, disableOnInteraction: false },
        pagination: { el: ".swiper-pagination", clickable: true },
        navigation: { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" },
        breakpoints: {
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
            1400: { slidesPerView: 4 }
        }
    });

    new Swiper(".routesSwiper", {
        slidesPerView: 1,
        spaceBetween: 30,
        loop: true,
        autoplay: { delay: 5000, disableOnInteraction: false },
        navigation: { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" },
        breakpoints: {
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
            1400: { slidesPerView: 4 }
        }
    });

});

// ── Global: City card img onerror → fetch real photo from Wikipedia ──────────
function wikiImgFallback(el) {
    el.onerror = null; // prevent infinite loop
    const wiki = el.getAttribute('data-wiki') || el.alt;
    if (!wiki) { el.style.display = 'none'; return; }
    fetch('https://en.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(wiki))
        .then(function(r) { return r.json(); })
        .then(function(d) {
            if (d.thumbnail && d.thumbnail.source) {
                el.src = d.thumbnail.source;
                el.style.display = 'block';
            } else { el.style.display = 'none'; }
        })
        .catch(function() { el.style.display = 'none'; });
}

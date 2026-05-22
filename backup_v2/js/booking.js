/**
 * KPS Travels - Fare Estimation Modal
 * Distance: Google Maps Distance Matrix API (accurate road distances)
 * Places: Google Maps Autocomplete on pickup/drop inputs
 * On estimate: shows all 3 vehicle fares in a popup modal.
 * Each card → Confirm Booking → pre-filled WhatsApp message.
 */

'use strict';

const VEHICLES = [
    {
        id: 'Sedan',
        label: 'Sedan',
        icon: 'fa-car',
        image: 'Assets/car_sedan.png',
        desc: 'Ideal for couples & small families',
        seats: '4 Seats',
        bags: '2 Bags',
        color: '#0A1128',
        oneWayRate: 14,
        roundTripRate: 13,
        batta: 400,
        minOneWay: 130,
        minRoundTrip: 250
    },
    {
        id: 'SUV',
        label: 'SUV',
        icon: 'fa-truck-pickup',
        image: 'Assets/car_suv.png',
        desc: 'Spacious comfort for groups & families',
        seats: '7 Seats',
        bags: '4 Bags',
        color: '#0077B6',
        oneWayRate: 19,
        roundTripRate: 18,
        batta: 400,
        minOneWay: 130,
        minRoundTrip: 250
    },
    {
        id: 'MUV',
        label: 'Innova Crysta',
        icon: 'fa-shuttle-van',
        image: 'Assets/car_innova.png',
        desc: 'Premium luxury for long journeys',
        seats: '7 Seats',
        bags: '4 Bags',
        color: '#03045E',
        oneWayRate: 21,
        roundTripRate: 20,
        batta: 400,
        minOneWay: 130,
        minRoundTrip: 250
    }
];

// ── Fare calculator ────────────────────────────────────────────────────
function calcFare(vehicle, rawKm, tripType, numDays) {
    const isRound   = tripType === 'Round Trip';
    const rate      = isRound ? vehicle.roundTripRate : vehicle.oneWayRate;
    const km        = isRound ? 250 * numDays : rawKm;
    const minKm     = isRound ? 250 * numDays : vehicle.minOneWay;
    const billable  = Math.max(km, minKm);
    const totalBatta = vehicle.batta * numDays;
    return {
        fare:        Math.round(billable * rate + totalBatta),
        billableKm:  Math.round(billable),
        actualKm:    Math.round(km),
        rate,
        batta:       vehicle.batta,
        totalBatta,
        baseCharge:  Math.round(billable * rate),
        numDays
    };
}

// ── Build one vehicle card ─────────────────────────────────────────────
function buildVehicleCard(vehicle, rawKm, tripType, pickup, drop, date, time, numDays) {
    const { fare, billableKm, actualKm, rate, batta, totalBatta, baseCharge, numDays: nd } = calcFare(vehicle, rawKm, tripType, numDays);
    const battaLabel = nd > 1 ? `₹${batta} × ${nd} days = ₹${totalBatta}` : `₹${totalBatta}`;
    const distLabel  = nd > 1 ? `${billableKm} km (${nd} days)` : `${billableKm} km`;
    const rateLabel  = tripType === 'Round Trip' ? `Extra Rate / km` : `Rate / km`;

    const waMsg = encodeURIComponent(
        `*New Cab Booking — KPS Travels*\n\n` +
        `📍 *From:* ${pickup}\n` +
        `🏁 *To:* ${drop}\n` +
        `🚗 *Vehicle:* ${vehicle.label}\n` +
        `📅 *Date:* ${date}   🕐 *Time:* ${time}\n` +
        `🔄 *Trip Type:* ${tripType}${nd > 1 ? ` (${nd} days)` : ''}\n` +
        `📏 *Distance:* ${billableKm} km\n` +
        `💰 *Estimated Fare:* ₹${fare.toLocaleString('en-IN')}\n\n` +
        `_Please confirm availability. Thank you!_`
    );

    return `
    <div class="fm-vehicle-card" style="
        background:#fff; border-radius:18px; border:2px solid #e2e8f0;
        overflow:hidden; display:flex; flex-direction:column;
        transition:all 0.3s cubic-bezier(0.34,1.56,0.64,1);"
        onmouseover="this.style.transform='translateY(-8px)';this.style.borderColor='#00B4D8';this.style.boxShadow='0 20px 45px rgba(0,180,216,0.28)'"
        onmouseout="this.style.transform='';this.style.borderColor='#e2e8f0';this.style.boxShadow=''">

        <!-- Car Image Banner -->
        <div style="position:relative; height:160px; overflow:hidden; background:${vehicle.color};">
            <img src="${vehicle.image}" alt="${vehicle.label}"
                style="width:100%; height:100%; object-fit:cover; object-position:center;"
                onerror="this.style.display='none'">
            <div style="position:absolute; inset:0; background:linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 55%);"></div>
            <span style="position:absolute; top:10px; right:12px; background:#00B4D8; color:#fff;
                font-size:0.68rem; font-weight:800; padding:3px 10px; border-radius:20px;
                text-transform:uppercase; letter-spacing:1px;">${vehicle.label}</span>
            <div style="position:absolute; bottom:10px; left:14px; display:flex; gap:0.6rem;">
                <span style="background:rgba(255,255,255,0.18); backdrop-filter:blur(6px); color:#fff; font-size:0.72rem; font-weight:600; padding:3px 9px; border-radius:20px; border:1px solid rgba(255,255,255,0.25);">
                    <i class="fa-solid fa-user" style="margin-right:3px;"></i>${vehicle.seats}
                </span>
                <span style="background:rgba(255,255,255,0.18); backdrop-filter:blur(6px); color:#fff; font-size:0.72rem; font-weight:600; padding:3px 9px; border-radius:20px; border:1px solid rgba(255,255,255,0.25);">
                    <i class="fa-solid fa-suitcase" style="margin-right:3px;"></i>${vehicle.bags}
                </span>
            </div>
        </div>

        <!-- Fare Info -->
        <div style="padding:1.3rem 1.4rem; flex:1; display:flex; flex-direction:column; gap:0.55rem;">
            <div style="text-align:center; margin-bottom:0.5rem;">
                <div style="font-size:1.9rem; font-weight:900; color:#03045E; letter-spacing:-1px;">
                    ₹${fare.toLocaleString('en-IN')}
                </div>
                <div style="font-size:0.78rem; color:#64748b; margin-top:3px;">${vehicle.desc}</div>
            </div>

            <hr style="border:none; border-top:1px solid #f1f5f9; margin:0.3rem 0;">

            <div style="display:flex; justify-content:space-between; font-size:0.83rem; color:#475569; padding:1px 0;">
                <span>Distance</span><strong>${distLabel}</strong>
            </div>
            <div style="display:flex; justify-content:space-between; font-size:0.83rem; color:#475569; padding:1px 0;">
                <span>${rateLabel}</span><strong>₹${rate} / km</strong>
            </div>
            <div style="display:flex; justify-content:space-between; font-size:0.83rem; color:#475569; padding:1px 0;">
                <span>Base Charge</span><strong>₹${baseCharge}</strong>
            </div>
            <div style="display:flex; justify-content:space-between; font-size:0.83rem; color:#475569; padding:1px 0;">
                <span>Driver Allowance</span><strong>${battaLabel}</strong>
            </div>

            <div style="display:flex; gap:1rem; margin-top:0.3rem; font-size:0.77rem; color:#94a3b8;">
                <span><i class="fa-solid fa-user" style="color:#0077B6;"></i> ${vehicle.seats}</span>
                <span><i class="fa-solid fa-suitcase" style="color:#0077B6;"></i> ${vehicle.bags}</span>
            </div>
        </div>

        <!-- Disclaimer -->
        <div style="margin:0 1.4rem 0.8rem; background:#FFF3CD; border-left:3px solid #F59E0B; border-radius:6px; padding:0.6rem 0.8rem;">
            <p style="font-size:0.73rem; color:#92400E; margin:0; line-height:1.45;">
                * Actual bill may vary based on distance, waiting time, night charges, hill charges, permits &amp; tolls.
            </p>
        </div>

        <!-- Confirm Booking Button (opens booking form step) -->
        <div style="padding:0 1.4rem 1.4rem;">
            <button
               onclick="openBookingForm('${vehicle.label}','${pickup}','${drop}','${date}','${time}','${tripType}',${fare},${billableKm},'${battaLabel}')"
               style="width:100%; display:flex; align-items:center; justify-content:center; gap:0.5rem;
                      background:linear-gradient(135deg,#0077B6,#03045E); color:#fff;
                      font-weight:800; font-size:0.92rem; padding:0.8rem;
                      border-radius:50px; border:none; cursor:pointer; transition:all 0.25s ease;"
               onmouseover="this.style.transform='scale(1.03)';this.style.boxShadow='0 8px 25px rgba(0,119,182,0.45)'"
               onmouseout="this.style.transform='';this.style.boxShadow=''">
                <i class="fa-solid fa-check-circle"></i>
                Confirm Booking
            </button>
        </div>
    </div>`;
}

// ── Booking Confirmation Form ─────────────────────────────────────────
window.openBookingForm = function(vehicleLabel, pickup, drop, date, time, tripType, fare, km, batta) {
    const modal = document.getElementById('fare-modal');
    const body  = modal.querySelector('.fm-modal-body');
    if (!body) return;

    const prefillName = document.getElementById('qb-name')?.value || '';
    const prefillPhone = document.getElementById('qb-phone')?.value || '';

    body.innerHTML = `
    <div style="max-width:540px; margin:0 auto; padding:2rem 1.5rem;">

        <!-- Back button -->
        <button onclick="window.closeFareModal()" style="background:none; border:none; color:#64748b; font-size:0.88rem; cursor:pointer; margin-bottom:1.5rem; display:flex; align-items:center; gap:0.4rem;">
            <i class="fa-solid fa-arrow-left"></i> Back to estimates
        </button>

        <!-- Header -->
        <div style="text-align:center; margin-bottom:2rem;">
            <div style="width:56px; height:56px; background:linear-gradient(135deg,#0077B6,#03045E); border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 1rem;">
                <i class="fa-solid fa-car" style="color:#fff; font-size:1.4rem;"></i>
            </div>
            <h2 style="font-size:1.5rem; font-weight:900; color:#03045E; margin:0 0 0.3rem;">Confirm Your Booking</h2>
            <p style="color:#64748b; font-size:0.9rem; margin:0;">Selected vehicle: <strong>${vehicleLabel}</strong> &nbsp;|&nbsp; Fare: <strong style="color:#0077B6;">₹${fare.toLocaleString('en-IN')}</strong></p>
        </div>

        <!-- Journey Summary -->
        <div style="background:#f0f9ff; border-radius:14px; padding:1rem 1.2rem; margin-bottom:1.5rem; border:1px solid #bae6fd; font-size:0.88rem; color:#0c4a6e;">
            <div style="display:flex; justify-content:space-between; margin-bottom:0.35rem;">
                <span>📍 From</span><strong>${pickup}</strong>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom:0.35rem;">
                <span>🏁 To</span><strong>${drop}</strong>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom:0.35rem;">
                <span>📅 Date & Time</span><strong>${date} at ${time}</strong>
            </div>
            <div style="display:flex; justify-content:space-between;">
                <span>🔄 Trip Type</span><strong>${tripType}</strong>
            </div>
        </div>

        <!-- Booking Form -->
        <div style="display:flex; flex-direction:column; gap:1rem;">

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
                <div>
                    <label style="display:block; font-size:0.78rem; font-weight:700; color:#475569; text-transform:uppercase; margin-bottom:0.4rem;">Full Name *</label>
                    <input id="bk-name" type="text" placeholder="Your full name" required value="${prefillName}"
                        style="width:100%; padding:0.75rem 1rem; border:1.5px solid #e2e8f0; border-radius:10px; font-size:0.9rem; outline:none; font-family:inherit; box-sizing:border-box;"
                        onfocus="this.style.borderColor='#0077B6'" onblur="this.style.borderColor='#e2e8f0'">
                </div>
                <div>
                    <label style="display:block; font-size:0.78rem; font-weight:700; color:#475569; text-transform:uppercase; margin-bottom:0.4rem;">Mobile Number *</label>
                    <input id="bk-phone" type="tel" placeholder="10-digit number" required value="${prefillPhone}"
                        style="width:100%; padding:0.75rem 1rem; border:1.5px solid #e2e8f0; border-radius:10px; font-size:0.9rem; outline:none; font-family:inherit; box-sizing:border-box;"
                        onfocus="this.style.borderColor='#0077B6'" onblur="this.style.borderColor='#e2e8f0'">
                </div>
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:1rem;">
                <div>
                    <label style="display:block; font-size:0.78rem; font-weight:700; color:#475569; text-transform:uppercase; margin-bottom:0.4rem;">Adults</label>
                    <select id="bk-adults" style="width:100%; padding:0.75rem 1rem; border:1.5px solid #e2e8f0; border-radius:10px; font-size:0.9rem; outline:none; font-family:inherit; box-sizing:border-box; background:#fff;">
                        <option>1</option><option>2</option><option>3</option><option>4</option><option>5</option><option>6</option><option>7</option>
                    </select>
                </div>
                <div>
                    <label style="display:block; font-size:0.78rem; font-weight:700; color:#475569; text-transform:uppercase; margin-bottom:0.4rem;">Children</label>
                    <select id="bk-children" style="width:100%; padding:0.75rem 1rem; border:1.5px solid #e2e8f0; border-radius:10px; font-size:0.9rem; outline:none; font-family:inherit; box-sizing:border-box; background:#fff;">
                        <option>0</option><option>1</option><option>2</option><option>3</option><option>4</option>
                    </select>
                </div>
                <div>
                    <label style="display:block; font-size:0.78rem; font-weight:700; color:#475569; text-transform:uppercase; margin-bottom:0.4rem;">Luggage</label>
                    <select id="bk-luggage" style="width:100%; padding:0.75rem 1rem; border:1.5px solid #e2e8f0; border-radius:10px; font-size:0.9rem; outline:none; font-family:inherit; box-sizing:border-box; background:#fff;">
                        <option>1</option><option>2</option><option>3</option><option>4</option><option>5+</option>
                    </select>
                </div>
            </div>

            <div>
                <label style="display:block; font-size:0.78rem; font-weight:700; color:#475569; text-transform:uppercase; margin-bottom:0.4rem;">Special Requests (Optional)</label>
                <textarea id="bk-notes" placeholder="E.g., baby seat, early morning pickup, AC preference..."
                    style="width:100%; padding:0.75rem 1rem; border:1.5px solid #e2e8f0; border-radius:10px; font-size:0.9rem; outline:none; font-family:inherit; resize:none; height:80px; box-sizing:border-box;"
                    onfocus="this.style.borderColor='#0077B6'" onblur="this.style.borderColor='#e2e8f0'"></textarea>
            </div>

            <!-- Disclaimer -->
            <div style="background:#FFF3CD; border-left:3px solid #F59E0B; border-radius:6px; padding:0.6rem 0.8rem;">
                <p style="font-size:0.73rem; color:#92400E; margin:0; line-height:1.45;">
                    * Actual bill may vary based on distance, waiting time, night charges, hill charges, permits & tolls.
                </p>
            </div>

            <!-- WhatsApp Send Button -->
            <button
                onclick="sendWhatsAppBooking('${vehicleLabel}','${pickup}','${drop}','${date}','${time}','${tripType}',${fare},${km},'${batta}')"
                style="width:100%; display:flex; align-items:center; justify-content:center; gap:0.6rem;
                       background:linear-gradient(135deg,#25D366,#128C7E); color:#fff;
                       font-weight:800; font-size:1rem; padding:1rem;
                       border-radius:50px; border:none; cursor:pointer;
                       transition:all 0.25s ease; margin-top:0.5rem;"
                onmouseover="this.style.transform='scale(1.02)';this.style.boxShadow='0 8px 28px rgba(37,211,102,0.45)'"
                onmouseout="this.style.transform='';this.style.boxShadow=''">
                <i class="fa-brands fa-whatsapp" style="font-size:1.3rem;"></i>
                Send via WhatsApp
            </button>
        </div>
    </div>`;
};

// ── WhatsApp Message Builder ──────────────────────────────────────────
window.sendWhatsAppBooking = function(vehicleLabel, pickup, drop, date, time, tripType, fare, km, batta) {
    const name     = document.getElementById('bk-name')?.value.trim()    || '';
    const phone    = document.getElementById('bk-phone')?.value.trim()   || '';
    const adults   = document.getElementById('bk-adults')?.value         || '1';
    const children = document.getElementById('bk-children')?.value       || '0';
    const luggage  = document.getElementById('bk-luggage')?.value        || '1';
    const notes    = document.getElementById('bk-notes')?.value.trim()   || '';

    if (!name || !phone) {
        alert('Please fill in your Name and Mobile Number.');
        return;
    }

    const msg = encodeURIComponent(
        `*🚖 New Cab Booking — KPS Travels*\n\n` +
        `👤 *Name:* ${name}\n` +
        `📞 *Mobile:* ${phone}\n\n` +
        `📍 *From:* ${pickup}\n` +
        `🏁 *To:* ${drop}\n` +
        `📅 *Date:* ${date}   🕐 *Time:* ${time}\n` +
        `🔄 *Trip Type:* ${tripType}\n` +
        `🚗 *Vehicle:* ${vehicleLabel}\n` +
        `📏 *Distance:* ${km} km\n` +
        `💰 *Estimated Fare:* ₹${fare.toLocaleString('en-IN')}\n` +
        `🧾 *Driver Allowance:* ${batta}\n\n` +
        `👥 *Adults:* ${adults}  |  👶 *Children:* ${children}  |  🧳 *Luggage:* ${luggage}\n` +
        (notes ? `📝 *Notes:* ${notes}\n` : '') +
        `\n_Please confirm availability. Thank you!_`
    );

    window.open(`https://wa.me/919442173548?text=${msg}`, '_blank');
};

// ── Get distance via Google Maps Distance Matrix ────────────────────────
function getGoogleDistance(origin, destination) {
    return new Promise((resolve, reject) => {
        const service = new google.maps.DistanceMatrixService();
        service.getDistanceMatrix({
            origins: [origin],
            destinations: [destination],
            travelMode: google.maps.TravelMode.DRIVING,
            unitSystem: google.maps.UnitSystem.METRIC,
            avoidHighways: false,
            avoidTolls: false
        }, (response, status) => {
            if (status === 'OK') {
                const element = response.rows[0].elements[0];
                if (element.status === 'OK') {
                    resolve({
                        km: element.distance.value / 1000,
                        text: element.distance.text,
                        duration: element.duration.text
                    });
                } else {
                    reject(new Error('Route not found: ' + element.status));
                }
            } else {
                reject(new Error('Distance Matrix error: ' + status));
            }
        });
    });
}

// ── Init Google Places Autocomplete ───────────────────────────────────
function initAutocomplete() {
    const options = {
        componentRestrictions: { country: 'in' },
        fields: ['formatted_address', 'geometry', 'name'],
        types: ['geocode', 'establishment']
    };

    // ── Hero quick-estimate form (qb-pickup / qb-drop) ──
    const pickupInput = document.getElementById('qb-pickup');
    const dropInput   = document.getElementById('qb-drop');
    if (pickupInput && dropInput) {
        pickupInput.setAttribute('autocomplete', 'new-password');
        dropInput.setAttribute('autocomplete', 'new-password');
        new google.maps.places.Autocomplete(pickupInput, options);
        new google.maps.places.Autocomplete(dropInput, options);
    }

    // ── "Plan Your Journey" contact form (mb-pickup / mb-drop) ──
    const mbPickup = document.getElementById('mb-pickup');
    const mbDrop   = document.getElementById('mb-drop');
    if (mbPickup && mbDrop) {
        mbPickup.setAttribute('autocomplete', 'new-password');
        mbDrop.setAttribute('autocomplete', 'new-password');
        mbPickup.removeAttribute('list');   // remove static datalist
        mbDrop.removeAttribute('list');
        new google.maps.places.Autocomplete(mbPickup, options);
        new google.maps.places.Autocomplete(mbDrop, options);
    }

    const GMAP_KEY = 'AIzaSyAdK3ME-SLn3S89x7fA3W04_X8TyJ9Us2I';
    const gmap = (loc, zoom=13, type='satellite') =>
        `https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(loc)}&zoom=${zoom}&size=500x280&maptype=${type}&key=${GMAP_KEY}`;

    const citiesData = [
        { name: "Coimbatore",     icon: "fa-city",          image: gmap("Coimbatore, Tamil Nadu, India",13,'hybrid'),     spots: ["Marudhamalai","Isha Yoga","Vydehi Falls"] },
        { name: "Ooty",           icon: "fa-mountain",      image: gmap("Ooty, Nilgiris, Tamil Nadu",14,'satellite'),     spots: ["Botanical Garden","Ooty Lake","Doddabetta"] },
        { name: "Rameshwaram",    icon: "fa-gopuram",       image: gmap("Ramanathaswamy Temple, Rameshwaram",15,'hybrid'),spots: ["Ramanathaswamy","Dhanushkodi","Agni Theertham"] },
        { name: "Kodaikanal",     icon: "fa-tree",          image: gmap("Kodaikanal Lake, Tamil Nadu",14,'satellite'),    spots: ["Kodai Lake","Coker's Walk","Pillar Rocks"] },
        { name: "Madurai",        icon: "fa-om",            image: gmap("Meenakshi Amman Temple, Madurai",15,'hybrid'),   spots: ["Meenakshi Temple","Thirumalai Nayak","Gandhi Museum"] },
        { name: "Alleppey",       icon: "fa-ship",          image: gmap("Alleppey Backwaters, Kerala",13,'satellite'),    spots: ["Alappuzha Beach","Backwaters","Marari Beach"] },
        { name: "Varkala",        icon: "fa-umbrella-beach",image: gmap("Varkala Cliff Beach, Kerala",14,'satellite'),    spots: ["Varkala Cliff","Janardhana Temple","Kappil Lake"] },
        { name: "Kochi",          icon: "fa-anchor",        image: gmap("Fort Kochi, Kerala",14,'hybrid'),                spots: ["Fort Kochi","Marine Drive","Jewish Synagogue"] },
        { name: "Munnar",         icon: "fa-leaf",          image: gmap("Munnar Tea Gardens, Kerala",13,'satellite'),     spots: ["Eravikulam","Periyar Lake","Tea Museum"] },
        { name: "Wayanad",        icon: "fa-water",         image: gmap("Banasura Sagar Dam, Wayanad",13,'satellite'),    spots: ["Banasura Sagar","Edakkal Caves","Soochipara Falls"] },
        { name: "Calicut",        icon: "fa-utensils",      image: gmap("Kozhikode Beach, Calicut, Kerala",14,'hybrid'),  spots: ["Kozhikode Beach","Beypore Port","Kappad Beach"] },
        { name: "Vagamon",        icon: "fa-cloud-sun",     image: gmap("Vagamon, Idukki, Kerala",14,'satellite'),        spots: ["Pine Forests","Marmala Waterfalls","Meadows"] },
        { name: "Tirupati",       icon: "fa-hands-praying", image: gmap("Tirumala Venkateswara Temple, Tirupati",15,'hybrid'), spots: ["Tirumala Temple","Silathoranam","Talakona Falls"] },
        { name: "Tirumala",       icon: "fa-sun",           image: gmap("Tirumala Hills, Andhra Pradesh",14,'satellite'),  spots: ["Venkateswara Temple","Akasa Ganga","Srivari Padalu"] },
        { name: "Kalahasti",      icon: "fa-dharmachakra",  image: gmap("Sri Kalahastiswara Temple, Kalahasti",15,'hybrid'), spots: ["Vayu Lingam","Pathala Vinayaka","Bharadwaja"] },
        { name: "Coorg",          icon: "fa-coffee",        image: gmap("Coorg Coffee Plantation, Karnataka",13,'satellite'), spots: ["Abbey Falls","Raja's Seat","Talakaveri"] },
        { name: "Mysore",         icon: "fa-fort-awesome",  image: gmap("Mysore Palace, Karnataka",15,'hybrid'),          spots: ["Mysore Palace","Chamundi Hill","Brindavan Gardens"] },
        { name: "Bangalore",      icon: "fa-laptop-code",   image: gmap("Lalbagh Botanical Garden, Bangalore",14,'hybrid'), spots: ["Lalbagh","Cubbon Park","Bangalore Palace"] }
    ];

    const routesData = [
        { from: "Coimbatore", to: "Bangalore",  dist: "360 km", price: "By Quote",
          image: `https://maps.googleapis.com/maps/api/staticmap?size=500x220&maptype=roadmap&markers=color:blue%7CCoimbatore,India&markers=color:red%7CBangalore,India&path=color:0x0077B6AA|weight:4|Coimbatore,India|Bangalore,India&key=${GMAP_KEY}`,
          desc: "A comfortable interstate journey connecting the textile city to the IT capital." },
        { from: "Coimbatore", to: "Chennai",    dist: "500 km", price: "By Quote",
          image: `https://maps.googleapis.com/maps/api/staticmap?size=500x220&maptype=roadmap&markers=color:blue%7CCoimbatore,India&markers=color:red%7CChennai,India&path=color:0x0077B6AA|weight:4|Coimbatore,India|Chennai,India&key=${GMAP_KEY}`,
          desc: "A premium journey across Tamil Nadu connecting two major industrial hubs." },
        { from: "Coimbatore", to: "Ooty",       dist: "90 km",  price: "By Quote",
          image: `https://maps.googleapis.com/maps/api/staticmap?size=500x220&maptype=terrain&markers=color:blue%7CCoimbatore,India&markers=color:red%7COoty,India&path=color:0x0077B6AA|weight:4|Coimbatore,India|Ooty,India&key=${GMAP_KEY}`,
          desc: "A beautiful uphill scenic drive through the Nilgiri mountains." },
        { from: "Coimbatore", to: "Kochi",      dist: "190 km", price: "By Quote",
          image: `https://maps.googleapis.com/maps/api/staticmap?size=500x220&maptype=roadmap&markers=color:blue%7CCoimbatore,India&markers=color:red%7CKochi,India&path=color:0x0077B6AA|weight:4|Coimbatore,India|Kochi,India&key=${GMAP_KEY}`,
          desc: "A pleasant cross-state journey from Tamil Nadu to the backwaters of Kerala." },
        { from: "Coimbatore", to: "Kodaikanal", dist: "175 km", price: "By Quote",
          image: `https://maps.googleapis.com/maps/api/staticmap?size=500x220&maptype=terrain&markers=color:blue%7CCoimbatore,India&markers=color:red%7CKodaikanal,India&path=color:0x0077B6AA|weight:4|Coimbatore,India|Kodaikanal,India&key=${GMAP_KEY}`,
          desc: "Through mist-covered mountains to the soul-soothing 'Princess of Hill Stations'." }
    ];



    // ── CRITICAL FIX: Move .pac-container to <body> ──────────────────
    // The hero form has backdrop-filter:blur() which creates a new CSS
    // stacking context, trapping fixed-position children inside it.
    // Google Places .pac-container uses position:fixed and gets clipped.
    // Solution: Watch for pac-container and reparent it to document.body.
    const pacObserver = new MutationObserver(() => {
        document.querySelectorAll('.pac-container').forEach(pac => {
            if (pac.parentElement !== document.body) {
                document.body.appendChild(pac);
            }
        });
    });
    pacObserver.observe(document.body, { childList: true, subtree: true });
}

// ── Main: handle Get Estimate ─────────────────────────────────────────
async function handleQuickEstimate() {
    const name     = (document.getElementById('qb-name')?.value || '').trim();
    const phone    = (document.getElementById('qb-phone')?.value || '').trim();
    const pickup   = (document.getElementById('qb-pickup')?.value || '').trim();
    const drop     = (document.getElementById('qb-drop')?.value   || '').trim();
    const date     = document.getElementById('qb-date')?.value   || '';
    const time     = document.getElementById('qb-time')?.value   || '';
    const tripType = document.querySelector('input[name="qb-trip-type"]:checked')?.value || 'One Way';
    const numDays  = tripType === 'Round Trip' ? (parseInt(document.getElementById('qb-days')?.value) || 1) : 1;
    const errorEl  = document.getElementById('qb-error');
    const btn      = document.getElementById('qb-btn-estimate');

    // Validate
    if (!name || !phone) {
        showError(errorEl, 'Please enter your Full Name and Mobile Number.');
        return;
    }
    if (!pickup || !drop) {
        showError(errorEl, 'Please enter both Pick Up and Drop locations.');
        return;
    }
    if (pickup.toLowerCase() === drop.toLowerCase()) {
        showError(errorEl, 'Pick Up and Drop locations cannot be the same.');
        return;
    }
    if (!date || !time) {
        showError(errorEl, 'Please select a travel date and time.');
        return;
    }
    hideError(errorEl);

    // Loading
    const origHTML = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Calculating...';
    btn.disabled = true;

    try {
        // ── Restore original modal body (in case user previously confirmed a booking) ──
        const modalBody = document.querySelector('#fare-modal .fm-modal-body');
        if (modalBody && _originalModalBodyHTML) {
            modalBody.innerHTML = _originalModalBodyHTML;
        }

        // ── Round Trip: Fixed 250km/day — no Google Maps needed ──
        let km, text, duration;
        if (tripType === 'Round Trip') {
            km       = 250 * numDays;
            text     = `${km} km`;
            duration = `${numDays} day${numDays > 1 ? 's' : ''}`;
        } else {
            // ── One Way: real road distance from Google Maps ──
            const result = await getGoogleDistance(pickup, drop);
            km       = result.km;
            text     = result.text;
            duration = result.duration;
        }

        // Populate modal
        const modal      = document.getElementById('fare-modal');
        const routeLabel = document.getElementById('fm-route-label');
        const distEl     = document.getElementById('fm-distance');
        const tripEl     = document.getElementById('fm-trip-type');
        const cardsEl    = document.getElementById('fm-cards');
        const durationEl = document.getElementById('fm-duration');
        const cityWrapper = document.getElementById('city-wrapper');
        const routeWrapper = document.getElementById('route-wrapper');

        if (cityWrapper) {
            cityWrapper.innerHTML = citiesData.map(city => `
                <div class="swiper-slide">
                    <div class="city-slide-card">
                        <div class="city-card-header" style="position:relative; height:170px; overflow:hidden; background:#0A1128;">
                            <img src="${city.image}" alt="${city.name}"
                                style="width:100%; height:100%; object-fit:cover; transition:transform 0.4s ease;"
                                onerror="this.parentElement.style.background='linear-gradient(135deg,#0077B6,#03045E)'">
                            <div style="position:absolute; inset:0; background:linear-gradient(to top, rgba(3,4,94,0.65) 0%, transparent 55%);"></div>
                            <div style="position:absolute; bottom:10px; left:14px; color:#fff; font-weight:700; font-size:1.05rem; text-shadow:0 1px 4px rgba(0,0,0,0.5);">${city.name}</div>
                            <div style="position:absolute; top:10px; right:10px; background:rgba(0,180,216,0.85); color:#fff; font-size:0.65rem; font-weight:700; padding:2px 8px; border-radius:20px; text-transform:uppercase; letter-spacing:0.5px;"><i class="fa-solid ${city.icon}"></i></div>
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
                    <div class="route-slide-card">
                        <div class="route-card-header" style="position:relative; height:150px; overflow:hidden; background:#0A1128;">
                            <img src="${route.image}" alt="${route.from} to ${route.to}"
                                style="width:100%; height:100%; object-fit:cover;"
                                onerror="this.parentElement.style.background='linear-gradient(135deg,#0077B6,#03045E)'">
                            <div style="position:absolute; inset:0; background:linear-gradient(to top, rgba(3,4,94,0.7) 0%, transparent 50%);"></div>
                            <div style="position:absolute; bottom:10px; left:14px; color:#fff; font-weight:800; font-size:1rem; text-shadow:0 1px 4px rgba(0,0,0,0.6);">${route.from} → ${route.to}</div>
                            <div style="position:absolute; top:10px; right:10px; background:rgba(0,0,0,0.4); backdrop-filter:blur(4px); color:#00B4D8; font-size:0.7rem; font-weight:700; padding:3px 9px; border-radius:20px; border:1px solid rgba(0,180,216,0.4);">${route.dist}</div>
                        </div>
                        <div class="route-card-body">
                            <a href="index.html?pickup=${encodeURIComponent(route.from)}&drop=${encodeURIComponent(route.to)}#home" class="route-btn" data-from="${route.from}" data-to="${route.to}">Book Now</a>
                            <p class="route-desc">${route.desc}</p>
                        </div>
                    </div>
                </div>
            `).join('');
        }

        if (routeLabel) routeLabel.textContent = `${pickup}  →  ${drop}`;
        if (tripType === 'Round Trip') {
            if (distEl)     distEl.textContent = `${250 * numDays} km`;
            if (durationEl) durationEl.textContent = `${numDays} day${numDays > 1 ? 's' : ''}`;
        } else {
            if (distEl)     distEl.textContent = text;
            if (durationEl) durationEl.textContent = duration;
        }
        if (tripEl)     tripEl.textContent  = tripType + (numDays > 1 ? ` — ${numDays} days` : '');

        if (cardsEl) {
            cardsEl.innerHTML = VEHICLES.map(v =>
                buildVehicleCard(v, km, tripType, pickup, drop, date, time, numDays)
            ).join('');
        }

        if (modal) modal.style.display = 'block';
        document.body.style.overflow = 'hidden';

    } catch (err) {
        console.error('Estimate error:', err);
        showError(errorEl, 'Could not calculate distance. Please check the city names and try again.');
    } finally {
        btn.innerHTML = origHTML;
        btn.disabled = false;
    }
}

function showError(el, msg) {
    if (el) { el.textContent = msg; el.style.display = 'block'; }
}
function hideError(el) {
    if (el) el.style.display = 'none';
}

// ── Cache original modal body so it can be restored each estimate ─────
let _originalModalBodyHTML = null;

// ── Wire up after DOM ready ───────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    // Save original modal body HTML (before any openBookingForm call replaces it)
    const _initModal = document.querySelector('#fare-modal .fm-modal-body');
    if (_initModal) _originalModalBodyHTML = _initModal.innerHTML;

    // --- Pre-fill Quick Estimate Form from URL parameters ---
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('car') || urlParams.has('pickup')) {
        const qbPickup = document.getElementById('qb-pickup');
        const qbDrop = document.getElementById('qb-drop');
        const qbCar = document.getElementById('qb-car');
        
        if (qbPickup && urlParams.get('pickup')) qbPickup.value = urlParams.get('pickup');
        if (qbDrop && urlParams.get('drop')) qbDrop.value = urlParams.get('drop');
        
        // Ensure the car exact match inside select element (Sedan, SUV, Innova Crysta, etc.)
        if (qbCar && urlParams.get('car')) {
            const carVal = urlParams.get('car');
            const options = Array.from(qbCar.options).map(o => o.value);
            if (options.includes(carVal)) {
                qbCar.value = carVal;
            }
        }
    }

    // Estimate button
    const btn = document.getElementById('qb-btn-estimate');
    if (btn) btn.addEventListener('click', handleQuickEstimate);

    // Enter key in inputs
    ['qb-name', 'qb-phone', 'qb-pickup', 'qb-drop', 'qb-date', 'qb-days'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); handleQuickEstimate(); } });
    });

    // Swap button
    const swapBtn = document.getElementById('qb-swap-btn');
    if (swapBtn) {
        swapBtn.addEventListener('click', () => {
            const pickupEl = document.getElementById('qb-pickup');
            const dropEl = document.getElementById('qb-drop');
            if (pickupEl && dropEl) {
                const temp = pickupEl.value;
                pickupEl.value = dropEl.value;
                dropEl.value = temp;
            }
        });
    }

    // Clear input content
    document.getElementById('clear-pickup')?.addEventListener('click', () => {
        const el = document.getElementById('qb-pickup');
        if (el) { el.value = ''; el.focus(); }
    });
    document.getElementById('clear-drop')?.addEventListener('click', () => {
        const el = document.getElementById('qb-drop');
        if (el) { el.value = ''; el.focus(); }
    });

    // Close modal on backdrop click
    const modal = document.getElementById('fare-modal');
    if (modal) {
        modal.addEventListener('click', e => {
            if (e.target === modal) { modal.style.display = 'none'; document.body.style.overflow = ''; }
        });
    }

    // Trip toggle → show/hide return date
    document.querySelectorAll('input[name="qb-trip-type"]').forEach(radio => {
        radio.addEventListener('change', e => {
            const endGroup = document.getElementById('qb-end-date-group');
            if (endGroup) endGroup.style.display = e.target.value === 'Round Trip' ? 'block' : 'none';
        });
    });

    // Init Places Autocomplete once Google Maps is ready
    if (typeof google !== 'undefined' && google.maps) {
        initAutocomplete();
    } else {
        // Poll until Maps SDK is loaded (async defer)
        const poll = setInterval(() => {
            if (typeof google !== 'undefined' && google.maps) {
                clearInterval(poll);
                initAutocomplete();
            }
        }, 200);
    }
});

// Close modal button (global, used by inline onclick)
window.closeFareModal = () => {
    const modal = document.getElementById('fare-modal');
    if (modal) { modal.style.display = 'none'; document.body.style.overflow = ''; }
};

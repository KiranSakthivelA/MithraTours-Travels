const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, 'index.html');
const inputHtml = fs.readFileSync(targetPath, 'utf8');

function extract(startStr, endStr) {
    const startIndex = inputHtml.indexOf(startStr);
    let endIndex = inputHtml.indexOf(endStr, startIndex);
    if(startIndex === -1 || endIndex === -1) throw new Error("Missing: " + startStr + " or " + endStr);
    return inputHtml.substring(startIndex, endIndex);
}

const prevHero = extract('<!DOCTYPE html>', '<!-- Hero Section -->');
const hero = extract('<!-- Hero Section -->', '<!-- Services Overview -->');
const services = extract('<!-- Services Overview -->', '<!-- Fleet Section -->');
const fleet = extract('<!-- Fleet Section -->', '<!-- Transparent Pricing -->');
const pricing = extract('<!-- Transparent Pricing -->', '<!-- Wide Service Coverage -->');
const wideCoverage = extract('<!-- Wide Service Coverage -->', '<!-- Popular Cities -->');
const popularCities = extract('<!-- Popular Cities -->', '<!-- Popular Routes -->');
const popularRoutes = extract('<!-- Popular Routes -->', '<!-- Feedback Section -->');
const feedback = extract('<!-- Feedback Section -->', '<!-- Ready on Your Next Trip CTA -->');
const cta = extract('<!-- Ready on Your Next Trip CTA -->', '<!-- Routes & Contact section combined -->');
const routesAndContact = extract('<!-- Routes & Contact section combined -->', '<!-- Footer -->');
const footer = inputHtml.substring(inputHtml.indexOf('<!-- Footer -->'));

// Split Routes and Contact
const routesInfoStart = routesAndContact.indexOf('<div class="routes-info reveal">');
const routesInfoEnd = routesAndContact.indexOf('<!-- Comprehensive Booking Form -->');
const formStart = routesAndContact.indexOf('<!-- Comprehensive Booking Form -->');
const formEnd = routesAndContact.lastIndexOf('</div>'); // end of contact-container

let routesInfoStr = routesAndContact.substring(routesInfoStart, routesInfoEnd).trim();
let formStr = routesAndContact.substring(formStart, formEnd).trim();

// Add section wrappers
const newRoutesHtml = `
    <!-- Routes Section -->
    <section id="routes" class="contact-section">
        <div class="contact-container" style="display:block; max-width: 1000px; margin: 0 auto;">
            \${routesInfoStr}
        </div>
    </section>
`;

const newContactHtml = `
    <!-- Booking / Contact Section -->
    <section id="contact" class="contact-section" style="background: rgba(255,255,255,0.02);">
        <div class="contact-container" style="display:block; max-width: 800px; margin: 0 auto;">
            \${formStr}
        </div>
    </section>
`;

// Navbar Order: Home, Our Fleet, Routes, Services
const newHTML = prevHero +
    hero +
    fleet +
    newRoutesHtml +
    popularCities +
    popularRoutes +
    services +
    pricing +
    wideCoverage +
    newContactHtml +
    feedback +
    cta +
    footer;

fs.writeFileSync(targetPath, newHTML);
console.log("Successfully reordered index.html sections.");

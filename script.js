// DOM Elements
const foregroundColorInput = document.getElementById('foreground-color');
const foregroundHexInput = document.getElementById('foreground-hex');
const backgroundColorInput = document.getElementById('background-color');
const backgroundHexInput = document.getElementById('background-hex');
const checkContrastButton = document.getElementById('check-contrast');
const resultsSection = document.querySelector('.results-section');
const contrastPreview = document.getElementById('contrast-preview');
const previewText = document.getElementById('preview-text');
const contrastRatioElement = document.getElementById('contrast-ratio');
const complianceResults = document.getElementById('compliance-results');
const baseColorInput = document.getElementById('base-color');
const baseHexInput = document.getElementById('base-hex');
const paletteTypeSelect = document.getElementById('palette-type');
const generatePaletteButton = document.getElementById('generate-palette');
const paletteResults = document.getElementById('palette-results');

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    // Set up event listeners
    setupEventListeners();
    
    // Check initial contrast
    checkContrast();
});

// Set up all event listeners
function setupEventListeners() {
    // Color input synchronization
    foregroundColorInput.addEventListener('input', function() {
        foregroundHexInput.value = this.value;
        checkContrast();
    });
    
    foregroundHexInput.addEventListener('input', function() {
        if (isValidHex(this.value)) {
            foregroundColorInput.value = normalizeHex(this.value);
            checkContrast();
        }
    });
    
    backgroundColorInput.addEventListener('input', function() {
        backgroundHexInput.value = this.value;
        checkContrast();
    });
    
    backgroundHexInput.addEventListener('input', function() {
        if (isValidHex(this.value)) {
            backgroundColorInput.value = normalizeHex(this.value);
            checkContrast();
        }
    });
    
    // Base color synchronization for palette generator
    baseColorInput.addEventListener('input', function() {
        baseHexInput.value = this.value;
    });
    
    baseHexInput.addEventListener('input', function() {
        if (isValidHex(this.value)) {
            baseColorInput.value = normalizeHex(this.value);
        }
    });
    
    // Button actions
    checkContrastButton.addEventListener('click', checkContrast);
    generatePaletteButton.addEventListener('click', generatePalette);
}

// Check if a string is a valid hex color
function isValidHex(color) {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}

// Normalize hex color to 6-digit format
function normalizeHex(hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3) {
        hex = hex.split('').map(char => char + char).join('');
    }
    return '#' + hex;
}

// Convert hex to RGB
function hexToRgb(hex) {
    hex = hex.replace('#', '');
    
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    return { r, g, b };
}

// Calculate relative luminance
function getLuminance(r, g, b) {
    const sRGB = [r, g, b].map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
}

// Calculate contrast ratio between two colors
function getContrastRatio(foreground, background) {
    const fgRgb = hexToRgb(foreground);
    const bgRgb = hexToRgb(background);
    
    const fgLuminance = getLuminance(fgRgb.r, fgRgb.g, fgRgb.b);
    const bgLuminance = getLuminance(bgRgb.r, bgRgb.g, bgRgb.b);
    
    const lighter = Math.max(fgLuminance, bgLuminance);
    const darker = Math.min(fgLuminance, bgLuminance);
    
    return (lighter + 0.05) / (darker + 0.05);
}

// Check WCAG compliance
function checkCompliance(ratio) {
    return {
        aa: ratio >= 4.5,
        aaLarge: ratio >= 3,
        aaa: ratio >= 7,
        aaaLarge: ratio >= 4.5
    };
}

// Format contrast ratio
function formatRatio(ratio) {
    return ratio.toFixed(2) + ':1';
}

// Main contrast checking function
function checkContrast() {
    const foreground = foregroundColorInput.value;
    const background = backgroundColorInput.value;
    
    // Update preview
    contrastPreview.style.backgroundColor = background;
    contrastPreview.style.color = foreground;
    previewText.style.color = foreground;
    
    // Calculate contrast ratio
    const ratio = getContrastRatio(foreground, background);
    const formattedRatio = formatRatio(ratio);
    
    // Update ratio display
    contrastRatioElement.textContent = formattedRatio;
    
    // Check compliance
    const compliance = checkCompliance(ratio);
    
    // Update compliance results
    complianceResults.innerHTML = `
        <div class="compliance-item">
            <span class="level">AA (Normal Text)</span>
            <span class="status ${compliance.aa ? 'pass' : 'fail'}">${compliance.aa ? 'Pass' : 'Fail'}</span>
        </div>
        <div class="compliance-item">
            <span class="level">AA (Large Text)</span>
            <span class="status ${compliance.aaLarge ? 'pass' : 'fail'}">${compliance.aaLarge ? 'Pass' : 'Fail'}</span>
        </div>
        <div class="compliance-item">
            <span class="level">AAA (Normal Text)</span>
            <span class="status ${compliance.aaa ? 'pass' : 'fail'}">${compliance.aaa ? 'Pass' : 'Fail'}</span>
        </div>
        <div class="compliance-item">
            <span class="level">AAA (Large Text)</span>
            <span class="status ${compliance.aaaLarge ? 'pass' : 'fail'}">${compliance.aaaLarge ? 'Pass' : 'Fail'}</span>
        </div>
    `;
    
    // Show results section
    resultsSection.hidden = false;
}

// Generate color palette
function generatePalette() {
    const baseColor = baseColorInput.value;
    const paletteType = paletteTypeSelect.value;
    
    let colors = [];
    
    switch(paletteType) {
        case 'monochromatic':
            colors = generateMonochromaticPalette(baseColor);
            break;
        case 'analogous':
            colors = generateAnalogousPalette(baseColor);
            break;
        case 'complementary':
            colors = generateComplementaryPalette(baseColor);
            break;
        case 'triadic':
            colors = generateTriadicPalette(baseColor);
            break;
    }
    
    displayPalette(colors);
}

// Convert RGB to HEX
function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}

// Convert HEX to HSL
function hexToHsl(hex) {
    let { r, g, b } = hexToRgb(hex);
    
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    
    if (max === min) {
        h = s = 0; // achromatic
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        
        h /= 6;
    }
    
    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
    };
}

// Convert HSL to HEX
function hslToHex(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;
    
    let r, g, b;
    
    if (s === 0) {
        r = g = b = l; // achromatic
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };
        
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }
    
    return rgbToHex(
        Math.round(r * 255),
        Math.round(g * 255),
        Math.round(b * 255)
    );
}

// Generate monochromatic palette
function generateMonochromaticPalette(baseColor) {
    const baseHsl = hexToHsl(baseColor);
    const colors = [baseColor];
    
    // Generate lighter shades
    for (let i = 1; i <= 2; i++) {
        const light = Math.min(100, baseHsl.l + (i * 15));
        colors.push(hslToHex(baseHsl.h, baseHsl.s, light));
    }
    
    // Generate darker shades
    for (let i = 1; i <= 2; i++) {
        const dark = Math.max(0, baseHsl.l - (i * 15));
        colors.push(hslToHex(baseHsl.h, baseHsl.s, dark));
    }
    
    return colors;
}

// Generate analogous palette
function generateAnalogousPalette(baseColor) {
    const baseHsl = hexToHsl(baseColor);
    const colors = [baseColor];
    
    // Generate analogous colors (30° apart)
    colors.push(hslToHex((baseHsl.h + 30) % 360, baseHsl.s, baseHsl.l));
    colors.push(hslToHex((baseHsl.h + 60) % 360, baseHsl.s, baseHsl.l));
    colors.push(hslToHex((baseHsl.h - 30 + 360) % 360, baseHsl.s, baseHsl.l));
    colors.push(hslToHex((baseHsl.h - 60 + 360) % 360, baseHsl.s, baseHsl.l));
    
    return colors;
}

// Generate complementary palette
function generateComplementaryPalette(baseColor) {
    const baseHsl = hexToHsl(baseColor);
    const colors = [baseColor];
    
    // Complementary color (180° apart)
    colors.push(hslToHex((baseHsl.h + 180) % 360, baseHsl.s, baseHsl.l));
    
    // Split complementary colors
    colors.push(hslToHex((baseHsl.h + 150) % 360, baseHsl.s, baseHsl.l));
    colors.push(hslToHex((baseHsl.h + 210) % 360, baseHsl.s, baseHsl.l));
    
    // Tints and shades
    colors.push(hslToHex(baseHsl.h, baseHsl.s, Math.min(100, baseHsl.l + 20)));
    colors.push(hslToHex(baseHsl.h, baseHsl.s, Math.max(0, baseHsl.l - 20)));
    
    return colors;
}

// Generate triadic palette
function generateTriadicPalette(baseColor) {
    const baseHsl = hexToHsl(baseColor);
    const colors = [baseColor];
    
    // Triadic colors (120° apart)
    colors.push(hslToHex((baseHsl.h + 120) % 360, baseHsl.s, baseHsl.l));
    colors.push(hslToHex((baseHsl.h + 240) % 360, baseHsl.s, baseHsl.l));
    
    // Tints and shades of each
    colors.push(hslToHex(baseHsl.h, baseHsl.s, Math.min(100, baseHsl.l + 15)));
    colors.push(hslToHex((baseHsl.h + 120) % 360, baseHsl.s, Math.min(100, baseHsl.l + 15)));
    colors.push(hslToHex((baseHsl.h + 240) % 360, baseHsl.s, Math.min(100, baseHsl.l + 15)));
    
    return colors;
}

// Display the generated palette
function displayPalette(colors) {
    paletteResults.innerHTML = '';
    
    colors.forEach(color => {
        const swatch = document.createElement('div');
        swatch.className = 'color-swatch';
        swatch.style.backgroundColor = color;
        
        // Determine if text should be light or dark for better readability
        const rgb = hexToRgb(color);
        const luminance = getLuminance(rgb.r, rgb.g, rgb.b);
        
        if (luminance > 0.5) {
            swatch.classList.add('light');
        }
        
        swatch.innerHTML = `
            <span>${color.toUpperCase()}</span>
            <div class="color-info">Click to copy</div>
        `;
        
        // Add click to copy functionality
        swatch.addEventListener('click', function() {
            navigator.clipboard.writeText(color).then(() => {
                const originalText = this.querySelector('.color-info').textContent;
                this.querySelector('.color-info').textContent = 'Copied!';
                
                setTimeout(() => {
                    this.querySelector('.color-info').textContent = originalText;
                }, 2000);
            });
        });
        
        paletteResults.appendChild(swatch);
    });
}
'use strict';

let alphabet = "123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ"
var fxhash = "oo" + Array(49).fill(0).map(_=>alphabet[(Math.random()*alphabet.length)|0]).join('')
let b58dec = str=>[...str].reduce((p,c)=>p*alphabet.length+alphabet.indexOf(c)|0, 0)
let fxhashTrunc = fxhash.slice(2)
let regex = new RegExp(".{" + ((fxhash.length/4)|0) + "}", 'g')
let hashes = fxhashTrunc.match(regex).map(h => b58dec(h))
let sfc32 = (a, b, c, d) => {
    return () => {
        a |= 0; b |= 0; c |= 0; d |= 0
        var t = (a + b | 0) + d | 0
        d = d + 1 | 0
        a = b ^ b >>> 9
        b = c + (c << 3) | 0
        c = c << 21 | c >>> 11
        c = c + t | 0
        return (t >>> 0) / 4294967296
    }
}
var fxrand = sfc32(...hashes)

class Random {
    constructor(seed) { this.setSeed(seed); }
    
    setSeed(seed) { this.seed = seed|0; }
    float(a=1, b=0) { // xorshift
        this.seed ^= this.seed << 13;
        this.seed ^= this.seed >>> 17;
        this.seed ^= this.seed << 5;
        return b + (a-b) * Math.abs(this.seed % 1e9) / 1e9;
    }
    floatSign(a, b) { return this.float(a,b) * this.sign(); }
    int(a=1, b=0) { return this.float(a, b)|0; }
    bool(chance = .5) { return this.float() < chance; }
    sign() { return this.bool() ? -1 : 1; }
    angle(p=1) { return this.float(PI*2*p); }
}
const random = new Random(fxrand()*1e9); 

const PI = Math.PI;
const mod = (a, b = 1) => ((a % b) + b) % b;
const clamp = (v, min = 0, max = 1) => v < min ? min : v > max ? max : v;
const hsl = (h = 0, s = 0, l = 0, a = 1) => `hsla(${mod(h) * 360},${clamp(s) * 100}%,${clamp(l) * 100}%,${clamp(a)})`;

let frame = 0;

const mainCanvas = document.getElementById('pixelArtCanvas');
const mainContext = mainCanvas.getContext('2d');

const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');

let isInverted;
let isGrayscale;
let isRainbow;
let windowOperatorType;
let backgroundOperatorType;
let seedX, seedY, startY;
let brightBuildings;
let windowHueOffset;
let roomsPerSecond;
let extraHueOffset;
let startScale;
let foreSat;
let shiftHue;
let bigMoon;
let earthquake;
let thinBuildings;
let neonHue;
let moonCount;

let animationFrameId; 

function applyOperator(operator, x, y) {
    x += seedX;
    y += seedY;

    switch (operator) {
        case 0: return x & y;
        case 1: return x | y;
        case 2: return x ^ y;
        case 3: return x + y;
        case 4: return x * y;
        case 5: return x / y + y / x;
        case 6: return (x - y) ^ (x + y);
        default: return 0;
    }
}

function compositeImage() {

    mainCanvas.width = mainCanvas.width;
    mainContext.drawImage(canvas, 0, 0, mainCanvas.width, mainCanvas.height);

    if (isGrayscale) {
        mainContext.save();
        mainContext.fillStyle = '#fff';
        mainContext.globalCompositeOperation = 'saturation';
        mainContext.fillRect(0, 0, mainCanvas.width, mainCanvas.height);
        mainContext.restore();
    }
    if (isInverted) {
        mainContext.save();
        mainContext.fillStyle = '#fff';
        mainContext.globalCompositeOperation = 'difference';
        mainContext.fillRect(0, 0, mainCanvas.width, mainCanvas.height);
        mainContext.restore();
    }
}

function drawBackground() {
    const backgroundHueIntensity = random.int(50, 100);
    const backgroundStartBright = random.float(0, .2);
    const backgroundSat = random.float(.2, .9);
    const hueOffset = random.float(.4, .75);
    const backBrightness = random.float(200, 600);
    const backBrighHue = random.int(500, 2e3);
    const scale = random.int(8, 33); 
    const w = Math.ceil(canvas.width / scale);
    const h = Math.ceil(canvas.height / scale);

    let seedScale = random.int(1e6);
    for (let k = w * h; k--;) {
        const i = k % w, j = k / w | 0;
        const o = applyOperator(backgroundOperatorType, i, j);
        const bright = Math.cos(o * seedScale);
        const hue = bright * backgroundHueIntensity;

        context.fillStyle = hsl(
            extraHueOffset + hueOffset + hue / 800 + j / (isRainbow ? 100 : 300),
            backgroundSat + hue / 1800,
            backgroundStartBright + hue / backBrighHue + j / backBrightness);
        context.fillRect(i * scale, j * scale, scale, scale);
    }

    context.save();
    context.globalCompositeOperation = 'difference'; 
    context.fillStyle = '#fff'; 
    for (let i = moonCount; i--;) {
        const m = 99; 
        const r = bigMoon ? random.float(500, 700) : random.float(150, 300); 
        const x = random.float(m * 2 + r, canvas.width - m * 2 - r);
        const y = random.float(m + r, m + r + 300);
        context.beginPath();
        context.arc(x, y, r, 0, Math.PI * 2); 
        context.fill();
    }
    context.restore();
}

function update() {
    const FPS = 60;
    const t = frame++ / FPS;

    mainCanvas.style.boxShadow = `0px 0px 50px ${10 + 5 * Math.sin(t * PI / 2)}px ` +
        hsl((isRainbow ? t / 60 : 0) + neonHue, 1, isGrayscale ? 1 : .5);

    const roomsWide = thinBuildings ? random.int(1, 4) : random.int(5, 12);
    const Y = startY + (t * 60) * 7 * roomsWide / roomsPerSecond;

    if (Y > canvas.height + 500) { 
        cancelAnimationFrame(animationFrameId); 
        return;
    }

    context.save();
    if (earthquake) {
        context.translate(canvas.width / 2, canvas.height / 2);
        context.rotate(random.floatSign(.1));
        context.translate(-canvas.width / 2, -canvas.height / 2);
    }

    const X = random.float(-200, canvas.width + 200); 
    const w = roomsWide * 2 + 1; 
    const seedScale = random.int(1e6); 
    const scale = startScale + t * 10 | 0;

    for (let k = 1e4; k--;) {
        const i = k % w, j = k / w | 0; 
        const o = applyOperator(windowOperatorType, i, j); 
        const bright = Math.cos(o * seedScale); 

        let h = windowHueOffset - j * .001 
            + bright * (.15 - windowHueOffset) 
            + (isRainbow ? t : 0); 
        let s = foreSat + random.floatSign(.1); 
        let l = bright; 

        if (i * j % 2 == 0 && !brightBuildings)
            l = s = 0;
        
        context.fillStyle = hsl(h + extraHueOffset, s, l); 
        context.fillRect(
            i * scale + X | 0, j * scale + Y | 0, 
            scale + (earthquake ? random.float(0, 5) : 0), 
            scale + (earthquake ? random.float(0, 5) : 0));
    }
    context.restore();
    compositeImage(); 
    animationFrameId = requestAnimationFrame(update); 
}

function startNewGeneration() {

    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
    frame = 0;
    
    canvas.width = 4096;
    canvas.height = 2048;

    const operatorTypes = ['&', '|', '^', '+', '*', '/', '-^+'];
    windowOperatorType = random.int(operatorTypes.length);
    backgroundOperatorType = random.int(operatorTypes.length);
    startScale = random.int(5, 9);

    moonCount = random.int(1, 4);
    if (random.bool(.05)) moonCount = random.int(30, 60);
    if (random.bool(.04)) moonCount = 0;
    if (random.bool(.05)) bigMoon = moonCount = 1;

    brightBuildings = random.bool(.05);
    isInverted = random.bool(.04);
    earthquake = random.bool(.04);
    thinBuildings = random.bool(.03);
    isGrayscale = random.bool(.1);
    isRainbow = !isGrayscale && random.bool(.03);
    shiftHue = !isRainbow && !isGrayscale && random.bool(.1);

    extraHueOffset = shiftHue ? .5 : isRainbow ? random.float() : 0;
    neonHue = random.float();
    seedX = random.int(1e3);
    seedY = random.int(1e3);
    windowHueOffset = random.float(0, .15);
    roomsPerSecond = random.float(2, 3);
    startY = random.float(99, 400);
    foreSat = random.float(isRainbow ? .4 : .1, 1);

    drawBackground();

    animationFrameId = requestAnimationFrame(update);
}

function downloadArt() {

    const dataURL = canvas.toDataURL('image/png'); 
    const a = document.createElement('a');
    a.href = dataURL;

    const date = new Date();
    const filename = `bit-dot-city-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}-${String(date.getHours()).padStart(2, '0')}${String(date.getMinutes()).padStart(2, '0')}${String(date.getSeconds()).padStart(2, '0')}.png`;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

const generateBtn = document.getElementById('generateBtn');

generateBtn.addEventListener('click', startNewGeneration);

const downloadBtn = document.getElementById('downloadBtn');

downloadBtn.addEventListener('click', downloadArt);

startNewGeneration();

window.addEventListener('resize', () => {

    compositeImage(); 
});

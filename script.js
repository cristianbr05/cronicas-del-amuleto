/* --- AUDIO SYSTEM (Web Audio API) --- */
class SoundManager {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.isMuted = false;
    this.oscillators = [];
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.3;
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : 0.3, this.ctx.currentTime, 0.1);
    }
    return this.isMuted;
  }

  stopAll() {
    this.oscillators.forEach(node => {
      try { node.stop(); node.disconnect(); } catch(e){}
    });
    this.oscillators = [];
  }

  playAmbience(type) {
    if (!this.ctx || this.isMuted) return;
    this.stopAll();
    
    switch(type) {
      case 'bosque': 
        this.createNoise('pink', 0.05);
        this.createOscillator(200, 'sine', 0.02, 0.5); // Wind
        break;
      case 'cueva': 
        this.createOscillator(100, 'sine', 0.1);
        this.createOscillator(103, 'sine', 0.05); // Binaural beat
        break;
      case 'volcan': 
        this.createNoise('brown', 0.15);
        this.createOscillator(50, 'sawtooth', 0.05);
        break;
      case 'ruinas': 
        this.createOscillator(800, 'sine', 0.02);
        this.createNoise('pink', 0.02);
        break;
      case 'templo': 
        this.createOscillator(440, 'sine', 0.05);
        this.createOscillator(880, 'sine', 0.02);
        break;
      case 'victory':
        this.createOscillator(523.25, 'triangle', 0.1); // C5
        this.createOscillator(659.25, 'triangle', 0.1); // E5
        this.createOscillator(783.99, 'triangle', 0.1); // G5
        break;
    }
  }

  createOscillator(freq, type, vol, lfoRate = 0) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = vol;
    
    if (lfoRate > 0) {
        const lfo = this.ctx.createOscillator();
        lfo.frequency.value = lfoRate;
        const lfoGain = this.ctx.createGain();
        lfoGain.gain.value = vol * 0.5;
        lfo.connect(lfoGain);
        lfoGain.connect(gain.gain);
        lfo.start();
        this.oscillators.push(lfo);
    }

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    this.oscillators.push(osc);
  }

  createNoise(type, vol) {
    const bufferSize = 2 * this.ctx.sampleRate;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    const gain = this.ctx.createGain();
    
    const filter = this.ctx.createBiquadFilter();
    if (type === 'pink') {
        filter.type = 'lowpass';
        filter.frequency.value = 400;
    } else if (type === 'brown') {
        filter.type = 'lowpass';
        filter.frequency.value = 150;
    }
    
    gain.gain.value = vol;
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noise.start();
    this.oscillators.push(noise);
  }
}

const soundManager = new SoundManager();

// --- DATOS DEL JUEGO ---
const itemsData = {
  "pocion": { name: "Poción", type: "consumable", heal: 30 },
  "pocion_maxima": { name: "Poción Máxima", type: "consumable", heal: 100 },
  "espada_madera": { name: "Espada de Madera", type: "weapon", atk: 10 },
  "espada_hierro": { name: "Espada de Hierro", type: "weapon", atk: 25 },
  "armadura_cuero": { name: "Armadura de Cuero", type: "armor", def: 10 },
  "armadura_acero": { name: "Armadura de Acero", type: "armor", def: 25 },
  "amuleto_luz": { name: "Amuleto de Luz", type: "key", desc: "Brilla con una luz cegadora." }
};

const worldData = {
  "bosque_1": {
    name: "Entrada del Bosque Oscuro",
    desc: "Árboles imponentes bloquean la luz del sol. El aire es denso y húmedo.",
    exits: { norte: "bosque_2", este: "cueva_1" },
    items: [],
    x: 1, y: 3,
    theme: "bosque",
    animClass: "anim-float",
    ascii: [
      "          .     .  .      +     .      .          .      ",
      "     .       .      .     #       .           .          ",
      "        .      .         ###            .      .      .  ",
      "      .      .   \"#:. .:##\"##:. .:#\"  .      .           ",
      "          .      . \"####\"###\"####\"  .                    ",
      "       .     \"#:.    .:#\"###\"#:.    .:#\"  .      .       ",
      "  .             \"#########\"#########\"        .        .  ",
      "        .    \"#:.  \"####\"###\"####\"  .:#\"   .       .     ",
      "     .     .  \"#######\"\"##\"##\"\"#######\"                  ",
      "                .\"##\"#####\"#####\"##\"           .      .  ",
      "    .   \"#:. ...  .:##\"###\"###\"##:.  ... .:#\"     .      ",
      "      .     \"#######\"##\"#####\"##\"#######\"      .     .   ",
      "    .    .     \"#####\"\"#######\"\"#####\"    .      .       ",
      "            .     \"      000      \"    .     .           ",
      "       .         .   .   000     .        .       .      ",
      ".........................000.............................",
      "▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓000▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓",
      "▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓000▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓"
    ]
  },
  "bosque_2": {
    name: "Sendero Sinuoso",
    desc: "Un camino estrecho rodeado de espinas. Escuchas ruidos extraños.",
    exits: { sur: "bosque_1", norte: "bosque_3" },
    items: ["pocion"],
    x: 1, y: 2,
    theme: "bosque",
    animClass: "anim-float",
    ascii: [
      "      .            .        .      .      .      .       ",
      "  .         .    .      .        .      .    .      .    ",
      "       .           .   .      .    .         .           ",
      "   .        .  .      .   .      .    .  .      .   .    ",
      "      .      .    .      .    .      .    .      .       ",
      "  .      .      .    .      .    .      .    .      .    ",
      "   ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒   ",
      "   ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒   ",
      "   ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒   ",
      "   ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒   ",
      "   ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒   ",
      "   ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒   ",
      "   ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒   ",
      "   ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒   ",
      "   ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒   ",
      "   ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒   ",
      "   ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒   ",
      "   ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒   "
    ]
  },
  "bosque_3": {
    name: "Claro Oculto",
    desc: "Un pequeño claro donde la luz logra filtrarse. Hay restos de un campamento.",
    exits: { sur: "bosque_2" },
    items: ["espada_madera"],
    x: 1, y: 1,
    theme: "bosque",
    animClass: "anim-float",
    ascii: [
      "          .          .            .             .        ",
      "      .          .   _      .       .       .       .    ",
      "   .      .         (_)         .       .       .        ",
      "      .       .      |      .       .       .       .    ",
      "   .      .         /|\\         .       .       .        ",
      "      .       .    / | \\    .       .       .       .    ",
      "   .      .       /__|__\\       .       .       .        ",
      "      .       .      |      .       .       .       .    ",
      "   .      .          |          .       .       .        ",
      "      .       .      |      .       .       .       .    ",
      "   .      .          |          .       .       .        ",
      "      .       .      |      .       .       .       .    ",
      "   .      .          |          .       .       .        ",
      "      .       .      |      .       .       .       .    ",
      "   .      .          |          .       .       .        ",
      "      .       .      |      .       .       .       .    ",
      "   .      .          |          .       .       .        ",
      "      .       .      |      .       .       .       .    "
    ]
  },
  "cueva_1": {
    name: "Boca de la Cueva de los Ecos",
    desc: "Una gran apertura en la roca. El viento silba al entrar.",
    exits: { oeste: "bosque_1", adentro: "cueva_2", este: "ruinas_1" },
    items: [],
    x: 2, y: 3,
    theme: "cueva",
    animClass: "anim-flicker",
    ascii: [
      "              /\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\               ",
      "            _/                        \\_             ",
      "          _/                            \\_           ",
      "         /                                \\          ",
      "        /                                  \\         ",
      "       |                                    |        ",
      "       |      (                      )      |        ",
      "       |       \\                    /       |        ",
      "       |        \\                  /        |        ",
      "       |         \\                /         |        ",
      "       |          \\              /          |        ",
      "       |           \\            /           |        ",
      "       |            \\          /            |        ",
      "       |             \\        /             |        ",
      "       |              \\      /              |        ",
      "       |               \\    /               |        ",
      "       |                \\  /                |        ",
      "       |_________________\\/_________________|        "
    ]
  },
  "cueva_2": {
    name: "Túnel Estrecho",
    desc: "Apenas cabes por aquí. Las paredes están húmedas.",
    exits: { afuera: "cueva_1", profundo: "cueva_3" },
    items: ["pocion"],
    x: 2, y: 2,
    theme: "cueva",
    animClass: "anim-flicker",
    ascii: [
      "         ________________________________________        ",
      "        /                                        \\       ",
      "       /                                          \\      ",
      "      |      ________________________________      |     ",
      "      |     /                                \\     |     ",
      "      |    |                                  |    |     ",
      "      |    |                                  |    |     ",
      "      |    |                                  |    |     ",
      "      |    |                                  |    |     ",
      "      |    |                                  |    |     ",
      "      |    |                                  |    |     ",
      "      |    |                                  |    |     ",
      "      |    |                                  |    |     ",
      "      |    |                                  |    |     ",
      "      |     \\________________________________/     |     ",
      "      |                                            |     ",
      "       \\                                          /      ",
      "        \\________________________________________/       "
    ]
  },
  "cueva_3": {
    name: "Caverna Profunda",
    desc: "Una cueva amplia iluminada por hongos bioluminiscentes.",
    exits: { arriba: "cueva_2" },
    items: ["armadura_cuero"],
    x: 2, y: 1,
    theme: "cueva",
    animClass: "anim-pulse",
    ascii: [
      "       .          .           .           .          .   ",
      "     .      o   .      o          .   o       .          ",
      "       .        .           .         .          .       ",
      "     o       .       o          . o       .          .   ",
      "        .       .         .           .          .       ",
      "      .      o        .         o   .      o          .  ",
      "         .        .       .         .          .         ",
      "      o        .         o        .      o          .    ",
      "        .         .         .         .          .       ",
      "     .       o         .         o          .          . ",
      "       .          .           .           .          .   ",
      "     .      o   .      o          .   o       .          ",
      "       .        .           .         .          .       ",
      "     o       .       o          . o       .          .   ",
      "        .       .         .           .          .       ",
      "      .      o        .         o   .      o          .  ",
      "         .        .       .         .          .         ",
      "      o        .         o        .      o          .    "
    ]
  },
  "ruinas_1": {
    name: "Patio en Ruinas",
    desc: "Restos de una antigua civilización. Columnas caídas por doquier.",
    exits: { oeste: "cueva_1", adentro: "ruinas_2", este: "templo_1" },
    items: [],
    x: 3, y: 3,
    theme: "ruinas",
    animClass: "",
    ascii: [
      "         |\\                      /|                      ",
      "         | \\                    / |                      ",
      "         |  \\                  /  |                      ",
      "         |   \\                /   |                      ",
      "         |    \\              /    |                      ",
      "         |     \\____________/     |                      ",
      "         |      |          |      |                      ",
      "         |      |          |      |                      ",
      "         |______|__________|______|                      ",
      "         |      |          |      |                      ",
      "         |      |          |      |                      ",
      "         |      |          |      |                      ",
      "         |      |          |      |                      ",
      "         |      |          |      |                      ",
      "         |      |          |      |                      ",
      "       __|______|__________|______|__                    ",
      "      |                              |                   ",
      "      |______________________________|                   "
    ]
  },
  "ruinas_2": {
    name: "Salón Principal",
    desc: "Un gran salón con mosaicos destrozados en el suelo.",
    exits: { afuera: "ruinas_1", abajo: "ruinas_3" },
    items: ["pocion"],
    x: 3, y: 2,
    theme: "ruinas",
    animClass: "",
    ascii: [
      "       __________________________________________        ",
      "      |    __________________________________    |       ",
      "      |   |                                  |   |       ",
      "      |   |                                  |   |       ",
      "      |   |      [ ]                [ ]      |   |       ",
      "      |   |                                  |   |       ",
      "      |   |                                  |   |       ",
      "      |   |                                  |   |       ",
      "      |   |                                  |   |       ",
      "      |   |                                  |   |       ",
      "      |   |                                  |   |       ",
      "      |   |      [ ]                [ ]      |   |       ",
      "      |   |                                  |   |       ",
      "      |   |                                  |   |       ",
      "      |   |__________________________________|   |       ",
      "      |                                          |       ",
      "      |__________________________________________|       ",
      "                                                         "
    ]
  },
  "ruinas_3": {
    name: "Cámara Secreta",
    desc: "Una habitación oculta que ha permanecido intacta por siglos.",
    exits: { arriba: "ruinas_2" },
    items: ["espada_hierro"],
    x: 3, y: 1,
    theme: "ruinas",
    animClass: "anim-pulse",
    ascii: [
      "                   ____________                          ",
      "                  /            \\                         ",
      "                 /              \\                        ",
      "                |    ________    |                       ",
      "                |   |        |   |                       ",
      "                |   |        |   |                       ",
      "                |   |________|   |                       ",
      "                |                |                       ",
      "                |                |                       ",
      "                |                |                       ",
      "                |                |                       ",
      "                |                |                       ",
      "                |                |                       ",
      "                |________________|                       ",
      "                                                         ",
      "                                                         ",
      "                                                         ",
      "                                                         "
    ]
  },
  "templo_1": {
    name: "Puertas del Templo Olvidado",
    desc: "Grandes puertas de bronce entreabiertas.",
    exits: { oeste: "ruinas_1", adentro: "templo_2", este: "volcan_1" },
    items: [],
    x: 4, y: 3,
    theme: "templo",
    animClass: "",
    ascii: [
      "                 ______________________                  ",
      "                /                      \\                 ",
      "               /                        \\                ",
      "              /__________________________\\               ",
      "             |    ____            ____    |              ",
      "             |   |    |          |    |   |              ",
      "             |   |    |          |    |   |              ",
      "             |   |    |          |    |   |              ",
      "             |   |    |          |    |   |              ",
      "             |   |    |          |    |   |              ",
      "             |   |____|          |____|   |              ",
      "             |                            |              ",
      "             |                            |              ",
      "             |                            |              ",
      "             |____________________________|              ",
      "                                                         ",
      "                                                         ",
      "                                                         "
    ]
  },
  "templo_2": {
    name: "Pasillo de las Pruebas",
    desc: "Un largo pasillo con estatuas amenazantes a los lados.",
    exits: { afuera: "templo_1", altar: "templo_3" },
    items: ["armadura_acero"],
    x: 4, y: 2,
    theme: "templo",
    animClass: "",
    ascii: [
      "       | |                                    | |        ",
      "       | |                                    | |        ",
      "       | |                                    | |        ",
      "       | |                                    | |        ",
      "       | |                                    | |        ",
      "       | |                                    | |        ",
      "       | |                                    | |        ",
      "       | |                                    | |        ",
      "       | |                                    | |        ",
      "       | |                                    | |        ",
      "       | |                                    | |        ",
      "       | |                                    | |        ",
      "       | |                                    | |        ",
      "       | |                                    | |        ",
      "       |_|____________________________________|_|        ",
      "                                                         ",
      "                                                         ",
      "                                                         "
    ]
  },
  "templo_3": {
    name: "Altar Sagrado",
    desc: "Un altar de mármol blanco bañado por un rayo de luz.",
    exits: { atras: "templo_2" },
    items: ["amuleto_luz"],
    x: 4, y: 1,
    theme: "templo",
    animClass: "anim-pulse",
    ascii: [
      "                        /\\                               ",
      "                       /  \\                              ",
      "                      /    \\                             ",
      "                     /______\\                            ",
      "                        ||                               ",
      "                        ||                               ",
      "                      __||__                             ",
      "                     /      \\                            ",
      "                    /        \\                           ",
      "                   |          |                          ",
      "                   |    ()    |                          ",
      "                   |          |                          ",
      "                    \\        /                           ",
      "                     \\______/                            ",
      "                                                         ",
      "                                                         ",
      "                                                         ",
      "                                                         "
    ]
  },
  "volcan_1": {
    name: "Sendero de Lava",
    desc: "El calor es insoportable. Ríos de lava fluyen lentamente.",
    exits: { oeste: "templo_1", arriba: "volcan_2" },
    items: [],
    x: 5, y: 3,
    theme: "volcan",
    animClass: "anim-shake",
    ascii: [
      "                       /\\                                ",
      "                      /  \\                               ",
      "                     /    \\                              ",
      "                    /      \\                             ",
      "                   /        \\                            ",
      "                  /          \\                           ",
      "                 /            \\                          ",
      "                /              \\                         ",
      "               /                \\                        ",
      "              /                  \\                       ",
      "             /                    \\                      ",
      "            /                      \\                     ",
      "           /                        \\                    ",
      "          /                          \\                   ",
      "         /                            \\                  ",
      "        /                              \\                 ",
      "       /________________________________\\                ",
      "                                                         "
    ]
  },
  "volcan_2": {
    name: "Puente de Obsidiana",
    desc: "Un frágil puente sobre un abismo de fuego.",
    exits: { abajo: "volcan_1", cima: "volcan_3" },
    items: ["pocion_maxima"],
    x: 5, y: 2,
    theme: "volcan",
    animClass: "anim-shake",
    ascii: [
      "       = = = = = = = = = = = = = = = = = = = = = =       ",
      "                                                         ",
      "       ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~       ",
      "       ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~       ",
      "       ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~       ",
      "       ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~       ",
      "       ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~       ",
      "       ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~       ",
      "       ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~       ",
      "       ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~       ",
      "       ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~       ",
      "       ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~       ",
      "       ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~       ",
      "       ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~       ",
      "                                                         ",
      "       = = = = = = = = = = = = = = = = = = = = = =       ",
      "                                                         ",
      "                                                         "
    ]
  },
  "volcan_3": {
    name: "Cráter Ardiente",
    desc: "El centro del volcán. Aquí reside el Dragón de Sombras.",
    exits: { abajo: "volcan_2" },
    items: [],
    x: 5, y: 1,
    theme: "volcan",
    animClass: "anim-shake",
    ascii: [
      "                       (  )                              ",
      "                      (    )                             ",
      "                     (      )                            ",
      "                    (        )                           ",
      "                   (          )                          ",
      "                  (            )                         ",
      "                 (              )                        ",
      "                (                )                       ",
      "               (                  )                      ",
      "              (                    )                     ",
      "             (                      )                    ",
      "            (                        )                   ",
      "           (                          )                  ",
      "          (                            )                 ",
      "         (                              )                ",
      "        (                                )               ",
      "       (                                  )              ",
      "                                                         "
    ]
  },
  "victory": {
    name: "Amanecer en Aethelgard",
    desc: "El Dragón ha caído. La luz del Amuleto disipa las sombras eternas.",
    exits: {},
    items: [],
    x: 5, y: 1,
    theme: "templo",
    animClass: "anim-pulse",
    ascii: [
      "                                                         ",
      "           \\  |  /           \\  |  /                     ",
      "         --  ( )  --       --  ( )  --                   ",
      "           /  |  \\           /  |  \\                     ",
      "                                                         ",
      "       *       .       *       .       *                 ",
      "           .       *       .       *                     ",
      "       ________________________________________          ",
      "      |                                        |         ",
      "      |   VICTORIA - EL MUNDO ESTÁ A SALVO     |         ",
      "      |________________________________________|         ",
      "                                                         ",
      "           .       *       .       *                     ",
      "       *       .       *       .       *                 ",
      "                                                         ",
      "                                                         ",
      "                                                         ",
      "                                                         "
    ]
  }
};

let state = {
  loc: "bosque_1",
  inventory: [],
  hp: 100,
  maxHp: 100,
  weapon: null,
  armor: null,
  bossHp: 200,
  bossDefeated: false,
  victory: false,
  worldState: JSON.parse(JSON.stringify(worldData)),
  discovered: ["bosque_1"],
  inIntro: true
};

// --- INTRO SEQUENCE ---
const introText = [
  "El mundo de Aethelgard cayó en la oscuridad hace siglos.",
  "El Dragón de Sombras despertó, cubriendo el sol con ceniza eterna.",
  "Solo el Amuleto de Luz, perdido en el Templo Olvidado, puede restaurar el equilibrio.",
  "Tú eres el último Guardián. Tu misión es clara.",
  "Encuentra el Amuleto. Derrota al Dragón. Salva el mundo."
];

const introAscii = `
      /\\
     /  \\
    /____\\
      ||
    __||__
   |      |
   |  {}  |
   |______|
`;

async function playIntro() {
  const overlay = document.getElementById("intro-overlay");
  const asciiEl = document.getElementById("intro-ascii");
  const textEl = document.getElementById("intro-text");
  
  overlay.classList.remove("hidden");
  asciiEl.textContent = introAscii;
  
  for (let i = 0; i < introText.length; i++) {
    if (!state.inIntro) return;
    textEl.textContent = introText[i];
    textEl.style.opacity = 0;
    
    for (let op = 0; op <= 1; op += 0.1) {
      if (!state.inIntro) return;
      textEl.style.opacity = op;
      await new Promise(r => setTimeout(r, 50));
    }
    
    await new Promise(r => setTimeout(r, 2000));
    
    for (let op = 1; op >= 0; op -= 0.1) {
      if (!state.inIntro) return;
      textEl.style.opacity = op;
      await new Promise(r => setTimeout(r, 50));
    }
  }
  
  endIntro();
}

function endIntro() {
  state.inIntro = false;
  document.getElementById("intro-overlay").classList.add("hidden");
  print("La aventura comienza...", "success");
  updateUI();
  soundManager.init();
  soundManager.playAmbience(state.worldState[state.loc].theme);
}

// --- RENDER Y UTILIDADES ---
const print = (text, type = "narrative") => {
  const output = document.getElementById("output");
  const div = document.createElement("div");
  div.className = `log log-${type}`;
  div.textContent = text;
  output.appendChild(div);
  output.scrollTop = output.scrollHeight;
};

const updateUI = () => {
  document.getElementById("hud-hp").textContent = `Vida: ${state.hp}/${state.maxHp}`;
  document.getElementById("hp-bar").style.width = `${Math.max(0, (state.hp / state.maxHp) * 100)}%`;
  
  const currentZone = state.victory ? worldData["victory"] : state.worldState[state.loc];
  document.getElementById("hud-loc").textContent = `Zona: ${currentZone.name}`;
  document.getElementById("hud-exits").textContent = state.victory ? "" : `Salidas: ${Object.keys(currentZone.exits).join(', ')}`;
  
  document.body.className = `theme-${currentZone.theme}`;
  
  const invList = document.getElementById("inv-list");
  invList.innerHTML = "";
  if (state.inventory.length === 0) {
    invList.innerHTML = "<li>Vacío</li>";
  } else {
    state.inventory.forEach(itemKey => {
      const li = document.createElement("li");
      li.textContent = itemsData[itemKey].name;
      invList.appendChild(li);
    });
  }
  
  document.getElementById("eq-weapon").textContent = state.weapon ? itemsData[state.weapon].name : "Ninguna";
  document.getElementById("eq-armor").textContent = state.armor ? itemsData[state.armor].name : "Ninguna";
  
  renderMinimap();
  renderScene();
};

const renderMinimap = () => {
  const mapEl = document.getElementById("minimap");
  mapEl.innerHTML = ""; // Clear
  
  // Grid 5x3 (X: 1-5, Y: 1-3)
  // Visual Grid: 3 rows per cell + 1 border = 10 rows
  // 5 cols per cell + 1 border = 26 cols
  
  const gridW = 5;
  const gridH = 3;
  const cellW = 6; // 5 chars + 1 space
  const cellH = 4; // 3 chars + 1 space
  
  const canvasW = gridW * cellW + 1;
  const canvasH = gridH * cellH + 1;
  
  // Create 2D array
  let canvas = [];
  for(let y=0; y<canvasH; y++) {
    canvas[y] = new Array(canvasW).fill(' ');
  }
  
  // Render Discovered Zones
  Object.keys(state.worldState).forEach(key => {
    if (!state.discovered.includes(key)) return;
    
    const z = state.worldState[key];
    // Invert Y for visual (Y=3 is bottom, Y=1 is top)
    // Map Y=3 -> Row 0, Y=2 -> Row 4, Y=1 -> Row 8
    // Formula: (3 - z.y) * 4
    const vy = (3 - z.y) * 4;
    const vx = (z.x - 1) * 6;
    
    const label = z.name.substring(0,1).toUpperCase();
    const isCurrent = (key === state.loc);
    const isEnemy = (key === "volcan_3" && !state.bossDefeated);
    
    let marker = label;
    let colorClass = "map-cell discovered";
    
    if (isCurrent) {
        marker = "@";
        colorClass = "map-cell current";
    } else if (isEnemy) {
        marker = "X";
        colorClass = "map-cell enemy";
    }
    
    // Draw Box
    // ┌───┐
    // │ M │
    // └───┘
    
    canvas[vy][vx] = '┌';
    canvas[vy][vx+1] = '─';
    canvas[vy][vx+2] = '─';
    canvas[vy][vx+3] = '─';
    canvas[vy][vx+4] = '┐';
    
    canvas[vy+1][vx] = '│';
    canvas[vy+1][vx+1] = ' ';
    canvas[vy+1][vx+2] = { char: marker, class: colorClass }; // Object for special rendering
    canvas[vy+1][vx+3] = ' ';
    canvas[vy+1][vx+4] = '│';
    
    canvas[vy+2][vx] = '└';
    canvas[vy+2][vx+1] = '─';
    canvas[vy+2][vx+2] = '─';
    canvas[vy+2][vx+3] = '─';
    canvas[vy+2][vx+4] = '┘';
    
    // Connections
    if (z.exits.este || z.exits.adentro) {
        canvas[vy+1][vx+5] = '─';
    }
    if (z.exits.oeste || z.exits.afuera) {
        if (vx > 0) canvas[vy+1][vx-1] = '─';
    }
    if (z.exits.sur || z.exits.abajo) {
        canvas[vy+3][vx+2] = '│';
    }
    if (z.exits.norte || z.exits.arriba || z.exits.cima) {
        if (vy > 0) canvas[vy-1][vx+2] = '│';
    }
  });
  
  // Render to HTML
  let html = "";
  for(let y=0; y<canvasH; y++) {
      let rowHtml = "";
      for(let x=0; x<canvasW; x++) {
          const cell = canvas[y][x];
          if (typeof cell === 'object') {
              rowHtml += `<span class="${cell.class}">${cell.char}</span>`;
          } else {
              rowHtml += cell;
          }
      }
      html += rowHtml + "\n";
  }
  mapEl.innerHTML = html;
};

const renderScene = () => {
  const sceneEl = document.getElementById("ascii-scene");
  const currentZone = state.victory ? worldData["victory"] : state.worldState[state.loc];
  
  // Apply animation class
  sceneEl.className = currentZone.animClass || "";
  
  // Render text
  sceneEl.textContent = currentZone.ascii.join("\n");
};

// --- GAME LOGIC ---
const handleInput = (cmd) => {
  cmd = cmd.trim().toLowerCase();
  if (!cmd) return;
  
  print(`> ${cmd}`, "cmd");
  
  if (cmd === "skip" && state.inIntro) {
      endIntro();
      return;
  }
  
  if (state.victory) {
      print("¡Has ganado! El mundo está a salvo. Gracias por jugar.", "success");
      return;
  }

  const parts = cmd.split(" ");
  const action = parts[0];
  const arg = parts.slice(1).join(" ");
  
  const currentZone = state.worldState[state.loc];
  
  // Random errors
  const errors = [
      "No entiendo eso.",
      "¿Qué intentas hacer?",
      "Eso no es posible aquí.",
      "Tus palabras se las lleva el viento.",
      "Intenta otra cosa.",
      "No tiene sentido.",
      "El mundo no responde a eso.",
      "Confuso...",
      "¿Perdón?",
      "Acción inválida."
  ];
  
  switch(action) {
    case "ayuda":
      print("Comandos: ir [dir], explorar, mirar, coger [obj], usar [obj], equipar [obj], atacar, guardar, cargar");
      break;
      
    case "ir":
      if (currentZone.exits[arg]) {
        state.loc = currentZone.exits[arg];
        if (!state.discovered.includes(state.loc)) {
            state.discovered.push(state.loc);
        }
        print(`Viajas hacia: ${arg}`, "success");
        soundManager.playAmbience(state.worldState[state.loc].theme);
        updateUI();
        saveGame();
      } else {
        print("No puedes ir por ahí.", "error");
      }
      break;
      
    case "explorar":
    case "mirar":
      print(currentZone.desc);
      if (currentZone.items.length > 0) {
        print(`Ves: ${currentZone.items.map(i => itemsData[i].name).join(", ")}`, "success");
      }
      if (state.loc === "volcan_3" && !state.bossDefeated) {
        print("¡El DRAGÓN DE SOMBRAS bloquea tu camino! (HP: " + state.bossHp + ")", "error");
      }
      break;
      
    case "coger":
      const itemIndex = currentZone.items.findIndex(i => itemsData[i].name.toLowerCase() === arg);
      if (itemIndex > -1) {
        const itemKey = currentZone.items[itemIndex];
        state.inventory.push(itemKey);
        currentZone.items.splice(itemIndex, 1);
        print(`Has cogido: ${itemsData[itemKey].name}`, "success");
        updateUI();
        saveGame();
      } else {
        print("No ves eso aquí.", "error");
      }
      break;
      
    case "usar":
      if (arg === "amuleto de luz" && state.inventory.includes("amuleto_luz")) {
          if (state.loc === "volcan_3" && state.bossDefeated) {
              triggerVictory();
          } else if (state.loc === "volcan_3" && !state.bossDefeated) {
              print("¡El Dragón es demasiado fuerte! ¡Debilítalo primero!", "error");
          } else {
              print("El amuleto brilla, pero nada sucede aquí.", "narrative");
          }
          return;
      }
      
      const useIndex = state.inventory.findIndex(i => itemsData[i].name.toLowerCase() === arg);
      if (useIndex > -1) {
        const itemKey = state.inventory[useIndex];
        const item = itemsData[itemKey];
        if (item.type === "consumable") {
          state.hp = Math.min(state.maxHp, state.hp + item.heal);
          state.inventory.splice(useIndex, 1);
          print(`Usaste ${item.name}. Vida: ${state.hp}`, "success");
          updateUI();
          saveGame();
        } else {
          print("No puedes usar eso así.", "error");
        }
      } else {
        print("No tienes eso.", "error");
      }
      break;
      
    case "equipar":
      const eqIndex = state.inventory.findIndex(i => itemsData[i].name.toLowerCase() === arg);
      if (eqIndex > -1) {
        const itemKey = state.inventory[eqIndex];
        const item = itemsData[itemKey];
        if (item.type === "weapon") {
          state.weapon = itemKey;
          print(`Equipado: ${item.name}`, "success");
        } else if (item.type === "armor") {
          state.armor = itemKey;
          print(`Equipado: ${item.name}`, "success");
        } else {
          print("Eso no se puede equipar.", "error");
        }
        updateUI();
        saveGame();
      } else {
        print("No tienes eso.", "error");
      }
      break;
      
    case "atacar":
      if (state.loc === "volcan_3" && !state.bossDefeated) {
        const dmg = state.weapon ? itemsData[state.weapon].atk : 2;
        state.bossHp -= dmg;
        
        print(`Atacas al Dragón de Sombras y le infliges ${dmg} de daño.`, "success");
        
        if (state.bossHp <= 0) {
          state.bossDefeated = true;
          print("¡El Dragón ha caído! El Amuleto de Luz vibra con poder...", "success");
          print("Escribe 'usar amuleto de luz' para terminar con esto.", "narrative");
        } else {
          // Boss attack logic
          const def = state.armor ? itemsData[state.armor].def : 0;
          
          // Daño aleatorio entre 20 y 50
          const dragonBaseDamage = Math.floor(Math.random() * 31) + 20;
          
          // Calcular daño final restando defensa, asegurando que no sea negativo
          const finalDamage = Math.max(0, dragonBaseDamage - def);
          
          state.hp -= finalDamage;
          
          // Evitar vida negativa
          if (state.hp < 0) state.hp = 0;
          
          print(`El Dragón ruge y contraataca: recibes ${finalDamage} de daño.`, "error");
          
          if (state.hp <= 0) {
            print("Has muerto... Tu leyenda termina aquí.", "error");
          }
        }
        updateUI();
      } else {
        print("No hay nada que atacar aquí.", "narrative");
      }
      break;
      
    case "guardar":
      saveGame();
      print("Partida guardada.", "success");
      break;
      
    case "cargar":
      loadGame();
      break;
      
    default:
      print(errors[Math.floor(Math.random() * errors.length)], "error");
  }
};

const triggerVictory = () => {
    state.victory = true;
    soundManager.playAmbience("victory");
    print("Levantas el Amuleto...", "success");
    setTimeout(() => print("Una luz cegadora inunda el cráter...", "success"), 1000);
    setTimeout(() => print("La lava se convierte en piedra...", "success"), 2000);
    setTimeout(() => print("Las sombras se disipan...", "success"), 3000);
    setTimeout(() => {
        updateUI();
        saveGame();
    }, 4000);
};

const saveGame = () => {
  localStorage.setItem("amuletoSave", JSON.stringify(state));
};

const loadGame = () => {
  const saved = localStorage.getItem("amuletoSave");
  if (saved) {
    state = JSON.parse(saved);
    updateUI();
    print("Partida cargada.", "success");
  } else {
    print("No hay partida guardada.", "error");
  }
};

// --- INICIALIZACIÓN ---
document.getElementById("input-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const input = document.getElementById("cmd-input");
  handleInput(input.value);
  input.value = "";
});

document.getElementById("audio-toggle").addEventListener("click", (e) => {
    const muted = soundManager.toggleMute();
    e.target.textContent = muted ? "🔇" : "🔊";
});

// Start
if (localStorage.getItem("amuletoSave")) {
    // Optional: Auto load? No, let user start fresh or load manually, 
    // but we need to init UI.
    // For this assignment, let's start fresh intro unless loaded explicitly?
    // Let's just play intro.
    playIntro();
} else {
    playIntro();
}

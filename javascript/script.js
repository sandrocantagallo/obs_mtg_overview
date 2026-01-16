/**
 * Magic: The Gathering - Life Counter for OBS
 * 
 *  
 * KEYBOARD CONTROLS
    | Tasto | Funzione             |
    | ----- | -------------------- |
    | Q / A | Vita Player A ±      |
    | P / L | Vita Player B ±      |
    | W / O | Win Player A / B     |
    | S     | Aggiungi spell STACK |
    | X     | Svuota STACK         |
    | C     | Card Zoom (URL)      |
    | T     | Start/Stop Timer     |
    | B     | Sideboard Mode       |

    | Tasto | Mana             |
    | ----- | ---------------- |
    | `1`   | White            |
    | `2`   | Blue             |
    | `3`   | Black            |
    | `4`   | Red              |
    | `5`   | Green            |
    | `6`   | Colorless        |
    | `R`   | **RESET mana A** |

    | Tasto | Mana             |
    | ----- | ---------------- |
    | `7`   | White            |
    | `8`   | Blue             |
    | `9`   | Black            |
    | `0`   | Red              |
    | `-`   | Green            |
    | `=`   | Colorless        |
    | `I`   | **RESET mana B** |

    | Tasto | Azione               |
    | ----- | -------------------- |
    | `N`   | Cambia nome Player A |
    | `K`   | Cambia nome Player B |

    | Tasto | Azione               |
    | ----- | -------------------- |
    | `Z`   | Giocatore 1 Attivo |
    | `M`   | Giocatore 2 Attivo |


 */

let lifeA = 20, lifeB = 20;
let winsA = 0, winsB = 0;
let timer = 0;
let timerRunning = false;
let interval;
let activePlayer = "A";


/* KEYBOARD CONTROLS */
document.addEventListener("keydown", e => {

  // LIFE
  if (e.key === "q") setLife("A", 1);
  if (e.key === "a") setLife("A", -1);
  if (e.key === "p") setLife("B", 1);
  if (e.key === "l") setLife("B", -1);

  // WINS
  if (e.key === "w") updateWins("A");
  if (e.key === "o") updateWins("B");

  // STACK
  if (e.key === "s") addToStack(prompt("Spell nello stack:"));
  if (e.key === "x") clearStack();

  // CARD ZOOM
  if (e.key === "c") toggleCard(prompt("URL immagine carta:"));

  // TIMER
  if (e.key === "t") toggleTimer();

  // SIDEBOARD
  if (e.key === "b") toggleSideboard();

});

document.addEventListener("keydown", e => {
  if (e.key.toLowerCase() === "z") {
    activePlayer = "A";
    updateActivePlayerUI();
  }
  if (e.key.toLowerCase() === "m") {
    activePlayer = "B";
    updateActivePlayerUI();
  }
});

document.addEventListener("keydown", e => {

  // Rename Player A
  if (e.key.toLowerCase() === "n") {
    const name = prompt("Nuovo nome Player A:");
    if (name) setPlayerName("A", name);
  }

  // Rename Player B
  if (e.key.toLowerCase() === "k") {
    const name = prompt("Nuovo nome Player B:");
    if (name) setPlayerName("B", name);
  }

});

function setPlayerName(player, name) {
  document.getElementById("name" + player).innerText = name;
}


/* MANA CONTROL */
document.addEventListener("keydown", e => {

  // PLAYER A
  if (e.key === "1") addMana("A","W");
  if (e.key === "2") addMana("A","U");
  if (e.key === "3") addMana("A","B");
  if (e.key === "4") addMana("A","R");
  if (e.key === "5") addMana("A","G");
  if (e.key === "6") addMana("A","C");
  if (e.key.toLowerCase() === "r") resetMana("A");

  // PLAYER B
  if (e.key === "7") addMana("B","W");
  if (e.key === "8") addMana("B","U");
  if (e.key === "9") addMana("B","B");
  if (e.key === "0") addMana("B","R");
  if (e.key === "-") addMana("B","G");
  if (e.key === "=") addMana("B","C");
  if (e.key.toLowerCase() === "i") resetMana("B");

});

/* ADD MANA */
function addMana(player, color) {
  const img = document.createElement("img");
  img.src = `assets/mana/${color}.png`;
  document.getElementById(`mana${player}`).appendChild(img);
}

/* RESET MANA */
function resetMana(player) {
  document.getElementById(`mana${player}`).innerHTML = "";
}

function setLife(p, d) {
  if (p === "A") document.getElementById("lifeA").innerText = (lifeA += d);
  else document.getElementById("lifeB").innerText = (lifeB += d);
}

function updateWins(p) {
  if (p === "A") document.getElementById("winsA").innerText = ++winsA;
  else document.getElementById("winsB").innerText = ++winsB;
}

function updateActivePlayerUI() {
  document.getElementById("playerA").classList.remove("active");
  document.getElementById("playerB").classList.remove("active");

  document.getElementById("player" + activePlayer).classList.add("active");
}

function parseManaCost(manaCost, player) {
  if (!manaCost) return;

  // Match di simboli tipo {1} {R} {G/U} ecc.
  const symbols = manaCost.match(/\{[^}]+\}/g);
  if (!symbols) return;

  symbols.forEach(sym => {
    const clean = sym.replace(/[{}]/g, "");

    // Mana generico → colorless
    if (!isNaN(clean)) {
      for (let i = 0; i < parseInt(clean); i++) {
        addMana(player, "C");
      }
    }
    // Mana colorato semplice
    else if (["W","U","B","R","G"].includes(clean)) {
      addMana(player, clean);
    }
    // Mana ibrido → scegliamo colore dominante (semplificazione broadcast)
    else if (clean.includes("/")) {
      addMana(player, clean.split("/")[0]);
    }
  });
}


/* STACK */
function addToStack(card) {
  if (!card) return;
  const li = document.createElement("li");
  li.innerText = card;
  document.getElementById("stackList").prepend(li);
  highlightStack();
  toggleCard(card);
}

function highlightStack() {
  document.querySelectorAll("#stack li").forEach((el,i)=>{
    el.classList.toggle("top", i===0);
  });
}

function clearStack() {
  document.getElementById("stackList").innerHTML = "";
  toggleCard(null);
  resetMana("A");
  resetMana("B");
}

/* CARD ZOOM */
async function toggleCard(cardName) {
  const zoom = document.getElementById("card-zoom");
  const img = document.getElementById("cardImage");

  // Se non passo nulla → nascondi
  if (!cardName || cardName.trim() === "") {
    zoom.classList.add("hidden");
    return;
  }

  try {
    // Query fuzzy a Scryfall
    const response = await fetch(
      `https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(cardName)}`
    );

    if (!response.ok) throw new Error("Carta non trovata");

    const data = await response.json();

    // Gestione carte double-face
    let imageUrl = "";

    if (data.image_uris) {
      imageUrl = data.image_uris.normal;
    } else if (data.card_faces && data.card_faces[0].image_uris) {
      imageUrl = data.card_faces[0].image_uris.normal;
    }

    img.src = imageUrl;

    // Mostra con animazione
    zoom.classList.remove("hidden");

    // 🔮 AGGIORNA MANA AUTOMATICO
    parseManaCost(data.mana_cost, activePlayer);

  } catch (err) {
    console.error("Errore Scryfall:", err);
    zoom.classList.add("hidden");
  }
}

/* TIMER */
function toggleTimer() {
  if (!timerRunning) {
    interval = setInterval(()=>{
      timer++;
      let m = String(Math.floor(timer/60)).padStart(2,"0");
      let s = String(timer%60).padStart(2,"0");
      document.getElementById("timer").innerText = `${m}:${s}`;
    },1000);
  } else clearInterval(interval);
  timerRunning = !timerRunning;
}

/* SIDEBOARD */
function toggleSideboard() {
  document.getElementById("sideboard").classList.toggle("hidden");
}



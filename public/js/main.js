let lastTime = 0; // Initialize lastTime
let game;
import SkinSelector from './skinSelector.js'; // Import the SkinSelector class

window.onload = () => {
  const canvas = document.getElementById("gameCanvas");
  game = new Game(canvas);

  // Initialize Skin Selector
  const skinSelector = new SkinSelector();
  const skinSelectorContainer = document.querySelector('.skin-selector');
  skinSelector.renderSkinSelector(skinSelectorContainer); // Render skin options

  // Grab references to the menus and buttons
  const mainMenu = document.getElementById("mainMenu");
  const pauseMenu = document.getElementById("pauseMenu");
  const playBtn = document.getElementById("playBtn");
  const quitBtn = document.getElementById("quitBtn");
  const resumeBtn = document.getElementById("resumeBtn");
  const mainMenuBtn = document.getElementById("mainMenuBtn");
  const quitBtn2 = document.getElementById("quitBtn2");
  const gameOverMenu = document.getElementById("gameOverMenu");
  const restartBtn = document.getElementById("restartBtn");
  const gameOverMenuBtn = document.getElementById("gameOverMenuBtn");
  const bestiaryBtn = document.getElementById("bestiaryBtn");
  const closeBestiaryBtn = document.getElementById("closeBestiaryBtn");
  const gamemodeMenu = document.getElementById("gamemodeMenu");
  const singleplayerBtn = document.getElementById("singleplayerBtn");
  const multiplayerBtn = document.getElementById("multiplayerBtn");
  const backToMainBtn = document.getElementById("backToMainBtn");

  const closeShopBtn = document.getElementById("closeShopBtn");
  closeShopBtn.addEventListener("click", () => {
    game.closeShop();
  });

  const startWaveBtn = document.getElementById("startWaveBtn");
  startWaveBtn.addEventListener("click", () => {
    document.getElementById("waveMenu").classList.remove("show");
    game.isWaveActive = true;
    game.enemiesSpawned = 0;
    game.state = GameState.PLAYING;
  });

  // Modify play button to show gamemode menu instead
  playBtn.addEventListener("click", () => {
    game.state = GameState.GAMEMODE_SELECT;
    updateMenus();
  });

  // Single player button starts normal game
  singleplayerBtn.addEventListener("click", () => {
    game.startGame();
    updateMenus();
  });

  multiplayerBtn.addEventListener("click", () => {
    game = new Game(canvas, true); // Initialize with multiplayer flag
    game.state = GameState.MULTIPLAYER_MENU;
    mainMenu.classList.remove("show");
    gamemodeMenu.classList.remove("show");
    multiplayerMenu.classList.add("show");
  });

  // Back button returns to main menu
  backToMainBtn.addEventListener("click", () => {
    game.state = GameState.MAIN_MENU;
    updateMenus();
  });

  // Update the menu display function
  function updateMenus() {
    mainMenu.classList.toggle("show", game.state === GameState.MAIN_MENU);
    gamemodeMenu.classList.toggle(
      "show",
      game.state === GameState.GAMEMODE_SELECT
    );
    pauseMenu.classList.toggle("show", game.state === GameState.PAUSED);
    gameOverMenu.classList.toggle("show", game.state === GameState.GAME_OVER);
  }

  // Main Menu: Quit
  quitBtn.addEventListener("click", () => {
    // For a browser game, "quit" can just close the window or confirm
    if (confirm("Are you sure you want to quit?")) {
      window.close(); // Might not always work in all browsers
    }
  });

  // Pause Menu: Resume
  resumeBtn.addEventListener("click", () => {
    game.resumeGame();
    updateMenus();
  });

  // Pause Menu: Main Menu
  mainMenuBtn.addEventListener("click", () => {
    game.showMainMenu();
    updateMenus();
  });

  // Pause Menu: Quit
  quitBtn2.addEventListener("click", () => {
    if (confirm("Are you sure you want to quit?")) {
      window.close();
    }
  });

  restartBtn.addEventListener("click", () => {
    gameOverMenu.classList.remove("show");
    game.resetGame();
    game.startGame();
  });

  gameOverMenuBtn.addEventListener("click", () => {
    gameOverMenu.classList.remove("show");
    game.showMainMenu();
    updateMenus();
  });

  bestiaryBtn.addEventListener("click", () => {
    showBestiary();
  });

  closeBestiaryBtn.addEventListener("click", () => {
    document.getElementById("bestiaryMenu").classList.remove("show");
    if (game.state === GameState.PAUSED) {
      game.resumeGame();
    }
  });

  document.getElementById("createRoomBtn").addEventListener("click", () => {
    if (game) {
      game.isMultiplayer = true;
      game.isHost = true;
      game.multiplayerManager = new MultiplayerManager();
      game.multiplayerManager.initializeSocket();
      game.multiplayerManager.createRoom();
    }
  });

  document.getElementById("connectToRoomBtn").addEventListener("click", () => {
    const codeDigits = Array.from(document.querySelectorAll(".code-digit"))
      .map((input) => input.value)
      .join("");
    if (codeDigits.length === 6) {
      game.multiplayerManager.joinRoom(codeDigits);
    }
  });

  document.getElementById("joinRoomBtn").addEventListener("click", () => {
    document.getElementById("multiplayerMenu").classList.remove("show");
    document.getElementById("joinRoomMenu").classList.add("show");
    game.isHost = false; // The guest
  });

  // Add this code where other event listeners are initialized
  document.querySelectorAll('.code-digit').forEach((input, index) => {
  input.addEventListener('input', function(e) {
      if (this.value.length === 1) {
          const nextInput = this.nextElementSibling;
          if (nextInput) {
              nextInput.focus();
          }
      }
  });

  // Also handle backspace to go to previous input
  input.addEventListener('keydown', function(e) {
      if (e.key === 'Backspace' && !this.value) {
          const prevInput = this.previousElementSibling;
          if (prevInput) {
              prevInput.focus();
          }
      }
  });
  });

  //--- The game loop stays the same, but we also call updateMenus each frame ---
  function gameLoop(timestamp) {
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    game.update(deltaTime);
    game.draw();

    // Make sure the correct menu is shown if game.state changed
    updateMenus();

    requestAnimationFrame(gameLoop);
  }

  // Start the loop
  requestAnimationFrame(gameLoop);

  setInterval(() => {
    if (this.socket && game.isMultiplayer) {
      this.socket.emit("player_update", {
        roomCode: this.roomCode,
        x: game.player.x,
        y: game.player.y,
        rotation: game.player.rotation,
        direction: game.player.direction
      });
    }
  }, 10);
};
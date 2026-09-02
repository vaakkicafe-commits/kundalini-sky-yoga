// Web Audio API Synthesizer & Meditation Ambient Player

(function() {
  let audioCtx = null;
  let isPlayingOm = false;
  let omOscillator = null;
  let omGain = null;

  let timerInterval = null;
  let timerSecondsLeft = 300; // 5 mins default

  function getAudioContext() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  // Play Tibetan Singing Bowl / Temple Bell Sound Synthesis
  window.playSingingBowl = function() {
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Fundamental frequency for Om/Bowl (136.1 Hz - Cosmic Om)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(136.1, ctx.currentTime);

      // Harmonics
      const osc2 = ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(272.2, ctx.currentTime);

      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 4.5); // Decay 4.5s

      osc.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc2.start();
      osc.stop(ctx.currentTime + 4.5);
      osc2.stop(ctx.currentTime + 4.5);
    } catch (e) {
      console.log('Web Audio setup:', e);
    }
  };

  // Toggle Continuous Om Drone Synth
  window.toggleOmDrone = function() {
    const btn = document.getElementById('playOmBtn');
    const statusText = document.getElementById('playerStatus');

    if (isPlayingOm) {
      stopOmDrone();
      if (btn) btn.innerHTML = '<i class="fa-solid fa-play"></i>';
      if (statusText) statusText.textContent = 'Meditation Audio (136.1 Hz Om Drone)';
    } else {
      startOmDrone();
      if (btn) btn.innerHTML = '<i class="fa-solid fa-pause"></i>';
      if (statusText) statusText.textContent = 'Playing Om Resonance (Deep Alpha Waves)';
    }
  };

  function startOmDrone() {
    try {
      const ctx = getAudioContext();
      if (isPlayingOm) return;

      omOscillator = ctx.createOscillator();
      omGain = ctx.createGain();

      omOscillator.type = 'sawtooth';
      omOscillator.frequency.setValueAtTime(136.1, ctx.currentTime); // Low Om C#

      // Low pass filter for warm drone sound
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, ctx.currentTime);

      omGain.gain.setValueAtTime(0.01, ctx.currentTime);
      omGain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 2.0);

      omOscillator.connect(filter);
      filter.connect(omGain);
      omGain.connect(ctx.destination);

      omOscillator.start();
      isPlayingOm = true;
    } catch (e) {
      console.log('Om drone error:', e);
    }
  }

  function stopOmDrone() {
    if (omOscillator && omGain && audioCtx) {
      omGain.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
      setTimeout(() => {
        try {
          omOscillator.stop();
          omOscillator.disconnect();
        } catch(e) {}
        isPlayingOm = false;
      }, 500);
    }
  }

  // Meditation Countdown Timer
  window.setMeditationTimer = function(minutes) {
    timerSecondsLeft = minutes * 60;
    updateTimerDisplay();
  };

  window.startTimer = function() {
    const timerDisplay = document.getElementById('timerDisplay');
    const startBtn = document.getElementById('startTimerBtn');

    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
      if (startBtn) startBtn.textContent = 'Start Timer';
      return;
    }

    if (startBtn) startBtn.textContent = 'Pause';
    window.playSingingBowl();

    timerInterval = setInterval(() => {
      if (timerSecondsLeft > 0) {
        timerSecondsLeft--;
        updateTimerDisplay();
      } else {
        clearInterval(timerInterval);
        timerInterval = null;
        if (startBtn) startBtn.textContent = 'Start Timer';
        window.playSingingBowl(); // Bell on completion
        alert('Meditation session completed! Vazhga Vaiyagam, Vazhga Valamudan.');
      }
    }, 1000);
  };

  function updateTimerDisplay() {
    const display = document.getElementById('timerDisplay');
    if (!display) return;
    const mins = Math.floor(timerSecondsLeft / 60);
    const secs = timerSecondsLeft % 60;
    display.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  document.addEventListener('DOMContentLoaded', () => {
    updateTimerDisplay();
  });
})();

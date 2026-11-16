/* ==========================================================================
   E-INVITATION CLIENT ENGINE: FULL ARCHIVAL KINETIC SYSTEM
   Includes:
   - Staggered Curtain Lift & Pastoral Stage Unlock
   - Directional Scroll Reveal Engine (IntersectionObserver)
   - Real-time Countdown Timer
   - RSVP Stepper, Safety Validation & Real-time Wall of Wishes
   ========================================================================== */

(function () {
  'use strict';

  // Application State
  var state = {
    lang: window.__INIT_LANG || 'id',
    dict: window.__I18N_DICT || {},
    countdownTarget: window.__COUNTDOWN_TARGET || 0,
    guestSlug: window.__GUEST_SLUG || '',
    maxPax: window.__MAX_PAX || 2,
    pax: 1,
    wishesPage: 1,
    hasMoreWishes: true,
    isSubmitting: false
  };

  // DOM References
  var coverScreen = document.getElementById('coverScreen');
  var btnOpen = document.getElementById('btnOpenCover');
  var bgmAudio = document.getElementById('bgmAudio');
  var btnMusicToggle = document.getElementById('btnMusicToggle');
  var btnLang = document.getElementById('btnLang');
  var formRsvp = document.getElementById('formRsvp');
  var rsvpCard = document.getElementById('rsvpCard');
  var rsvpCompleted = document.getElementById('rsvpCompleted');
  var paxGroup = document.getElementById('paxGroup');
  var stepperVal = document.getElementById('stepperVal');
  var stepperInput = document.getElementById('stepperInput');
  var btnDec = document.getElementById('btnDecPax');
  var btnInc = document.getElementById('btnIncPax');
  var wishText = document.getElementById('wishText');
  var wishCount = document.getElementById('wishCharCount');
  var wishesContainer = document.getElementById('wishesContainer');
  var btnMoreWishes = document.getElementById('btnMoreWishes');
  var wishesLoading = document.getElementById('wishesLoading');
  var wishesEmpty = document.getElementById('wishesEmpty');
  var modalBackdrop = document.getElementById('modalBackdrop');
  var modalTitle = document.getElementById('modalTitle');
  var modalBody = document.getElementById('modalBody');
  var modalActions = document.getElementById('modalActions');
  var toastContainer = document.getElementById('toastContainer');

  // Translation helper
  function t(key) {
    if (state.dict[state.lang] && state.dict[state.lang][key] != null) {
      return state.dict[state.lang][key];
    }
    return key;
  }

  // ==========================================================================
  // TOAST & MODAL SYSTEM
  // ==========================================================================
  function showToast(msg) {
    if (!toastContainer) return;
    var el = document.createElement('div');
    el.className = 'toast';
    el.textContent = msg;
    toastContainer.appendChild(el);
    setTimeout(function () { el.classList.add('show'); }, 20);
    setTimeout(function () {
      el.classList.remove('show');
      setTimeout(function () {
        if (el.parentNode) el.parentNode.removeChild(el);
      }, 400);
    }, 3200);
  }

  function showModal(opts) {
    if (!modalBackdrop) return;
    modalTitle.textContent = opts.title || '';
    modalBody.textContent = opts.body || '';
    modalActions.innerHTML = '';

    (opts.buttons || []).forEach(function (b) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = b.className || 'btn-rsvp-submit';
      btn.textContent = b.text;
      btn.onclick = function () {
        closeModal();
        if (b.action) b.action();
      };
      modalActions.appendChild(btn);
    });

    modalBackdrop.classList.add('active');
  }

  function closeModal() {
    if (modalBackdrop) modalBackdrop.classList.remove('active');
  }

  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', function (e) {
      if (e.target === modalBackdrop) closeModal();
    });
  }

  // ==========================================================================
  // ==========================================================================
  // BACKGROUND MUSIC ENGINE (BGM)
  // ==========================================================================
  var bgmFadeInterval = null;
  var bgmWasPlayingBeforeVoice = false;

  function updateMusicUi(isPlaying) {
    if (!btnMusicToggle) return;
    var iconNote = btnMusicToggle.querySelector('.music-icon-note');
    var iconMuted = btnMusicToggle.querySelector('.music-icon-muted');
    if (isPlaying) {
      btnMusicToggle.classList.remove('is-paused');
      btnMusicToggle.classList.add('is-playing');
      if (iconNote) iconNote.style.display = 'block';
      if (iconMuted) iconMuted.style.display = 'none';
    } else {
      btnMusicToggle.classList.remove('is-playing');
      btnMusicToggle.classList.add('is-paused');
      if (iconNote) iconNote.style.display = 'none';
      if (iconMuted) iconMuted.style.display = 'block';
    }
  }

  function playBgm(fade) {
    if (!bgmAudio) return;
    if (bgmFadeInterval) clearInterval(bgmFadeInterval);

    if (fade) {
      bgmAudio.volume = 0.05;
      var p = bgmAudio.play();
      if (p && p.catch) {
        p.catch(function (err) {
          console.warn('Autoplay prevented by browser:', err);
          updateMusicUi(false);
        });
      }
      var targetVol = 0.75;
      var step = 0.05;
      bgmFadeInterval = setInterval(function () {
        if (!bgmAudio || bgmAudio.paused) {
          clearInterval(bgmFadeInterval);
          return;
        }
        if (bgmAudio.volume + step >= targetVol) {
          bgmAudio.volume = targetVol;
          clearInterval(bgmFadeInterval);
        } else {
          bgmAudio.volume = Math.min(targetVol, bgmAudio.volume + step);
        }
      }, 70);
    } else {
      bgmAudio.volume = 0.75;
      bgmAudio.play().catch(function (err) {
        console.warn('Play prevented:', err);
      });
    }
    updateMusicUi(true);
  }

  function pauseBgm() {
    if (!bgmAudio) return;
    if (bgmFadeInterval) clearInterval(bgmFadeInterval);
    bgmAudio.pause();
    updateMusicUi(false);
  }

  function duckBgm() {
    if (!bgmAudio || bgmAudio.paused) return;
    bgmAudio.volume = 0.12;
  }

  function unduckBgm() {
    if (!bgmAudio || bgmAudio.paused) return;
    bgmAudio.volume = 0.75;
  }

  if (btnMusicToggle && bgmAudio) {
    btnMusicToggle.addEventListener('click', function (e) {
      e.preventDefault();
      if (bgmAudio.paused) {
        playBgm(false);
      } else {
        pauseBgm();
      }
    });

    bgmAudio.addEventListener('play', function () {
      updateMusicUi(true);
    });

    bgmAudio.addEventListener('pause', function () {
      updateMusicUi(false);
    });
  }

  // COVER OPENING & CHOREOGRAPHED CURTAIN REVEAL
  // Sequence:
  // 0.0s: Curtain lifts upward (cubic-bezier 0.65, 0, 0.35, 1)
  // 0.15s: Body stage-unlocked (House scales from bottom, 25 Botanicals glide, Card rises)
  // 0.95s: Curtain hidden completely
  // ==========================================================================
  if (btnOpen && coverScreen) {
    btnOpen.addEventListener('click', function () {
      // 0. Start Wedding Background Music
      playBgm(true);

      // 1. Lift curtain upward
      coverScreen.classList.add('curtain-lift');

      // 2. Staggered unlock of inner pastoral stage
      setTimeout(function () {
        document.body.classList.add('stage-unlocked');
      }, 150);

      // 3. Mark opened once curtain clear
      setTimeout(function () {
        coverScreen.classList.add('opened');
      }, 950);

      // Smooth scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
      var welcomeSection = document.getElementById('welcomeSection');
      if (welcomeSection) {
        if (window.innerWidth < 1024) {
          welcomeSection.scrollIntoView({ behavior: 'smooth' });
        } else {
          var mainEl = document.querySelector('.invitation-main');
          if (mainEl) mainEl.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    });

    // Auto-open if query param ?open=1 is present (for instant review & test)
    if (window.location.search.includes('open=1')) {
      coverScreen.classList.add('opened');
      document.body.classList.add('stage-unlocked');
    }
  }

  // Language Switcher - restarts naturally from the cover screen in the selected language
  if (btnLang) {
    btnLang.addEventListener('click', function () {
      var nextLang = state.lang === 'id' ? 'en' : 'id';
      var url = new URL(window.location.href);
      url.searchParams.set('lang', nextLang);
      url.searchParams.delete('opened');
      window.location.href = url.toString();
    });
  }

  // ==========================================================================
  // SCROLL REVEAL ENGINE (INTERSECTION OBSERVER)
  // Observes all .reveal-on-scroll elements to trigger physical spring slide-ins
  // ==========================================================================
  function initScrollReveals() {
    var reveals = document.querySelectorAll('.reveal-on-scroll');
    if (!reveals.length) return;

    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px'
      });

      reveals.forEach(function (el) {
        observer.observe(el);
      });
    } else {
      reveals.forEach(function (el) {
        el.classList.add('in-view');
      });
    }
  }
  initScrollReveals();

  // ==========================================================================
  // COUNTDOWN CLOCK
  // ==========================================================================
  function initCountdown() {
    var cdDays = document.getElementById('cdDays');
    var cdHours = document.getElementById('cdHours');
    var cdMinutes = document.getElementById('cdMinutes');
    var cdSeconds = document.getElementById('cdSeconds');
    if (!cdDays || !state.countdownTarget) return;

    function update() {
      var diff = state.countdownTarget - Date.now();
      if (diff <= 0) {
        cdDays.textContent = '00';
        cdHours.textContent = '00';
        cdMinutes.textContent = '00';
        cdSeconds.textContent = '00';
        return;
      }
      var d = Math.floor(diff / (1000 * 60 * 60 * 24));
      var h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      var m = Math.floor((diff / (1000 * 60)) % 60);
      var s = Math.floor((diff / 1000) % 60);

      cdDays.textContent = (d < 10 ? '0' : '') + d;
      cdHours.textContent = (h < 10 ? '0' : '') + h;
      cdMinutes.textContent = (m < 10 ? '0' : '') + m;
      cdSeconds.textContent = (s < 10 ? '0' : '') + s;
    }

    update();
    setInterval(update, 1000);
  }
  initCountdown();

  // ==========================================================================
  // BESPOKE LUXURY AUDIO PLAYER
  // ==========================================================================
  function formatAudioTime(secs) {
    if (isNaN(secs) || !isFinite(secs) || secs < 0) return '0:00';
    var m = Math.floor(secs / 60);
    var s = Math.floor(secs % 60);
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  function initLuxuryAudioPlayers() {
    var players = document.querySelectorAll('.luxury-audio-player');
    players.forEach(function (player) {
      if (player._lapInitialized) return;
      player._lapInitialized = true;

      var audio = player.querySelector('audio');
      var btnPlay = player.querySelector('.lap-btn-play');
      var iconPlay = player.querySelector('.lap-icon-play');
      var iconPause = player.querySelector('.lap-icon-pause');
      var track = player.querySelector('.lap-track');
      var fill = player.querySelector('.lap-fill');
      var head = player.querySelector('.lap-head');
      var timeCurr = player.querySelector('.lap-time-curr');
      var timeTotal = player.querySelector('.lap-time-total');
      var btnMute = player.querySelector('.lap-btn-mute');
      var iconVolOn = player.querySelector('.lap-icon-vol-on');
      var iconVolOff = player.querySelector('.lap-icon-vol-off');

      if (!audio) return;

      function updatePlayState(isPlaying) {
        if (isPlaying) {
          if (iconPlay) iconPlay.style.display = 'none';
          if (iconPause) iconPause.style.display = 'inline-block';
          player.classList.add('is-playing');
        } else {
          if (iconPlay) iconPlay.style.display = 'inline-block';
          if (iconPause) iconPause.style.display = 'none';
          player.classList.remove('is-playing');
        }
      }

      function updateProgress(curr, dur) {
        if (timeCurr) timeCurr.textContent = formatAudioTime(curr);
        if (timeTotal && dur && isFinite(dur)) timeTotal.textContent = formatAudioTime(dur);
        var pct = (dur && dur > 0) ? Math.min(100, Math.max(0, (curr / dur) * 100)) : 0;
        if (fill) fill.style.width = pct + '%';
        if (head) head.style.left = pct + '%';
        if (track) track.setAttribute('aria-valuenow', Math.round(pct));
      }

      function syncDuration() {
        if (audio.duration && isFinite(audio.duration)) {
          if (timeTotal) timeTotal.textContent = formatAudioTime(audio.duration);
        }
      }

      audio.addEventListener('loadedmetadata', syncDuration);
      audio.addEventListener('durationchange', syncDuration);
      audio.addEventListener('canplay', syncDuration);

      audio.addEventListener('timeupdate', function () {
        updateProgress(audio.currentTime, audio.duration);
      });

      audio.addEventListener('play', function () {
        document.querySelectorAll('.luxury-audio-player audio').forEach(function (other) {
          if (other !== audio && !other.paused) {
            other.pause();
          }
        });
        updatePlayState(true);
        duckBgm();
      });

      audio.addEventListener('pause', function () {
        updatePlayState(false);
        unduckBgm();
      });

      audio.addEventListener('ended', function () {
        updatePlayState(false);
        audio.currentTime = 0;
        updateProgress(0, audio.duration);
        unduckBgm();
      });

      if (btnPlay) {
        btnPlay.addEventListener('click', function (e) {
          e.preventDefault();
          if (audio.paused) {
            audio.play().catch(function (err) {
              console.warn('Audio play prevented:', err);
            });
          } else {
            audio.pause();
          }
        });
      }

      function seekFromEvent(e) {
        if (!track || !audio.duration || !isFinite(audio.duration)) return;
        var rect = track.getBoundingClientRect();
        var clientX = e.clientX;
        if (e.touches && e.touches.length > 0) {
          clientX = e.touches[0].clientX;
        }
        var offset = clientX - rect.left;
        var pct = Math.max(0, Math.min(1, offset / rect.width));
        audio.currentTime = pct * audio.duration;
        updateProgress(audio.currentTime, audio.duration);
      }

      if (track) {
        var isDragging = false;
        track.addEventListener('click', function (e) {
          seekFromEvent(e);
        });
        track.addEventListener('mousedown', function (e) {
          isDragging = true;
          seekFromEvent(e);
        });
        window.addEventListener('mousemove', function (e) {
          if (isDragging) seekFromEvent(e);
        });
        window.addEventListener('mouseup', function () {
          isDragging = false;
        });
        track.addEventListener('touchstart', function (e) {
          isDragging = true;
          seekFromEvent(e);
        }, { passive: true });
        window.addEventListener('touchmove', function (e) {
          if (isDragging) seekFromEvent(e);
        }, { passive: true });
        window.addEventListener('touchend', function () {
          isDragging = false;
        });
      }

      if (btnMute) {
        btnMute.addEventListener('click', function (e) {
          e.preventDefault();
          audio.muted = !audio.muted;
          if (audio.muted) {
            if (iconVolOn) iconVolOn.style.display = 'none';
            if (iconVolOff) iconVolOff.style.display = 'inline-block';
          } else {
            if (iconVolOn) iconVolOn.style.display = 'inline-block';
            if (iconVolOff) iconVolOff.style.display = 'none';
          }
        });
      }

      player._reloadSource = function (newSrc) {
        audio.pause();
        if (newSrc) {
          audio.src = newSrc;
          audio.load();
        } else {
          audio.removeAttribute('src');
          audio.load();
        }
        updatePlayState(false);
        updateProgress(0, 0);
      };
    });
  }
  initLuxuryAudioPlayers();

  // ==========================================================================
  // RSVP FORM & WALL OF WISHES
  // ==========================================================================
  function initRsvp() {
    if (!formRsvp) return;

    var radios = formRsvp.querySelectorAll('input[name="attending"]');
    radios.forEach(function (radio) {
      radio.addEventListener('change', function () {
        if (this.value === '1') {
          if (paxGroup) paxGroup.style.display = 'block';
        } else {
          if (paxGroup) paxGroup.style.display = 'none';
        }
      });
    });

    // Pax Stepper
    function updatePax(newPax) {
      state.pax = Math.max(1, Math.min(state.maxPax, newPax));
      if (stepperVal) stepperVal.textContent = state.pax;
      if (stepperInput) stepperInput.value = state.pax;
      if (btnDec) btnDec.disabled = state.pax <= 1;
      if (btnInc) btnInc.disabled = state.pax >= state.maxPax;
    }

    if (btnDec) {
      btnDec.addEventListener('click', function () {
        updatePax(state.pax - 1);
      });
    }
    if (btnInc) {
      btnInc.addEventListener('click', function () {
        updatePax(state.pax + 1);
      });
    }
    updatePax(1);

    // Wishes text length counter
    if (wishText && wishCount) {
      wishText.addEventListener('input', function () {
        var len = this.value.length;
        wishCount.textContent = len;
        if (len > 1000) {
          this.value = this.value.slice(0, 1000);
          wishCount.textContent = 1000;
        }
      });
    }

    // ==========================================================================
    // PRIVATE VOICE RECORDER MODULE
    // ==========================================================================
    var voiceRecorderCard = document.getElementById('voiceRecorderCard');
    var btnStartRecord = document.getElementById('btnStartRecord');
    var btnStopRecord = document.getElementById('btnStopRecord');
    var btnResetRecord = document.getElementById('btnResetRecord');
    var voiceStateIdle = document.getElementById('voiceStateIdle');
    var voiceStateRecording = document.getElementById('voiceStateRecording');
    var voiceStatePreview = document.getElementById('voiceStatePreview');
    var recordingTimer = document.getElementById('recordingTimer');
    var audioPreview = document.getElementById('audioPreview');

    var voiceState = {
      recorder: null,
      stream: null,
      chunks: [],
      blob: null,
      blobUrl: null,
      timerInterval: null,
      secondsElapsed: 0,
      maxSeconds: 60
    };

    function formatTime(totalSeconds) {
      var mins = Math.floor(totalSeconds / 60);
      var secs = totalSeconds % 60;
      return (mins < 10 ? '0' : '') + mins + ':' + (secs < 10 ? '0' : '') + secs;
    }

    function updateTimerDisplay(secs) {
      if (recordingTimer) {
        recordingTimer.textContent = formatTime(secs);
      }
    }

    function stopRecording() {
      if (voiceState.recorder && voiceState.recorder.state === 'recording') {
        try {
          voiceState.recorder.stop();
        } catch (e) {
          console.warn('Recorder stop error:', e);
        }
      }
    }

    function resetRecording() {
      if (voiceState.recorder && voiceState.recorder.state === 'recording') {
        try { voiceState.recorder.stop(); } catch (e) {}
      }
      if (voiceState.stream) {
        voiceState.stream.getTracks().forEach(function (t) { t.stop(); });
        voiceState.stream = null;
      }
      clearInterval(voiceState.timerInterval);
      if (voiceState.blobUrl) {
        URL.revokeObjectURL(voiceState.blobUrl);
        voiceState.blobUrl = null;
      }
      voiceState.blob = null;
      voiceState.chunks = [];
      voiceState.secondsElapsed = 0;
      if (audioPreview) {
        audioPreview.pause();
        audioPreview.removeAttribute('src');
        audioPreview.load();
      }
      var previewPlayer = document.querySelector('.luxury-audio-player[data-player="audioPreview"]');
      if (previewPlayer && previewPlayer._reloadSource) {
        previewPlayer._reloadSource(null);
      }
      if (voiceStatePreview) voiceStatePreview.style.display = 'none';
      if (voiceStateRecording) voiceStateRecording.style.display = 'none';
      if (voiceStateIdle) voiceStateIdle.style.display = 'flex';
      updateTimerDisplay(0);
    }

    if (btnStartRecord) {
      btnStartRecord.addEventListener('click', function () {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          showToast(t('voice.micBlocked') || 'Browser Anda belum mendukung rekaman suara.');
          return;
        }

        navigator.mediaDevices.getUserMedia({ audio: true })
          .then(function (stream) {
            if (bgmAudio && !bgmAudio.paused) {
              bgmWasPlayingBeforeVoice = true;
              pauseBgm();
            }
            voiceState.stream = stream;
            voiceState.chunks = [];
            voiceState.secondsElapsed = 0;

            var options = {};
            if (window.MediaRecorder && MediaRecorder.isTypeSupported) {
              if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
                options.mimeType = 'audio/webm;codecs=opus';
              } else if (MediaRecorder.isTypeSupported('audio/webm')) {
                options.mimeType = 'audio/webm';
              } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
                options.mimeType = 'audio/mp4';
              }
            }

            var recorder;
            try {
              recorder = new MediaRecorder(stream, options);
            } catch (e) {
              recorder = new MediaRecorder(stream);
            }
            voiceState.recorder = recorder;

            recorder.ondataavailable = function (e) {
              if (e.data && e.data.size > 0) {
                voiceState.chunks.push(e.data);
              }
            };

            recorder.onstop = function () {
              clearInterval(voiceState.timerInterval);
              if (voiceState.stream) {
                voiceState.stream.getTracks().forEach(function (track) { track.stop(); });
                voiceState.stream = null;
              }
              var recordedType = recorder.mimeType || 'audio/webm';
              var blob = new Blob(voiceState.chunks, { type: recordedType });
              voiceState.blob = blob;

              if (voiceState.blobUrl) URL.revokeObjectURL(voiceState.blobUrl);
              voiceState.blobUrl = URL.createObjectURL(blob);

              if (audioPreview) {
                audioPreview.src = voiceState.blobUrl;
              }
              var previewPlayer = document.querySelector('.luxury-audio-player[data-player="audioPreview"]');
              if (previewPlayer && previewPlayer._reloadSource) {
                previewPlayer._reloadSource(voiceState.blobUrl);
              }

              if (voiceStateRecording) voiceStateRecording.style.display = 'none';
              if (voiceStatePreview) voiceStatePreview.style.display = 'block';
            };

            recorder.start(250);

            if (voiceStateIdle) voiceStateIdle.style.display = 'none';
            if (voiceStateRecording) voiceStateRecording.style.display = 'flex';

            updateTimerDisplay(0);
            voiceState.timerInterval = setInterval(function () {
              voiceState.secondsElapsed++;
              updateTimerDisplay(voiceState.secondsElapsed);
              if (voiceState.secondsElapsed >= voiceState.maxSeconds) {
                stopRecording();
              }
            }, 1000);
          })
          .catch(function (err) {
            console.error('Mic access error:', err);
            showToast(t('voice.micBlocked') || 'Akses mikrofon ditolak atau tidak tersedia.');
          });
      });
    }

    if (btnStopRecord) {
      btnStopRecord.addEventListener('click', function () {
        stopRecording();
      });
    }

    if (btnResetRecord) {
      btnResetRecord.addEventListener('click', function () {
        resetRecording();
        if (bgmWasPlayingBeforeVoice) {
          playBgm(true);
          bgmWasPlayingBeforeVoice = false;
        }
      });
    }

    // Submit handler
    formRsvp.addEventListener('submit', function (e) {
      e.preventDefault();
      if (state.isSubmitting) return;

      var checked = formRsvp.querySelector('input[name="attending"]:checked');
      if (!checked) {
        showToast(t('rsvp.chooseAttendance'));
        return;
      }

      var attending = parseInt(checked.value, 10);
      var pax = attending === 1 ? state.pax : 0;
      var wish = wishText ? wishText.value.trim() : '';

      // Check for code/links
      var linkRe = /(https?:|ftp:|www\.|javascript:|[<>{}`]|\b[a-z0-9-]+\.(com|net|org|id|co|io|me|xyz|ly|info|biz|site|link|app)\b)/i;
      if (linkRe.test(wish)) {
        showModal({
          title: t('modal.invalidTitle'),
          body: t('modal.invalidBody'),
          buttons: [{ text: t('modal.ok'), className: 'btn-rsvp-submit' }]
        });
        return;
      }

      // Check empty wish confirmation ONLY if they haven't recorded a voice note
      if (!wish && !voiceState.blob) {
        showModal({
          title: t('modal.emptyTitle'),
          body: t('modal.emptyBody'),
          buttons: [
            { text: t('modal.emptyCancel'), className: 'btn-copy-account' },
            {
              text: t('modal.emptySubmit'),
              className: 'btn-rsvp-submit',
              action: function () {
                executeSubmit(attending, pax, '');
              }
            }
          ]
        });
        return;
      }

      executeSubmit(attending, pax, wish);
    });

    function getActiveGuestSlug() {
      if (state.guestSlug) return state.guestSlug;
      if (window.__GUEST_SLUG) return window.__GUEST_SLUG;
      var hiddenInput = formRsvp ? formRsvp.querySelector('input[name="guestSlug"]') : null;
      if (hiddenInput && hiddenInput.value) return hiddenInput.value;
      try {
        var sp = new URLSearchParams(window.location.search);
        var qSlug = sp.get('to') || sp.get('guest') || sp.get('slug');
        if (qSlug) return qSlug;
      } catch (e) {}
      var pathParts = window.location.pathname.split('/').filter(Boolean);
      if (pathParts.length > 0) {
        var last = pathParts[pathParts.length - 1];
        if (last !== 'resepsi' && last !== 'syukuran') return last;
      }
      return '';
    }

    function executeSubmit(attending, pax, wish) {
      state.isSubmitting = true;
      var btnSubmit = formRsvp.querySelector('button[type="submit"]');
      if (btnSubmit) {
        btnSubmit.disabled = true;
        btnSubmit.textContent = t('rsvp.submitting');
      }

      var activeSlug = getActiveGuestSlug();
      var formData = new FormData();
      formData.append('guestSlug', activeSlug);
      formData.append('attending', attending);
      formData.append('pax', pax);
      formData.append('wish', wish);

      if (voiceState.blob) {
        var ext = (voiceState.blob.type && voiceState.blob.type.includes('mp4')) ? 'mp4' : 'webm';
        formData.append('voiceNote', voiceState.blob, 'voice-note.' + ext);
        formData.append('voiceDuration', voiceState.secondsElapsed || 0);
      }

      var xhr = new XMLHttpRequest();
      var postUrl = '/api/rsvp' + (activeSlug ? ('?guestSlug=' + encodeURIComponent(activeSlug)) : '');
      xhr.open('POST', postUrl, true);
      xhr.onload = function () {
        state.isSubmitting = false;
        if (btnSubmit) {
          btnSubmit.disabled = false;
          btnSubmit.textContent = t('rsvp.submit');
        }

        try {
          var res = JSON.parse(xhr.responseText);
          if (xhr.status === 200 && res.ok) {
            showToast(t('rsvp.thanks'));
            if (rsvpCard) rsvpCard.style.display = 'none';
            if (rsvpCompleted) {
              rsvpCompleted.style.display = 'block';
              var thanksMsg = document.getElementById('rsvpThanksMsg');
              if (thanksMsg) {
                thanksMsg.textContent = attending === 1 ? t('rsvp.thanksYes') : t('rsvp.thanksNo');
              }
              var yourP = document.getElementById('rsvpYourPax');
              if (yourP) {
                var paxUnit = state.lang === 'en' ? (pax > 1 ? 'guests' : 'guest') : 'orang';
                yourP.textContent = attending === 1 ? ('✓ ' + t('rsvp.yes') + ' (' + pax + ' ' + paxUnit + ')') : ('✗ ' + t('rsvp.no'));
              }
              if (voiceState.blobUrl) {
                var sentAudio = document.getElementById('audioSentPreview');
                var sentWrap = document.getElementById('rsvpVoiceSentWrap');
                var sentPlayer = document.querySelector('.luxury-audio-player[data-player="audioSentPreview"]');
                if (sentAudio && sentWrap) {
                  sentAudio.src = voiceState.blobUrl;
                  if (sentPlayer && sentPlayer._reloadSource) {
                    sentPlayer._reloadSource(voiceState.blobUrl);
                  }
                  sentWrap.style.display = 'block';
                }
              }
            }
            state.wishesPage = 1;
            loadWishes(true);
          } else {
            showToast(res.error || t('rsvp.error'));
          }
        } catch (e) {
          showToast(t('rsvp.error'));
        }
      };
      xhr.onerror = function () {
        state.isSubmitting = false;
        if (btnSubmit) {
          btnSubmit.disabled = false;
          btnSubmit.textContent = t('rsvp.submit');
        }
        showToast(t('rsvp.error'));
      };
      xhr.send(formData);
    }
  }
  initRsvp();

  // Load Wishes Wall
  function loadWishes(reset) {
    if (!wishesContainer) return;
    if (wishesLoading) wishesLoading.style.display = 'block';
    if (reset) {
      wishesContainer.innerHTML = '';
      state.wishesPage = 1;
    }

    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/api/wishes?page=' + state.wishesPage, true);
    xhr.onload = function () {
      if (wishesLoading) wishesLoading.style.display = 'none';
      if (xhr.status === 200) {
        try {
          var res = JSON.parse(xhr.responseText);
          if (res.items && res.items.length > 0) {
            if (wishesEmpty) wishesEmpty.style.display = 'none';
            res.items.forEach(function (w) {
              var card = document.createElement('div');
              card.className = 'wish-item';

              var header = document.createElement('div');
              header.className = 'wish-header';

              var author = document.createElement('span');
              author.className = 'wish-author';
              author.textContent = w.name;

              var badge = document.createElement('span');
              badge.className = 'wish-status-badge ' + (w.attending ? 'badge-attending' : 'badge-absent');
              badge.textContent = w.attending ? t('wishes.attending') : t('wishes.notAttending');

              header.appendChild(author);
              header.appendChild(badge);

              var body = document.createElement('div');
              body.className = 'wish-body';
              body.textContent = w.wish;

              card.appendChild(header);
              card.appendChild(body);
              wishesContainer.appendChild(card);
            });

            if (btnMoreWishes) {
              btnMoreWishes.style.display = res.hasMore ? 'inline-block' : 'none';
            }
          } else if (reset) {
            if (wishesEmpty) wishesEmpty.style.display = 'block';
            if (btnMoreWishes) btnMoreWishes.style.display = 'none';
          }
        } catch (e) {
          if (wishesEmpty) wishesEmpty.style.display = 'block';
        }
      }
    };
    xhr.onerror = function () {
      if (wishesLoading) wishesLoading.style.display = 'none';
    };
    xhr.send();
  }

  // ====================================================================
  // COUPLE PHOTO AUTO-CYCLE (EVERY 2 SECONDS) & CLICK TO SWAP
  // ====================================================================
  function initCouplePhotoSwitchers() {
    var wraps = document.querySelectorAll('.couple-avatar-wrap.auto-cycle');
    wraps.forEach(function (wrap) {
      var nowImg = wrap.querySelector('.avatar-now');
      var childImg = wrap.querySelector('.avatar-child');
      if (!nowImg || !childImg) return;

      var timer = null;
      var isHovered = false;

      function togglePhoto() {
        var isChildActive = childImg.classList.contains('is-active');
        if (isChildActive) {
          childImg.classList.remove('is-active');
          nowImg.classList.add('is-active');
        } else {
          nowImg.classList.remove('is-active');
          childImg.classList.add('is-active');
        }
      }

      function startCycle() {
        if (timer) clearInterval(timer);
        timer = setInterval(function () {
          if (!isHovered) {
            togglePhoto();
          }
        }, 2000);
      }

      function resetCycle() {
        togglePhoto();
        startCycle();
      }

      // Click to toggle immediately and reset 2s interval
      wrap.addEventListener('click', function () {
        resetCycle();
      });

      wrap.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          resetCycle();
        }
      });

      // Pause on hover so visitor can admire the current photo
      wrap.addEventListener('mouseenter', function () {
        isHovered = true;
      });
      wrap.addEventListener('mouseleave', function () {
        isHovered = false;
      });

      // Start automatic 2-second cycle
      startCycle();
    });
  }

  initCouplePhotoSwitchers();

  if (btnMoreWishes) {
    btnMoreWishes.addEventListener('click', function () {
      state.wishesPage += 1;
      loadWishes(false);
    });
  }
  loadWishes(true);

})();

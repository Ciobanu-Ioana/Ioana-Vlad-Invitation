/* ==============
   Scroll Reveal
   ============== */
(function(){
    const revealables = document.querySelectorAll('.reveal-fade, .reveal-up, .reveal-blur, .reveal-scale');
    const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if(entry.isIntersecting){
                entry.target.classList.add('reveal-in');
                // unobserve if you want one-time animation
                io.unobserve(entry.target);
            }
        });
    }, { root: null, rootMargin: '0px 0px -10% 0px', threshold: 0.1 });

    revealables.forEach(el => io.observe(el));
})();

(function(){
    const els = [...document.querySelectorAll('[data-parallax]')];
    if(!els.length) return;

    let lastY = window.scrollY;
    let ticking = false;

    function onScroll(){
        lastY = window.scrollY;
        if(!ticking){
            requestAnimationFrame(applyParallax);
            ticking = true;
        }
    }
    function applyParallax(){
        els.forEach(el => {
            const speed = parseFloat(el.getAttribute('data-speed')) || 0.05;
            const y = lastY * speed;
            el.style.transform = `translate3d(0, ${y}px, 0)`;
        });
        ticking = false;
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    applyParallax();
})();

/* ==============
   RSVP: number steppers
   ============== */
(function(){
    document.querySelectorAll('.number-box').forEach(box => {
        const input = box.querySelector('input');
        const minus = box.querySelector('.minus');
        const plus = box.querySelector('.plus');
        const minValue = parseInt(input.getAttribute('min'), 10);

        minus.addEventListener('click', () => {
            input.value = Math.max(minValue, parseInt(input.value, 10) - 1);
        });

        plus.addEventListener('click', () => {
            input.value = parseInt(input.value, 10) + 1;
        });
    });
})();

/* ==============
   RSVP: radio highlight
   ============== */
(function(){
    const form = document.getElementById('rsvpForm');
    if(!form) return;

    const radios = form.querySelectorAll('input[name="attending"]');
    const accommodationRadios = form.querySelectorAll('input[name="accommodation"]');
    const accommodationGroup = form.querySelector('input[name="accommodation"]');
    const accYes = form.querySelector('input[name="accommodation"][value="da"]');
    const modal = document.getElementById("accommodationModal");
    const closeModal = document.getElementById("closeAccommodationModal");
    const okBtn = document.getElementById("okAccommodationBtn");
    const numAdultsBox = form.querySelector('.number-box[data-name="adults"]');
    const numKidsBox   = form.querySelector('.number-box[data-name="kids"]');
    const adultsInput  = numAdultsBox?.querySelector('input');
    const kidsInput    = numKidsBox?.querySelector('input');
    const adultsMinus  = numAdultsBox?.querySelector('.minus');
    const adultsPlus   = numAdultsBox?.querySelector('.plus');
    const kidsMinus    = numKidsBox?.querySelector('.minus');
    const kidsPlus     = numKidsBox?.querySelector('.plus');

    // function setSelectedHighlight(groupName){
    //     // highlight pentru etichetele attendance-box
    //     form.querySelectorAll('.attendance-box').forEach(l => l.classList.remove('selected'));
    //     const checked = form.querySelector(`input[name="${groupName}"]:checked`);
    //     if(checked) checked.closest('.attendance-box').classList.add('selected');
    // }

    function setSelectedHighlight(groupName){
        const inputs = form.querySelectorAll(`input[name="${groupName}"]`);

        inputs.forEach(input => {
            input.closest('.attendance-box')?.classList.remove('selected');
        });

        const checked = form.querySelector(`input[name="${groupName}"]:checked`);
        if(checked) checked.closest('.attendance-box').classList.add('selected');
    }

    function disableGuests(){
        // setează la 0 și dezactivează
        if (adultsInput) adultsInput.value = 0;
        if (kidsInput)   kidsInput.value   = 0;

        [adultsInput, kidsInput, adultsMinus, adultsPlus, kidsMinus, kidsPlus].forEach(el => {
            if(!el) return;
            el.setAttribute('disabled', 'true');
            el.setAttribute('aria-disabled', 'true');
            // pentru inputuri readonly (în cazul tău erau readonly): menținem readonly și adăugăm disabled
        });

        if (numAdultsBox) numAdultsBox.classList.add('disabled');
        if (numKidsBox)   numKidsBox.classList.add('disabled');

        // pentru aspect, putem marca și coloanele
        numAdultsBox?.closest('.guest-column')?.classList.add('disabled');
        numKidsBox?.closest('.guest-column')?.classList.add('disabled');
    }

    function enableGuests(){
        [adultsInput, kidsInput, adultsMinus, adultsPlus, kidsMinus, kidsPlus].forEach(el => {
            if(!el) return;
            el.removeAttribute('disabled');
            el.setAttribute('aria-disabled', 'false');
        });

        if (numAdultsBox) numAdultsBox.classList.remove('disabled');
        if (numKidsBox)   numKidsBox.classList.remove('disabled');

        numAdultsBox?.closest('.guest-column')?.classList.remove('disabled');
        numKidsBox?.closest('.guest-column')?.classList.remove('disabled');

        // asigură un minim logic: adulții ≥ 1 când participă
        if (adultsInput && (+adultsInput.value || 0) < 1) {
            adultsInput.value = 1;
        }
    }

    function disableAccommodation(){
        accommodationRadios.forEach(r => {
            r.checked = false;
            r.setAttribute('disabled', 'true');
            r.setAttribute('aria-disabled', 'true');
        });

        form.querySelectorAll('.attendance-box').forEach(b => {
            if(b.querySelector('input[name="accommodation"]')){
                b.classList.remove('selected');
                b.classList.add('disabled');
            }
        });

        accommodationGroup?.closest('.form-group')?.classList.add('disabled');
    }

    function enableAccommodation(){
        accommodationRadios.forEach(r => {
            r.removeAttribute('disabled');
            r.setAttribute('aria-disabled', 'false');
        });

        form.querySelectorAll('.attendance-box').forEach(b => {
            if(b.querySelector('input[name="accommodation"]')){
                b.classList.remove('disabled');
            }
        });

        accommodationGroup?.closest('.form-group')?.classList.remove('disabled');
    }

    function updateState(){
        setSelectedHighlight("attending");
        setSelectedHighlight("accommodation");
        const attending = (form.querySelector('input[name="attending"]:checked') || {}).value;
        if(attending === 'nu'){
            disableGuests();
            disableAccommodation();
        } else if(attending === 'da'){
            enableGuests();
            enableAccommodation();
        }
    }

    radios.forEach(r => r.addEventListener('change', updateState));
    // init on load
    updateState();

    accommodationRadios.forEach(r => r.addEventListener('change', () => {
        setSelectedHighlight("accommodation");
    }));

    accYes?.addEventListener('click', () => {
        if (modal && modal.hidden) {
            modal.hidden = false;
        }
    });

    closeModal?.addEventListener("click", () => { modal.hidden = true; });
    okBtn?.addEventListener("click", () => { modal.hidden = true; });
    modal?.addEventListener("click", (e) => {
        if (e.target === modal) modal.hidden = true;
    });


    // Securitate suplimentară la submit: dacă "nu", forțăm 0/0.
    form.addEventListener('submit', () => {
        const attending = (form.querySelector('input[name="attending"]:checked') || {}).value;
        if(attending === 'nu'){
            if (adultsInput) adultsInput.value = 0;
            if (kidsInput)   kidsInput.value   = 0;
        }
    });
})();

/* ==============
   RSVP: form handling (feedback toast)
   ============== */
(function(){
    const form  = document.getElementById('rsvpForm');
    const toast = document.getElementById('toast');
    if(!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const err       = form.querySelector('.error-msg');
        const nameInput = form.querySelector('#guestName');
        const name      = nameInput.value.trim();
        const attending = (form.querySelector('input[name="attending"]:checked') || {}).value || '';
        const accommodation = attending === 'da' ? (form.querySelector('input[name="accommodation"]:checked') || {}).value || '' : '';
        const adults    = Number((form.querySelector('.number-box[data-name="adults"] input') || {}).value || 0);
        const kids      = Number((form.querySelector('.number-box[data-name="kids"] input') || {}).value || 0);
        const message   = (form.querySelector('#message') || {}).value || '';

        nameInput.addEventListener('input', () => {
            err.textContent = '';
        });

        form.querySelectorAll('input[name="attending"]').forEach(r => {
            r.addEventListener('change', () => {
                err.textContent = '';
            });
        });

        form.querySelectorAll('input[name="accommodation"]').forEach(r => {
            r.addEventListener('change', () => {
                err.textContent = '';
            });
        });

        form.addEventListener('reset', () => {
            err.textContent = '';
        });


        // Validări minime
        if(!name){ err.textContent = 'Te rugăm să completezi numele.'; nameInput.focus(); return; }
        if(!attending){ err.textContent = 'Selectează dacă vei participa.'; return; }
        // if(attending === 'da' && !accommodation){ err.textContent = 'Selectează dacă vei avea nevoie de rezervare pentru cazare.'; return; }
        err.textContent = '';

        const btn = form.querySelector('.submit-btn');
        const oldText = btn.textContent;
        btn.disabled = true; btn.textContent = 'Se trimite...';

        try {
            const payload = {
                guestName: name, attending, accommodation: attending === 'da' ? accommodation : 'nu', adults, kids, message,
                _ua: navigator.userAgent,
                _ref: document.referrer || location.href,
                _ip: '' // (opțional) dacă vei popula IP aproximativ din client
            };

            const res = await fetch(APPS_SCRIPT_URL, {
                method: 'POST',
                redirect: 'follow', // important pentru Apps Script
                headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // evită preflight
                body: JSON.stringify(payload)
            });

            const data = await res.json().catch(() => ({}));
            if (data && data.ok) {
                showToast('Mulțumim! Ți-am înregistrat confirmarea. 💛');

            } else {
                showToast('Ne pare rău, a apărut o eroare. Încearcă din nou.');
                console.error('RSVP error:', data);
            }
        } catch (errSend) {
            showToast('Conexiunea a eșuat. Încearcă din nou.');
            console.error('Fetch error:', errSend);
        } finally {
            btn.disabled = false; btn.textContent = oldText;
        }
    });

    function showToast(message){
        if(!toast) return;
        toast.textContent = message;
        toast.hidden = false;
        toast.style.opacity = '0';
        toast.style.transform = 'translate(-50%, 8px)';
        requestAnimationFrame(() => {
            toast.style.transition = 'opacity .25s ease, transform .25s ease';
            toast.style.opacity = '1';
            toast.style.transform = 'translate(-50%, 0)';
        });
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translate(-50%, 8px)';
            setTimeout(() => { toast.hidden = true; }, 250);
        }, 2400);
    }
})();

document.addEventListener('DOMContentLoaded', () => {
    const sealBtn    = document.getElementById('sealBtn');
    const sound      = document.getElementById('sealSound');
    const screen     = document.getElementById('envelopeScreen');

    const flapWrap   = document.querySelector('.flap-wrap');   // <— containerul 3D
    const glowSmall  = document.querySelector('.glow-small');
    const glowBig    = document.querySelector('.glow-big');
    // const veil       = document.querySelector('.envelope-veil');
    const invitation = document.getElementById('invitation-pages');

    if (!sealBtn || !flapWrap || !glowSmall || !glowBig || !invitation) return;

    sealBtn.addEventListener('click', () => {
        if (sound) { try { sound.currentTime = 0; sound.play(); } catch(_){} }

        // 1) mic "shake" + "peel" (opțional)
        sealBtn.classList.remove('stretch');
        sealBtn.classList.add('pre-release');
        setTimeout(() => {
            sealBtn.classList.remove('pre-release');
            sealBtn.classList.add('stretch');
        }, 280);

        // 2) clapeta ~90°, glow mic
        setTimeout(() => {
            sealBtn.classList.remove('stretch');
            flapWrap.classList.add('open');
            glowSmall.classList.add('on');
        }, 600);

        // 3) glow mare
        setTimeout(() => {
            glowBig.classList.add('on');
        }, 1200);

        // // 4) voal alb
        // setTimeout(() => {
        //     veil.classList.add('on');
        // }, 1600);

        // 5) invitația apare
        setTimeout(() => {
            invitation.hidden = false;
            invitation.classList.add('appear');
            window.scrollTo({ top: 0, behavior: 'instant' });
        }, 1500);

        // 6) ascundem plicul
        setTimeout(() => {
            screen.style.display = 'none';
        }, 2000);

        // 7) music
        setTimeout(() => {
            document.getElementById("invitation-pages").style.display = "block";
            document.getElementById("musicToggle").style.display = "flex";
            document.getElementById("scroll").style.display = "flex";
            startMusicAfterEnvelope();
        }, 2300);
    });
});

window.addEventListener('load', () => {
    const flap = document.querySelector('.flap-wrap');
    if (flap) {
        const old = flap.style.transform;
        flap.style.transform = old;
    }
});

window.addeventasync = function(){
    addeventatc.direct = 1;
    addeventatc.caldropdown = 0;

};

/* ==============
   MUSIC PLAYER
   ============== */

    const music = document.getElementById("bgMusic");
    const toggleBtn = document.getElementById("musicToggle");

    let isPlaying = false;

    function startMusicAfterEnvelope() {
    if (!isPlaying) {
    music.volume = 0.2;
    music.play().then(() => {
    isPlaying = true;
    toggleBtn.textContent = "🔊";
}).catch(() => {
    console.log("Autoplay blocat, user trebuie sa interactioneze.");
});
}
}

    toggleBtn.addEventListener("click", () => {
    if (isPlaying) {
    music.pause();
    toggleBtn.textContent = "🔇";
    isPlaying = false;
} else {
    music.play();
    toggleBtn.textContent = "🔊";
    isPlaying = true;
}
});


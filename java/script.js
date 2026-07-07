/* ==========================================================
   IZIPARK NANTES — script.js
   ========================================================== */

document.addEventListener('DOMContentLoaded', function () {

    /* ----------------------------------------------------------
       1. TRADUCTION FR / EN
       ---------------------------------------------------------- */
    var langActuelle = localStorage.getItem('izipark-lang') || 'fr';

    function appliquerLangue(lang) {
        document.documentElement.setAttribute('lang', lang);
        document.querySelectorAll('[data-fr]').forEach(function (el) {
            var texte = el.getAttribute('data-' + lang);
            if (texte !== null) el.innerHTML = texte;
        });
        document.querySelectorAll('[data-fr-placeholder]').forEach(function (el) {
            var texte = el.getAttribute('data-' + lang + '-placeholder');
            if (texte !== null) el.setAttribute('placeholder', texte);
        });
        document.querySelectorAll('#lang-switch button').forEach(function (btn) {
            btn.classList.toggle('actif', btn.dataset.lang === lang);
        });
        localStorage.setItem('izipark-lang', lang);
        langActuelle = lang;
    }

    document.querySelectorAll('#lang-switch button').forEach(function (btn) {
        btn.addEventListener('click', function () { appliquerLangue(this.dataset.lang); });
    });

    appliquerLangue(langActuelle);

    /* ----------------------------------------------------------
       2. RÉVÉLATION AU SCROLL
       ---------------------------------------------------------- */
    var elementsReveal = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');

    if ('IntersectionObserver' in window) {
        var observateur = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) entry.target.classList.add('visible');
            });
        }, { threshold: 0.15 });
        elementsReveal.forEach(function (el) { observateur.observe(el); });

        var routeTrack = document.querySelector('.route-track');
        if (routeTrack) {
            var observateurRoute = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        routeTrack.classList.remove('animer');
                        void routeTrack.offsetWidth; // force le reflow pour rejouer l'animation CSS
                        routeTrack.classList.add('animer');
                    }
                });
            }, { threshold: 0.5 });
            observateurRoute.observe(routeTrack);
        }
    } else {
        elementsReveal.forEach(function (el) { el.classList.add('visible'); });
    }

    /* ----------------------------------------------------------
       3. COMPTEUR ANIMÉ DES STATISTIQUES
       ---------------------------------------------------------- */
    var stats = document.querySelectorAll('.stats-bar .valeur[data-cible]');
    if (stats.length && 'IntersectionObserver' in window) {
        var observateurStats = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting && !entry.target.dataset.anime) {
                    entry.target.dataset.anime = "1";
                    var cible = parseInt(entry.target.getAttribute('data-cible'), 10);
                    var suffixe = entry.target.getAttribute('data-suffixe') || '';
                    var duree = 1400;
                    var t0 = null;
                    function pas(horodatage) {
                        if (!t0) t0 = horodatage;
                        var progres = Math.min((horodatage - t0) / duree, 1);
                        entry.target.textContent = Math.floor(progres * cible) + suffixe;
                        if (progres < 1) requestAnimationFrame(pas);
                        else entry.target.textContent = cible + suffixe;
                    }
                    requestAnimationFrame(pas);
                }
            });
        }, { threshold: 0.6 });
        stats.forEach(function (el) { observateurStats.observe(el); });
    }

    /* ----------------------------------------------------------
       4. HEADER RÉTRACTABLE / BARRE DE PROGRESSION / RETOUR HAUT
       ---------------------------------------------------------- */
    var header = document.getElementById('header');
    var barreProgres = document.getElementById('progress-scroll');
    var btnRetour = document.getElementById('cRetour');

    window.addEventListener('scroll', function () {
        var y = window.scrollY || window.pageYOffset;

        if (header) header.classList.toggle('shrink', y > 40);

        if (btnRetour) {
            btnRetour.classList.toggle('cVisible', y > 300);
            btnRetour.classList.toggle('cInvisible', y <= 300);
        }

        if (barreProgres) {
            var hauteurTotale = document.documentElement.scrollHeight - window.innerHeight;
            barreProgres.style.width = (hauteurTotale > 0 ? (y / hauteurTotale) * 100 : 0) + '%';
        }
    }, { passive: true });

    if (btnRetour) {
        btnRetour.addEventListener('click', function (e) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    /* ----------------------------------------------------------
       5. CARTES SERVICE : bascule au tap / clavier
       ---------------------------------------------------------- */
    document.querySelectorAll('.carte-service').forEach(function (carte) {
        carte.setAttribute('tabindex', '0');
        carte.addEventListener('click', function () { carte.classList.toggle('flip'); });
        carte.addEventListener('keypress', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                carte.classList.toggle('flip');
            }
        });
    });

    /* ----------------------------------------------------------
       6. FORMULAIRE DE RÉSERVATION
       ---------------------------------------------------------- */
    dateplug();

    var forms = document.getElementsByTagName('form');
    for (var i = 0; i < forms.length; i++) {
        forms[i].noValidate = true;
        forms[i].addEventListener('submit', function (event) {
            if (!event.target.checkValidity()) event.preventDefault();
        }, false);
    }
});

/* ==========================================================
   FONCTIONS UTILITAIRES ET FORMULAIRE
   ========================================================== */
function isNumberKey(evt) {
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) return false;
    return true;
}

function validateEmail(id) {
    var reg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
    if (reg.test(id.value)) return true;
    alert("Entrez une adresse e-mail valide SVP");
    return false;
}

function LZ(n) { return (n > 9 ? n : '0' + n); }

function dateplug() {
    var champDebut = document.getElementById('begin');
    var champFin = document.getElementById('end');

    var d = new Date();
    if (champDebut) champDebut.value = LZ(d.getDate()) + "/" + LZ(d.getMonth() + 1) + "/" + d.getFullYear();

    var df = new Date();
    df.setDate(df.getDate() + 7);
    if (champFin) champFin.value = LZ(df.getDate()) + "/" + LZ(df.getMonth() + 1) + "/" + df.getFullYear();
}

function dateupd() {
    var champDebut = document.getElementById('begin');
    var champFin = document.getElementById('end');
    if (!champDebut || !champFin) return;

    var day = champDebut.value.substring(0, 2);
    var month = champDebut.value.substring(3, 5);
    var year = champDebut.value.substring(6, 10);
    var d = new Date();
    d.setFullYear(year, month - 1, day);

    var dt = new Date(d);
    dt.setDate(d.getDate() + 7);
    champFin.value = LZ(dt.getDate()) + "/" + LZ(dt.getMonth() + 1) + "/" + dt.getFullYear();
}

function datedep() {
    // conservé pour compatibilité avec le formulaire d'origine
}

function get_url_inkara(selObj) {
    var monDebut = selObj.begin.value;
    var maFin = selObj.end.value;
    var monHDebut = selObj.heurea.value;
    var maMDebut = selObj.mina.value;
    var monHFin = selObj.heured.value;
    var maMFin = selObj.mind.value;

    if (monDebut.length >= 10) {
        var jjDeb = monDebut.substring(0, 2), mmDeb = monDebut.substring(3, 5), yyDeb = monDebut.substring(6, 10);
        selObj.ff_aa_ti_stay_start_datetime.value = yyDeb + '-' + mmDeb + '-' + jjDeb + ' ' + monHDebut + ':' + maMDebut;
    }

    if (maFin.length >= 10) {
        var jjFin = maFin.substring(0, 2), mmFin = maFin.substring(3, 5), yyFin = maFin.substring(6, 10);
        selObj.ff_aa_ti_stay_end_datetime.value = yyFin + '-' + mmFin + '-' + jjFin + ' ' + monHFin + ':' + maMFin;
    }

    selObj.heuredepart.value = monHDebut + maMDebut;
    selObj.heurearrivee.value = monHFin + maMFin;
}

/* ==========================================================
   GOOGLE MAPS
   ========================================================== */
var directionsService, directionsDisplay, maCarte;

function initMap() {
    if (typeof google === 'undefined') return;
    var mapElement = document.getElementById("EmplacementDeMaCarte");
    if (!mapElement) return;

    directionsService = new google.maps.DirectionsService();
    directionsDisplay = new google.maps.DirectionsRenderer();
    var tours = new google.maps.LatLng(47.1782672, -1.5960141);
    maCarte = new google.maps.Map(mapElement, { zoom: 11, mapTypeId: google.maps.MapTypeId.ROADMAP, center: tours });
    new google.maps.TrafficLayer().setMap(maCarte);

    var campMarker = new google.maps.Marker({ position: tours, map: maCarte, title: "IZIPARK Nantes" });
    var infoWindow = new google.maps.InfoWindow({
        content: "<p class='winmap'>IZIPARK Nantes<br/>24 rue Christophe Colomb<br/>44340 Bouguenais</p>"
    });
    infoWindow.open(maCarte, campMarker);
    google.maps.event.addListener(campMarker, 'click', function () { infoWindow.open(maCarte, campMarker); });
}

/* ==========================================================
   TARTEAUCITRON (RGPD)
   ========================================================== */
if (typeof tarteaucitron !== 'undefined') {
    tarteaucitron.init({
        "hashtag": "#tarteaucitron",
        "highPrivacy": false,
        "orientation": "bottom",
        "adblocker": true,
        "showAlertSmall": true,
        "cookieslist": false,
        "removeCredit": false
    });
    tarteaucitron.user.gtagUa = 'G-7TNSZ0RY4D';
    tarteaucitron.user.gtagMore = function () {};
    (tarteaucitron.job = tarteaucitron.job || []).push('gtag');
    (tarteaucitron.job = tarteaucitron.job || []).push('youtube');
}

/* ==========================================================
   PRELOADER VOITURE
   ========================================================== */
window.addEventListener('load', function () {
    var preloader = document.getElementById('preloader');
    if (!preloader) return;
    setTimeout(function () {
        preloader.classList.add('preloader-hidden');
        setTimeout(function () { if (preloader) preloader.remove(); }, 600);
    }, 1200);
});

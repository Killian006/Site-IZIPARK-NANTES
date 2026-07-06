/* ==========================================================
   IZIPARK NANTES — script.js
   Refonte graphique : interactions, scroll, i18n FR/EN
   ========================================================== */

/* ----------------------------------------------------------
   1. DICTIONNAIRE DE TRADUCTION
   ---------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', function () {

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
        btn.addEventListener('click', function () {
            appliquerLangue(this.dataset.lang);
        });
    });

    appliquerLangue(langActuelle);

    /* ----------------------------------------------------------
       2. RÉVÉLATION AU SCROLL (IntersectionObserver)
       ---------------------------------------------------------- */
    var elementsReveal = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');

    if ('IntersectionObserver' in window) {
        var observateur = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.15 });

        elementsReveal.forEach(function (el) { observateur.observe(el); });

        /* Animation du "chrono navette" rejouée à chaque passage */
        var routeTrack = document.querySelector('.route-track');
        if (routeTrack) {
            var observateurRoute = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        routeTrack.classList.remove('animer');
                        void routeTrack.offsetWidth; // force reflow pour relancer l'animation CSS
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
                    var depart = 0;
                    var duree = 1400;
                    var t0 = null;
                    function pas(horodatage) {
                        if (!t0) t0 = horodatage;
                        var progres = Math.min((horodatage - t0) / duree, 1);
                        var valeur = Math.floor(progres * cible);
                        entry.target.textContent = valeur + suffixe;
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
       4. HEADER RÉTRACTABLE AU SCROLL
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
            var pourcentage = hauteurTotale > 0 ? (y / hauteurTotale) * 100 : 0;
            barreProgres.style.width = pourcentage + '%';
        }
    }, { passive: true });

    if (btnRetour) {
        btnRetour.addEventListener('click', function (e) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    /* ----------------------------------------------------------
       5. CARTES SERVICE : bascule au tap (mobile / accessibilité clavier)
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
    function LZ(n) { return (n > 9 ? n : '0' + n); }

function dateplug() {
    // Initialise les dates avec aujourd'hui et J+7 (Format: jj/mm/aaaa)
    var d = new Date();
    var beginInput = document.getElementById('begin');
    if (beginInput) {
        beginInput.value = LZ(d.getDate()) + "/" + LZ(d.getMonth() + 1) + "/" + d.getFullYear();
    }
    
    var df = new Date();
    df.setDate(df.getDate() + 7);
    var endInput = document.getElementById('end');
    if (endInput) {
        endInput.value = LZ(df.getDate()) + "/" + LZ(df.getMonth() + 1) + "/" + df.getFullYear();
    }
    
    // Si la librairie pickmeup est chargée, on active le calendrier
    if (typeof pickmeup !== 'undefined' && beginInput && endInput) {
        pickmeup('#begin', { position: "bottom", format: "d/m/Y", hide_on_select: true, min: new Date() });
        pickmeup('#end', { position: "bottom", format: "d/m/Y", hide_on_select: true, min: new Date() });
    }
}
});

/* ==========================================================
   FONCTIONS UTILITAIRES ET FORMULAIRE (logique métier conservée)
   ========================================================== */
function isNumberKey(evt) {
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) return false;
    return true;
}

function validateEmail(id) {
    var reg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
    if (reg.test(id.value)) return true;
    else { alert("Entrez une adresse e-mail valide SVP"); return false; }
}

function LZ(n) { return (n > 9 ? n : '0' + n); }

function toDatetimeLocalValue(d) {
    return d.getFullYear() + "-" + LZ(d.getMonth() + 1) + "-" + LZ(d.getDate()) + "T" + LZ(d.getHours()) + ":" + LZ(d.getMinutes());
}

function dateplug() {
    var champDebut = document.getElementById('begin');
    var champFin = document.getElementById('end');
    if (!champDebut || !champFin) return;

    var maintenant = new Date();
    maintenant.setMinutes(0, 0, 0);

    // On empêche de choisir une date de dépôt dans le passé
    champDebut.min = toDatetimeLocalValue(maintenant);

    if (!champDebut.value) champDebut.value = toDatetimeLocalValue(maintenant);

    var dansUneSemaine = new Date(maintenant.getTime());
    dansUneSemaine.setDate(dansUneSemaine.getDate() + 7);
    champFin.min = champDebut.value;
    if (!champFin.value) champFin.value = toDatetimeLocalValue(dansUneSemaine);

    champDebut.addEventListener('change', function () {
        // La date de retour ne peut pas précéder la date de dépôt
        champFin.min = champDebut.value;
        if (champFin.value && champFin.value < champDebut.value) {
            champFin.value = champDebut.value;
        }
    });
}

function get_url_inkara(selObj) {
    // Récupération des valeurs textuelles (jj/mm/aaaa)
    var monDebut = selObj.begin.value;
    var maFin = selObj.end.value;
    
    // Récupération des heures et minutes
    var monHDebut = selObj.heurea.value;
    var maMDebut = selObj.mina.value;
    var monHFin = selObj.heured.value;
    var maMFin = selObj.mind.value;
    
    // Découpage et formatage (AAAA-MM-JJ HH:MM) pour le champ start
    if (monDebut.length >= 10) {
        var jjDeb = monDebut.substring(0, 2);
        var mmDeb = monDebut.substring(3, 5);
        var yyDeb = monDebut.substring(6, 10);
        var hDeb = monHDebut.substring(0, 2);
        var mDeb = maMDebut.substring(0, 2);
        var debutInaxel = yyDeb + '-' + mmDeb + '-' + jjDeb + ' ' + hDeb + ':' + mDeb;
        selObj.ff_aa_ti_stay_start_datetime.value = debutInaxel;
    }

    // Découpage et formatage pour le champ end
    if (maFin.length >= 10) {
        var jjFin = maFin.substring(0, 2);
        var mmFin = maFin.substring(3, 5);
        var yyFin = maFin.substring(6, 10);
        var hFin = monHFin.substring(0, 2);
        var mFin = maMFin.substring(0, 2);
        var finInaxel = yyFin + '-' + mmFin + '-' + jjFin + ' ' + hFin + ':' + mFin;
        selObj.ff_aa_ti_stay_end_datetime.value = finInaxel;
    }
    
    // Remplissage des champs supplémentaires
    selObj.heuredepart.value = monHDebut + maMDebut;
    selObj.heurearrivee.value = monHFin + maMFin;
}

/* ==========================================================
   GOOGLE MAPS (chargement différé, callback)
   ========================================================== */
var directionsService, directionsDisplay, maCarte;

function initMap() {
    if (typeof google === 'undefined') return;
    var mapElement = document.getElementById("EmplacementDeMaCarte");
    if (!mapElement) return;

    directionsService = new google.maps.DirectionsService();
    directionsDisplay = new google.maps.DirectionsRenderer();
    var tours = new google.maps.LatLng(47.1782672, -1.5960141);
    maCarte = new google.maps.Map(mapElement, {
        zoom: 11, mapTypeId: google.maps.MapTypeId.ROADMAP, center: tours
    });
    new google.maps.TrafficLayer().setMap(maCarte);

    var campMarker = new google.maps.Marker({ position: tours, map: maCarte, title: "IZIPARK Nantes" });
    var infoWindow = new google.maps.InfoWindow({
        content: "<p class='winmap'>IZIPARK Nantes<br/>24 rue Christophe Colomb<br/>44340 Bouguenais</p>"
    });
    infoWindow.open(maCarte, campMarker);
    google.maps.event.addListener(campMarker, 'click', function () { infoWindow.open(maCarte, campMarker); });
}

/* ==========================================================
   TARTEAUCITRON (RGPD) — conservé
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
   PRELOADER VOITURE — conservé
   ========================================================== */
window.addEventListener('load', function () {
    var preloader = document.getElementById('preloader');
    if (!preloader) return;
    setTimeout(function () {
        preloader.classList.add('preloader-hidden');
        setTimeout(function () {
            if (preloader) preloader.remove();
        }, 600);
    }, 1200);
});
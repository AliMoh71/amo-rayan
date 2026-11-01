/* =========================================
   AMO RAYAN - JAVASCRIPT

   1. Price Gallery
   2. Offers Slider
   3. New Products (جديدنا)
   4. Fullscreen Gallery
   5. Swipe and Zoom
========================================= */


/* =========================================
   1. IMAGE COLLECTIONS
========================================= */

// Price list images
const priceImages = [
    "images/main_prices/main_prices.jpeg",
    "images/main_prices/prices2.jpeg"
];

// Offers
const offers = [
    "offer1.jpeg",
    "offer2.jpeg",
    "offer3.jpeg",
    "offer4.jpeg",
    "offer5.jpeg"
];

// New products - جديدنا
const newProducts = [
    "new1.jpeg",
    "new2.jpeg",
    "new3.jpeg",
    "new4.jpeg",
    "new5.jpeg",
    "new6.jpeg"
];

// Complete image paths
const offerImages = offers.map(
    filename => `images/offers/${filename}`
);

const newImages = newProducts.map(
    filename => `images/new/${filename}`
);


/* =========================================
   2. FULLSCREEN GALLERY
========================================= */

const galleryModal = document.getElementById("galleryModal");
const galleryImage = document.getElementById("galleryImage");
const galleryCounter = document.getElementById("galleryCounter");

let activeImages = priceImages;
let activeGallery = "prices";
let currentImage = 0;

// Zoom settings
const MAX_ZOOM = 4;
const DOUBLE_TAP_DELAY = 300;
const SWIPE_THRESHOLD = 50;

let zoomScale = 1;
let translateX = 0;
let translateY = 0;

let startDistance = 0;
let startScale = 1;

let startX = 0;
let startY = 0;

let initialTranslateX = 0;
let initialTranslateY = 0;

let gestureHadPinch = false;
let gestureStartedZoomed = false;

let lastTapTime = 0;
let lastTapX = 0;
let lastTapY = 0;

let mouseDragging = false;


/* =========================================
   3. OPEN GALLERY
========================================= */

// Existing HTML can still call openGallery(0)
// or openGallery(1) for price images.

function openGallery(index, type = "prices") {

    activeGallery = type;

    if (type === "prices") {
        activeImages = priceImages;
    } else if (type === "offers") {
        activeImages = offerImages;
    } else if (type === "new") {
        activeImages = newImages;
    } else {
        return;
    }

    if (activeImages.length === 0) {
        return;
    }

    currentImage = Math.max(
        0,
        Math.min(index, activeImages.length - 1)
    );

    resetZoom();
    updateGallery();

    galleryModal.hidden = false;
    document.body.style.overflow = "hidden";
}


/* =========================================
   4. CLOSE GALLERY
========================================= */

function closeGallery() {

    galleryModal.hidden = true;

    document.body.style.overflow = "";

    resetZoom();

    // Restore price images as the default gallery
    activeGallery = "prices";
    activeImages = priceImages;
}


/* =========================================
   5. UPDATE GALLERY IMAGE
========================================= */

function updateGallery() {

    if (activeImages.length === 0) {
        return;
    }

    galleryImage.src = activeImages[currentImage];

    if (activeGallery === "prices") {

        galleryImage.alt =
            `قائمة الأسعار - الصفحة ${currentImage + 1}`;

    } else if (activeGallery === "offers") {

        galleryImage.alt =
            `العرض ${currentImage + 1}`;

    } else {

        galleryImage.alt =
            `جديدنا - الصورة ${currentImage + 1}`;
    }

    galleryCounter.textContent =
        `${currentImage + 1} / ${activeImages.length}`;

    const prev = document.querySelector(".gallery-prev");
    const next = document.querySelector(".gallery-next");

    if (prev && next) {
        const display = activeImages.length > 1 ? "flex" : "none";

        prev.style.display = display;
        next.style.display = display;
    }
}


/* =========================================
   6. CHANGE GALLERY IMAGE
========================================= */

function changeImage(direction) {

    if (activeImages.length === 0) {
        return;
    }

    currentImage =
        (currentImage + direction + activeImages.length)
        % activeImages.length;

    resetZoom();
    updateGallery();
}


/* =========================================
   7. ZOOM FUNCTIONS
========================================= */

function applyZoom() {

    galleryImage.style.transform =
        `translate(${translateX}px, ${translateY}px) scale(${zoomScale})`;

    galleryImage.style.cursor =
        zoomScale > 1 ? "grab" : "zoom-in";
}


function resetZoom() {

    zoomScale = 1;

    translateX = 0;
    translateY = 0;

    lastTapTime = 0;
    gestureHadPinch = false;

    applyZoom();
}


function clampPosition() {

    const imageWidth = galleryImage.offsetWidth;
    const imageHeight = galleryImage.offsetHeight;

    const maxX = Math.max(
        0,
        (imageWidth * (zoomScale - 1)) / 2
    );

    const maxY = Math.max(
        0,
        (imageHeight * (zoomScale - 1)) / 2
    );

    translateX = Math.max(
        -maxX,
        Math.min(maxX, translateX)
    );

    translateY = Math.max(
        -maxY,
        Math.min(maxY, translateY)
    );
}


function toggleZoom() {

    if (zoomScale > 1) {

        resetZoom();

    } else {

        zoomScale = 2.5;

        translateX = 0;
        translateY = 0;

        applyZoom();
    }
}


function getTouchDistance(touch1, touch2) {

    return Math.hypot(
        touch1.clientX - touch2.clientX,
        touch1.clientY - touch2.clientY
    );
}


/* =========================================
   8. TOUCH START
========================================= */

galleryImage.addEventListener(
    "touchstart",
    function(event) {

        if (event.touches.length === 2) {

            gestureHadPinch = true;

            startDistance = getTouchDistance(
                event.touches[0],
                event.touches[1]
            );

            startScale = zoomScale;

        } else if (event.touches.length === 1) {

            startX = event.touches[0].clientX;
            startY = event.touches[0].clientY;

            initialTranslateX = translateX;
            initialTranslateY = translateY;

            gestureStartedZoomed = zoomScale > 1;
        }

    },
    { passive: true }
);


/* =========================================
   9. TOUCH MOVE
========================================= */

galleryImage.addEventListener(
    "touchmove",
    function(event) {

        if (event.touches.length === 2) {

            event.preventDefault();

            const newDistance = getTouchDistance(
                event.touches[0],
                event.touches[1]
            );

            if (startDistance > 0) {

                zoomScale = Math.min(
                    MAX_ZOOM,
                    Math.max(
                        1,
                        startScale * newDistance / startDistance
                    )
                );

                if (zoomScale === 1) {
                    translateX = 0;
                    translateY = 0;
                }

                clampPosition();
                applyZoom();
            }

        } else if (
            event.touches.length === 1 &&
            zoomScale > 1
        ) {

            event.preventDefault();

            translateX =
                initialTranslateX +
                event.touches[0].clientX - startX;

            translateY =
                initialTranslateY +
                event.touches[0].clientY - startY;

            clampPosition();
            applyZoom();
        }

    },
    { passive: false }
);


/* =========================================
   10. TOUCH END
========================================= */

galleryImage.addEventListener(
    "touchend",
    function(event) {

        if (event.touches.length === 1) {

            startX = event.touches[0].clientX;
            startY = event.touches[0].clientY;

            initialTranslateX = translateX;
            initialTranslateY = translateY;

            return;
        }

        if (event.touches.length > 0) {
            return;
        }

        if (gestureHadPinch) {

            gestureHadPinch = false;
            lastTapTime = 0;

            return;
        }

        const touch = event.changedTouches[0];

        if (!touch) {
            return;
        }

        const dx = touch.clientX - startX;
        const dy = touch.clientY - startY;

        // Swipe between images when not zoomed
        if (
            !gestureStartedZoomed &&
            zoomScale === 1 &&
            Math.abs(dx) > SWIPE_THRESHOLD &&
            Math.abs(dx) > Math.abs(dy)
        ) {

            changeImage(dx < 0 ? 1 : -1);

            lastTapTime = 0;

            return;
        }

        // Double tap to zoom
        if (
            Math.abs(dx) < 15 &&
            Math.abs(dy) < 15
        ) {

            const now = Date.now();

            const nearPreviousTap = Math.hypot(
                touch.clientX - lastTapX,
                touch.clientY - lastTapY
            ) < 60;

            if (
                lastTapTime > 0 &&
                now - lastTapTime < DOUBLE_TAP_DELAY &&
                nearPreviousTap
            ) {

                toggleZoom();

                lastTapTime = 0;

            } else {

                lastTapTime = now;

                lastTapX = touch.clientX;
                lastTapY = touch.clientY;
            }

        } else {

            lastTapTime = 0;
        }

    },
    { passive: true }
);


/* =========================================
   11. DESKTOP ZOOM AND DRAG
========================================= */

galleryImage.addEventListener("dblclick", function() {
    toggleZoom();
});


galleryImage.addEventListener("mousedown", function(event) {

    if (zoomScale <= 1 || event.button !== 0) {
        return;
    }

    event.preventDefault();

    mouseDragging = true;

    startX = event.clientX;
    startY = event.clientY;

    initialTranslateX = translateX;
    initialTranslateY = translateY;
});


window.addEventListener("mousemove", function(event) {

    if (!mouseDragging) {
        return;
    }

    translateX =
        initialTranslateX + event.clientX - startX;

    translateY =
        initialTranslateY + event.clientY - startY;

    clampPosition();
    applyZoom();
});


window.addEventListener("mouseup", function() {
    mouseDragging = false;
});


/* =========================================
   12. KEYBOARD NAVIGATION
========================================= */

document.addEventListener("keydown", function(event) {

    if (galleryModal.hidden) {
        return;
    }

    if (event.key === "Escape") {

        closeGallery();

    } else if (event.key === "ArrowLeft") {

        changeImage(1);

    } else if (event.key === "ArrowRight") {

        changeImage(-1);
    }
});


galleryModal.addEventListener("click", function(event) {

    if (event.target === galleryModal) {
        closeGallery();
    }
});


/* =========================================
   13. REUSABLE IMAGE SLIDER

   Used for:
   - Offers
   - New Products
========================================= */

function createImageSlider(config) {

    const section = document.getElementById(config.sectionId);
    const slider = document.getElementById(config.sliderId);
    const dotsContainer = document.getElementById(config.dotsId);

    const prevButton = document.querySelector(config.prevSelector);
    const nextButton = document.querySelector(config.nextSelector);

    if (
        !section ||
        !slider ||
        !dotsContainer ||
        !prevButton ||
        !nextButton
    ) {

        console.warn(
            `Slider elements not found: ${config.sectionId}`
        );

        return;
    }

    const images = config.images;

    let currentIndex = 0;
    let touchStartX = 0;
    let wasSwiped = false;
    let swipeTimer = null;
    let scrollTimer = null;

    slider.innerHTML = "";
    dotsContainer.innerHTML = "";

    // Hide section when no images exist
    if (images.length === 0) {

        section.style.display = "none";

        return;
    }

    section.style.display = "";

    // Create images and dots
    images.forEach((imagePath, index) => {

        const card = document.createElement("button");

        card.type = "button";
        card.className = config.cardClass;

        card.setAttribute(
            "aria-label",
            `فتح الصورة ${index + 1}`
        );

        const img = document.createElement("img");

        img.src = imagePath;
        img.alt = `${config.title} - الصورة ${index + 1}`;

        img.loading = "lazy";
        img.draggable = false;

        card.appendChild(img);
        slider.appendChild(card);

        // Open image fullscreen
        card.addEventListener("click", function() {

            if (wasSwiped) {
                return;
            }

            openGallery(index, config.galleryType);
        });

        // Create navigation dot
        const dot = document.createElement("span");

        dot.className = config.dotClass;

        if (index === 0) {
            dot.classList.add("active");
        }

        dotsContainer.appendChild(dot);
    });

    // Hide arrows if only one image
    const hasMultipleImages = images.length > 1;

    prevButton.style.display =
        hasMultipleImages ? "flex" : "none";

    nextButton.style.display =
        hasMultipleImages ? "flex" : "none";

    dotsContainer.style.display =
        hasMultipleImages ? "flex" : "none";


    /* ===== UPDATE DOTS ===== */

    function updateDots() {

        const dots = dotsContainer.querySelectorAll(
            `.${config.dotClass}`
        );

        dots.forEach((dot, index) => {

            dot.classList.toggle(
                "active",
                index === currentIndex
            );
        });
    }


    /* ===== SHOW IMAGE ===== */

    function showImage(index) {

        if (images.length === 0) {
            return;
        }

        currentIndex =
            (index + images.length) % images.length;

        slider.scrollTo({
            left: -currentIndex * slider.clientWidth,
            behavior: "smooth"
        });

        updateDots();
    }


    /* ===== NAVIGATION BUTTONS ===== */

    prevButton.addEventListener("click", function() {
        showImage(currentIndex - 1);
    });

    nextButton.addEventListener("click", function() {
        showImage(currentIndex + 1);
    });


    /* ===== DETECT SWIPING ===== */

    slider.addEventListener(
        "touchstart",
        function(event) {

            wasSwiped = false;

            touchStartX = event.touches[0].clientX;

            clearTimeout(swipeTimer);
        },
        { passive: true }
    );


    slider.addEventListener(
        "touchmove",
        function(event) {

            const dx =
                event.touches[0].clientX - touchStartX;

            if (Math.abs(dx) > 10) {
                wasSwiped = true;
            }
        },
        { passive: true }
    );


    slider.addEventListener(
        "touchend",
        function() {

            swipeTimer = setTimeout(function() {
                wasSwiped = false;
            }, 350);
        },
        { passive: true }
    );


    /* ===== UPDATE DOTS AFTER SCROLL ===== */

    slider.addEventListener("scroll", function() {

        clearTimeout(scrollTimer);

        scrollTimer = setTimeout(function() {

            const width = slider.clientWidth;

            if (width === 0) {
                return;
            }

            const index = Math.round(
                Math.abs(slider.scrollLeft) / width
            );

            currentIndex = Math.max(
                0,
                Math.min(images.length - 1, index)
            );

            updateDots();

        }, 120);
    });

}


/* =========================================
   14. INITIALIZE OFFERS
========================================= */

createImageSlider({

    sectionId: "offers",

    sliderId: "offersSlider",

    dotsId: "sliderDots",

    prevSelector: ".prev-btn",

    nextSelector: ".next-btn",

    images: offerImages,

    title: "عروضنا",

    galleryType: "offers",

    cardClass: "offer-card",

    dotClass: "dot"
});


/* =========================================
   15. INITIALIZE NEW PRODUCTS - جديدنا
========================================= */

createImageSlider({

    sectionId: "new",

    sliderId: "newSlider",

    dotsId: "newDots",

    prevSelector: ".new-prev-btn",

    nextSelector: ".new-next-btn",

    images: newImages,

    title: "جديدنا",

    galleryType: "new",

    cardClass: "new-card",

    dotClass: "new-dot"
});
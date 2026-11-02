
/* ==========================================
   JPMDZ PORTFOLIO
   COMPLETE JAVASCRIPT (with anti-bot protection)
========================================== */


/* ==========================================
   1. DARK MODE / LIGHT MODE
========================================== */

const themeToggle = document.getElementById("theme-toggle");

// Apply the selected theme
function setTheme(theme) {

    const isDark = theme === "dark";

    document.documentElement.classList.toggle("dark-mode", isDark);
    document.body.classList.toggle("dark-mode", isDark);

    if (themeToggle) {

        const icon = themeToggle.querySelector("i");

        if (icon) {
            icon.classList.toggle("fa-moon", !isDark);
            icon.classList.toggle("fa-sun", isDark);
        }

        themeToggle.setAttribute(
            "aria-label",
            isDark ? "Switch to light mode" : "Switch to dark mode"
        );

        themeToggle.setAttribute(
            "title",
            isDark ? "Switch to light mode" : "Switch to dark mode"
        );
    }
}


// Load saved theme
let savedTheme = "light";

try {

    const storedTheme = localStorage.getItem("portfolio-theme");

    if (storedTheme === "dark" || storedTheme === "light") {

        savedTheme = storedTheme;

    } else if (
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {

        savedTheme = "dark";

    }

} catch (error) {

    console.warn("Unable to load saved theme:", error);

}


// Apply theme when page loads
setTheme(savedTheme);


// Switch between dark and light mode
if (themeToggle) {

    themeToggle.addEventListener("click", function () {

        const isDark =
            document.documentElement.classList.contains("dark-mode");

        const newTheme = isDark ? "light" : "dark";

        setTheme(newTheme);

        try {

            localStorage.setItem("portfolio-theme", newTheme);

        } catch (error) {

            console.warn("Unable to save theme:", error);

        }

    });

}



/* ==========================================
   2. MOBILE BURGER NAVIGATION
========================================== */

const menuToggle = document.getElementById("menu-toggle");
const navMenu = document.getElementById("nav-menu");


function setMenu(open) {

    if (!menuToggle || !navMenu) return;

    navMenu.classList.toggle("open", open);

    menuToggle.setAttribute("aria-expanded", String(open));

    menuToggle.setAttribute(
        "aria-label",
        open ? "Close menu" : "Open menu"
    );

    const menuIcon = menuToggle.querySelector("i");

    if (menuIcon) {

        menuIcon.classList.toggle("fa-bars", !open);
        menuIcon.classList.toggle("fa-xmark", open);

    }

}


if (menuToggle && navMenu) {

    // Burger button click
    menuToggle.addEventListener("click", function () {

        const isOpen = navMenu.classList.contains("open");

        setMenu(!isOpen);

    });


    // Close menu after selecting a link
    navMenu.querySelectorAll("a").forEach(function (link) {

        link.addEventListener("click", function () {

            setMenu(false);

        });

    });


    // Close menu when pressing Escape
    document.addEventListener("keydown", function (event) {

        if (event.key === "Escape") {

            setMenu(false);

        }

    });


    // Close menu when clicking outside header
    document.addEventListener("click", function (event) {

        if (!event.target.closest("header")) {

            setMenu(false);

        }

    });


    // Close menu when resizing to desktop
    window.addEventListener("resize", function () {

        if (window.innerWidth > 768) {

            setMenu(false);

        }

    });

}



/* ==========================================
   3. CONTACT FORM
   WEB3FORMS EMAIL SUBMISSION + ANTI-BOT
========================================== */

const contactForm = document.getElementById("contact-form");

const formStatus = document.querySelector(".form-status");


if (contactForm) {

    const nameInput = contactForm.querySelector('[name="name"]');
    const emailInput = contactForm.querySelector('[name="email"]');
    const subjectInput = contactForm.querySelector('[name="subject"]');
    const messageInput = contactForm.querySelector('[name="message"]');

    const submitButton = contactForm.querySelector(
        'button[type="submit"], input[type="submit"]'
    );

    const originalButtonHTML = submitButton
        ? submitButton.innerHTML
        : "";


    const fields = [
        nameInput,
        emailInput,
        subjectInput,
        messageInput
    ].filter(Boolean);


    /* ---------- ANTI-BOT SETTINGS ---------- */

    const FORM_LOADED_AT = Date.now();
    const MIN_FILL_TIME_MS = 3000;       // humans take longer than 3 seconds
    const COOLDOWN_MS = 60 * 1000;       // 1 message per minute
    const MAX_LINKS = 2;                 // spam usually contains many links

    const MAX_LENGTHS = {
        name: 80,
        email: 120,
        subject: 120,
        message: 2000
    };

    // Limit input length on the fields themselves
    fields.forEach(function (field) {

        const max = MAX_LENGTHS[field.name];

        if (max) {

            field.setAttribute("maxlength", max);

        }

    });


    // Returns a reason string if the submission looks like a bot, otherwise null
    function isLikelyBot() {

        // 1. Honeypots filled
        const botcheck = contactForm.querySelector('[name="botcheck"]');
        const website = contactForm.querySelector('[name="website"]');

        if (
            (botcheck && botcheck.checked) ||
            (website && website.value.trim() !== "")
        ) {
            return "honeypot";
        }

        // 2. Form submitted too quickly
        if (Date.now() - FORM_LOADED_AT < MIN_FILL_TIME_MS) {
            return "too-fast";
        }

        // 3. Too many links in the message
        if (messageInput) {

            const links = (
                messageInput.value.match(/https?:\/\/|www\./gi) || []
            ).length;

            if (links > MAX_LINKS) {
                return "too-many-links";
            }

        }

        // 4. Cooldown between submissions
        try {

            const last = Number(localStorage.getItem("last-submit") || 0);

            if (Date.now() - last < COOLDOWN_MS) {
                return "cooldown";
            }

        } catch (error) {
            // Storage unavailable, skip this check
        }

        return null;

    }


    /* ---------- FIELD ERRORS ---------- */

    // Show error message
    function showError(input, message) {

        if (!input) return;

        const group = input.closest(".form-group");

        const errorElement = group
            ? group.querySelector(".error-msg")
            : null;

        if (errorElement) {

            errorElement.textContent = message;

        }

        input.classList.add("input-error");

        input.setAttribute("aria-invalid", "true");

    }


    // Clear error message
    function clearError(input) {

        if (!input) return;

        const group = input.closest(".form-group");

        const errorElement = group
            ? group.querySelector(".error-msg")
            : null;

        if (errorElement) {

            errorElement.textContent = "";

        }

        input.classList.remove("input-error");

        input.removeAttribute("aria-invalid");

    }


    /* ---------- VALIDATION ---------- */

    function validateField(input) {

        if (!input) return false;

        const value = input.value.trim();

        clearError(input);


        // NAME
        if (input === nameInput) {

            if (!value) {

                showError(input, "Please enter your full name.");

                return false;

            }

            if (value.length < 2) {

                showError(input, "Your name must contain at least 2 characters.");

                return false;

            }

            const namePattern = /^[\p{L}\p{M}][\p{L}\p{M}\s'.-]*$/u;

            if (!namePattern.test(value)) {

                showError(input, "Please enter a valid name.");

                return false;

            }

        }


        // EMAIL
        if (input === emailInput) {

            if (!value) {

                showError(input, "Please enter your email address.");

                return false;

            }

            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailPattern.test(value)) {

                showError(input, "Please enter a valid email address.");

                return false;

            }

        }


        // SUBJECT
        if (input === subjectInput) {

            if (!value) {

                showError(input, "Please enter a subject.");

                return false;

            }

            if (value.length < 3) {

                showError(input, "Subject must contain at least 3 characters.");

                return false;

            }

        }


        // MESSAGE
        if (input === messageInput) {

            if (!value) {

                showError(input, "Please enter your message.");

                return false;

            }

            if (value.length < 5) {

                showError(input, "Message must contain at least 5 characters.");

                return false;

            }

        }

        return true;

    }


    function validateForm() {

        let isValid = true;

        fields.forEach(function (field) {

            if (!validateField(field)) {

                isValid = false;

            }

        });

        return isValid;

    }


    // Validate when leaving an input, clear errors when correcting
    fields.forEach(function (field) {

        field.addEventListener("blur", function () {

            validateField(field);

        });

        field.addEventListener("input", function () {

            if (field.hasAttribute("aria-invalid")) {

                validateField(field);

            }

        });

    });


    /* ---------- SUBMIT ---------- */

    contactForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        if (formStatus) {

            formStatus.textContent = "";

        }


        // Anti-bot checks
        const botReason = isLikelyBot();

        if (botReason) {

            if (botReason === "cooldown") {

                if (formStatus) {
                    formStatus.textContent =
                        "Please wait a minute before sending another message.";
                }

            } else if (botReason === "too-fast") {

                if (formStatus) {
                    formStatus.textContent =
                        "Please take a moment to review your message, then try again.";
                }

            } else if (botReason === "too-many-links") {

                if (formStatus) {
                    formStatus.textContent =
                        "Your message contains too many links.";
                }

            } else {

                // Honeypot: fake success so bots don't adapt
                if (formStatus) {
                    formStatus.textContent =
                        "Thank you! Your message has been sent successfully.";
                }

                contactForm.reset();

            }

            return;

        }


        // Check validation
        if (!validateForm()) {

            if (formStatus) {

                formStatus.textContent =
                    "Please check the highlighted fields and correct the errors.";

            }

            const firstInvalid = contactForm.querySelector(
                '[aria-invalid="true"]'
            );

            if (firstInvalid) {

                firstInvalid.focus();

            }

            return;

        }


        // Captcha check (only runs if an hCaptcha widget is on the form)
        const captchaWidget = contactForm.querySelector(".h-captcha");

        if (captchaWidget) {

            const captchaResponse = contactForm.querySelector(
                '[name="h-captcha-response"]'
            );

            if (!captchaResponse || !captchaResponse.value) {

                if (formStatus) {

                    formStatus.textContent =
                        "Please complete the captcha before sending.";

                }

                return;

            }

        }


        // Check Web3Forms access key
        const accessKey = contactForm.querySelector('[name="access_key"]');

        if (
            !accessKey ||
            !accessKey.value.trim() ||
            accessKey.value.includes("YOUR_ACCESS_KEY")
        ) {

            if (formStatus) {

                formStatus.textContent =
                    "Please configure your Web3Forms access key.";

            }

            console.error("Web3Forms access key is missing.");

            return;

        }


        // Prepare form data
        const formData = new FormData(contactForm);


        // Sending status
        if (formStatus) {

            formStatus.textContent = "Sending your message...";

        }

        if (submitButton) {

            submitButton.disabled = true;

            submitButton.textContent = "Sending...";

        }


        try {

            const response = await fetch(
                "https://api.web3forms.com/submit",
                {
                    method: "POST",
                    body: formData
                }
            );

            const result = await response.json();


            if (response.ok && result.success) {

                if (formStatus) {

                    formStatus.textContent =
                        "Thank you! Your message has been sent successfully.";

                }

                contactForm.reset();

                fields.forEach(clearError);

                // Reset captcha if present
                if (window.hcaptcha) {

                    try {
                        window.hcaptcha.reset();
                    } catch (error) {
                        // Ignore captcha reset errors
                    }

                }

                // Save time of last successful submission (cooldown)
                try {

                    localStorage.setItem("last-submit", String(Date.now()));

                } catch (error) {
                    // Storage unavailable
                }

            } else {

                throw new Error(
                    result.message || "Unable to send your message."
                );

            }


        } catch (error) {

            console.error("Contact form error:", error);

            if (formStatus) {

                formStatus.textContent =
                    "Sorry, something went wrong. Please try again.";

            }

        } finally {

            // Restore submit button
            if (submitButton) {

                submitButton.disabled = false;

                submitButton.innerHTML = originalButtonHTML;

            }

        }

    });

}



/* ==========================================
   4. AUTOMATIC COPYRIGHT YEAR
========================================== */

const yearElement = document.getElementById("year");

if (yearElement) {

    yearElement.textContent = new Date().getFullYear();

}
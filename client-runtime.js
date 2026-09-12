/* ============================================================
   MDK CLIENT RUNTIME
   V1
   ============================================================ */

(function () {

    "use strict";


    /* ========================================================
       SUPABASE
    ======================================================== */

    var SUPABASE_URL =
        "https://ywvdozdoanmcxscfofcf.supabase.co";

    var SUPABASE_KEY =
        "sb_publishable_aAqO96BmDbYivhlgl_3z7g_1orXAscB";


    var db = null;


    /* ========================================================
       START
    ======================================================== */

    function startRuntime() {

        console.log(
            "MDK Runtime: Starting..."
        );


        if (!window.supabase) {

            console.error(
                "MDK Runtime: Supabase library not loaded."
            );

            return;
        }


        try {

            db =
                window.supabase.createClient(
                    SUPABASE_URL,
                    SUPABASE_KEY
                );

            window.MDKSupabaseClient = db;

        } catch (error) {

            console.error(
                "MDK Runtime: Supabase initialization failed.",
                error
            );

            return;
        }


        loadClient();

    }


    /* ========================================================
       GET CLIENT ID
       URL FIRST
       ?client=UUID
       ?client_id=UUID
       ======================================================== */

    function getClientId() {

        try {

            var params =
                new URLSearchParams(
                    window.location.search
                );


            var urlId =
                params.get("client");


            if (urlId) {

                return urlId;

            }


            var urlClientId =
                params.get("client_id");


            if (urlClientId) {

                return urlClientId;

            }

        } catch (error) {

            console.warn(
                "MDK Runtime: URL read failed.",
                error
            );

        }


        try {

            if (
                window.MDKClientContext &&
                typeof window.MDKClientContext.id ===
                    "function"
            ) {

                var contextId =
                    window.MDKClientContext.id();


                if (contextId) {

                    return contextId;

                }

            }

        } catch (error) {

            console.warn(
                "MDK Runtime: Context read failed.",
                error
            );

        }


        try {

            var saved =
                localStorage.getItem(
                    "mdkaif_active_client"
                );


            if (saved) {

                var client =
                    JSON.parse(saved);


                if (
                    client &&
                    client.id
                ) {

                    return client.id;

                }

            }

        } catch (error) {

            console.warn(
                "MDK Runtime: LocalStorage read failed.",
                error
            );

        }


        return null;

    }


    /* ========================================================
       SAFE VALUE
       ======================================================== */

    function getValue(
        object,
        key,
        fallback
    ) {

        if (!object) {

            return fallback || "";

        }


        if (
            object[key] !== null &&
            object[key] !== undefined &&
            String(object[key]).trim() !== ""
        ) {

            return String(object[key]);

        }


        return fallback || "";

    }


    /* ========================================================
       SET TEXT
       ======================================================== */

    function setText(
        selector,
        value
    ) {

        if (
            value === null ||
            value === undefined ||
            String(value).trim() === ""
        ) {

            return;

        }


        var elements =
            document.querySelectorAll(
                selector
            );


        elements.forEach(
            function (element) {

                element.textContent =
                    String(value);

            }
        );

    }


    /* ========================================================
       SET ATTRIBUTE
       ======================================================== */

    function setAttribute(
        selector,
        attribute,
        value
    ) {

        if (
            value === null ||
            value === undefined ||
            String(value).trim() === ""
        ) {

            return;

        }


        var elements =
            document.querySelectorAll(
                selector
            );


        elements.forEach(
            function (element) {

                element.setAttribute(
                    attribute,
                    String(value)
                );

            }
        );

    }


    /* ========================================================
       ESCAPE HTML
       ======================================================== */

    function escapeHTML(value) {

        return String(
            value === null ||
            value === undefined
                ? ""
                : value
        )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

    }


    /* ========================================================
       NORMALIZE WEBSITE URL
       ======================================================== */

    function normalizeUrl(
        url
    ) {

        if (!url) {

            return "";

        }


        url =
            String(url).trim();


        if (!url) {

            return "";

        }


        if (
            url.indexOf("http://") !== 0 &&
            url.indexOf("https://") !== 0 &&
            url.indexOf("//") !== 0
        ) {

            url =
                "https://" +
                url;

        }


        return url;

    }


    /* ========================================================
       LOAD CLIENT
       ======================================================== */

    async function loadClient() {

        var clientId =
            getClientId();


        if (!clientId) {

            console.log(
                "MDK Runtime: No client selected. Demo mode."
            );

            return;

        }


        console.log(
            "MDK Runtime: Client ID:",
            clientId
        );


        try {

            /* ================================================
               CLIENT
            ================================================= */

            var clientResult =
                await db
                    .from("clients")
                    .select("*")
                    .eq(
                        "id",
                        clientId
                    )
                    .single();


            if (clientResult.error) {

                console.error(
                    "MDK Runtime: Client error:",
                    clientResult.error
                );

                return;

            }


            var client =
                clientResult.data;


            if (!client) {

                console.error(
                    "MDK Runtime: Client not found."
                );

                return;

            }


            console.log(
                "MDK Runtime: Loaded:",
                client.company_name
            );


            /* ================================================
               SAVE CONTEXT
            ================================================= */

            try {

                if (
                    window.MDKClientContext &&
                    typeof window.MDKClientContext.set ===
                        "function"
                ) {

                    window.MDKClientContext.set(
                        client
                    );

                }

            } catch (error) {

                console.warn(
                    "MDK Runtime: Context save failed.",
                    error
                );

            }


            /* ================================================
               CLIENT BASIC DATA
            ================================================= */

            applyClient(
                client
            );


            /* ================================================
               WEBSITE CONTENT
            ================================================= */

            await loadWebsiteContent(
                clientId
            );


            /* ================================================
               COMPANY SETTINGS
               COMPANY SETTINGS OVERRIDES
               PHONE / EMAIL / ADDRESS / SEO ETC.
            ================================================= */

            await loadCompanySettings(
                clientId
            );


            /* ========================================================
               ADVANCED WEBSITE SETTINGS
               ======================================================== */
            await loadAdvancedWebsiteSettings(
                clientId
            );


            /* ================================================
               PRODUCTS
            ================================================= */

            var products =
                await loadTable(
                    "client_products",
                    clientId
                );


            renderProducts(
                products
            );


            /* ================================================
               MANUFACTURING
            ================================================= */

            var manufacturing =
                await loadTable(
                    "client_manufacturing_steps",
                    clientId
                );


            renderManufacturing(
                manufacturing
            );


            /* ================================================
               QUALITY
            ================================================= */

            var quality =
                await loadTable(
                    "client_quality",
                    clientId
                );


            renderQuality(
                quality
            );


            /* ================================================
               INDUSTRIES
            ================================================= */

            var industries =
                await loadTable(
                    "client_industries",
                    clientId
                );


            renderIndustries(
                industries
            );


            /* ================================================
               GALLERY
            ================================================= */

            var gallery =
                await loadTable(
                    "client_gallery",
                    clientId
                );


            renderGallery(
                gallery
            );


            /* ================================================
               TESTIMONIALS
            ================================================= */

            var testimonials =
                await loadTable(
                    "client_testimonials",
                    clientId
                );


            renderTestimonials(
                testimonials
            );


            /* ================================================
               FAQ
            ================================================= */

            var faq =
                await loadTable(
                    "client_faq",
                    clientId
                );


            renderFAQ(
                faq
            );


            document.body.setAttribute(
                "data-client-loaded",
                "true"
            );


            console.log(
                "MDK Runtime: WEBSITE LOADED SUCCESSFULLY"
            );

        } catch (error) {

            console.error(
                "MDK Runtime ERROR:",
                error
            );

        }

    }


    /* ========================================================
       APPLY CLIENT
       ======================================================== */

    function applyClient(
        client
    ) {

        var companyName =
            getValue(
                client,
                "company_name",
                "INDUSTRIA"
            );


        /* COMPANY NAME */

        setText(
            '[data-client="company_name"]',
            companyName
        );


        /* PAGE TITLE DEFAULT */

        document.title =
            companyName +
            " | Manufacturing Excellence";


        /* BODY DATA */

        document.body.setAttribute(
            "data-client-id",
            client.id || ""
        );


        document.body.setAttribute(
            "data-client-name",
            companyName
        );


        document.body.setAttribute(
            "data-client-slug",
            client.slug || ""
        );

    }


    /* ========================================================
       COMPANY SETTINGS
       ======================================================== */

    async function loadCompanySettings(
        clientId
    ) {

        try {

            var result =
                await db
                    .from("company_settings")
                    .select("*")
                    .eq("client_id", clientId)
                    .maybeSingle();

            if (result.error) {
                console.warn(
                    "MDK Runtime: Company settings error:",
                    result.error
                );
                return;
            }

            if (!result.data) {
                console.log(
                    "MDK Runtime: No company settings found."
                );
                return;
            }

            var settings = result.data;

            console.log(
                "MDK Runtime: Company settings data:",
                settings
            );

            /* TAGLINE */
            var tagline = getValue(settings, "tagline");
            if (tagline) {
                setText('[data-content="tagline"]', tagline);
                setText('[data-client="tagline"]', tagline);
            }

            /* PHONE */
            var phone = getValue(settings, "phone");
            if (phone) {
                setText('[data-content="phone"]', phone);
                var phoneNumber = phone.replace(/[^0-9+]/g, "");
                setAttribute(
                    '[data-content-link="phone"]',
                    "href",
                    "tel:" + phoneNumber
                );
            }

            /* EMAIL */
            var email = getValue(settings, "email");
            if (email) {
                setText('[data-content="email"]', email);
                setAttribute(
                    '[data-content-link="email"]',
                    "href",
                    "mailto:" + email
                );
            }

            /* WEBSITE */
            var website = normalizeUrl(
                getValue(settings, "website")
            );
            if (website) {
                setText('[data-content="website"]', website);
                setAttribute(
                    '[data-content-link="website"]',
                    "href",
                    website
                );
                document
                    .querySelectorAll('[data-content-link="website"]')
                    .forEach(function (element) {
                        element.target = "_blank";
                        element.rel = "noopener noreferrer";
                    });
            }

            /* WHATSAPP */
            var whatsapp = getValue(settings, "whatsapp");
            if (whatsapp) {
                setText('[data-content="whatsapp"]', whatsapp);
                var whatsappNumber = whatsapp.replace(/[^0-9]/g, "");
                setAttribute(
                    '[data-content-link="whatsapp"]',
                    "href",
                    "https://wa.me/" + whatsappNumber
                );
            }

            /* ADDRESS */
            setText('[data-content="address"]', getValue(settings, "address"));
            setText('[data-content="city"]', getValue(settings, "city"));
            setText('[data-content="state"]', getValue(settings, "state"));
            setText('[data-content="country"]', getValue(settings, "country"));
            setText('[data-content="postal_code"]', getValue(settings, "postal_code"));

            /* COMPANY PROFILE */
            setText('[data-content="about"]', getValue(settings, "about"));
            setText('[data-content="mission"]', getValue(settings, "mission"));
            setText('[data-content="vision"]', getValue(settings, "vision"));

            /* SOCIAL LINKS */
            setLink(
                '[data-content-link="facebook"]',
                getValue(settings, "facebook_url")
            );
            setLink(
                '[data-content-link="instagram"]',
                getValue(settings, "instagram_url")
            );
            setLink(
                '[data-content-link="linkedin"]',
                getValue(settings, "linkedin_url")
            );
            setLink(
                '[data-content-link="youtube"]',
                getValue(settings, "youtube_url")
            );

            /* SEO */
            var websiteTitle = getValue(settings, "website_title");
            if (websiteTitle) {
                document.title = websiteTitle;
            }

            var metaDescription = getValue(settings, "meta_description");
            if (metaDescription) {
                var meta = document.querySelector('meta[name="description"]');
                if (!meta) {
                    meta = document.createElement("meta");
                    meta.name = "description";
                    document.head.appendChild(meta);
                }
                meta.setAttribute("content", metaDescription);
            }

            /* FAVICON */
            var favicon = getValue(settings, "favicon_url");
            if (favicon) {
                var faviconLink = document.querySelector('link[rel="icon"]');
                if (!faviconLink) {
                    faviconLink = document.createElement("link");
                    faviconLink.rel = "icon";
                    document.head.appendChild(faviconLink);
                }
                faviconLink.href = normalizeUrl(favicon);
            }

            /* LOGO */
            var logo = getValue(settings, "logo_url");
            if (logo) {
                document
                    .querySelectorAll(
                        '[data-content-image="logo"], [data-content="logo_url"], [data-client="logo_url"]'
                    )
                    .forEach(function (element) {
                        if (
                            element.tagName &&
                            element.tagName.toLowerCase() === "img"
                        ) {
                            element.src = normalizeUrl(logo);
                            element.alt = "Company Logo";
                        } else {
                            element.style.backgroundImage =
                                "url('" +
                                normalizeUrl(logo).replace(/'/g, "\\'") +
                                "')";
                        }
                    });
            }

            /* COLORS */
            var primaryColor = getValue(settings, "primary_color");
            if (primaryColor) {
                document.documentElement.style.setProperty(
                    "--primary-color",
                    primaryColor
                );
                document.documentElement.style.setProperty(
                    "--primary",
                    primaryColor
                );
            }

            var secondaryColor = getValue(settings, "secondary_color");
            if (secondaryColor) {
                document.documentElement.style.setProperty(
                    "--secondary-color",
                    secondaryColor
                );
                document.documentElement.style.setProperty(
                    "--secondary",
                    secondaryColor
                );
            }

            console.log(
                "MDK Runtime: Company settings applied."
            );

        } catch (error) {

            console.warn(
                "MDK Runtime: Company settings load failed:",
                error
            );

        }

    }


    /* ========================================================
       ADVANCED WEBSITE SETTINGS
       ======================================================== */

    async function loadAdvancedWebsiteSettings(
        clientId
    ) {

        try {

            var result =
                await db
                    .from("client_website_settings")
                    .select("*")
                    .eq("client_id", clientId)
                    .maybeSingle();

            if (result.error) {
                console.warn(
                    "MDK Runtime: Advanced settings error:",
                    result.error
                );
                return;
            }

            if (!result.data) {
                console.log(
                    "MDK Runtime: No advanced website settings found. Using template defaults."
                );
                return;
            }

            var advanced = result.data;
            var colors = advanced.colors || {};
            var typography = advanced.typography || {};
            var layout = advanced.layout || {};
            var buttons = advanced.buttons || {};
            var header = advanced.header || {};
            var hero = advanced.hero || {};
            var footer = advanced.footer || {};
            var mobile = advanced.mobile || {};

            var root = document.documentElement;

            function setVar(name, value) {
                if (value !== null && value !== undefined && String(value).trim() !== "") {
                    root.style.setProperty(name, String(value));
                }
            }

            /* COLORS */
            setVar("--primary", colors.primary);
            setVar("--primary-color", colors.primary);
            setVar("--secondary", colors.secondary);
            setVar("--secondary-color", colors.secondary);
            setVar("--brand-name-color", colors.company_name);
            setVar("--tagline-color", colors.tagline);
            setVar("--navbar-bg", colors.navbar_bg);
            setVar("--navbar-text", colors.navbar_text);
            setVar("--hero-bg", colors.hero_bg);
            setVar("--hero-heading", colors.hero_heading);
            setVar("--hero-text", colors.hero_text);
            setVar("--section-heading", colors.section_heading);
            setVar("--section-text", colors.section_text);
            setVar("--card-bg", colors.card_bg);
            setVar("--card-title", colors.card_title);
            setVar("--card-text", colors.card_text);
            setVar("--product-bg", colors.product_bg);
            setVar("--product-title", colors.product_title);
            setVar("--product-text", colors.product_text);
            setVar("--testimonial-bg", colors.testimonial_bg);
            setVar("--testimonial-name", colors.testimonial_name);
            setVar("--testimonial-quote", colors.testimonial_quote);
            setVar("--faq-bg", colors.faq_bg);
            setVar("--faq-question", colors.faq_question);
            setVar("--faq-answer", colors.faq_answer);
            setVar("--cta-bg", colors.cta_bg);
            setVar("--cta-text", colors.cta_text);
            setVar("--footer-bg", colors.footer_bg);
            setVar("--footer-text", colors.footer_text);
            setVar("--footer-link", colors.footer_link);
            setVar("--button-bg", colors.button_bg);
            setVar("--button-text", colors.button_text);
            setVar("--button-hover", colors.button_hover);
            setVar("--border", colors.border);
            setVar("--page-bg", colors.page_bg);

            /* TYPOGRAPHY */
            setVar("--heading-font", typography.heading_font);
            setVar("--body-font", typography.body_font);
            setVar("--heading-weight", typography.heading_weight);
            setVar("--body-size", typography.body_size);
            setVar("--heading-letter-spacing", typography.heading_letter_spacing);
            setVar("--body-line-height", typography.body_line_height);

            /* LAYOUT */
            setVar("--container-width", layout.container_width);
            setVar("--section-gap", layout.section_gap);
            setVar("--card-radius", layout.card_radius);
            setVar("--card-border-width", layout.card_border_width);
            setVar("--shadow-strength", layout.shadow_strength);

            /* HEADER */
            setVar("--header-bg", header.background);
            setVar("--header-height", header.height);
            setVar("--nav-font-size", header.font_size);

            /* HERO */
            setVar("--hero-overlay", hero.overlay);
            setVar("--hero-min-height", hero.min_height);
            setVar("--hero-title-size", hero.title_size);
            setVar("--hero-text-size", hero.text_size);

            /* BUTTONS */
            setVar("--button-radius", buttons.radius);
            setVar("--button-font-size", buttons.font_size);
            setVar("--button-padding-y", buttons.padding_y);
            setVar("--button-padding-x", buttons.padding_x);

            /* FOOTER */
            setVar("--footer-heading", footer.heading);

            /* MOBILE */
            setVar("--mobile-title-size", mobile.title_size);
            setVar("--mobile-section-gap", mobile.section_gap);
            setVar("--mobile-card-gap", mobile.card_gap);

            /* DIRECT ELEMENT COLORS */
            var rules = [
                ["[data-client=\"company_name\"]", "color", colors.company_name],
                ["[data-content=\"tagline\"]", "color", colors.tagline],
                [".brand-tagline", "color", colors.tagline],
                ["header", "backgroundColor", header.background || colors.navbar_bg],
                [".navlinks a", "color", colors.navbar_text],
                [".hero", "backgroundColor", colors.hero_bg],
                [".hero h1", "color", colors.hero_heading],
                [".hero p", "color", colors.hero_text],
                ["section h2", "color", colors.section_heading],
                ["section p", "color", colors.section_text],
                [".card", "backgroundColor", colors.card_bg],
                [".card h3", "color", colors.card_title],
                [".card p", "color", colors.card_text],
                [".product-code", "color", colors.product_text],
                [".quote", "backgroundColor", colors.testimonial_bg],
                [".quote p", "color", colors.testimonial_quote],
                [".quote strong", "color", colors.testimonial_name],
                [".faq-item", "backgroundColor", colors.faq_bg],
                [".faq-question", "color", colors.faq_question],
                [".faq-answer", "color", colors.faq_answer],
                [".btn-primary", "backgroundColor", colors.button_bg],
                [".btn-primary", "color", colors.button_text],
                [".btn-outline", "color", colors.button_bg],
                ["footer", "backgroundColor", colors.footer_bg],
                ["footer", "color", colors.footer_text],
                ["footer a", "color", colors.footer_link]
            ];

            rules.forEach(function (rule) {
                if (!rule[2]) return;
                document.querySelectorAll(rule[0]).forEach(function (element) {
                    element.style[rule[1]] = String(rule[2]);
                });
            });

            /* GLOBAL ADVANCED CSS */
            var style = document.getElementById("mdk-advanced-runtime-style");
            if (!style) {
                style = document.createElement("style");
                style.id = "mdk-advanced-runtime-style";
                document.head.appendChild(style);
            }

            style.textContent = `
                body { background: var(--page-bg, initial); font-family: var(--body-font, inherit); font-size: var(--body-size, inherit); line-height: var(--body-line-height, inherit); }
                h1,h2,h3,h4,h5,h6 { font-family: var(--heading-font, inherit); font-weight: var(--heading-weight, inherit); letter-spacing: var(--heading-letter-spacing, inherit); }
                .container { max-width: var(--container-width, 1180px); }
                section { margin-bottom: var(--section-gap, initial); }
                .card, .quote, .faq-item { border-radius: var(--card-radius, initial); border-width: var(--card-border-width, initial); }
                .card { background: var(--card-bg, initial); border-color: var(--border, initial); }
                .card h3 { color: var(--card-title, initial); }
                .card p { color: var(--card-text, initial); }
                .product-image { background: var(--product-bg, var(--card-bg, initial)); }
                .product-body h3 { color: var(--product-title, var(--card-title, initial)); }
                .product-body p { color: var(--product-text, var(--card-text, initial)); }
                .product-code { color: var(--product-text, initial); }
                .step h3 { color: var(--card-title, initial); }
                .step p { color: var(--card-text, initial); }
                .step .number { background: var(--primary, initial); }
                .quote { background: var(--testimonial-bg, var(--card-bg, initial)); border-color: var(--border, initial); }
                .quote p { color: var(--testimonial-quote, initial); }
                .quote strong { color: var(--testimonial-name, initial); }
                .faq-item { background: var(--faq-bg, var(--card-bg, initial)); border-color: var(--border, initial); }
                .faq-question { color: var(--faq-question, initial); }
                .faq-answer { color: var(--faq-answer, initial); }
                .btn { border-radius: var(--button-radius, initial); font-size: var(--button-font-size, inherit); padding: var(--button-padding-y, initial) var(--button-padding-x, initial); }
                .btn-primary { background: var(--button-bg, initial); color: var(--button-text, initial); }
                .btn-outline { color: var(--button-bg, initial); border-color: var(--button-bg, initial); }
                .btn-primary:hover, .btn-outline:hover { background: var(--button-hover, initial); }
                header { min-height: var(--header-height, initial); background: var(--header-bg, var(--navbar-bg, initial)); }
                .navlinks a { font-size: var(--nav-font-size, inherit); color: var(--navbar-text, initial); }
                .hero { min-height: var(--hero-min-height, initial); background-color: var(--hero-bg, initial); }
                .hero h1 { font-size: var(--hero-title-size, inherit); color: var(--hero-heading, initial); }
                .hero p { font-size: var(--hero-text-size, inherit); color: var(--hero-text, initial); }
                .hero .eyebrow, .eyebrow { color: var(--secondary, initial); }
                section h2 { color: var(--section-heading, initial); }
                section p { color: var(--section-text, initial); }
                .stats .stat strong { color: var(--section-heading, initial); }
                .stats .stat span { color: var(--section-text, initial); }
                footer { background: var(--footer-bg, initial); color: var(--footer-text, initial); }
                footer a { color: var(--footer-link, initial); }
                @media (max-width: 700px) {
                    .hero h1 { font-size: var(--mobile-title-size, inherit); }
                    section { margin-bottom: var(--mobile-section-gap, initial); }
                }
            `;

            console.log(
                "MDK Runtime: Advanced website settings applied."
            );

        } catch (error) {
            console.warn(
                "MDK Runtime: Advanced settings load failed:",
                error
            );
        }

    }


    async function loadWebsiteContent(
        clientId
    ) {

        var result =
            await db
                .from(
                    "client_website_content"
                )
                .select("*")
                .eq(
                    "client_id",
                    clientId
                )
                .maybeSingle();


        if (result.error) {

            console.warn(
                "MDK Runtime: Website content error:",
                result.error
            );

            return;

        }


        if (!result.data) {

            console.log(
                "MDK Runtime: No website content found."
            );

            return;

        }


        var content =
            result.data;


        /* ================================================
           TOPBAR
        ================================================= */

        setText(
            '[data-content="topbar_text"]',
            getValue(
                content,
                "topbar_text"
            )
        );


        /* ================================================
           PHONE
        ================================================= */

        var phone =
            getValue(
                content,
                "phone"
            );


        if (phone) {

            setText(
                '[data-content="phone"]',
                phone
            );


            var phoneNumber =
                phone.replace(
                    /[^0-9+]/g,
                    ""
                );


            setAttribute(
                '[data-content-link="phone"]',
                "href",
                "tel:" +
                phoneNumber
            );

        }


        /* ================================================
           EMAIL
        ================================================= */

        var email =
            getValue(
                content,
                "email"
            );


        if (email) {

            setText(
                '[data-content="email"]',
                email
            );


            setAttribute(
                '[data-content-link="email"]',
                "href",
                "mailto:" +
                email
            );

        }


        /* ================================================
           ADDRESS
        ================================================= */

        setText(
            '[data-content="address"]',
            getValue(
                content,
                "address"
            )
        );


        /* ================================================
           BUSINESS HOURS
        ================================================= */

        var businessHours =
            getValue(
                content,
                "business_hours"
            );


        if (businessHours) {

            setText(
                '[data-content="business_hours"]',
                businessHours
            );

        }


        /* ================================================
           WEBSITE
        ================================================= */

        var website =
            normalizeUrl(
                getValue(
                    content,
                    "website"
                )
            );


        if (website) {

            setAttribute(
                '[data-content-link="website"]',
                "href",
                website
            );


            document
                .querySelectorAll(
                    '[data-content-link="website"]'
                )
                .forEach(
                    function (element) {

                        element.target =
                            "_blank";

                        element.rel =
                            "noopener noreferrer";

                    }
                );

        }


        /* ================================================
           WHATSAPP
        ================================================= */

        var whatsapp =
            getValue(
                content,
                "whatsapp"
            );


        if (whatsapp) {

            var whatsappNumber =
                whatsapp.replace(
                    /[^0-9]/g,
                    ""
                );


            setAttribute(
                '[data-content-link="whatsapp"]',
                "href",
                "https://wa.me/" +
                whatsappNumber
            );

        }


        /* ================================================
           CITY
        ================================================= */

        setText(
            '[data-content="city"]',
            getValue(
                content,
                "city"
            )
        );


        /* ================================================
           STATE
        ================================================= */

        setText(
            '[data-content="state"]',
            getValue(
                content,
                "state"
            )
        );


        /* ================================================
           COUNTRY
        ================================================= */

        setText(
            '[data-content="country"]',
            getValue(
                content,
                "country"
            )
        );


        /* ================================================
           POSTAL CODE
        ================================================= */

        setText(
            '[data-content="postal_code"]',
            getValue(
                content,
                "postal_code"
            )
        );


        /* ================================================
           HERO
        ================================================= */

        setText(
            '[data-content="hero_eyebrow"]',
            getValue(
                content,
                "hero_eyebrow"
            )
        );


        setText(
            '[data-content="hero_title"]',
            getValue(
                content,
                "hero_heading"
            )
        );


        setText(
            '[data-content="hero_description"]',
            getValue(
                content,
                "hero_description"
            )
        );


        var heroImage =
            getValue(
                content,
                "hero_image_url"
            );


        if (heroImage) {

            var hero =
                document.querySelector(
                    ".hero"
                );


            if (hero) {

                hero.style.backgroundImage =
                    "linear-gradient(90deg,rgba(2,6,23,.92),rgba(2,6,23,.55)),url('" +
                    heroImage.replace(
                        /'/g,
                        "\\'"
                    ) +
                    "')";

            }

        }


        /* ================================================
           ABOUT
        ================================================= */

        setText(
            '[data-content="about_eyebrow"]',
            getValue(
                content,
                "about_eyebrow"
            )
        );


        setText(
            '[data-content="about_title"]',
            getValue(
                content,
                "about_heading"
            )
        );


        setText(
            '[data-content="about_description"]',
            getValue(
                content,
                "about_description"
            )
        );


        var aboutDescription2 =
            getValue(
                content,
                "about_description_2"
            );


        if (aboutDescription2) {

            setText(
                '[data-content="about_description_2"]',
                aboutDescription2
            );

        }


        /* ABOUT POINTS */

        setText(
            '[data-content="about_point_1"]',
            getValue(
                content,
                "about_point_1"
            )
        );


        setText(
            '[data-content="about_point_2"]',
            getValue(
                content,
                "about_point_2"
            )
        );


        setText(
            '[data-content="about_point_3"]',
            getValue(
                content,
                "about_point_3"
            )
        );


        setText(
            '[data-content="about_point_4"]',
            getValue(
                content,
                "about_point_4"
            )
        );


        var aboutImage =
            getValue(
                content,
                "about_image_url"
            );


        if (aboutImage) {

            var visual =
                document.querySelector(
                    '[data-content-image="about"]'
                );


            if (visual) {

                visual.style.backgroundImage =
                    "url('" +
                    aboutImage.replace(
                        /'/g,
                        "\\'"
                    ) +
                    "')";


                visual.textContent =
                    "";

            }

        }


        /* ================================================
           MISSION
        ================================================= */

        setText(
            '[data-content="mission"]',
            getValue(
                content,
                "mission"
            )
        );


        /* ================================================
           VISION
        ================================================= */

        setText(
            '[data-content="vision"]',
            getValue(
                content,
                "vision"
            )
        );


        /* ================================================
           STATS
        ================================================= */

        setText(
            '[data-stat="1-value"]',
            getValue(
                content,
                "stat_1_value"
            )
        );


        setText(
            '[data-stat="1-label"]',
            getValue(
                content,
                "stat_1_label"
            )
        );


        setText(
            '[data-stat="2-value"]',
            getValue(
                content,
                "stat_2_value"
            )
        );


        setText(
            '[data-stat="2-label"]',
            getValue(
                content,
                "stat_2_label"
            )
        );


        setText(
            '[data-stat="3-value"]',
            getValue(
                content,
                "stat_3_value"
            )
        );


        setText(
            '[data-stat="3-label"]',
            getValue(
                content,
                "stat_3_label"
            )
        );


        setText(
            '[data-stat="4-value"]',
            getValue(
                content,
                "stat_4_value"
            )
        );


        setText(
            '[data-stat="4-label"]',
            getValue(
                content,
                "stat_4_label"
            )
        );


        /* ================================================
           PRODUCTS SECTION
        ================================================= */

        setText(
            '[data-content="products_eyebrow"]',
            getValue(
                content,
                "products_eyebrow"
            )
        );


        setText(
            '[data-content="products_title"]',
            getValue(
                content,
                "products_heading"
            )
        );


        setText(
            '[data-content="products_description"]',
            getValue(
                content,
                "products_description"
            )
        );


        /* ================================================
           MANUFACTURING
        ================================================= */

        setText(
            '[data-content="manufacturing_eyebrow"]',
            getValue(
                content,
                "manufacturing_eyebrow"
            )
        );


        setText(
            '[data-content="manufacturing_title"]',
            getValue(
                content,
                "manufacturing_heading"
            )
        );


        setText(
            '[data-content="manufacturing_description"]',
            getValue(
                content,
                "manufacturing_description"
            )
        );


        /* ================================================
           QUALITY
        ================================================= */

        setText(
            '[data-content="quality_eyebrow"]',
            getValue(
                content,
                "quality_eyebrow"
            )
        );


        setText(
            '[data-content="quality_title"]',
            getValue(
                content,
                "quality_heading"
            )
        );


        setText(
            '[data-content="quality_description"]',
            getValue(
                content,
                "quality_description"
            )
        );


        /* ================================================
           INDUSTRIES
        ================================================= */

        setText(
            '[data-content="industries_eyebrow"]',
            getValue(
                content,
                "industries_eyebrow"
            )
        );


        setText(
            '[data-content="industries_title"]',
            getValue(
                content,
                "industries_heading"
            )
        );


        /* ================================================
           GALLERY
        ================================================= */

        setText(
            '[data-content="gallery_eyebrow"]',
            getValue(
                content,
                "gallery_eyebrow"
            )
        );


        setText(
            '[data-content="gallery_title"]',
            getValue(
                content,
                "gallery_heading"
            )
        );


        setText(
            '[data-content="gallery_description"]',
            getValue(
                content,
                "gallery_description"
            )
        );


        /* ================================================
           TESTIMONIALS
        ================================================= */

        setText(
            '[data-content="testimonials_eyebrow"]',
            getValue(
                content,
                "testimonials_eyebrow"
            )
        );


        setText(
            '[data-content="testimonials_title"]',
            getValue(
                content,
                "testimonials_heading"
            )
        );


        /* ================================================
           FAQ
        ================================================= */

        setText(
            '[data-content="faq_eyebrow"]',
            getValue(
                content,
                "faq_eyebrow"
            )
        );


        setText(
            '[data-content="faq_title"]',
            getValue(
                content,
                "faq_heading"
            )
        );


        /* ================================================
           CONTACT
        ================================================= */

        setText(
            '[data-content="contact_eyebrow"]',
            getValue(
                content,
                "contact_eyebrow"
            )
        );


        setText(
            '[data-content="contact_title"]',
            getValue(
                content,
                "contact_heading"
            )
        );


        setText(
            '[data-content="contact_description"]',
            getValue(
                content,
                "contact_description"
            )
        );


        /* ================================================
           FOOTER
        ================================================= */

        setText(
            '[data-content="footer_description"]',
            getValue(
                content,
                "footer_description"
            )
        );


        /* ================================================
           LEGAL LINKS
        ================================================= */

        setLink(
            '[data-content-link="privacy"]',
            getValue(
                content,
                "privacy_url"
            )
        );


        setLink(
            '[data-content-link="terms"]',
            getValue(
                content,
                "terms_url"
            )
        );


        setLink(
            '[data-content-link="linkedin"]',
            getValue(
                content,
                "linkedin_url"
            )
        );


        /* ================================================
           SOCIAL LINKS
        ================================================= */

        setLink(
            '[data-content-link="facebook"]',
            getValue(
                content,
                "facebook_url"
            )
        );


        setLink(
            '[data-content-link="instagram"]',
            getValue(
                content,
                "instagram_url"
            )
        );


        setLink(
            '[data-content-link="youtube"]',
            getValue(
                content,
                "youtube_url"
            )
        );


        /* ================================================
           META / SEO
        ================================================= */

        var websiteTitle =
            getValue(
                content,
                "website_title"
            );


        if (websiteTitle) {

            document.title =
                websiteTitle;

        }


        var metaDescription =
            getValue(
                content,
                "meta_description"
            );


        if (metaDescription) {

            var meta =
                document.querySelector(
                    'meta[name="description"]'
                );


            if (!meta) {

                meta =
                    document.createElement(
                        "meta"
                    );

                meta.name =
                    "description";

                document.head.appendChild(
                    meta
                );

            }


            meta.setAttribute(
                "content",
                metaDescription
            );

        }

    }


    /* ========================================================
       LINK
       ======================================================== */

    function setLink(
        selector,
        url
    ) {

        if (!url) {

            return;

        }


        var normalized =
            normalizeUrl(
                url
            );


        if (!normalized) {

            return;

        }


        var elements =
            document.querySelectorAll(
                selector
            );


        elements.forEach(
            function (element) {

                element.href =
                    normalized;


                if (
                    normalized.indexOf(
                        "http"
                    ) === 0
                ) {

                    element.target =
                        "_blank";


                    element.rel =
                        "noopener noreferrer";

                }

            }
        );

    }


    /* ========================================================
       LOAD TABLE
    ======================================================== */

    async function loadTable(
        table,
        clientId
    ) {

        try {

            var result =
                await db
                    .from(table)
                    .select("*")
                    .eq(
                        "client_id",
                        clientId
                    );


            if (result.error) {

                console.warn(
                    "MDK Runtime:",
                    table,
                    result.error
                );

                return [];

            }


            return result.data || [];

        } catch (error) {

            console.warn(
                "MDK Runtime:",
                table,
                error
            );

            return [];

        }

    }


    /* ========================================================
       GET FIRST AVAILABLE FIELD
       ======================================================== */

    function first(
        row,
        fields,
        fallback
    ) {

        for (
            var i = 0;
            i < fields.length;
            i++
        ) {

            var key =
                fields[i];


            if (
                row[key] !== null &&
                row[key] !== undefined &&
                String(row[key]).trim() !== ""
            ) {

                return String(
                    row[key]
                );

            }

        }


        return fallback || "";

    }


    /* ========================================================
       PRODUCTS
    ======================================================== */

    function renderProducts(
        items
    ) {

        var container =
            document.querySelector(
                "[data-products]"
            );


        if (!container) {

            return;

        }


        container.innerHTML =
            "";


        items.forEach(
            function (item) {

                var name =
                    first(
                        item,
                        [
                            "name",
                            "product_name",
                            "title"
                        ],
                        "Product"
                    );


                var description =
                    first(
                        item,
                        [
                            "description",
                            "product_description",
                            "details"
                        ],
                        ""
                    );


                var image =
                    first(
                        item,
                        [
                            "image_url",
                            "product_image_url",
                            "image",
                            "photo_url"
                        ],
                        ""
                    );


                var code =
                    first(
                        item,
                        [
                            "product_code",
                            "code",
                            "sku"
                        ],
                        ""
                    );


                var card =
                    document.createElement(
                        "article"
                    );


                card.className =
                    "card";


                var imageHTML =
                    image
                        ? (
                            '<div class="product-image">' +
                            '<img src="' +
                            escapeHTML(image) +
                            '" alt="' +
                            escapeHTML(name) +
                            '" style="width:100%;height:100%;object-fit:cover;">' +
                            '</div>'
                        )
                        : (
                            '<div class="product-image">' +
                            'PRODUCT IMAGE' +
                            '</div>'
                        );


                card.innerHTML =
                    imageHTML +
                    '<div class="product-body">' +
                    '<div class="product-code">' +
                    escapeHTML(code) +
                    '</div>' +
                    '<h3>' +
                    escapeHTML(name) +
                    '</h3>' +
                    '<p>' +
                    escapeHTML(description) +
                    '</p>' +
                    '</div>';


                container.appendChild(
                    card
                );

            }
        );

    }


    /* ========================================================
       MANUFACTURING
    ======================================================== */

    function renderManufacturing(
        items
    ) {

        var container =
            document.querySelector(
                "[data-manufacturing]"
            );


        if (!container) {

            return;

        }


        container.innerHTML =
            "";


        items.forEach(
            function (item, index) {

                var title =
                    first(
                        item,
                        [
                            "title",
                            "name",
                            "step_name"
                        ],
                        "Manufacturing Step"
                    );


                var description =
                    first(
                        item,
                        [
                            "description",
                            "step_description",
                            "details"
                        ],
                        ""
                    );


                var number =
                    first(
                        item,
                        [
                            "step_number",
                            "number",
                            "sequence"
                        ],
                        String(
                            index + 1
                        )
                    );


                var card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "step";


                card.innerHTML =
                    '<div class="number">' +
                    escapeHTML(number) +
                    '</div>' +
                    '<h3>' +
                    escapeHTML(title) +
                    '</h3>' +
                    '<p>' +
                    escapeHTML(description) +
                    '</p>';


                container.appendChild(
                    card
                );

            }
        );

    }


    /* ========================================================
       QUALITY
    ======================================================== */

    function renderQuality(
        items
    ) {

        var container =
            document.querySelector(
                "[data-quality]"
            );


        if (!container) {

            return;

        }


        container.innerHTML =
            "";


        items.forEach(
            function (item) {

                var title =
                    first(
                        item,
                        [
                            "title",
                            "name",
                            "quality_name"
                        ],
                        "Quality Assurance"
                    );


                var description =
                    first(
                        item,
                        [
                            "description",
                            "details"
                        ],
                        ""
                    );


                var icon =
                    first(
                        item,
                        [
                            "icon",
                            "icon_text"
                        ],
                        "✓"
                    );


                var card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "card";


                card.innerHTML =
                    '<div class="icon">' +
                    escapeHTML(icon) +
                    '</div>' +
                    '<h3>' +
                    escapeHTML(title) +
                    '</h3>' +
                    '<p>' +
                    escapeHTML(description) +
                    '</p>';


                container.appendChild(
                    card
                );

            }
        );

    }


    /* ========================================================
       INDUSTRIES
    ======================================================== */

    function renderIndustries(
        items
    ) {

        var container =
            document.querySelector(
                "[data-industries]"
            );


        if (!container) {

            return;

        }


        container.innerHTML =
            "";


        items.forEach(
            function (item) {

                var name =
                    first(
                        item,
                        [
                            "name",
                            "title",
                            "industry_name"
                        ],
                        "Industry"
                    );


                var pill =
                    document.createElement(
                        "div"
                    );


                pill.className =
                    "pill";


                pill.textContent =
                    name;


                container.appendChild(
                    pill
                );

            }
        );

    }


    /* ========================================================
       GALLERY
    ======================================================== */

    function renderGallery(
        items
    ) {

        var container =
            document.querySelector(
                "[data-gallery]"
            );


        if (!container) {

            return;

        }


        container.innerHTML =
            "";


        items.forEach(
            function (item) {

                var image =
                    first(
                        item,
                        [
                            "image_url",
                            "gallery_image_url",
                            "image",
                            "photo_url"
                        ],
                        ""
                    );


                var title =
                    first(
                        item,
                        [
                            "title",
                            "name",
                            "caption"
                        ],
                        "Gallery"
                    );


                if (!image) {

                    return;

                }


                var element =
                    document.createElement(
                        "div"
                    );


                element.className =
                    "gallery-item";


                element.style.backgroundImage =
                    "url('" +
                    image.replace(
                        /'/g,
                        "\\'"
                    ) +
                    "')";


                element.setAttribute(
                    "title",
                    title
                );


                container.appendChild(
                    element
                );

            }
        );

    }


    /* ========================================================
       TESTIMONIALS
    ======================================================== */

    function renderTestimonials(
        items
    ) {

        var container =
            document.querySelector(
                "[data-testimonials]"
            );


        if (!container) {

            return;

        }


        container.innerHTML =
            "";


        items.forEach(
            function (item) {

                var name =
                    first(
                        item,
                        [
                            "name",
                            "customer_name",
                            "client_name",
                            "author"
                        ],
                        "Customer"
                    );


                var message =
                    first(
                        item,
                        [
                            "message",
                            "testimonial",
                            "review",
                            "description"
                        ],
                        ""
                    );


                var company =
                    first(
                        item,
                        [
                            "company",
                            "company_name",
                            "organization"
                        ],
                        ""
                    );


                var card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "quote";


                card.innerHTML =
                    '<p>“' +
                    escapeHTML(message) +
                    '”</p>' +
                    '<strong>' +
                    escapeHTML(name) +
                    '</strong>' +
                    (
                        company
                            ? '<small>' +
                              escapeHTML(company) +
                              '</small>'
                            : ""
                    );


                container.appendChild(
                    card
                );

            }
        );

    }


    /* ========================================================
       FAQ
    ======================================================== */

    function renderFAQ(
        items
    ) {

        var container =
            document.querySelector(
                "[data-faq]"
            );


        if (!container) {

            return;

        }


        container.innerHTML =
            "";


        items.forEach(
            function (item) {

                var question =
                    first(
                        item,
                        [
                            "question",
                            "title",
                            "faq_question"
                        ],
                        "Question"
                    );


                var answer =
                    first(
                        item,
                        [
                            "answer",
                            "description",
                            "faq_answer"
                        ],
                        ""
                    );


                var wrapper =
                    document.createElement(
                        "div"
                    );


                wrapper.className =
                    "faq-item";


                wrapper.innerHTML =
                    '<button type="button" class="faq-question">' +
                    '<span>' +
                    escapeHTML(question) +
                    '</span>' +
                    '<span>+</span>' +
                    '</button>' +
                    '<div class="faq-answer">' +
                    '<p>' +
                    escapeHTML(answer) +
                    '</p>' +
                    '</div>';


                container.appendChild(
                    wrapper
                );

            }
        );


        container
            .querySelectorAll(
                ".faq-question"
            )
            .forEach(
                function (button) {

                    button.addEventListener(
                        "click",
                        function () {

                            var item =
                                button.parentElement;


                            item.classList.toggle(
                                "open"
                            );


                            var icon =
                                button.querySelector(
                                    "span:last-child"
                                );


                            if (icon) {

                                icon.textContent =
                                    item.classList.contains(
                                        "open"
                                    )
                                        ? "−"
                                        : "+";

                            }

                        }
                    );

                }
            );

    }


    /* ========================================================
       INITIALIZE
    ======================================================== */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            startRuntime
        );

    } else {

        startRuntime();

    }


})();

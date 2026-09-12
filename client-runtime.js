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

    var supabaseClient = null;


    /* ========================================================
       START
       ======================================================== */

    function startRuntime() {

        if (!window.supabase) {
            console.error("MDK Runtime: Supabase library not loaded.");
            return;
        }

        supabaseClient = window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_KEY
        );

        loadClient();
    }


    /* ========================================================
       CLIENT ID
       ======================================================== */

    function getClientId() {

        try {

            var params =
                new URLSearchParams(window.location.search);

            var id =
                params.get("client") ||
                params.get("client_id");

            if (id) return id;

        } catch (e) {}


        try {

            if (
                window.MDKClientContext &&
                typeof window.MDKClientContext.id === "function"
            ) {

                var contextId =
                    window.MDKClientContext.id();

                if (contextId) return contextId;
            }

        } catch (e) {}


        try {

            var stored =
                localStorage.getItem("mdkaif_active_client");

            if (stored) return stored;

        } catch (e) {}


        return null;
    }


    /* ========================================================
       VALUE HELPER
       ======================================================== */

    function getValue(obj, keys) {

        if (!obj || !keys) return "";

        for (var i = 0; i < keys.length; i++) {

            var key = keys[i];

            if (
                obj[key] !== undefined &&
                obj[key] !== null &&
                String(obj[key]).trim() !== ""
            ) {
                return obj[key];
            }
        }

        return "";
    }


    /* ========================================================
       TEXT
       ======================================================== */

    function setText(selector, value) {

        if (value === undefined || value === null) return;

        var elements =
            document.querySelectorAll(selector);

        elements.forEach(function (el) {

            el.textContent = value;

        });
    }


    /* ========================================================
       ATTRIBUTE
       ======================================================== */

    function setAttribute(selector, attribute, value) {

        if (
            value === undefined ||
            value === null ||
            String(value).trim() === ""
        ) {
            return;
        }

        var elements =
            document.querySelectorAll(selector);

        elements.forEach(function (el) {

            el.setAttribute(attribute, value);

        });
    }


    /* ========================================================
       ESCAPE HTML
       ======================================================== */

    function escapeHTML(value) {

        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    /* ========================================================
       URL
       ======================================================== */

    function normalizeUrl(url) {

        if (!url) return "";

        url = String(url).trim();

        if (!url) return "";

        if (
            url.indexOf("http://") === 0 ||
            url.indexOf("https://") === 0 ||
            url.indexOf("mailto:") === 0 ||
            url.indexOf("tel:") === 0
        ) {
            return url;
        }

        return "https://" + url;
    }


    /* ========================================================
       LINK
       ======================================================== */

    function setLink(selector, url) {

        if (!url) return;

        var href =
            normalizeUrl(url);

        if (!href) return;

        var elements =
            document.querySelectorAll(selector);

        elements.forEach(function (el) {

            el.setAttribute("href", href);

            if (
                href.indexOf("http://") === 0 ||
                href.indexOf("https://") === 0
            ) {

                el.setAttribute("target", "_blank");

                el.setAttribute(
                    "rel",
                    "noopener noreferrer"
                );
            }

        });
    }


    /* ========================================================
       LOAD CLIENT
       ======================================================== */

    async function loadClient() {

        var clientId =
            getClientId();

        if (!clientId) {

            console.warn(
                "MDK Runtime: Client ID not found."
            );

            return;
        }


        try {

            /* -----------------------------------------------
               CLIENT
               ----------------------------------------------- */

            var result =
                await supabaseClient
                    .from("clients")
                    .select("*")
                    .eq("id", clientId)
                    .single();


            if (result.error)
                throw result.error;


            var client =
                result.data;


            if (!client)
                throw new Error(
                    "Client not found."
                );


            /* -----------------------------------------------
               CLIENT CONTEXT
               ----------------------------------------------- */

            try {

                if (
                    window.MDKClientContext &&
                    typeof window.MDKClientContext.set === "function"
                ) {

                    window.MDKClientContext.set(client);
                }

            } catch (e) {

                console.warn(
                    "MDK Client Context error:",
                    e
                );
            }


            /* -----------------------------------------------
               BASE CLIENT
               ----------------------------------------------- */

            applyClient(client);


            /* -----------------------------------------------
               WEBSITE CONTENT
               ----------------------------------------------- */

            await loadWebsiteContent(clientId);


            /* -----------------------------------------------
               COMPANY SETTINGS
               ----------------------------------------------- */

            await loadCompanySettings(clientId);


            /* -----------------------------------------------
               PRODUCTS
               ----------------------------------------------- */

            var products =
                await loadTable(
                    "client_products",
                    clientId
                );

            renderProducts(products);


            /* -----------------------------------------------
               MANUFACTURING
               ----------------------------------------------- */

            var manufacturing =
                await loadTable(
                    "client_manufacturing_steps",
                    clientId
                );

            renderManufacturing(
                manufacturing
            );


            /* -----------------------------------------------
               QUALITY
               ----------------------------------------------- */

            var quality =
                await loadTable(
                    "client_quality",
                    clientId
                );

            renderQuality(quality);


            /* -----------------------------------------------
               INDUSTRIES
               ----------------------------------------------- */

            var industries =
                await loadTable(
                    "client_industries",
                    clientId
                );

            renderIndustries(
                industries
            );


            /* -----------------------------------------------
               GALLERY
               ----------------------------------------------- */

            var gallery =
                await loadTable(
                    "client_gallery",
                    clientId
                );

            renderGallery(gallery);


            /* -----------------------------------------------
               TESTIMONIALS
               ----------------------------------------------- */

            var testimonials =
                await loadTable(
                    "client_testimonials",
                    clientId
                );

            renderTestimonials(
                testimonials
            );


            /* -----------------------------------------------
               FAQ
               ----------------------------------------------- */

            var faq =
                await loadTable(
                    "client_faq",
                    clientId
                );

            renderFAQ(faq);


            /* -----------------------------------------------
               COMPLETE
               ----------------------------------------------- */

            document.body.setAttribute(
                "data-client-loaded",
                "true"
            );


            console.log(
                "MDK Runtime: Client loaded successfully.",
                clientId
            );


        } catch (error) {

            console.error(
                "MDK Runtime error:",
                error
            );
        }
    }


    /* ========================================================
       BASE CLIENT
       ======================================================== */

    function applyClient(client) {

        var companyName =
            getValue(
                client,
                [
                    "company_name",
                    "name",
                    "company"
                ]
            );


        /* IMPORTANT:
           Existing V1 company name logic remains safe.
        */

        setText(
            '[data-client="company_name"]',
            companyName
        );


        if (companyName) {

            document.title =
                companyName;
        }


        document.body.setAttribute(
            "data-client-id",
            client.id || ""
        );


        document.body.setAttribute(
            "data-client-name",
            companyName || ""
        );
    }


    /* ========================================================
       COMPANY SETTINGS
       ======================================================== */

    async function loadCompanySettings(clientId) {

        try {

            var result =
                await supabaseClient
                    .from("company_settings")
                    .select("*")
                    .eq("client_id", clientId)
                    .maybeSingle();


            if (result.error) {

                console.warn(
                    "MDK Runtime: Company Settings error:",
                    result.error
                );

                return;
            }


            var settings =
                result.data;


            if (!settings)
                return;


            /* -----------------------------------------------
               COMPANY NAME
               ----------------------------------------------- */

            var companyName =
                getValue(
                    settings,
                    [
                        "company_name",
                        "name",
                        "company"
                    ]
                );


            if (companyName) {

                setText(
                    '[data-client="company_name"]',
                    companyName
                );

                document.title =
                    companyName;
            }


            /* -----------------------------------------------
               CONTACT DETAILS
               ----------------------------------------------- */

            var mobile =
                getValue(
                    settings,
                    [
                        "mobile",
                        "phone",
                        "phone_number",
                        "contact_number"
                    ]
                );


            var email =
                getValue(
                    settings,
                    [
                        "email",
                        "email_address"
                    ]
                );


            var address =
                getValue(
                    settings,
                    [
                        "address",
                        "company_address"
                    ]
                );


            var whatsapp =
                getValue(
                    settings,
                    [
                        "whatsapp",
                        "whatsapp_number"
                    ]
                );


            var website =
                getValue(
                    settings,
                    [
                        "website",
                        "website_url"
                    ]
                );


            var city =
                getValue(
                    settings,
                    [
                        "city"
                    ]
                );


            var state =
                getValue(
                    settings,
                    [
                        "state"
                    ]
                );


            var country =
                getValue(
                    settings,
                    [
                        "country"
                    ]
                );


            var postalCode =
                getValue(
                    settings,
                    [
                        "postal_code",
                        "postcode",
                        "zip_code",
                        "pincode"
                    ]
                );


            /* -----------------------------------------------
               APPLY CONTACT DETAILS
               ----------------------------------------------- */

            setText(
                '[data-client="mobile"]',
                mobile
            );


            setText(
                '[data-client="phone"]',
                mobile
            );


            setText(
                '[data-client="email"]',
                email
            );


            setText(
                '[data-client="address"]',
                address
            );


            setText(
                '[data-client="whatsapp"]',
                whatsapp
            );


            setText(
                '[data-client="website"]',
                website
            );


            setText(
                '[data-client="city"]',
                city
            );


            setText(
                '[data-client="state"]',
                state
            );


            setText(
                '[data-client="country"]',
                country
            );


            setText(
                '[data-client="postal_code"]',
                postalCode
            );


            /* -----------------------------------------------
               CLICKABLE CONTACT LINKS
               ----------------------------------------------- */

            if (mobile) {

                setLink(
                    '[data-client-link="mobile"]',
                    "tel:" + String(mobile)
                );


                setLink(
                    '[data-client-link="phone"]',
                    "tel:" + String(mobile)
                );
            }


            if (email) {

                setLink(
                    '[data-client-link="email"]',
                    "mailto:" + String(email)
                );
            }


            if (website) {

                setLink(
                    '[data-client-link="website"]',
                    website
                );
            }


            if (whatsapp) {

                var wa =
                    String(whatsapp)
                        .replace(/[^\d]/g, "");


                if (wa) {

                    setLink(
                        '[data-client-link="whatsapp"]',
                        "https://wa.me/" + wa
                    );
                }
            }


            /* -----------------------------------------------
               SOCIAL MEDIA
               ----------------------------------------------- */

            setLink(
                '[data-client-link="facebook"]',
                getValue(
                    settings,
                    [
                        "facebook",
                        "facebook_url"
                    ]
                )
            );


            setLink(
                '[data-client-link="instagram"]',
                getValue(
                    settings,
                    [
                        "instagram",
                        "instagram_url"
                    ]
                )
            );


            setLink(
                '[data-client-link="linkedin"]',
                getValue(
                    settings,
                    [
                        "linkedin",
                        "linkedin_url"
                    ]
                )
            );


            setLink(
                '[data-client-link="youtube"]',
                getValue(
                    settings,
                    [
                        "youtube",
                        "youtube_url"
                    ]
                )
            );


            /* -----------------------------------------------
               WEBSITE TITLE / SEO
               ----------------------------------------------- */

            var websiteTitle =
                getValue(
                    settings,
                    [
                        "website_title",
                        "site_title",
                        "title"
                    ]
                );


            var metaDescription =
                getValue(
                    settings,
                    [
                        "meta_description",
                        "description",
                        "seo_description"
                    ]
                );


            if (websiteTitle) {

                document.title =
                    websiteTitle;
            }


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

                    meta.setAttribute(
                        "name",
                        "description"
                    );

                    document.head.appendChild(
                        meta
                    );
                }


                meta.setAttribute(
                    "content",
                    metaDescription
                );
            }


            /* -----------------------------------------------
               FAVICON
               ----------------------------------------------- */

            var favicon =
                getValue(
                    settings,
                    [
                        "favicon",
                        "favicon_url"
                    ]
                );


            if (favicon) {

                var icon =
                    document.querySelector(
                        'link[rel="icon"]'
                    );


                if (!icon) {

                    icon =
                        document.createElement(
                            "link"
                        );

                    icon.setAttribute(
                        "rel",
                        "icon"
                    );

                    document.head.appendChild(
                        icon
                    );
                }


                icon.setAttribute(
                    "href",
                    normalizeUrl(favicon)
                );
            }


            /* -----------------------------------------------
               LOGO
               Only works if V1 already has:
               data-client="logo"
               ----------------------------------------------- */

            var logo =
                getValue(
                    settings,
                    [
                        "logo",
                        "logo_url"
                    ]
                );


            if (logo) {

                var logoElements =
                    document.querySelectorAll(
                        '[data-client="logo"]'
                    );


                logoElements.forEach(
                    function (el) {

                        if (
                            el.tagName &&
                            el.tagName.toLowerCase() === "img"
                        ) {

                            el.setAttribute(
                                "src",
                                normalizeUrl(logo)
                            );

                        } else {

                            el.style.backgroundImage =
                                "url('" +
                                normalizeUrl(logo)
                                    .replace(
                                        /'/g,
                                        "%27"
                                    ) +
                                "')";
                        }

                    }
                );
            }


        } catch (error) {

            console.error(
                "MDK Runtime Company Settings error:",
                error
            );
        }
    }


    /* ========================================================
       WEBSITE CONTENT
       ======================================================== */

    async function loadWebsiteContent(clientId) {

        try {

            var result =
                await supabaseClient
                    .from("client_website_content")
                    .select("*")
                    .eq("client_id", clientId)
                    .maybeSingle();


            if (result.error) {

                console.warn(
                    "MDK Runtime: Website content error:",
                    result.error
                );

                return;
            }


            var content =
                result.data;


            if (!content)
                return;


            /* -----------------------------------------------
               BASIC
               ----------------------------------------------- */

            setText(
                '[data-content="topbar"]',
                getValue(
                    content,
                    [
                        "topbar",
                        "topbar_text",
                        "announcement"
                    ]
                )
            );


            setText(
                '[data-content="phone"]',
                getValue(
                    content,
                    [
                        "phone",
                        "mobile",
                        "contact_number"
                    ]
                )
            );


            setText(
                '[data-content="email"]',
                getValue(
                    content,
                    [
                        "email",
                        "email_address"
                    ]
                )
            );


            setText(
                '[data-content="address"]',
                getValue(
                    content,
                    [
                        "address"
                    ]
                )
            );


            setText(
                '[data-content="business_hours"]',
                getValue(
                    content,
                    [
                        "business_hours",
                        "working_hours"
                    ]
                )
            );


            setText(
                '[data-content="website"]',
                getValue(
                    content,
                    [
                        "website",
                        "website_url"
                    ]
                )
            );


            setText(
                '[data-content="whatsapp"]',
                getValue(
                    content,
                    [
                        "whatsapp",
                        "whatsapp_number"
                    ]
                )
            );


            setText(
                '[data-content="city"]',
                getValue(
                    content,
                    [
                        "city"
                    ]
                )
            );


            setText(
                '[data-content="state"]',
                getValue(
                    content,
                    [
                        "state"
                    ]
                )
            );


            setText(
                '[data-content="country"]',
                getValue(
                    content,
                    [
                        "country"
                    ]
                )
            );


            setText(
                '[data-content="postal_code"]',
                getValue(
                    content,
                    [
                        "postal_code",
                        "postcode",
                        "zip_code",
                        "pincode"
                    ]
                )
            );


            /* -----------------------------------------------
               HERO
               ----------------------------------------------- */

            setText(
                '[data-content="hero_badge"]',
                getValue(
                    content,
                    [
                        "hero_badge",
                        "hero_label"
                    ]
                )
            );


            setText(
                '[data-content="hero_title"]',
                getValue(
                    content,
                    [
                        "hero_title",
                        "hero_heading"
                    ]
                )
            );


            setText(
                '[data-content="hero_subtitle"]',
                getValue(
                    content,
                    [
                        "hero_subtitle",
                        "hero_description"
                    ]
                )
            );


            setText(
                '[data-content="hero_button"]',
                getValue(
                    content,
                    [
                        "hero_button",
                        "hero_cta"
                    ]
                )
            );


            setLink(
                '[data-content-link="hero_button"]',
                getValue(
                    content,
                    [
                        "hero_button_url",
                        "hero_cta_url"
                    ]
                )
            );


            /* -----------------------------------------------
               ABOUT
               ----------------------------------------------- */

            setText(
                '[data-content="about_badge"]',
                getValue(
                    content,
                    [
                        "about_badge",
                        "about_label"
                    ]
                )
            );


            setText(
                '[data-content="about_title"]',
                getValue(
                    content,
                    [
                        "about_title",
                        "about_heading"
                    ]
                )
            );


            setText(
                '[data-content="about_description"]',
                getValue(
                    content,
                    [
                        "about_description",
                        "about_text"
                    ]
                )
            );


            setText(
                '[data-content="about_button"]',
                getValue(
                    content,
                    [
                        "about_button",
                        "about_cta"
                    ]
                )
            );


            setLink(
                '[data-content-link="about_button"]',
                getValue(
                    content,
                    [
                        "about_button_url",
                        "about_cta_url"
                    ]
                )
            );


            /* -----------------------------------------------
               MISSION / VISION
               ----------------------------------------------- */

            setText(
                '[data-content="mission"]',
                getValue(
                    content,
                    [
                        "mission",
                        "mission_text"
                    ]
                )
            );


            setText(
                '[data-content="vision"]',
                getValue(
                    content,
                    [
                        "vision",
                        "vision_text"
                    ]
                )
            );


            /* -----------------------------------------------
               STATS
               ----------------------------------------------- */

            for (var s = 1; s <= 4; s++) {

                setText(
                    '[data-content="stat' +
                    s +
                    '_number"]',

                    getValue(
                        content,
                        [
                            "stat" +
                            s +
                            "_number",

                            "stat_" +
                            s +
                            "_number"
                        ]
                    )
                );


                setText(
                    '[data-content="stat' +
                    s +
                    '_label"]',

                    getValue(
                        content,
                        [
                            "stat" +
                            s +
                            "_label",

                            "stat_" +
                            s +
                            "_label"
                        ]
                    )
                );
            }


            /* -----------------------------------------------
               SECTION CONTENT
               ----------------------------------------------- */

            var sections = [

                "products",
                "manufacturing",
                "quality",
                "industries",
                "gallery",
                "testimonials",
                "faq",
                "contact",
                "footer"

            ];


            sections.forEach(
                function (section) {

                    setText(
                        '[data-content="' +
                        section +
                        '_heading"]',

                        getValue(
                            content,
                            [
                                section +
                                "_heading",

                                section +
                                "_title"
                            ]
                        )
                    );


                    setText(
                        '[data-content="' +
                        section +
                        '_description"]',

                        getValue(
                            content,
                            [
                                section +
                                "_description",

                                section +
                                "_text"
                            ]
                        )
                    );

                }
            );


            /* -----------------------------------------------
               PRIVACY / TERMS
               ----------------------------------------------- */

            setText(
                '[data-content="privacy"]',
                getValue(
                    content,
                    [
                        "privacy",
                        "privacy_text"
                    ]
                )
            );


            setText(
                '[data-content="terms"]',
                getValue(
                    content,
                    [
                        "terms",
                        "terms_text"
                    ]
                )
            );


            /* -----------------------------------------------
               SOCIAL
               ----------------------------------------------- */

            setLink(
                '[data-content-link="facebook"]',
                getValue(
                    content,
                    [
                        "facebook",
                        "facebook_url"
                    ]
                )
            );


            setLink(
                '[data-content-link="instagram"]',
                getValue(
                    content,
                    [
                        "instagram",
                        "instagram_url"
                    ]
                )
            );


            setLink(
                '[data-content-link="linkedin"]',
                getValue(
                    content,
                    [
                        "linkedin",
                        "linkedin_url"
                    ]
                )
            );


            setLink(
                '[data-content-link="youtube"]',
                getValue(
                    content,
                    [
                        "youtube",
                        "youtube_url"
                    ]
                )
            );


            /* -----------------------------------------------
               SEO
               ----------------------------------------------- */

            var seoTitle =
                getValue(
                    content,
                    [
                        "website_title",
                        "seo_title",
                        "site_title"
                    ]
                );


            var seoDescription =
                getValue(
                    content,
                    [
                        "meta_description",
                        "seo_description"
                    ]
                );


            if (seoTitle) {

                document.title =
                    seoTitle;
            }


            if (seoDescription) {

                var description =
                    document.querySelector(
                        'meta[name="description"]'
                    );


                if (!description) {

                    description =
                        document.createElement(
                            "meta"
                        );

                    description.setAttribute(
                        "name",
                        "description"
                    );

                    document.head.appendChild(
                        description
                    );
                }


                description.setAttribute(
                    "content",
                    seoDescription
                );
            }


        } catch (error) {

            console.error(
                "MDK Runtime Website Content error:",
                error
            );
        }
    }


    /* ========================================================
       GENERIC TABLE LOADER
       ======================================================== */

    async function loadTable(
        tableName,
        clientId
    ) {

        try {

            var result =
                await supabaseClient
                    .from(tableName)
                    .select("*")
                    .eq("client_id", clientId);


            if (result.error) {

                console.warn(
                    "MDK Runtime table error:",
                    tableName,
                    result.error
                );

                return [];
            }


            return result.data || [];


        } catch (error) {

            console.error(
                "MDK Runtime table error:",
                tableName,
                error
            );

            return [];
        }
    }


    /* ========================================================
       FIRST VALUE
       ======================================================== */

    function first(obj, keys) {

        return getValue(
            obj,
            keys
        );
    }


    /* ========================================================
       PRODUCTS
       ======================================================== */

    function renderProducts(rows) {

        var containers =
            document.querySelectorAll(
                "[data-products]"
            );


        if (!containers.length)
            return;


        containers.forEach(
            function (container) {

                container.innerHTML = "";


                rows.forEach(
                    function (row) {

                        var name =
                            first(
                                row,
                                [
                                    "name",
                                    "product_name",
                                    "title"
                                ]
                            );


                        var description =
                            first(
                                row,
                                [
                                    "description",
                                    "product_description",
                                    "details"
                                ]
                            );


                        var code =
                            first(
                                row,
                                [
                                    "code",
                                    "product_code",
                                    "material_code"
                                ]
                            );


                        var image =
                            first(
                                row,
                                [
                                    "image",
                                    "image_url",
                                    "photo",
                                    "photo_url"
                                ]
                            );


                        var card =
                            document.createElement(
                                "div"
                            );


                        card.className =
                            "card";


                        var html = "";


                        if (image) {

                            html +=
                                '<img src="' +
                                escapeHTML(
                                    normalizeUrl(image)
                                ) +
                                '" alt="' +
                                escapeHTML(name) +
                                '">';
                        }


                        html +=
                            '<div class="card-body">';


                        if (code) {

                            html +=
                                '<div class="product-code">' +
                                escapeHTML(code) +
                                "</div>";
                        }


                        html +=
                            "<h3>" +
                            escapeHTML(name) +
                            "</h3>";


                        if (description) {

                            html +=
                                "<p>" +
                                escapeHTML(description) +
                                "</p>";
                        }


                        html +=
                            "</div>";


                        card.innerHTML =
                            html;


                        container.appendChild(
                            card
                        );

                    }
                );

            }
        );
    }


    /* ========================================================
       MANUFACTURING
       ======================================================== */

    function renderManufacturing(rows) {

        var containers =
            document.querySelectorAll(
                "[data-manufacturing]"
            );


        if (!containers.length)
            return;


        containers.forEach(
            function (container) {

                container.innerHTML = "";


                rows.forEach(
                    function (row, index) {

                        var number =
                            first(
                                row,
                                [
                                    "step_no",
                                    "number",
                                    "sort_order"
                                ]
                            ) ||
                            (index + 1);


                        var title =
                            first(
                                row,
                                [
                                    "title",
                                    "name",
                                    "step_title"
                                ]
                            );


                        var description =
                            first(
                                row,
                                [
                                    "description",
                                    "details",
                                    "step_description"
                                ]
                            );


                        var item =
                            document.createElement(
                                "div"
                            );


                        item.className =
                            "step";


                        item.innerHTML =

                            '<div class="step-number">' +
                            escapeHTML(number) +
                            "</div>" +

                            "<h3>" +
                            escapeHTML(title) +
                            "</h3>" +

                            "<p>" +
                            escapeHTML(description) +
                            "</p>";


                        container.appendChild(
                            item
                        );

                    }
                );

            }
        );
    }


    /* ========================================================
       QUALITY
       ======================================================== */

    function renderQuality(rows) {

        var containers =
            document.querySelectorAll(
                "[data-quality]"
            );


        if (!containers.length)
            return;


        containers.forEach(
            function (container) {

                container.innerHTML = "";


                rows.forEach(
                    function (row) {

                        var icon =
                            first(
                                row,
                                [
                                    "icon",
                                    "icon_class"
                                ]
                            );


                        var title =
                            first(
                                row,
                                [
                                    "title",
                                    "name"
                                ]
                            );


                        var description =
                            first(
                                row,
                                [
                                    "description",
                                    "details"
                                ]
                            );


                        var card =
                            document.createElement(
                                "div"
                            );


                        card.className =
                            "card";


                        card.innerHTML =

                            (
                                icon
                                    ? '<div class="quality-icon">' +
                                      escapeHTML(icon) +
                                      "</div>"
                                    : ""
                            ) +

                            "<h3>" +
                            escapeHTML(title) +
                            "</h3>" +

                            "<p>" +
                            escapeHTML(description) +
                            "</p>";


                        container.appendChild(
                            card
                        );

                    }
                );

            }
        );
    }


    /* ========================================================
       INDUSTRIES
       ======================================================== */

    function renderIndustries(rows) {

        var containers =
            document.querySelectorAll(
                "[data-industries]"
            );


        if (!containers.length)
            return;


        containers.forEach(
            function (container) {

                container.innerHTML = "";


                rows.forEach(
                    function (row) {

                        var name =
                            first(
                                row,
                                [
                                    "name",
                                    "industry_name",
                                    "title"
                                ]
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
        );
    }


    /* ========================================================
       GALLERY
       ======================================================== */

    function renderGallery(rows) {

        var containers =
            document.querySelectorAll(
                "[data-gallery]"
            );


        if (!containers.length)
            return;


        containers.forEach(
            function (container) {

                container.innerHTML = "";


                rows.forEach(
                    function (row) {

                        var image =
                            first(
                                row,
                                [
                                    "image",
                                    "image_url",
                                    "photo",
                                    "photo_url"
                                ]
                            );


                        var title =
                            first(
                                row,
                                [
                                    "title",
                                    "name",
                                    "caption"
                                ]
                            );


                        var item =
                            document.createElement(
                                "div"
                            );


                        item.className =
                            "gallery-item";


                        if (image) {

                            item.style.backgroundImage =
                                "url('" +
                                normalizeUrl(image)
                                    .replace(
                                        /'/g,
                                        "%27"
                                    ) +
                                "')";
                        }


                        if (title) {

                            item.setAttribute(
                                "title",
                                title
                            );
                        }


                        container.appendChild(
                            item
                        );

                    }
                );

            }
        );
    }


    /* ========================================================
       TESTIMONIALS
       ======================================================== */

    function renderTestimonials(rows) {

        var containers =
            document.querySelectorAll(
                "[data-testimonials]"
            );


        if (!containers.length)
            return;


        containers.forEach(
            function (container) {

                container.innerHTML = "";


                rows.forEach(
                    function (row) {

                        var message =
                            first(
                                row,
                                [
                                    "message",
                                    "testimonial",
                                    "quote",
                                    "text",
                                    "content"
                                ]
                            );


                        var name =
                            first(
                                row,
                                [
                                    "name",
                                    "client_name",
                                    "person_name"
                                ]
                            );


                        var company =
                            first(
                                row,
                                [
                                    "company",
                                    "company_name"
                                ]
                            );


                        var card =
                            document.createElement(
                                "div"
                            );


                        card.className =
                            "quote";


                        card.innerHTML =

                            '<div class="quote-mark">“</div>' +

                            "<p>" +
                            escapeHTML(message) +
                            "</p>" +

                            '<div class="quote-name">' +
                            escapeHTML(name) +
                            "</div>" +

                            (
                                company
                                    ? '<div class="quote-company">' +
                                      escapeHTML(company) +
                                      "</div>"
                                    : ""
                            );


                        container.appendChild(
                            card
                        );

                    }
                );

            }
        );
    }


    /* ========================================================
       FAQ
       ======================================================== */

    function renderFAQ(rows) {

        var containers =
            document.querySelectorAll(
                "[data-faq]"
            );


        if (!containers.length)
            return;


        containers.forEach(
            function (container) {

                container.innerHTML = "";


                rows.forEach(
                    function (row) {

                        var question =
                            first(
                                row,
                                [
                                    "question",
                                    "faq_question",
                                    "title"
                                ]
                            );


                        var answer =
                            first(
                                row,
                                [
                                    "answer",
                                    "faq_answer",
                                    "description",
                                    "content"
                                ]
                            );


                        var item =
                            document.createElement(
                                "div"
                            );


                        item.className =
                            "faq-item";


                        item.innerHTML =

                            '<button type="button" class="faq-question">' +

                            "<span>" +
                            escapeHTML(question) +
                            "</span>" +

                            '<span class="faq-icon">+</span>' +

                            "</button>" +

                            '<div class="faq-answer">' +
                            escapeHTML(answer) +
                            "</div>";


                        var button =
                            item.querySelector(
                                ".faq-question"
                            );


                        button.addEventListener(
                            "click",
                            function () {

                                item.classList.toggle(
                                    "open"
                                );


                                var icon =
                                    item.querySelector(
                                        ".faq-icon"
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


                        container.appendChild(
                            item
                        );

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

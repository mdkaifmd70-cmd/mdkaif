```javascript
/* ============================================================
   MD KAIF WEB PLATFORM
   CLIENT RUNTIME
   V1 DYNAMIC WEBSITE SYSTEM

   This file connects:
   Client Manager
   Company Settings
   Website Content
   Products
   Manufacturing
   Quality
   Industries
   Gallery
   Testimonials
   FAQ

   Everything is filtered by client_id.
   ============================================================ */

(function () {

    "use strict";

    /* ============================================================
       SUPABASE
       ============================================================ */

    const SUPABASE_URL =
        "https://ywvdozdoanmcxscfofcf.supabase.co";

    const SUPABASE_KEY =
        "sb_publishable_aAqO96BmDbYivhlgl_3z7g_1orXAscB";

    let db = null;


    /* ============================================================
       INITIALIZE SUPABASE
       ============================================================ */

    function initSupabase() {

        if (!window.supabase) {
            console.error(
                "Supabase library not loaded."
            );
            return false;
        }

        db = window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_KEY
        );

        return true;
    }


    /* ============================================================
       SAFE HELPERS
       ============================================================ */

    function escapeHTML(value) {

        return String(
            value ?? ""
        )
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    function escapeAttr(value) {

        return escapeHTML(value);
    }


    function getFirst(
        object,
        keys,
        fallback = ""
    ) {

        if (!object) {
            return fallback;
        }

        for (const key of keys) {

            if (
                object[key] !== null &&
                object[key] !== undefined &&
                String(object[key]).trim() !== ""
            ) {

                return object[key];
            }
        }

        return fallback;
    }


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

        document
            .querySelectorAll(selector)
            .forEach(function (element) {

                element.textContent =
                    String(value);
            });
    }


    function setHTML(
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

        document
            .querySelectorAll(selector)
            .forEach(function (element) {

                element.innerHTML =
                    String(value);
            });
    }


    function setLink(
        selector,
        href
    ) {

        if (
            !href ||
            String(href).trim() === ""
        ) {
            return;
        }

        document
            .querySelectorAll(selector)
            .forEach(function (element) {

                element.setAttribute(
                    "href",
                    href
                );
            });
    }


    function normalizeUrl(url) {

        if (!url) {
            return "";
        }

        url = String(url).trim();

        if (
            url.startsWith("http://") ||
            url.startsWith("https://") ||
            url.startsWith("mailto:") ||
            url.startsWith("tel:") ||
            url.startsWith("#")
        ) {
            return url;
        }

        return "https://" + url;
    }


    /* ============================================================
       CLIENT ID
       ============================================================ */

    function getClientId() {

        try {

            const params =
                new URLSearchParams(
                    window.location.search
                );

            /* URL:
               ?client=UUID
            */

            const clientFromUrl =
                params.get("client");

            if (clientFromUrl) {
                return clientFromUrl;
            }


            /* URL:
               ?client_id=UUID
            */

            const clientIdFromUrl =
                params.get("client_id");

            if (clientIdFromUrl) {
                return clientIdFromUrl;
            }


            /* CENTRAL CLIENT CONTEXT */

            if (
                window.MDKClientContext
            ) {

                const contextId =
                    MDKClientContext.id();

                if (contextId) {
                    return contextId;
                }

                const context =
                    MDKClientContext.get();

                if (
                    context &&
                    context.id
                ) {
                    return context.id;
                }
            }


            /* OLD LOCAL STORAGE FALLBACK */

            const stored =
                localStorage.getItem(
                    "mdkaif_active_client"
                );

            if (stored) {

                try {

                    const parsed =
                        JSON.parse(stored);

                    if (
                        parsed &&
                        parsed.id
                    ) {
                        return parsed.id;
                    }

                } catch (e) {

                    console.warn(
                        "Invalid stored client context."
                    );
                }
            }

        } catch (error) {

            console.error(
                "Client ID Error:",
                error
            );
        }

        return null;
    }


    /* ============================================================
       LOAD CLIENT
       ============================================================ */

    async function loadClient(
        clientId
    ) {

        if (!clientId) {

            console.warn(
                "No client ID found."
            );

            return;
        }


        const {
            data,
            error
        } = await db
            .from("clients")
            .select(`
                id,
                company_name,
                slug,
                domain,
                status,
                template
            `)
            .eq(
                "id",
                clientId
            )
            .single();


        if (error) {

            console.error(
                "Client Load Error:",
                error
            );

            return;
        }


        if (!data) {

            console.warn(
                "Client not found:",
                clientId
            );

            return;
        }


        /* SAVE CENTRAL CONTEXT */

        if (
            window.MDKClientContext
        ) {

            MDKClientContext.set(
                data
            );
        }


        /* APPLY CLIENT */

        applyClient(
            data
        );


        /*
           IMPORTANT ORDER

           1. Website Content
           2. Company Settings

           Company Settings comes AFTER Website Content
           so phone/title/email/etc. from Company Settings
           become the final/latest values.
        */

        await loadWebsiteContent(
            clientId
        );


        await loadCompanySettings(
            clientId
        );


        /* ========================================================
           OTHER V1 MODULES
           ======================================================== */

        await loadTable(
            "client_products",
            clientId,
            renderProducts
        );


        await loadTable(
            "client_manufacturing_steps",
            clientId,
            renderManufacturing
        );


        await loadTable(
            "client_quality",
            clientId,
            renderQuality
        );


        await loadTable(
            "client_industries",
            clientId,
            renderIndustries
        );


        await loadTable(
            "client_gallery",
            clientId,
            renderGallery
        );


        await loadTable(
            "client_testimonials",
            clientId,
            renderTestimonials
        );


        await loadTable(
            "client_faq",
            clientId,
            renderFAQ
        );


        /* CURRENT YEAR */

        document
            .querySelectorAll(
                "[data-current-year]"
            )
            .forEach(function (element) {

                element.textContent =
                    new Date()
                        .getFullYear();
            });


        const year =
            document.getElementById(
                "year"
            );

        if (year) {

            year.textContent =
                new Date()
                    .getFullYear();
        }


        console.log(
            "MDK V1 loaded for client:",
            data.company_name,
            clientId
        );
    }


    /* ============================================================
       APPLY CLIENT
       ============================================================ */

    function applyClient(
        client
    ) {

        if (!client) {
            return;
        }


        /* COMPANY NAME */

        setText(
            '[data-client="company_name"]',
            client.company_name
        );


        /* DEFAULT TITLE */

        if (
            client.company_name &&
            !document.title
        ) {

            document.title =
                client.company_name;
        }


        /* BODY ATTRIBUTES */

        document.body.setAttribute(
            "data-client-id",
            client.id
        );


        if (client.slug) {

            document.body.setAttribute(
                "data-client-slug",
                client.slug
            );
        }


        if (client.template) {

            document.body.setAttribute(
                "data-template",
                client.template
            );
        }
    }


    /* ============================================================
       WEBSITE CONTENT
       ============================================================ */

    async function loadWebsiteContent(
        clientId
    ) {

        const {
            data,
            error
        } = await db
            .from(
                "client_website_content"
            )
            .select("*")
            .eq(
                "client_id",
                clientId
            )
            .maybeSingle();


        if (error) {

            console.warn(
                "Website Content Error:",
                error.message
            );

            return;
        }


        if (!data) {

            console.log(
                "No client_website_content found for:",
                clientId
            );

            return;
        }


        /* ========================================================
           BASIC CONTENT
           ======================================================== */

        setText(
            '[data-content="topbar_text"]',
            data.topbar_text
        );

        setText(
            '[data-content="tagline"]',
            data.tagline
        );

        setText(
            '[data-content="phone"]',
            data.phone
        );

        setText(
            '[data-content="email"]',
            data.email
        );

        setText(
            '[data-content="address"]',
            data.address
        );

        setText(
            '[data-content="city"]',
            data.city
        );

        setText(
            '[data-content="state"]',
            data.state
        );

        setText(
            '[data-content="country"]',
            data.country
        );

        setText(
            '[data-content="postal_code"]',
            data.postal_code
        );

        setText(
            '[data-content="business_hours"]',
            data.business_hours
        );


        /* ========================================================
           CONTACT LINKS
           ======================================================== */

        if (data.phone) {

            setLink(
                '[data-content-link="phone"]',
                "tel:" + data.phone
            );
        }


        if (data.email) {

            setLink(
                '[data-content-link="email"]',
                "mailto:" + data.email
            );
        }


        if (data.website) {

            setLink(
                '[data-content-link="website"]',
                normalizeUrl(
                    data.website
                )
            );
        }


        if (data.whatsapp) {

            const number =
                String(
                    data.whatsapp
                ).replace(
                    /\D/g,
                    ""
                );

            if (number) {

                setLink(
                    '[data-content-link="whatsapp"]',
                    "https://wa.me/" +
                    number
                );
            }
        }


        /* ========================================================
           HERO
           ======================================================== */

        setText(
            '[data-content="hero_eyebrow"]',
            data.hero_eyebrow
        );

        setText(
            '[data-content="hero_title"]',
            data.hero_title
        );

        setText(
            '[data-content="hero_description"]',
            data.hero_description
        );


        /* ========================================================
           ABOUT
           ======================================================== */

        setText(
            '[data-content="about_eyebrow"]',
            data.about_eyebrow
        );

        setText(
            '[data-content="about_title"]',
            data.about_title
        );

        setText(
            '[data-content="about_description"]',
            data.about_description
        );

        setText(
            '[data-content="about_description_2"]',
            data.about_description_2
        );


        for (
            let i = 1;
            i <= 4;
            i++
        ) {

            setText(
                '[data-content="about_point_' + i + '"]',
                data[
                    "about_point_" + i
                ]
            );
        }


        /* ========================================================
           MISSION / VISION
           ======================================================== */

        setText(
            '[data-content="mission"]',
            data.mission
        );

        setText(
            '[data-content="vision"]',
            data.vision
        );


        /* ========================================================
           STATS
           ======================================================== */

        for (
            let i = 1;
            i <= 8;
            i++
        ) {

            setText(
                '[data-stat="' + i + '"]',
                data[
                    "stat_" + i
                ]
            );
        }


        /* ========================================================
           SECTION TEXT
           ======================================================== */

        const contentFields = [

            "products_eyebrow",
            "products_title",
            "products_description",

            "manufacturing_eyebrow",
            "manufacturing_title",
            "manufacturing_description",

            "quality_eyebrow",
            "quality_title",
            "quality_description",

            "industries_eyebrow",
            "industries_title",
            "industries_description",

            "gallery_eyebrow",
            "gallery_title",
            "gallery_description",

            "testimonials_eyebrow",
            "testimonials_title",
            "testimonials_description",

            "faq_eyebrow",
            "faq_title",
            "faq_description",

            "contact_eyebrow",
            "contact_title",
            "contact_description",

            "footer_description"
        ];


        contentFields.forEach(
            function (field) {

                setText(
                    '[data-content="' +
                    field +
                    '"]',
                    data[field]
                );
            }
        );


        /* ========================================================
           CONTACT / FOOTER
           ======================================================== */

        setText(
            '[data-content="contact_address"]',
            data.contact_address
        );

        setText(
            '[data-content="contact_phone"]',
            data.contact_phone
        );

        setText(
            '[data-content="contact_email"]',
            data.contact_email
        );


        /* ========================================================
           LEGAL
           ======================================================== */

        setText(
            '[data-content="privacy"]',
            data.privacy
        );

        setText(
            '[data-content="terms"]',
            data.terms
        );


        /* ========================================================
           SOCIAL
           ======================================================== */

        if (data.facebook_url) {

            setLink(
                '[data-content-link="facebook"]',
                normalizeUrl(
                    data.facebook_url
                )
            );
        }


        if (data.instagram_url) {

            setLink(
                '[data-content-link="instagram"]',
                normalizeUrl(
                    data.instagram_url
                )
            );
        }


        if (data.linkedin_url) {

            setLink(
                '[data-content-link="linkedin"]',
                normalizeUrl(
                    data.linkedin_url
                )
            );
        }


        if (data.youtube_url) {

            setLink(
                '[data-content-link="youtube"]',
                normalizeUrl(
                    data.youtube_url
                )
            );
        }


        /* ========================================================
           SEO
           ======================================================== */

        if (data.website_title) {

            document.title =
                data.website_title;
        }


        if (data.meta_description) {

            let meta =
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
                data.meta_description
            );
        }


        /* ========================================================
           CONTENT LINKS FROM WEBSITE CONTENT
           ======================================================== */

        if (data.phone) {

            setLink(
                '[data-content-link="phone"]',
                "tel:" + data.phone
            );
        }


        if (data.email) {

            setLink(
                '[data-content-link="email"]',
                "mailto:" + data.email
            );
        }
    }


    /* ============================================================
       COMPANY SETTINGS
       ============================================================ */

    async function loadCompanySettings(
        clientId
    ) {

        try {

            const {
                data,
                error
            } = await db
                .from(
                    "company_settings"
                )
                .select("*")
                .eq(
                    "client_id",
                    clientId
                )
                .maybeSingle();


            if (error) {

                console.warn(
                    "Company Settings Error:",
                    error.message
                );

                return;
            }


            if (!data) {

                console.log(
                    "No company_settings found for:",
                    clientId
                );

                return;
            }


            console.log(
                "Company Settings Loaded:",
                data
            );


            /* ====================================================
               PHONE
               ==================================================== */

            if (data.phone) {

                setText(
                    '[data-content="phone"]',
                    data.phone
                );


                setLink(
                    '[data-content-link="phone"]',
                    "tel:" + data.phone
                );
            }


            /* ====================================================
               EMAIL
               ==================================================== */

            if (data.email) {

                setText(
                    '[data-content="email"]',
                    data.email
                );


                setLink(
                    '[data-content-link="email"]',
                    "mailto:" + data.email
                );
            }


            /* ====================================================
               WEBSITE
               ==================================================== */

            if (data.website) {

                const website =
                    normalizeUrl(
                        data.website
                    );


                setText(
                    '[data-content="website"]',
                    data.website
                );


                setLink(
                    '[data-content-link="website"]',
                    website
                );
            }


            /* ====================================================
               ADDRESS
               ==================================================== */

            if (data.address) {

                setText(
                    '[data-content="address"]',
                    data.address
                );
            }


            if (data.city) {

                setText(
                    '[data-content="city"]',
                    data.city
                );
            }


            if (data.state) {

                setText(
                    '[data-content="state"]',
                    data.state
                );
            }


            if (data.country) {

                setText(
                    '[data-content="country"]',
                    data.country
                );
            }


            if (data.postal_code) {

                setText(
                    '[data-content="postal_code"]',
                    data.postal_code
                );
            }


            /* ====================================================
               WHATSAPP
               ==================================================== */

            if (data.whatsapp) {

                setText(
                    '[data-content="whatsapp"]',
                    data.whatsapp
                );


                const whatsappNumber =
                    String(
                        data.whatsapp
                    ).replace(
                        /\D/g,
                        ""
                    );


                if (whatsappNumber) {

                    setLink(
                        '[data-content-link="whatsapp"]',
                        "https://wa.me/" +
                        whatsappNumber
                    );
                }
            }


            /* ====================================================
               TAGLINE
               ==================================================== */

            if (data.tagline) {

                setText(
                    '[data-content="tagline"]',
                    data.tagline
                );
            }


            /* ====================================================
               ABOUT
               ==================================================== */

            if (data.about) {

                setText(
                    '[data-content="about_description"]',
                    data.about
                );
            }


            /* ====================================================
               MISSION
               ==================================================== */

            if (data.mission) {

                setText(
                    '[data-content="mission"]',
                    data.mission
                );
            }


            /* ====================================================
               VISION
               ==================================================== */

            if (data.vision) {

                setText(
                    '[data-content="vision"]',
                    data.vision
                );
            }


            /* ====================================================
               SOCIAL MEDIA
               ==================================================== */

            if (data.facebook_url) {

                setLink(
                    '[data-content-link="facebook"]',
                    normalizeUrl(
                        data.facebook_url
                    )
                );
            }


            if (data.instagram_url) {

                setLink(
                    '[data-content-link="instagram"]',
                    normalizeUrl(
                        data.instagram_url
                    )
                );
            }


            if (data.linkedin_url) {

                setLink(
                    '[data-content-link="linkedin"]',
                    normalizeUrl(
                        data.linkedin_url
                    )
                );
            }


            if (data.youtube_url) {

                setLink(
                    '[data-content-link="youtube"]',
                    normalizeUrl(
                        data.youtube_url
                    )
                );
            }


            /* ====================================================
               WEBSITE TITLE

               IMPORTANT:
               Company Settings has priority.
               ==================================================== */

            if (data.website_title) {

                document.title =
                    data.website_title;


                let titleMeta =
                    document.querySelector(
                        'meta[name="title"]'
                    );


                if (!titleMeta) {

                    titleMeta =
                        document.createElement(
                            "meta"
                        );

                    titleMeta.setAttribute(
                        "name",
                        "title"
                    );

                    document.head.appendChild(
                        titleMeta
                    );
                }


                titleMeta.setAttribute(
                    "content",
                    data.website_title
                );
            }


            /* ====================================================
               META DESCRIPTION
               ==================================================== */

            if (data.meta_description) {

                let meta =
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
                    data.meta_description
                );
            }


            /* ====================================================
               FAVICON

               Safe support from Company Settings.
               ==================================================== */

            if (data.favicon_url) {

                let favicon =
                    document.querySelector(
                        'link[rel="icon"]'
                    );


                if (!favicon) {

                    favicon =
                        document.createElement(
                            "link"
                        );

                    favicon.setAttribute(
                        "rel",
                        "icon"
                    );

                    document.head.appendChild(
                        favicon
                    );
                }


                favicon.setAttribute(
                    "href",
                    data.favicon_url
                );
            }


            /* ====================================================
               OPTIONAL LOGO SUPPORT

               Does nothing unless V1 later contains:
               data-content-logo
               or
               data-client-logo
               ==================================================== */

            if (data.logo_url) {

                document
                    .querySelectorAll(
                        "[data-content-logo], [data-client-logo]"
                    )
                    .forEach(
                        function (element) {

                            if (
                                element.tagName ===
                                "IMG"
                            ) {

                                element.src =
                                    data.logo_url;
                            }
                        }
                    );
            }

        } catch (error) {

            console.error(
                "Company Settings Runtime Error:",
                error
            );
        }
    }


    /* ============================================================
       GENERIC TABLE LOADER
       ============================================================ */

    async function loadTable(
        tableName,
        clientId,
        renderFunction
    ) {

        try {

            const {
                data,
                error
            } = await db
                .from(tableName)
                .select("*")
                .eq(
                    "client_id",
                    clientId
                );


            if (error) {

                console.warn(
                    tableName +
                    " Error:",
                    error.message
                );

                if (
                    typeof renderFunction ===
                    "function"
                ) {

                    renderFunction([]);
                }

                return;
            }


            if (
                typeof renderFunction ===
                "function"
            ) {

                renderFunction(
                    data || []
                );
            }

        } catch (error) {

            console.error(
                tableName +
                " Runtime Error:",
                error
            );


            if (
                typeof renderFunction ===
                "function"
            ) {

                renderFunction([]);
            }
        }
    }


    /* ============================================================
       PRODUCTS
       ============================================================ */

    function renderProducts(
        rows
    ) {

        const containers =
            document.querySelectorAll(
                "[data-products]"
            );


        if (!containers.length) {
            return;
        }


        containers.forEach(
            function (container) {

                if (!rows.length) {

                    container.innerHTML =
                        `
                        <div class="empty">
                            Products will appear here.
                        </div>
                        `;

                    return;
                }


                container.innerHTML =
                    rows
                        .map(
                            function (item) {

                                const name =
                                    getFirst(
                                        item,
                                        [
                                            "name",
                                            "product_name",
                                            "title",
                                            "product"
                                        ],
                                        "Product"
                                    );


                                const description =
                                    getFirst(
                                        item,
                                        [
                                            "description",
                                            "short_description",
                                            "details"
                                        ],
                                        ""
                                    );


                                const image =
                                    getFirst(
                                        item,
                                        [
                                            "image_url",
                                            "image",
                                            "photo_url",
                                            "product_image"
                                        ],
                                        ""
                                    );


                                const category =
                                    getFirst(
                                        item,
                                        [
                                            "category_name",
                                            "category"
                                        ],
                                        ""
                                    );


                                return `
                                    <article class="product-card">

                                        ${
                                            image
                                                ? `
                                                <div class="product-image">
                                                    <img
                                                        src="${escapeAttr(image)}"
                                                        alt="${escapeAttr(name)}"
                                                        loading="lazy">
                                                </div>
                                                `
                                                : ""
                                        }

                                        <div class="product-content">

                                            ${
                                                category
                                                    ? `
                                                    <div class="product-category">
                                                        ${escapeHTML(category)}
                                                    </div>
                                                    `
                                                    : ""
                                            }

                                            <h3>
                                                ${escapeHTML(name)}
                                            </h3>

                                            ${
                                                description
                                                    ? `
                                                    <p>
                                                        ${escapeHTML(description)}
                                                    </p>
                                                    `
                                                    : ""
                                            }

                                            <a
                                                href="#contact"
                                                class="btn btn-primary"
                                                data-product-name="${escapeAttr(name)}">
                                                Enquire Now
                                            </a>

                                        </div>

                                    </article>
                                `;
                            }
                        )
                        .join("");


                bindProductEnquiryButtons();
            }
        );
    }


    /* ============================================================
       PRODUCT ENQUIRY BUTTONS
       ============================================================ */

    function bindProductEnquiryButtons() {

        document
            .querySelectorAll(
                "[data-product-name]"
            )
            .forEach(
                function (button) {

                    button.addEventListener(
                        "click",
                        function () {

                            const name =
                                button.getAttribute(
                                    "data-product-name"
                                );


                            const requirement =
                                document.querySelector(
                                    "#enquiryRequirement"
                                );


                            if (requirement) {

                                requirement.value =
                                    "I am interested in: " +
                                    name;
                            }


                            const contact =
                                document.getElementById(
                                    "contact"
                                );


                            if (contact) {

                                contact.scrollIntoView({
                                    behavior: "smooth"
                                });
                            }
                        }
                    );
                }
            );
    }


    /* ============================================================
       MANUFACTURING
       ============================================================ */

    function renderManufacturing(
        rows
    ) {

        const containers =
            document.querySelectorAll(
                "[data-manufacturing]"
            );


        if (!containers.length) {
            return;
        }


        containers.forEach(
            function (container) {

                if (!rows.length) {

                    container.innerHTML =
                        `
                        <div class="empty">
                            Manufacturing information will appear here.
                        </div>
                        `;

                    return;
                }


                container.innerHTML =
                    rows
                        .map(
                            function (item, index) {

                                const title =
                                    getFirst(
                                        item,
                                        [
                                            "title",
                                            "name",
                                            "step_name"
                                        ],
                                        "Process " +
                                        (index + 1)
                                    );


                                const description =
                                    getFirst(
                                        item,
                                        [
                                            "description",
                                            "details",
                                            "content"
                                        ],
                                        ""
                                    );


                                return `
                                    <div class="manufacturing-card">

                                        <div class="manufacturing-number">
                                            ${String(index + 1).padStart(2, "0")}
                                        </div>

                                        <div class="manufacturing-content">

                                            <h3>
                                                ${escapeHTML(title)}
                                            </h3>

                                            ${
                                                description
                                                    ? `
                                                    <p>
                                                        ${escapeHTML(description)}
                                                    </p>
                                                    `
                                                    : ""
                                            }

                                        </div>

                                    </div>
                                `;
                            }
                        )
                        .join("");
            }
        );
    }


    /* ============================================================
       QUALITY
       ============================================================ */

    function renderQuality(
        rows
    ) {

        const containers =
            document.querySelectorAll(
                "[data-quality]"
            );


        if (!containers.length) {
            return;
        }


        containers.forEach(
            function (container) {

                if (!rows.length) {

                    container.innerHTML =
                        `
                        <div class="empty">
                            Quality information will appear here.
                        </div>
                        `;

                    return;
                }


                container.innerHTML =
                    rows
                        .map(
                            function (item) {

                                const title =
                                    getFirst(
                                        item,
                                        [
                                            "title",
                                            "name",
                                            "heading"
                                        ],
                                        "Quality"
                                    );


                                const description =
                                    getFirst(
                                        item,
                                        [
                                            "description",
                                            "details",
                                            "content"
                                        ],
                                        ""
                                    );


                                return `
                                    <div class="quality-card">

                                        <h3>
                                            ${escapeHTML(title)}
                                        </h3>

                                        ${
                                            description
                                                ? `
                                                <p>
                                                    ${escapeHTML(description)}
                                                </p>
                                                `
                                                : ""
                                        }

                                    </div>
                                `;
                            }
                        )
                        .join("");
            }
        );
    }


    /* ============================================================
       INDUSTRIES
       ============================================================ */

    function renderIndustries(
        rows
    ) {

        const containers =
            document.querySelectorAll(
                "[data-industries]"
            );


        if (!containers.length) {
            return;
        }


        containers.forEach(
            function (container) {

                if (!rows.length) {

                    container.innerHTML =
                        `
                        <div class="empty">
                            Industries will appear here.
                        </div>
                        `;

                    return;
                }


                container.innerHTML =
                    rows
                        .map(
                            function (item) {

                                const title =
                                    getFirst(
                                        item,
                                        [
                                            "name",
                                            "title",
                                            "industry_name"
                                        ],
                                        "Industry"
                                    );


                                const description =
                                    getFirst(
                                        item,
                                        [
                                            "description",
                                            "details"
                                        ],
                                        ""
                                    );


                                const image =
                                    getFirst(
                                        item,
                                        [
                                            "image_url",
                                            "image",
                                            "photo_url"
                                        ],
                                        ""
                                    );


                                return `
                                    <div class="industry-card">

                                        ${
                                            image
                                                ? `
                                                <img
                                                    src="${escapeAttr(image)}"
                                                    alt="${escapeAttr(title)}"
                                                    loading="lazy">
                                                `
                                                : ""
                                        }

                                        <div class="industry-content">

                                            <h3>
                                                ${escapeHTML(title)}
                                            </h3>

                                            ${
                                                description
                                                    ? `
                                                    <p>
                                                        ${escapeHTML(description)}
                                                    </p>
                                                    `
                                                    : ""
                                            }

                                        </div>

                                    </div>
                                `;
                            }
                        )
                        .join("");
            }
        );
    }


    /* ============================================================
       GALLERY
       ============================================================ */

    function renderGallery(
        rows
    ) {

        const containers =
            document.querySelectorAll(
                "[data-gallery]"
            );


        if (!containers.length) {
            return;
        }


        containers.forEach(
            function (container) {

                if (!rows.length) {

                    container.innerHTML =
                        `
                        <div class="empty">
                            Gallery images will appear here.
                        </div>
                        `;

                    return;
                }


                container.innerHTML =
                    rows
                        .map(
                            function (item) {

                                const image =
                                    getFirst(
                                        item,
                                        [
                                            "image_url",
                                            "url",
                                            "image",
                                            "photo_url"
                                        ],
                                        ""
                                    );


                                if (!image) {
                                    return "";
                                }


                                const title =
                                    getFirst(
                                        item,
                                        [
                                            "title",
                                            "alt_text",
                                            "name"
                                        ],
                                        "Gallery"
                                    );


                                return `
                                    <div class="gallery-item">

                                        <img
                                            src="${escapeAttr(image)}"
                                            alt="${escapeAttr(title)}"
                                            loading="lazy">

                                    </div>
                                `;
                            }
                        )
                        .join("");
            }
        );
    }


    /* ============================================================
       TESTIMONIALS
       ============================================================ */

    function renderTestimonials(
        rows
    ) {

        const containers =
            document.querySelectorAll(
                "[data-testimonials]"
            );


        if (!containers.length) {
            return;
        }


        containers.forEach(
            function (container) {

                if (!rows.length) {

                    container.innerHTML =
                        `
                        <div class="empty">
                            Client testimonials will appear here.
                        </div>
                        `;

                    return;
                }


                container.innerHTML =
                    rows
                        .slice(0, 6)
                        .map(
                            function (item) {

                                const text =
                                    getFirst(
                                        item,
                                        [
                                            "testimonial",
                                            "message",
                                            "review",
                                            "content",
                                            "text"
                                        ],
                                        ""
                                    );


                                const name =
                                    getFirst(
                                        item,
                                        [
                                            "name",
                                            "client_name",
                                            "customer_name",
                                            "author_name"
                                        ],
                                        "Client"
                                    );


                                const role =
                                    getFirst(
                                        item,
                                        [
                                            "designation",
                                            "role",
                                            "position"
                                        ],
                                        ""
                                    );


                                return `
                                    <div class="testimonial-card">

                                        <div class="testimonial-quote">
                                            “
                                        </div>

                                        <div class="testimonial-text">
                                            ${escapeHTML(text)}
                                        </div>

                                        <div class="testimonial-name">
                                            ${escapeHTML(name)}
                                        </div>

                                        ${
                                            role
                                                ? `
                                                <div class="testimonial-role">
                                                    ${escapeHTML(role)}
                                                </div>
                                                `
                                                : ""
                                        }

                                    </div>
                                `;
                            }
                        )
                        .join("");
            }
        );
    }


    /* ============================================================
       FAQ
       ============================================================ */

    function renderFAQ(
        rows
    ) {

        const containers =
            document.querySelectorAll(
                "[data-faq]"
            );


        if (!containers.length) {
            return;
        }


        containers.forEach(
            function (container) {

                if (!rows.length) {

                    container.innerHTML =
                        `
                        <div class="empty">
                            No FAQs available.
                        </div>
                        `;

                    return;
                }


                container.innerHTML =
                    rows
                        .map(
                            function (item) {

                                const question =
                                    getFirst(
                                        item,
                                        [
                                            "question",
                                            "title",
                                            "faq_question"
                                        ],
                                        "Question"
                                    );


                                const answer =
                                    getFirst(
                                        item,
                                        [
                                            "answer",
                                            "description",
                                            "content",
                                            "faq_answer"
                                        ],
                                        ""
                                    );


                                return `
                                    <div class="faq-item">

                                        <button
                                            type="button"
                                            class="faq-question">

                                            <span>
                                                ${escapeHTML(question)}
                                            </span>

                                            <span>
                                                +
                                            </span>

                                        </button>

                                        <div class="faq-answer">

                                            <p>
                                                ${escapeHTML(answer)}
                                            </p>

                                        </div>

                                    </div>
                                `;
                            }
                        )
                        .join("");


                bindFAQ();
            }
        );
    }


    /* ============================================================
       FAQ BINDING
       ============================================================ */

    function bindFAQ() {

        document
            .querySelectorAll(
                ".faq-question"
            )
            .forEach(
                function (button) {

                    if (
                        button.dataset.mdkBound ===
                        "1"
                    ) {
                        return;
                    }


                    button.dataset.mdkBound =
                        "1";


                    button.addEventListener(
                        "click",
                        function () {

                            const item =
                                button.closest(
                                    ".faq-item"
                                );


                            if (!item) {
                                return;
                            }


                            item.classList.toggle(
                                "open"
                            );


                            const icon =
                                button
                                    .querySelector(
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


    /* ============================================================
       START RUNTIME
       ============================================================ */

    async function startRuntime() {

        try {

            if (!initSupabase()) {
                return;
            }


            const clientId =
                getClientId();


            if (!clientId) {

                console.warn(
                    "MDK Runtime: No client selected."
                );

                return;
            }


            await loadClient(
                clientId
            );


        } catch (error) {

            console.error(
                "MDK Runtime Error:",
                error
            );
        }
    }


    /* ============================================================
       CLIENT CHANGE LISTENER
       ============================================================ */

    window.addEventListener(
        "mdk-client-changed",
        function (event) {

            const client =
                event.detail;


            if (
                client &&
                client.id
            ) {

                loadClient(
                    client.id
                );
            }
        }
    );


    /* ============================================================
       START AFTER DOM READY
       ============================================================ */

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
```

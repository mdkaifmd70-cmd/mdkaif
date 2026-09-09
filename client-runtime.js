/* ============================================================
   MDK CLIENT RUNTIME
   Version: V1
   Purpose:
   Load client-specific website data from Supabase
   without changing the template design.
   ============================================================ */

(function () {
    "use strict";

    /* ============================================================
       SUPABASE CONFIG
       ============================================================ */

    var SUPABASE_URL =
        "https://ywvdozdoanmcxscfofcf.supabase.co";

    var SUPABASE_KEY =
        "sb_publishable_aAqO96BmDbYivhlgl_3z7g_1orXAscB";


    /* ============================================================
       SUPABASE CLIENT
       ============================================================ */

    function getSupabase() {

        if (!window.supabase) {
            console.error(
                "MDK Runtime: Supabase library not loaded."
            );

            return null;
        }

        try {

            return window.supabase.createClient(
                SUPABASE_URL,
                SUPABASE_KEY
            );

        } catch (error) {

            console.error(
                "MDK Runtime: Supabase initialization failed.",
                error
            );

            return null;
        }
    }


    /* ============================================================
       GET CLIENT ID
       Priority:
       1. URL ?client=
       2. MDKClientContext
       3. localStorage
       ============================================================ */

    function getClientId() {

        try {

            var params =
                new URLSearchParams(
                    window.location.search
                );

            var urlClient =
                params.get("client");

            if (urlClient) {
                return urlClient;
            }

        } catch (error) {

            console.error(
                "MDK Runtime: URL parameter error.",
                error
            );
        }


        try {

            if (
                window.MDKClientContext &&
                typeof window.MDKClientContext.id === "function"
            ) {

                var contextId =
                    window.MDKClientContext.id();

                if (contextId) {
                    return contextId;
                }
            }

        } catch (error) {

            console.error(
                "MDK Runtime: Client context error.",
                error
            );
        }


        try {

            var saved =
                localStorage.getItem(
                    "mdkaif_active_client"
                );

            if (saved) {

                var parsed =
                    JSON.parse(saved);

                if (parsed && parsed.id) {
                    return parsed.id;
                }
            }

        } catch (error) {

            console.error(
                "MDK Runtime: Local storage error.",
                error
            );
        }


        return null;
    }


    /* ============================================================
       VALUE HELPER
       ============================================================ */

    function value(data, key, fallback) {

        if (!data) {
            return fallback || "";
        }

        if (
            data[key] !== null &&
            data[key] !== undefined &&
            String(data[key]).trim() !== ""
        ) {

            return String(data[key]);
        }

        return fallback || "";
    }


    /* ============================================================
       SAFE TEXT
       ============================================================ */

    function setText(selector, text) {

        try {

            var element =
                document.querySelector(selector);

            if (!element) {
                return;
            }

            if (
                text !== null &&
                text !== undefined &&
                String(text).trim() !== ""
            ) {

                element.textContent =
                    String(text);
            }

        } catch (error) {

            console.error(
                "MDK Runtime setText error:",
                selector,
                error
            );
        }
    }


    /* ============================================================
       SET ATTRIBUTE
       ============================================================ */

    function setAttr(
        selector,
        attribute,
        valueToSet
    ) {

        try {

            var element =
                document.querySelector(selector);

            if (!element) {
                return;
            }

            if (
                valueToSet !== null &&
                valueToSet !== undefined &&
                String(valueToSet).trim() !== ""
            ) {

                element.setAttribute(
                    attribute,
                    String(valueToSet)
                );
            }

        } catch (error) {

            console.error(
                "MDK Runtime setAttr error:",
                selector,
                error
            );
        }
    }


    /* ============================================================
       ESCAPE HTML
       ============================================================ */

    function escapeHTML(valueToEscape) {

        return String(
            valueToEscape === null ||
            valueToEscape === undefined
                ? ""
                : valueToEscape
        )
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }


    /* ============================================================
       ESCAPE ATTRIBUTE
       ============================================================ */

    function escapeAttr(valueToEscape) {

        return escapeHTML(valueToEscape);
    }


    /* ============================================================
       APPLY CLIENT BASIC DATA
       ============================================================ */

    function applyClient(client) {

        if (!client) {
            return;
        }


        /* COMPANY NAME */

        var companyName =
            value(
                client,
                "company_name",
                "Your Company"
            );


        /* LOGO / COMPANY NAME */

        var logoText =
            document.querySelector(
                ".logo"
            );

        if (
            logoText &&
            !logoText.querySelector("img")
        ) {

            logoText.textContent =
                companyName;
        }


        /* FOOTER LOGO */

        var footerLogo =
            document.querySelector(
                ".footer-logo"
            );

        if (footerLogo) {

            footerLogo.textContent =
                companyName;
        }


        /* DOCUMENT TITLE */

        if (companyName) {

            document.title =
                companyName;
        }


        /* DATA ATTRIBUTES */

        document.body.setAttribute(
            "data-client-id",
            client.id || ""
        );

        document.body.setAttribute(
            "data-client-slug",
            client.slug || ""
        );

        document.body.setAttribute(
            "data-client-name",
            companyName
        );


        /* ACTIVE CLIENT CONTEXT */

        try {

            if (
                window.MDKClientContext &&
                typeof window.MDKClientContext.set === "function"
            ) {

                window.MDKClientContext.set(
                    client
                );
            }

        } catch (error) {

            console.error(
                "MDK Runtime: Could not save client context.",
                error
            );
        }
    }


    /* ============================================================
       APPLY WEBSITE CONTENT
       ============================================================ */

    function applyWebsiteContent(content) {

        if (!content) {
            return;
        }


        /* ========================================================
           TOP BAR
           ======================================================== */

        setText(
            ".topbar-inner span:first-child",
            value(
                content,
                "topbar_text",
                ""
            )
        );


        /* ========================================================
           HERO
           ======================================================== */

        setText(
            '[data-content="hero_eyebrow"]',
            value(
                content,
                "hero_eyebrow",
                ""
            )
        );

        setText(
            '[data-content="hero_title"]',
            value(
                content,
                "hero_heading",
                ""
            )
        );

        setText(
            '[data-content="hero_description"]',
            value(
                content,
                "hero_description",
                ""
            )
        );


        /* HERO IMAGE */

        var heroImage =
            value(
                content,
                "hero_image_url",
                ""
            );

        if (heroImage) {

            var hero =
                document.querySelector(
                    ".hero"
                );

            if (hero) {

                hero.style.backgroundImage =
                    "linear-gradient(rgba(0,0,0,.50),rgba(0,0,0,.50)),url('" +
                    heroImage.replace(/'/g, "\\'") +
                    "')";

                hero.style.backgroundSize =
                    "cover";

                hero.style.backgroundPosition =
                    "center";
            }
        }


        /* ========================================================
           ABOUT
           ======================================================== */

        setText(
            '[data-content="about_eyebrow"]',
            value(
                content,
                "about_eyebrow",
                ""
            )
        );

        setText(
            '[data-content="about_title"]',
            value(
                content,
                "about_heading",
                ""
            )
        );

        setText(
            '[data-content="about_description"]',
            value(
                content,
                "about_description",
                ""
            )
        );


        /* ABOUT IMAGE */

        var aboutImage =
            value(
                content,
                "about_image_url",
                ""
            );

        if (aboutImage) {

            var aboutVisual =
                document.querySelector(
                    ".about .visual"
                );

            if (aboutVisual) {

                aboutVisual.style.backgroundImage =
                    "url('" +
                    aboutImage.replace(/'/g, "\\'") +
                    "')";

                aboutVisual.style.backgroundSize =
                    "cover";

                aboutVisual.style.backgroundPosition =
                    "center";

                aboutVisual.textContent =
                    "";
            }
        }


        /* ========================================================
           STATS
           ======================================================== */

        setText(
            '[data-stat="1-value"]',
            value(
                content,
                "stat_1_value",
                ""
            )
        );

        setText(
            '[data-stat="1-label"]',
            value(
                content,
                "stat_1_label",
                ""
            )
        );


        setText(
            '[data-stat="2-value"]',
            value(
                content,
                "stat_2_value",
                ""
            )
        );

        setText(
            '[data-stat="2-label"]',
            value(
                content,
                "stat_2_label",
                ""
            )
        );


        setText(
            '[data-stat="3-value"]',
            value(
                content,
                "stat_3_value",
                ""
            )
        );

        setText(
            '[data-stat="3-label"]',
            value(
                content,
                "stat_3_label",
                ""
            )
        );


        setText(
            '[data-stat="4-value"]',
            value(
                content,
                "stat_4_value",
                ""
            )
        );

        setText(
            '[data-stat="4-label"]',
            value(
                content,
                "stat_4_label",
                ""
            )
        );


        /* ========================================================
           PRODUCTS
           ======================================================== */

        setText(
            '[data-content="products_eyebrow"]',
            value(
                content,
                "products_eyebrow",
                ""
            )
        );

        setText(
            '[data-content="products_title"]',
            value(
                content,
                "products_heading",
                ""
            )
        );

        setText(
            '[data-content="products_description"]',
            value(
                content,
                "products_description",
                ""
            )
        );


        /* ========================================================
           MANUFACTURING
           ======================================================== */

        setText(
            '[data-content="manufacturing_eyebrow"]',
            value(
                content,
                "manufacturing_eyebrow",
                ""
            )
        );

        setText(
            '[data-content="manufacturing_title"]',
            value(
                content,
                "manufacturing_heading",
                ""
            )
        );

        setText(
            '[data-content="manufacturing_description"]',
            value(
                content,
                "manufacturing_description",
                ""
            )
        );


        /* ========================================================
           QUALITY
           ======================================================== */

        setText(
            '[data-content="quality_eyebrow"]',
            value(
                content,
                "quality_eyebrow",
                ""
            )
        );

        setText(
            '[data-content="quality_title"]',
            value(
                content,
                "quality_heading",
                ""
            )
        );

        setText(
            '[data-content="quality_description"]',
            value(
                content,
                "quality_description",
                ""
            )
        );


        /* ========================================================
           INDUSTRIES
           ======================================================== */

        setText(
            '[data-content="industries_eyebrow"]',
            value(
                content,
                "industries_eyebrow",
                ""
            )
        );

        setText(
            '[data-content="industries_title"]',
            value(
                content,
                "industries_heading",
                ""
            )
        );


        /* ========================================================
           GALLERY
           ======================================================== */

        setText(
            '[data-content="gallery_eyebrow"]',
            value(
                content,
                "gallery_eyebrow",
                ""
            )
        );

        setText(
            '[data-content="gallery_title"]',
            value(
                content,
                "gallery_heading",
                ""
            )
        );

        setText(
            '[data-content="gallery_description"]',
            value(
                content,
                "gallery_description",
                ""
            )
        );


        /* ========================================================
           TESTIMONIALS
           ======================================================== */

        setText(
            '[data-content="testimonials_eyebrow"]',
            value(
                content,
                "testimonials_eyebrow",
                ""
            )
        );

        setText(
            '[data-content="testimonials_title"]',
            value(
                content,
                "testimonials_heading",
                ""
            )
        );


        /* ========================================================
           FAQ
           ======================================================== */

        setText(
            '[data-content="faq_eyebrow"]',
            value(
                content,
                "faq_eyebrow",
                ""
            )
        );

        setText(
            '[data-content="faq_title"]',
            value(
                content,
                "faq_heading",
                ""
            )
        );


        /* ========================================================
           CONTACT
           ======================================================== */

        setText(
            '[data-content="contact_eyebrow"]',
            value(
                content,
                "contact_eyebrow",
                ""
            )
        );

        setText(
            '[data-content="contact_title"]',
            value(
                content,
                "contact_heading",
                ""
            )
        );

        setText(
            '[data-content="contact_description"]',
            value(
                content,
                "contact_description",
                ""
            )
        );


        /* PHONE */

        var phone =
            value(
                content,
                "phone",
                ""
            );

        if (phone) {

            document
                .querySelectorAll(
                    '[data-contact="phone"]'
                )
                .forEach(function (element) {

                    element.textContent =
                        phone;

                    if (
                        element.tagName === "A"
                    ) {

                        element.href =
                            "tel:" +
                            phone.replace(
                                /[^0-9+]/g,
                                ""
                            );
                    }
                });
        }


        /* EMAIL */

        var email =
            value(
                content,
                "email",
                ""
            );

        if (email) {

            document
                .querySelectorAll(
                    '[data-contact="email"]'
                )
                .forEach(function (element) {

                    element.textContent =
                        email;

                    if (
                        element.tagName === "A"
                    ) {

                        element.href =
                            "mailto:" +
                            email;
                    }
                });
        }


        /* ADDRESS */

        setText(
            '[data-contact="address"]',
            value(
                content,
                "address",
                ""
            )
        );


        /* WHATSAPP */

        var whatsapp =
            value(
                content,
                "whatsapp",
                ""
            );

        if (whatsapp) {

            var whatsappNumber =
                whatsapp.replace(
                    /[^0-9]/g,
                    ""
                );

            document
                .querySelectorAll(
                    '[data-contact="whatsapp"]'
                )
                .forEach(function (element) {

                    if (
                        element.tagName === "A"
                    ) {

                        element.href =
                            "https://wa.me/" +
                            whatsappNumber;

                        element.target =
                            "_blank";
                    }

                    if (
                        element.hasAttribute(
                            "data-whatsapp-text"
                        )
                    ) {

                        element.textContent =
                            whatsapp;
                    }
                });
        }


        /* ========================================================
           LOGO IMAGE
           ======================================================== */

        var logoUrl =
            value(
                content,
                "logo_url",
                ""
            );

        if (logoUrl) {

            var logoImage =
                document.querySelector(
                    '[data-content-image="logo"]'
                );

            if (logoImage) {

                logoImage.src =
                    logoUrl;

                logoImage.alt =
                    "Company Logo";
            }
        }


        /* ========================================================
           FOOTER DESCRIPTION
           ======================================================== */

        setText(
            '[data-content="footer_description"]',
            value(
                content,
                "footer_description",
                ""
            )
        );


        /* ========================================================
           SOCIAL / LEGAL LINKS
           ======================================================== */

        var linkedin =
            value(
                content,
                "linkedin_url",
                ""
            );

        if (linkedin) {

            document
                .querySelectorAll(
                    '[data-link="linkedin"]'
                )
                .forEach(function (element) {

                    element.href =
                        linkedin;

                    element.target =
                        "_blank";
                });
        }


        var privacy =
            value(
                content,
                "privacy_url",
                ""
            );

        if (privacy) {

            document
                .querySelectorAll(
                    '[data-link="privacy"]'
                )
                .forEach(function (element) {

                    element.href =
                        privacy;
                });
        }


        var terms =
            value(
                content,
                "terms_url",
                ""
            );

        if (terms) {

            document
                .querySelectorAll(
                    '[data-link="terms"]'
                )
                .forEach(function (element) {

                    element.href =
                        terms;
                });
        }
    }


    /* ============================================================
       GENERIC FIELD HELPER
       ============================================================ */

    function firstValue(
        row,
        keys,
        fallback
    ) {

        if (!row) {
            return fallback || "";
        }

        for (
            var i = 0;
            i < keys.length;
            i++
        ) {

            var key =
                keys[i];

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


    /* ============================================================
       RENDER PRODUCTS
       ============================================================ */

    function renderProducts(products) {

        var container =
            document.querySelector(
                "[data-products]"
            );

        if (!container) {
            return;
        }

        container.innerHTML =
            "";


        if (
            !products ||
            !products.length
        ) {

            return;
        }


        products.forEach(
            function (product) {

                var name =
                    firstValue(
                        product,
                        [
                            "name",
                            "product_name",
                            "title"
                        ],
                        "Product"
                    );


                var description =
                    firstValue(
                        product,
                        [
                            "description",
                            "product_description",
                            "details"
                        ],
                        ""
                    );


                var image =
                    firstValue(
                        product,
                        [
                            "image_url",
                            "image",
                            "photo_url",
                            "product_image_url"
                        ],
                        ""
                    );


                var code =
                    firstValue(
                        product,
                        [
                            "product_code",
                            "code",
                            "sku"
                        ],
                        ""
                    );


                var article =
                    document.createElement(
                        "article"
                    );

                article.className =
                    "card products";


                var imageHTML =
                    image
                        ? (
                            '<img src="' +
                            escapeAttr(image) +
                            '" alt="' +
                            escapeAttr(name) +
                            '" style="width:100%;height:220px;object-fit:cover;">'
                        )
                        : "";


                article.innerHTML =
                    imageHTML +
                    '<div style="padding:22px;">' +
                    '<div class="eyebrow">' +
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
                    article
                );
            }
        );
    }


    /* ============================================================
       RENDER MANUFACTURING
       ============================================================ */

    function renderManufacturing(steps) {

        var container =
            document.querySelector(
                "[data-manufacturing]"
            );

        if (!container) {
            return;
        }

        container.innerHTML =
            "";


        if (
            !steps ||
            !steps.length
        ) {

            return;
        }


        steps.forEach(
            function (step, index) {

                var title =
                    firstValue(
                        step,
                        [
                            "title",
                            "name",
                            "step_name"
                        ],
                        "Step " +
                        (index + 1)
                    );


                var description =
                    firstValue(
                        step,
                        [
                            "description",
                            "details",
                            "step_description"
                        ],
                        ""
                    );


                var number =
                    firstValue(
                        step,
                        [
                            "step_number",
                            "number",
                            "sequence"
                        ],
                        String(index + 1)
                    );


                var card =
                    document.createElement(
                        "div"
                    );

                card.className =
                    "card";


                card.innerHTML =
                    '<div class="eyebrow">STEP ' +
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


    /* ============================================================
       RENDER QUALITY
       ============================================================ */

    function renderQuality(items) {

        var container =
            document.querySelector(
                "[data-quality]"
            );

        if (!container) {
            return;
        }

        container.innerHTML =
            "";


        if (
            !items ||
            !items.length
        ) {

            return;
        }


        items.forEach(
            function (item) {

                var title =
                    firstValue(
                        item,
                        [
                            "title",
                            "name",
                            "quality_name"
                        ],
                        "Quality"
                    );


                var description =
                    firstValue(
                        item,
                        [
                            "description",
                            "details"
                        ],
                        ""
                    );


                var icon =
                    firstValue(
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
                    '<div style="font-size:32px;margin-bottom:12px;">' +
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


    /* ============================================================
       RENDER INDUSTRIES
       ============================================================ */

    function renderIndustries(items) {

        var container =
            document.querySelector(
                "[data-industries]"
            );

        if (!container) {
            return;
        }

        container.innerHTML =
            "";


        if (
            !items ||
            !items.length
        ) {

            return;
        }


        items.forEach(
            function (item) {

                var name =
                    firstValue(
                        item,
                        [
                            "name",
                            "title",
                            "industry_name"
                        ],
                        "Industry"
                    );


                var description =
                    firstValue(
                        item,
                        [
                            "description",
                            "details"
                        ],
                        ""
                    );


                var card =
                    document.createElement(
                        "div"
                    );

                card.className =
                    "industry";


                card.innerHTML =
                    '<strong>' +
                    escapeHTML(name) +
                    '</strong>' +
                    (
                        description
                            ? '<span>' +
                              escapeHTML(description) +
                              '</span>'
                            : ""
                    );


                container.appendChild(
                    card
                );
            }
        );
    }


    /* ============================================================
       RENDER GALLERY
       ============================================================ */

    function renderGallery(items) {

        var container =
            document.querySelector(
                "[data-gallery]"
            );

        if (!container) {
            return;
        }

        container.innerHTML =
            "";


        if (
            !items ||
            !items.length
        ) {

            return;
        }


        items.forEach(
            function (item) {

                var image =
                    firstValue(
                        item,
                        [
                            "image_url",
                            "image",
                            "photo_url",
                            "gallery_image_url"
                        ],
                        ""
                    );


                var title =
                    firstValue(
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


                var figure =
                    document.createElement(
                        "figure"
                    );


                figure.innerHTML =
                    '<img src="' +
                    escapeAttr(image) +
                    '" alt="' +
                    escapeAttr(title) +
                    '" style="width:100%;height:100%;object-fit:cover;">';


                container.appendChild(
                    figure
                );
            }
        );
    }


    /* ============================================================
       RENDER TESTIMONIALS
       ============================================================ */

    function renderTestimonials(items) {

        var container =
            document.querySelector(
                "[data-testimonials]"
            );

        if (!container) {
            return;
        }

        container.innerHTML =
            "";


        if (
            !items ||
            !items.length
        ) {

            return;
        }


        items.forEach(
            function (item) {

                var name =
                    firstValue(
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
                    firstValue(
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
                    firstValue(
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
                    "card";


                card.innerHTML =
                    '<p style="font-size:17px;line-height:1.7;">“' +
                    escapeHTML(message) +
                    '”</p>' +
                    '<strong>' +
                    escapeHTML(name) +
                    '</strong>' +
                    (
                        company
                            ? '<div style="margin-top:5px;opacity:.7;">' +
                              escapeHTML(company) +
                              '</div>'
                            : ""
                    );


                container.appendChild(
                    card
                );
            }
        );
    }


    /* ============================================================
       RENDER FAQ
       ============================================================ */

    function renderFAQ(items) {

        var container =
            document.querySelector(
                "[data-faq]"
            );

        if (!container) {
            return;
        }

        container.innerHTML =
            "";


        if (
            !items ||
            !items.length
        ) {

            return;
        }


        items.forEach(
            function (item) {

                var question =
                    firstValue(
                        item,
                        [
                            "question",
                            "title",
                            "faq_question"
                        ],
                        "Question"
                    );


                var answer =
                    firstValue(
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


        /* FAQ CLICK EVENTS */

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


    /* ============================================================
       LOAD ONE TABLE
       ============================================================ */

    async function loadTable(
        supabaseClient,
        tableName,
        clientId
    ) {

        try {

            var result =
                await supabaseClient
                    .from(tableName)
                    .select("*")
                    .eq(
                        "client_id",
                        clientId
                    );


            if (result.error) {

                console.warn(
                    "MDK Runtime: " +
                    tableName +
                    " could not be loaded.",
                    result.error
                );

                return [];
            }


            return result.data || [];

        } catch (error) {

            console.warn(
                "MDK Runtime: " +
                tableName +
                " loading error.",
                error
            );

            return [];
        }
    }


    /* ============================================================
       LOAD WEBSITE
       ============================================================ */

    async function loadWebsite() {

        console.log(
            "MDK Client Runtime: START"
        );


        var clientId =
            getClientId();


        if (!clientId) {

            console.warn(
                "MDK Client Runtime: No client ID found."
            );

            document.body.setAttribute(
                "data-client-loaded",
                "false"
            );

            return;
        }


        console.log(
            "MDK Client Runtime: Client ID =",
            clientId
        );


        var supabaseClient =
            getSupabase();


        if (!supabaseClient) {

            return;
        }


        try {

            /* ====================================================
               CLIENT
               ==================================================== */

            var clientResult =
                await supabaseClient
                    .from("clients")
                    .select(
                        "id,company_name,slug,domain,hosting_type,hosting_url,template,status"
                    )
                    .eq(
                        "id",
                        clientId
                    )
                    .single();


            if (clientResult.error) {

                console.error(
                    "MDK Runtime: Client loading failed.",
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
                "MDK Client Runtime: Client loaded:",
                client.company_name
            );


            /* ====================================================
               WEBSITE CONTENT
               ==================================================== */

            var contentResult =
                await supabaseClient
                    .from(
                        "client_website_content"
                    )
                    .select("*")
                    .eq(
                        "client_id",
                        clientId
                    )
                    .maybeSingle();


            if (
                contentResult.error
            ) {

                console.warn(
                    "MDK Runtime: Website content loading failed.",
                    contentResult.error
                );

            }


            var websiteContent =
                contentResult.data || {};


            /* ====================================================
               CHILD TABLES
               ==================================================== */

            var results =
                await Promise.all([
                    loadTable(
                        supabaseClient,
                        "client_products",
                        clientId
                    ),

                    loadTable(
                        supabaseClient,
                        "client_manufacturing_steps",
                        clientId
                    ),

                    loadTable(
                        supabaseClient,
                        "client_quality",
                        clientId
                    ),

                    loadTable(
                        supabaseClient,
                        "client_industries",
                        clientId
                    ),

                    loadTable(
                        supabaseClient,
                        "client_gallery",
                        clientId
                    ),

                    loadTable(
                        supabaseClient,
                        "client_testimonials",
                        clientId
                    ),

                    loadTable(
                        supabaseClient,
                        "client_faq",
                        clientId
                    )
                ]);


            var products =
                results[0];

            var manufacturing =
                results[1];

            var quality =
                results[2];

            var industries =
                results[3];

            var gallery =
                results[4];

            var testimonials =
                results[5];

            var faq =
                results[6];


            /* ====================================================
               APPLY EVERYTHING
               ==================================================== */

            applyClient(
                client
            );


            applyWebsiteContent(
                websiteContent
            );


            renderProducts(
                products
            );


            renderManufacturing(
                manufacturing
            );


            renderQuality(
                quality
            );


            renderIndustries(
                industries
            );


            renderGallery(
                gallery
            );


            renderTestimonials(
                testimonials
            );


            renderFAQ(
                faq
            );


            /* ====================================================
               LOADED STATUS
               ==================================================== */

            document.body.setAttribute(
                "data-client-loaded",
                "true"
            );


            document.body.setAttribute(
                "data-client-company",
                client.company_name || ""
            );


            console.log(
                "MDK Client Runtime: WEBSITE LOADED SUCCESSFULLY"
            );


            console.log(
                "Products:",
                products.length
            );


            console.log(
                "Manufacturing:",
                manufacturing.length
            );


            console.log(
                "Quality:",
                quality.length
            );


            console.log(
                "Industries:",
                industries.length
            );


            console.log(
                "Gallery:",
                gallery.length
            );


            console.log(
                "Testimonials:",
                testimonials.length
            );


            console.log(
                "FAQ:",
                faq.length
            );


            /* ====================================================
               CUSTOM EVENT
               ==================================================== */

            try {

                window.dispatchEvent(
                    new CustomEvent(
                        "mdk-site-ready",
                        {
                            detail: {
                                client: client,
                                content: websiteContent,
                                products: products,
                                manufacturing: manufacturing,
                                quality: quality,
                                industries: industries,
                                gallery: gallery,
                                testimonials: testimonials,
                                faq: faq
                            }
                        }
                    )
                );

            } catch (eventError) {

                console.warn(
                    "MDK Runtime: Custom event failed.",
                    eventError
                );
            }


        } catch (error) {

            console.error(
                "MDK Client Runtime ERROR:",
                error
            );

            document.body.setAttribute(
                "data-client-loaded",
                "false"
            );
        }
    }


    /* ============================================================
       INITIALIZE
       ============================================================ */

    function initialize() {

        console.log(
            "MDK Client Runtime: INITIALIZING"
        );


        if (
            document.readyState ===
            "loading"
        ) {

            document.addEventListener(
                "DOMContentLoaded",
                function () {

                    loadWebsite();

                }
            );

        } else {

            loadWebsite();
        }
    }


    /* ============================================================
       START
       ============================================================ */

    initialize();

})();

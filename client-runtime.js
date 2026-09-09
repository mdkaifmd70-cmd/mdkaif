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


        /* PAGE TITLE */

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
       WEBSITE CONTENT
       ======================================================== */

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


        var elements =
            document.querySelectorAll(
                selector
            );


        elements.forEach(
            function (element) {

                element.href =
                    url;

                if (
                    url.indexOf(
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

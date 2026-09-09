(function () {
    "use strict";

    const SUPABASE_URL =
        "https://ywvdozdoanmcxscfofcf.supabase.co";

    const SUPABASE_KEY =
        "sb_publishable_aAqO96BmDbYivhlgl_3z7g_1orXAscB";

    let sb = null;

    /* =========================================
       SUPABASE
    ========================================= */

    function getSupabase() {

        if (sb) return sb;

        if (
            !window.supabase ||
            !window.supabase.createClient
        ) {
            console.error(
                "MDK Runtime: Supabase library not loaded."
            );
            return null;
        }

        sb = window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_KEY
        );

        return sb;
    }


    /* =========================================
       CLIENT ID
    ========================================= */

    function getClientId() {

        try {

            const params =
                new URLSearchParams(
                    window.location.search
                );

            return params.get("client");

        } catch (error) {

            console.error(
                "MDK Runtime: Client ID error",
                error
            );

            return null;
        }
    }


    /* =========================================
       SAFE VALUE
    ========================================= */

    function value(data, key, fallback = "") {

        if (
            data &&
            data[key] !== null &&
            data[key] !== undefined &&
            data[key] !== ""
        ) {
            return data[key];
        }

        return fallback;
    }


    /* =========================================
       SET TEXT
    ========================================= */

    function setText(selector, text) {

        const elements =
            document.querySelectorAll(selector);

        elements.forEach(function (el) {

            if (
                text !== null &&
                text !== undefined &&
                text !== ""
            ) {
                el.textContent = text;
            }

        });
    }


    /* =========================================
       SET ATTRIBUTE
    ========================================= */

    function setAttr(selector, attr, val) {

        const elements =
            document.querySelectorAll(selector);

        elements.forEach(function (el) {

            if (
                val !== null &&
                val !== undefined &&
                val !== ""
            ) {
                el.setAttribute(attr, val);
            }

        });
    }


    /* =========================================
       CLIENT BASIC DATA
    ========================================= */

    function applyClient(client) {

        if (!client) return;

        setText(
            '[data-client="company_name"]',
            client.company_name
        );

        setText(
            '[data-client="domain"]',
            client.domain
        );

        document.title =
            value(
                client,
                "company_name",
                "INDUSTRIA"
            ) +
            " | Manufacturing Excellence";
    }


    /* =========================================
       WEBSITE CONTENT
    ========================================= */

    function applyWebsiteContent(content) {

        if (!content) return;


        /* TOP BAR */

        setText(
            '[data-content="topbar_text"]',
            content.topbar_text
        );


        /* PHONE */

        setText(
            '[data-content="phone"]',
            content.phone
        );

        if (content.phone) {

            const phoneClean =
                String(content.phone)
                .replace(/[^\d+]/g, "");

            setAttr(
                '[data-content-link="phone"]',
                "href",
                "tel:" + phoneClean
            );
        }


        /* EMAIL */

        setText(
            '[data-content="email"]',
            content.email
        );

        if (content.email) {

            setAttr(
                '[data-content-link="email"]',
                "href",
                "mailto:" + content.email
            );
        }


        /* WHATSAPP */

        if (content.whatsapp) {

            const whatsapp =
                String(content.whatsapp)
                .replace(/\D/g, "");

            setAttr(
                '[data-content-link="whatsapp"]',
                "href",
                "https://wa.me/" + whatsapp
            );
        }


        /* ADDRESS */

        setText(
            '[data-content="address"]',
            content.address
        );


        /* HERO */

        setText(
            '[data-content="hero_eyebrow"]',
            content.hero_eyebrow
        );

        setText(
            '[data-content="hero_title"]',
            content.hero_title
        );

        setText(
            '[data-content="hero_description"]',
            content.hero_description
        );


        if (content.hero_image) {

            const hero =
                document.querySelector(".hero");

            if (hero) {

                hero.style.backgroundImage =
                    "linear-gradient(90deg, rgba(2,6,23,.92), rgba(2,6,23,.55)), url('" +
                    content.hero_image +
                    "')";

            }
        }


        /* ABOUT */

        setText(
            '[data-content="about_eyebrow"]',
            content.about_eyebrow
        );

        setText(
            '[data-content="about_title"]',
            content.about_title
        );

        setText(
            '[data-content="about_description"]',
            content.about_description
        );


        /* ABOUT IMAGE */

        if (content.about_image) {

            const visual =
                document.querySelector(".about .visual");

            if (visual) {

                visual.style.backgroundImage =
                    "linear-gradient(135deg, rgba(219,234,254,.15), rgba(226,232,240,.15)), url('" +
                    content.about_image +
                    "')";

                visual.style.backgroundSize =
                    "cover";

                visual.style.backgroundPosition =
                    "center";

                visual.style.color =
                    "transparent";

                visual.textContent = "";

            }
        }


        /* STATS */

        setText(
            '[data-stat="1-value"]',
            content.stat_1_value
        );

        setText(
            '[data-stat="1-label"]',
            content.stat_1_label
        );

        setText(
            '[data-stat="2-value"]',
            content.stat_2_value
        );

        setText(
            '[data-stat="2-label"]',
            content.stat_2_label
        );

        setText(
            '[data-stat="3-value"]',
            content.stat_3_value
        );

        setText(
            '[data-stat="3-label"]',
            content.stat_3_label
        );

        setText(
            '[data-stat="4-value"]',
            content.stat_4_value
        );

        setText(
            '[data-stat="4-label"]',
            content.stat_4_label
        );


        /* SECTION HEADINGS */

        setText(
            '[data-content="products_eyebrow"]',
            content.products_eyebrow
        );

        setText(
            '[data-content="products_title"]',
            content.products_title
        );

        setText(
            '[data-content="products_description"]',
            content.products_description
        );


        setText(
            '[data-content="manufacturing_eyebrow"]',
            content.manufacturing_eyebrow
        );

        setText(
            '[data-content="manufacturing_title"]',
            content.manufacturing_title
        );

        setText(
            '[data-content="manufacturing_description"]',
            content.manufacturing_description
        );


        setText(
            '[data-content="quality_eyebrow"]',
            content.quality_eyebrow
        );

        setText(
            '[data-content="quality_title"]',
            content.quality_title
        );

        setText(
            '[data-content="quality_description"]',
            content.quality_description
        );


        setText(
            '[data-content="industries_eyebrow"]',
            content.industries_eyebrow
        );

        setText(
            '[data-content="industries_title"]',
            content.industries_title
        );


        setText(
            '[data-content="gallery_eyebrow"]',
            content.gallery_eyebrow
        );

        setText(
            '[data-content="gallery_title"]',
            content.gallery_title
        );

        setText(
            '[data-content="gallery_description"]',
            content.gallery_description
        );


        setText(
            '[data-content="testimonials_eyebrow"]',
            content.testimonials_eyebrow
        );

        setText(
            '[data-content="testimonials_title"]',
            content.testimonials_title
        );


        setText(
            '[data-content="faq_eyebrow"]',
            content.faq_eyebrow
        );

        setText(
            '[data-content="faq_title"]',
            content.faq_title
        );


        /* CONTACT */

        setText(
            '[data-content="contact_eyebrow"]',
            content.contact_eyebrow
        );

        setText(
            '[data-content="contact_title"]',
            content.contact_title
        );

        setText(
            '[data-content="contact_description"]',
            content.contact_description
        );


        /* FOOTER */

        setText(
            '[data-content="footer_description"]',
            content.footer_description
        );

        setAttr(
            '[data-content-link="linkedin"]',
            "href",
            content.linkedin_url
        );

        setAttr(
            '[data-content-link="privacy"]',
            "href",
            content.privacy_url
        );

        setAttr(
            '[data-content-link="terms"]',
            "href",
            content.terms_url
        );
    }


    /* =========================================
       PRODUCTS
    ========================================= */

    function renderProducts(products) {

        const container =
            document.querySelector(
                "[data-products]"
            );

        if (!container || !products) return;

        if (!products.length) return;

        container.innerHTML = "";

        products.forEach(function (product) {

            const article =
                document.createElement("article");

            article.className =
                "card products";

            const image =
                product.image_url
                ? `
                    <div class="product-image"
                         style="
                         background-image:url('${product.image_url}');
                         background-size:cover;
                         background-position:center;
                         color:transparent;">
                    </div>
                  `
                : `
                    <div class="product-image">
                        PRODUCT IMAGE
                    </div>
                  `;

            const enquiryUrl =
                product.enquiry_url ||
                "#contact";

            article.innerHTML = `

                ${image}

                <div class="product-body">

                    <span class="product-code">
                        PRODUCT CODE:
                        ${escapeHTML(product.product_code || "")}
                    </span>

                    <h3>
                        ${escapeHTML(product.product_name || "")}
                    </h3>

                    <p>
                        ${escapeHTML(product.description || "")}
                    </p>

                    <br>

                    <a
                        class="btn btn-primary"
                        href="${escapeAttr(enquiryUrl)}">

                        Enquire Now

                    </a>

                </div>

            `;

            container.appendChild(article);

        });
    }


    /* =========================================
       MANUFACTURING
    ========================================= */

    function renderManufacturing(steps) {

        const container =
            document.querySelector(
                "[data-manufacturing]"
            );

        if (!container || !steps) return;

        if (!steps.length) return;

        container.innerHTML = "";

        steps.forEach(function (step, index) {

            const number =
                step.step_number ||
                String(index + 1).padStart(2, "0");

            const div =
                document.createElement("div");

            div.className = "step";

            div.innerHTML = `

                <div class="number">
                    ${escapeHTML(String(number).padStart(2, "0"))}
                </div>

                <h3>
                    ${escapeHTML(step.title || "")}
                </h3>

                <p>
                    ${escapeHTML(step.description || "")}
                </p>

            `;

            container.appendChild(div);

        });
    }


    /* =========================================
       QUALITY
    ========================================= */

    function renderQuality(items) {

        const container =
            document.querySelector(
                "[data-quality]"
            );

        if (!container || !items) return;

        if (!items.length) return;

        container.innerHTML = "";

        items.forEach(function (item) {

            const div =
                document.createElement("div");

            div.className = "card";

            div.innerHTML = `

                <div class="icon">
                    ${escapeHTML(item.icon || "✓")}
                </div>

                <h3>
                    ${escapeHTML(item.title || "")}
                </h3>

                <p>
                    ${escapeHTML(item.description || "")}
                </p>

            `;

            container.appendChild(div);

        });
    }


    /* =========================================
       INDUSTRIES
    ========================================= */

    function renderIndustries(items) {

        const container =
            document.querySelector(
                "[data-industries]"
            );

        if (!container || !items) return;

        if (!items.length) return;

        container.innerHTML = "";

        items.forEach(function (item) {

            const span =
                document.createElement("span");

            span.className = "pill";

            span.textContent =
                item.name || "";

            container.appendChild(span);

        });
    }


    /* =========================================
       GALLERY
    ========================================= */

    function renderGallery(items) {

        const container =
            document.querySelector(
                "[data-gallery]"
            );

        if (!container || !items) return;

        if (!items.length) return;

        container.innerHTML = "";

        items.forEach(function (item) {

            const div =
                document.createElement("div");

            div.className =
                "gallery-item";

            if (item.image_url) {

                div.style.backgroundImage =
                    "url('" +
                    item.image_url +
                    "')";

                div.style.backgroundSize =
                    "cover";

                div.style.backgroundPosition =
                    "center";

                div.style.color =
                    "transparent";

            } else {

                div.textContent =
                    item.title || "PHOTO";

            }

            container.appendChild(div);

        });
    }


    /* =========================================
       TESTIMONIALS
    ========================================= */

    function renderTestimonials(items) {

        const container =
            document.querySelector(
                "[data-testimonials]"
            );

        if (!container || !items) return;

        if (!items.length) return;

        container.innerHTML = "";

        items.forEach(function (item) {

            const div =
                document.createElement("div");

            div.className = "quote";

            let person =
                item.customer_name || "";

            if (item.designation) {

                person +=
                    " — " +
                    item.designation;
            }

            div.innerHTML = `

                <p>
                    “${escapeHTML(item.message || "")}”
                </p>

                <strong>
                    ${escapeHTML(person)}
                </strong>

            `;

            container.appendChild(div);

        });
    }


    /* =========================================
       FAQ
    ========================================= */

    function renderFAQ(items) {

        const container =
            document.querySelector(
                "[data-faq]"
            );

        if (!container || !items) return;

        if (!items.length) return;

        container.innerHTML = "";

        items.forEach(function (item) {

            const div =
                document.createElement("div");

            div.className =
                "faq-item";

            div.innerHTML = `

                <button
                    class="faq-question"
                    type="button">

                    <span>
                        ${escapeHTML(item.question || "")}
                    </span>

                    <span>
                        +
                    </span>

                </button>

                <div class="faq-answer">

                    ${escapeHTML(item.answer || "")}

                </div>

            `;

            container.appendChild(div);

        });


        container
        .querySelectorAll(".faq-question")
        .forEach(function (button) {

            button.addEventListener(
                "click",
                function () {

                    const item =
                        button.closest(
                            ".faq-item"
                        );

                    const icon =
                        button.querySelector(
                            "span:last-child"
                        );

                    item.classList.toggle("open");

                    if (icon) {

                        icon.textContent =
                            item.classList.contains("open")
                            ? "−"
                            : "+";
                    }

                }
            );

        });
    }


    /* =========================================
       SECURITY HELPERS
    ========================================= */

    function escapeHTML(value) {

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    function escapeAttr(value) {

        return String(value)
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    /* =========================================
       LOAD ALL DATA
    ========================================= */

    async function loadWebsite() {

        const clientId =
            getClientId();

        if (!clientId) {

            console.log(
                "MDK Runtime: Static template mode."
            );

            return;
        }

        const supabase =
            getSupabase();

        if (!supabase) return;


        console.log(
            "MDK Runtime: Loading client:",
            clientId
        );


        try {

            const results =
                await Promise.all([

                    supabase
                    .from("clients")
                    .select("*")
                    .eq("id", clientId)
                    .single(),

                    supabase
                    .from("client_website_content")
                    .select("*")
                    .eq("client_id", clientId)
                    .maybeSingle(),

                    supabase
                    .from("client_products")
                    .select("*")
                    .eq("client_id", clientId)
                    .eq("is_active", true)
                    .order("sort_order"),

                    supabase
                    .from("client_manufacturing_steps")
                    .select("*")
                    .eq("client_id", clientId)
                    .eq("is_active", true)
                    .order("sort_order"),

                    supabase
                    .from("client_quality")
                    .select("*")
                    .eq("client_id", clientId)
                    .eq("is_active", true)
                    .order("sort_order"),

                    supabase
                    .from("client_industries")
                    .select("*")
                    .eq("client_id", clientId)
                    .eq("is_active", true)
                    .order("sort_order"),

                    supabase
                    .from("client_gallery")
                    .select("*")
                    .eq("client_id", clientId)
                    .eq("is_active", true)
                    .order("sort_order"),

                    supabase
                    .from("client_testimonials")
                    .select("*")
                    .eq("client_id", clientId)
                    .eq("is_active", true)
                    .order("sort_order"),

                    supabase
                    .from("client_faq")
                    .select("*")
                    .eq("client_id", clientId)
                    .eq("is_active", true)
                    .order("sort_order")
                ]);


            const clientResult =
                results[0];

            if (clientResult.error) {

                console.error(
                    "Client loading error:",
                    clientResult.error
                );

                return;
            }


            const client =
                clientResult.data;

            if (!client) {

                console.error(
                    "Client not found:",
                    clientId
                );

                return;
            }


            const content =
                results[1].data;

            const products =
                results[2].data || [];

            const manufacturing =
                results[3].data || [];

            const quality =
                results[4].data || [];

            const industries =
                results[5].data || [];

            const gallery =
                results[6].data || [];

            const testimonials =
                results[7].data || [];

            const faq =
                results[8].data || [];


            /* SAVE GLOBAL */

            window.MDKSiteClient =
                client;

            window.MDKClientId =
                client.id;

            window.MDKSiteContent =
                content;


            /* APPLY */

            applyClient(client);

            applyWebsiteContent(content);

            renderProducts(products);

            renderManufacturing(manufacturing);

            renderQuality(quality);

            renderIndustries(industries);

            renderGallery(gallery);

            renderTestimonials(testimonials);

            renderFAQ(faq);


            document.documentElement
                .setAttribute(
                    "data-client-loaded",
                    "true"
                );

            document.body
                .setAttribute(
                    "data-client-id",
                    client.id
                );


            /* CLIENT CONTEXT */

            if (
                window.MDKClientContext
            ) {

                MDKClientContext.set(
                    client
                );
            }


            /* READY EVENT */

            window.dispatchEvent(
                new CustomEvent(
                    "mdk-site-ready",
                    {
                        detail: {
                            client: client,
                            content: content,
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


            console.log(
                "MDK Runtime: Website loaded successfully:",
                client.company_name
            );

        } catch (error) {

            console.error(
                "MDK Runtime Fatal Error:",
                error
            );

        }

    }


    /* =========================================
       INIT
    ========================================= */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            loadWebsite,
            {
                once: true
            }
        );

    } else {

        loadWebsite();

    }

})();

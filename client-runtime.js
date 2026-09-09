```javascript
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
       DATABASE COLUMN NAMES ARE USED HERE
    ========================================= */

    function applyWebsiteContent(content) {

        if (!content) return;


        /* =====================================
           TOP BAR
        ===================================== */

        setText(
            '[data-content="topbar_text"]',
            content.topbar_text
        );


        /* =====================================
           LOGO
        ===================================== */

        if (content.logo_url) {

            const logoElements =
                document.querySelectorAll(
                    '[data-content-image="logo"]'
                );

            logoElements.forEach(function (el) {

                el.src = content.logo_url;

                if (
                    el.tagName &&
                    el.tagName.toLowerCase() === "img"
                ) {
                    el.style.display = "";
                }

            });
        }


        /* =====================================
           PHONE
        ===================================== */

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


        /* =====================================
           EMAIL
        ===================================== */

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


        /* =====================================
           WHATSAPP
        ===================================== */

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


        /* =====================================
           ADDRESS
        ===================================== */

        setText(
            '[data-content="address"]',
            content.address
        );


        /* =====================================
           HERO
           
           DB:
           hero_eyebrow
           hero_heading
           hero_description
           hero_image_url
        ===================================== */

        setText(
            '[data-content="hero_eyebrow"]',
            content.hero_eyebrow
        );

        setText(
            '[data-content="hero_title"]',
            content.hero_heading
        );

        setText(
            '[data-content="hero_description"]',
            content.hero_description
        );


        if (content.hero_image_url) {

            const hero =
                document.querySelector(".hero");

            if (hero) {

                hero.style.backgroundImage =
                    "linear-gradient(90deg, rgba(2,6,23,.92), rgba(2,6,23,.55)), url('" +
                    content.hero_image_url +
                    "')";

            }
        }


        /* =====================================
           ABOUT
           
           DB:
           about_eyebrow
           about_heading
           about_description
           about_image_url
        ===================================== */

        setText(
            '[data-content="about_eyebrow"]',
            content.about_eyebrow
        );

        setText(
            '[data-content="about_title"]',
            content.about_heading
        );

        setText(
            '[data-content="about_description"]',
            content.about_description
        );


        /* ABOUT IMAGE */

        if (content.about_image_url) {

            const visual =
                document.querySelector(
                    ".about .visual"
                );

            if (visual) {

                visual.style.backgroundImage =
                    "linear-gradient(135deg, rgba(219,234,254,.15), rgba(226,232,240,.15)), url('" +
                    content.about_image_url +
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


        /* =====================================
           STATS
        ===================================== */

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


        /* =====================================
           PRODUCTS SECTION
           
           DB:
           products_eyebrow
           products_heading
           products_description
        ===================================== */

        setText(
            '[data-content="products_eyebrow"]',
            content.products_eyebrow
        );

        setText(
            '[data-content="products_title"]',
            content.products_heading
        );

        setText(
            '[data-content="products_description"]',
            content.products_description
        );


        /* =====================================
           MANUFACTURING SECTION
        ===================================== */

        setText(
            '[data-content="manufacturing_eyebrow"]',
            content.manufacturing_eyebrow
        );

        setText(
            '[data-content="manufacturing_title"]',
            content.manufacturing_heading
        );

        setText(
            '[data-content="manufacturing_description"]',
            content.manufacturing_description
        );


        /* =====================================
           QUALITY SECTION
        ===================================== */

        setText(
            '[data-content="quality_eyebrow"]',
            content.quality_eyebrow
        );

        setText(
            '[data-content="quality_title"]',
            content.quality_heading
        );

        setText(
            '[data-content="quality_description"]',
            content.quality_description
        );


        /* =====================================
           INDUSTRIES SECTION
        ===================================== */

        setText(
            '[data-content="industries_eyebrow"]',
            content.industries_eyebrow
        );

        setText(
            '[data-content="industries_title"]',
            content.industries_heading
        );


        /* =====================================
           GALLERY SECTION
        ===================================== */

        setText(
            '[data-content="gallery_eyebrow"]',
            content.gallery_eyebrow
        );

        setText(
            '[data-content="gallery_title"]',
            content.gallery_heading
        );

        setText(
            '[data-content="gallery_description"]',
            content.gallery_description
        );


        /* =====================================
           TESTIMONIALS SECTION
        ===================================== */

        setText(
            '[data-content="testimonials_eyebrow"]',
            content.testimonials_eyebrow
        );

        setText(
            '[data-content="testimonials_title"]',
            content.testimonials_heading
        );


        /* =====================================
           FAQ SECTION
        ===================================== */

        setText(
            '[data-content="faq_eyebrow"]',
            content.faq_eyebrow
        );

        setText(
            '[data-content="faq_title"]',
            content.faq_heading
        );


        /* =====================================
           CONTACT
        ===================================== */

        setText(
            '[data-content="contact_eyebrow"]',
            content.contact_eyebrow
        );

        setText(
            '[data-content="contact_title"]',
            content.contact_heading
        );

        setText(
            '[data-content="contact_description"]',
            content.contact_description
        );


        /* =====================================
           FOOTER
        ===================================== */

        setText(
            '[data-content="footer_description"]',
            content.footer_description
        );


        /* =====================================
           SOCIAL / LEGAL LINKS
        ===================================== */

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
                         background-image:url('${escapeAttr(product.image_url)}');
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
                    ${escapeHTML(
                        String(number).padStart(2, "0")
                    )}
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
                    ${escapeHTML(
                        item.icon || "✓"
                    )}
                </div>

                <h3>
                    ${escapeHTML(
                        item.title || ""
                    )}
                </h3>

                <p>
                    ${escapeHTML(
                        item.description || ""
                    )}
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

            span.className =
                "pill";

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
                    item.title ||
                    "PHOTO";

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

            div.className =
                "quote";

            let person =
                item.customer_name || "";

            if (item.designation) {

                person +=
                    " — " +
                    item.designation;
            }

            div.innerHTML = `

                <p>
                    “${escapeHTML(
                        item.message || ""
                    )}”
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
                        ${escapeHTML(
                            item.question || ""
                        )}
                    </span>

                    <span>
                        +
                    </span>

                </button>

                <div class="faq-answer">

                    ${escapeHTML(
                        item.answer || ""
                    )}

                </div>

            `;

            container.appendChild(div);

        });


        container
            .querySelectorAll(
                ".faq-question"
            )
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

                        item.classList.toggle(
                            "open"
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

            });
    }


    /* =========================================
       SECURITY HELPERS
    ========================================= */

    function escapeHTML(value) {

        return String(value)
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


    function escapeAttr(value) {

        return String(value)
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );
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

                    /* CLIENT */

                    supabase
                        .from("clients")
                        .select("*")
                        .eq("id", clientId)
                        .single(),


                    /* WEBSITE CONTENT */

                    supabase
                        .from("client_website_content")
                        .select("*")
                        .eq("client_id", clientId)
                        .maybeSingle(),


                    /* PRODUCTS */

                    supabase
                        .from("client_products")
                        .select("*")
                        .eq("client_id", clientId)
                        .eq("is_active", true)
                        .order("sort_order"),


                    /* MANUFACTURING */

                    supabase
                        .from(
                            "client_manufacturing_steps"
                        )
                        .select("*")
                        .eq(
                            "client_id",
                            clientId
                        )
                        .eq(
                            "is_active",
                            true
                        )
                        .order(
                            "sort_order"
                        ),


                    /* QUALITY */

                    supabase
                        .from("client_quality")
                        .select("*")
                        .eq(
                            "client_id",
                            clientId
                        )
                        .eq(
                            "is_active",
                            true
                        )
                        .order(
                            "sort_order"
                        ),


                    /* INDUSTRIES */

                    supabase
                        .from("client_industries")
                        .select("*")
                        .eq(
                            "client_id",
                            clientId
                        )
                        .eq(
                            "is_active",
                            true
                        )
                        .order(
                            "sort_order"
                        ),


                    /* GALLERY */

                    supabase
                        .from("client_gallery")
                        .select("*")
                        .eq(
                            "client_id",
                            clientId
                        )
                        .eq(
                            "is_active",
                            true
                        )
                        .order(
                            "sort_order"
                        ),


                    /* TESTIMONIALS */

                    supabase
                        .from("client_testimonials")
                        .select("*")
                        .eq(
                            "client_id",
                            clientId
                        )
                        .eq(
                            "is_active",
                            true
                        )
                        .order(
                            "sort_order"
                        ),


                    /* FAQ */

                    supabase
                        .from("client_faq")
                        .select("*")
                        .eq(
                            "client_id",
                            clientId
                        )
                        .eq(
                            "is_active",
                            true
                        )
                        .order(
                            "sort_order"
                        )
                ]);


            /* =====================================
               CLIENT RESULT
            ===================================== */

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


            /* =====================================
               DATA
            ===================================== */

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


            /* =====================================
               LOG ERRORS FOR CHILD TABLES
            ===================================== */

            results.slice(1).forEach(
                function (result, index) {

                    if (result.error) {

                        console.error(
                            "MDK Runtime: Query error index " +
                            (index + 1),
                            result.error
                        );

                    }

                }
            );


            /* =====================================
               GLOBAL DATA
            ===================================== */

            window.MDKSiteClient =
                client;

            window.MDKClientId =
                client.id;

            window.MDKSiteContent =
                content;


            /* =====================================
               APPLY DATA
            ===================================== */

            applyClient(
                client
            );

            applyWebsiteContent(
                content
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


            /* =====================================
               LOADED STATE
            ===================================== */

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


            /* =====================================
               CLIENT CONTEXT
            ===================================== */

            if (
                window.MDKClientContext
            ) {

                MDKClientContext.set(
                    client
                );
            }


            /* =====================================
               READY EVENT
            ===================================== */

            window.dispatchEvent(
                new CustomEvent(
                    "mdk-site-ready",
                    {
                        detail: {
                            client:
                                client,

                            content:
                                content,

                            products:
                                products,

                            manufacturing:
                                manufacturing,

                            quality:
                                quality,

                            industries:
                                industries,

                            gallery:
                                gallery,

                            testimonials:
                                testimonials,

                            faq:
                                faq
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
```

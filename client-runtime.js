(function () {
    "use strict";

    const SUPABASE_URL =
        "https://ywvdozdoanmcxscfofcf.supabase.co";

    const SUPABASE_KEY =
        "sb_publishable_aAqO96BmDbYivhlgl_3z7g_1orXAscB";

    let runtimeSupabase = null;

    /* ================================
       GET CLIENT ID FROM URL
    ================================= */

    function getClientId() {

        if (
            window.MDKClientContext &&
            typeof MDKClientContext.urlClientId === "function"
        ) {
            return MDKClientContext.urlClientId();
        }

        try {
            return new URLSearchParams(
                window.location.search
            ).get("client");
        } catch (error) {
            return null;
        }
    }


    /* ================================
       SUPABASE
    ================================= */

    function getSupabase() {

        if (runtimeSupabase) {
            return runtimeSupabase;
        }

        if (
            !window.supabase ||
            !window.supabase.createClient
        ) {
            console.error(
                "MDK Runtime: Supabase JS library not loaded."
            );
            return null;
        }

        runtimeSupabase =
            window.supabase.createClient(
                SUPABASE_URL,
                SUPABASE_KEY
            );

        return runtimeSupabase;
    }


    /* ================================
       NESTED VALUE
       Example:
       company_name
       contact.phone
    ================================= */

    function getValue(object, path) {

        if (!object || !path) {
            return null;
        }

        return path
            .split(".")
            .reduce(function (current, key) {

                if (
                    current === null ||
                    current === undefined
                ) {
                    return null;
                }

                return current[key];

            }, object);
    }


    /* ================================
       SIMPLE DATA BINDING

       HTML:
       data-client="company_name"
    ================================= */

    function applySimpleBindings(client) {

        const elements =
            document.querySelectorAll(
                "[data-client]"
            );

        elements.forEach(function (element) {

            const field =
                element.getAttribute(
                    "data-client"
                );

            const value =
                getValue(client, field);

            if (
                value === null ||
                value === undefined ||
                value === ""
            ) {
                return;
            }

            const attribute =
                element.getAttribute(
                    "data-client-attr"
                );

            if (attribute) {

                element.setAttribute(
                    attribute,
                    String(value)
                );

            } else {

                element.textContent =
                    String(value);

            }

        });
    }


    /* ================================
       TEMPLATE BINDING

       HTML:
       data-client-template="{company_name} | Manufacturing"

       Supports:
       {company_name}
       {domain}
       {slug}
    ================================= */

    function applyTemplateBindings(client) {

        const elements =
            document.querySelectorAll(
                "[data-client-template]"
            );

        elements.forEach(function (element) {

            const template =
                element.getAttribute(
                    "data-client-template"
                );

            if (!template) {
                return;
            }

            const result =
                template.replace(
                    /\{([^}]+)\}/g,
                    function (match, field) {

                        const value =
                            getValue(
                                client,
                                field.trim()
                            );

                        if (
                            value === null ||
                            value === undefined
                        ) {
                            return match;
                        }

                        return String(value);
                    }
                );

            element.textContent = result;

        });
    }


    /* ================================
       APPLY ALL WEBSITE BINDINGS
    ================================= */

    function applyClientData(client) {

        if (!client) {
            return;
        }

        applySimpleBindings(client);

        applyTemplateBindings(client);

        document.documentElement.setAttribute(
            "data-client-loaded",
            "true"
        );

        document.body.setAttribute(
            "data-client-id",
            String(client.id)
        );

        console.log(
            "MDK Runtime: Client data applied."
        );
    }


    /* ================================
       LOAD CLIENT
    ================================= */

    async function loadClient() {

        const clientId =
            getClientId();

        /*
         * Normal Template Manager preview
         * has no ?client=
         *
         * So original template remains unchanged.
         */

        if (!clientId) {

            console.log(
                "MDK Runtime: No client parameter. Static template mode."
            );

            return null;
        }


        const sb =
            getSupabase();

        if (!sb) {
            return null;
        }


        console.log(
            "MDK Runtime: Loading client:",
            clientId
        );


        const {
            data,
            error
        } = await sb
            .from("clients")
            .select("*")
            .eq("id", clientId)
            .single();


        if (error) {

            console.error(
                "MDK Runtime Client Error:",
                error
            );

            window.dispatchEvent(
                new CustomEvent(
                    "mdk-site-error",
                    {
                        detail: error
                    }
                )
            );

            return null;
        }


        if (!data) {

            console.error(
                "MDK Runtime: Client not found:",
                clientId
            );

            return null;
        }


        /* Save client globally */

        window.MDKSiteClient =
            data;

        window.MDKClientId =
            data.id;


        /* Save in Client Context */

        if (
            window.MDKClientContext
        ) {

            MDKClientContext.set(
                data
            );
        }


        /* Apply dynamic website data */

        applyClientData(
            data
        );


        /* Website ready event */

        window.dispatchEvent(
            new CustomEvent(
                "mdk-site-ready",
                {
                    detail: data
                }
            )
        );


        console.log(
            "MDK Runtime: Client loaded:",
            data.company_name
        );


        return data;
    }


    /* ================================
       INITIALIZE
    ================================= */

    async function init() {

        try {

            await loadClient();

        } catch (error) {

            console.error(
                "MDK Runtime Fatal Error:",
                error
            );
        }
    }


    /* ================================
       START
    ================================= */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            init,
            {
                once: true
            }
        );

    } else {

        init();
    }

})();

(function(){

    "use strict";


    /* ==========================================
       SUPABASE
    ========================================== */

    const SUPABASE_URL =
        "https://ywvdozdoanmcxscfofcf.supabase.co";


    const SUPABASE_KEY =
        "sb_publishable_aAqO96BmDbYivhlgl_3z7g_1orXAscB";


    let runtimeSupabase = null;


    /* ==========================================
       GET CLIENT ID
    ========================================== */

    function getClientId(){

        if(
            window.MDKClientContext &&
            typeof MDKClientContext.urlClientId ===
                "function"
        ){

            return MDKClientContext.urlClientId();

        }


        try{

            return new URLSearchParams(
                window.location.search
            ).get("client");

        }
        catch(error){

            return null;

        }

    }


    /* ==========================================
       CREATE SUPABASE
    ========================================== */

    function getSupabase(){

        if(runtimeSupabase){

            return runtimeSupabase;

        }


        if(
            !window.supabase ||
            !window.supabase.createClient
        ){

            console.error(
                "Supabase JS library not loaded."
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


    /* ==========================================
       LOAD CLIENT
    ========================================== */

    async function loadClient(){

        const clientId =
            getClientId();


        /*
           Normal website without ?client=
           doesn't need platform client loading.
        */

        if(!clientId){

            console.log(
                "MDK Runtime: No client parameter."
            );

            return null;

        }


        const sb =
            getSupabase();


        if(!sb){

            return null;

        }


        console.log(
            "MDK Runtime: Loading client:",
            clientId
        );


        const {
            data,
            error
        } =
        await sb
            .from("clients")
            .select("*")
            .eq(
                "id",
                clientId
            )
            .single();


        if(error){

            console.error(
                "MDK Runtime Client Error:",
                error
            );

            window.dispatchEvent(
                new CustomEvent(
                    "mdk-site-error",
                    {
                        detail:error
                    }
                )
            );

            return null;

        }


        if(!data){

            console.error(
                "MDK Runtime: Client not found:",
                clientId
            );

            return null;

        }


        /*
           Save active client.
        */

        if(
            window.MDKClientContext
        ){

            MDKClientContext.set(
                data
            );

        }


        /*
           Global client object.
        */

        window.MDKSiteClient =
            data;


        /*
           Helpful shortcut.
        */

        window.MDKClientId =
            data.id;


        /*
           Fire ready event.
        */

        window.dispatchEvent(
            new CustomEvent(
                "mdk-site-ready",
                {
                    detail:data
                }
            )
        );


        console.log(
            "MDK Runtime: Client loaded:",
            data.company_name
        );


        return data;

    }


    /* ==========================================
       INIT
    ========================================== */

    async function init(){

        try{

            await loadClient();

        }
        catch(error){

            console.error(
                "MDK Runtime Fatal Error:",
                error
            );

        }

    }


    /* ==========================================
       START
    ========================================== */

    if(
        document.readyState ===
        "loading"
    ){

        document.addEventListener(
            "DOMContentLoaded",
            init,
            {
                once:true
            }
        );

    }
    else{

        init();

    }


})();

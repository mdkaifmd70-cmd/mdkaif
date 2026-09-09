(function(){

    "use strict";


    const KEY =
        "mdkaif_active_client";


    /* ==========================================
       GET CLIENT ID FROM URL
    ========================================== */

    function getUrlClientId(){

        try{

            const params =
                new URLSearchParams(
                    window.location.search
                );

            return params.get("client");

        }
        catch(error){

            console.error(
                "URL client ID error:",
                error
            );

            return null;

        }

    }


    /* ==========================================
       API
    ========================================== */

    const API = {


        /* --------------------------------------
           SET CLIENT
        -------------------------------------- */

        set(client){

            if(
                !client ||
                !client.id
            ){

                return false;

            }


            localStorage.setItem(
                KEY,
                JSON.stringify(client)
            );


            window.dispatchEvent(
                new CustomEvent(
                    "mdk-client-changed",
                    {
                        detail:client
                    }
                )
            );


            return true;

        },


        /* --------------------------------------
           GET CLIENT
        -------------------------------------- */

        get(){

            try{

                return JSON.parse(
                    localStorage.getItem(
                        KEY
                    ) || "null"
                );

            }
            catch(error){

                console.error(
                    "Client context read error:",
                    error
                );

                return null;

            }

        },


        /* --------------------------------------
           GET CLIENT ID
           URL gets priority
        -------------------------------------- */

        id(){

            const urlClientId =
                getUrlClientId();


            if(urlClientId){

                return urlClientId;

            }


            const client =
                this.get();


            return client
                ? client.id
                : null;

        },


        /* --------------------------------------
           URL CLIENT ID
        -------------------------------------- */

        urlClientId(){

            return getUrlClientId();

        },


        /* --------------------------------------
           CLEAR
        -------------------------------------- */

        clear(){

            localStorage.removeItem(
                KEY
            );


            window.dispatchEvent(
                new CustomEvent(
                    "mdk-client-changed",
                    {
                        detail:null
                    }
                )
            );

        },


        /* --------------------------------------
           REQUIRE CLIENT
        -------------------------------------- */

        require(){

            const client =
                this.get();


            if(!client){

                alert(
                    "Please select a client first."
                );

                return null;

            }


            return client;

        }

    };


    window.MDKClientContext =
        API;


})();

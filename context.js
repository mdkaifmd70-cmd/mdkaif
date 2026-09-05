(function () {
    "use strict";

    const STORAGE_KEY = "mdkaif_active_client";

    const MDKClientContext = {

        // Save selected client
        set: function (client) {
            if (!client || !client.id) {
                console.error("Invalid client data.");
                return false;
            }

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(client)
            );

            // Notify other pages/components
            window.dispatchEvent(
                new CustomEvent("mdk-client-changed", {
                    detail: client
                })
            );

            return true;
        },

        // Get selected client
        get: function () {
            try {
                const data = localStorage.getItem(STORAGE_KEY);

                if (!data) {
                    return null;
                }

                return JSON.parse(data);

            } catch (error) {
                console.error(
                    "Client context read error:",
                    error
                );

                return null;
            }
        },

        // Get selected client ID
        id: function () {
            const client = this.get();

            return client ? client.id : null;
        },

        // Clear selected client
        clear: function () {

            localStorage.removeItem(STORAGE_KEY);

            window.dispatchEvent(
                new CustomEvent("mdk-client-changed", {
                    detail: null
                })
            );
        },

        // Check whether client is selected
        require: function () {

            const client = this.get();

            if (!client) {

                alert(
                    "Please select a client first."
                );

                return null;
            }

            return client;
        },

        // Check selected client
        exists: function () {
            return this.get() !== null;
        }
    };

    // Make globally available
    window.MDKClientContext = MDKClientContext;

})();

class ConstantsClass {
    API_BASE_URL = "https://dispatcher-api.zipjet.co.uk/v1/";
    API_KEY      = "b3b9c41a3c496bfcfc5ea1618f14878904fb0ca1";

    getApiBaseUrl() {
        return this.API_BASE_URL.replace('//', '//intwash:cleanmeup@');
    }
};

export let Constants = new ConstantsClass();
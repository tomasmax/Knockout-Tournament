// manages get and post http request to the back end

var KnockoutTournament = KnockoutTournament || {};

(function (KnockoutTournament) {
    KnockoutTournament.httpRequestManager = class httpRequestManager {

        // http get request
        static get(url, params) {

            const options = {
                method: 'GET',
            };

            if (params) {
                // add params to the
                url += "?" + httpRequestManager._toQueryString(params);
            }

            return window.fetch(url, options);
        }

        // http post request
        static post(url, data) {

            const options = {
                method: 'POST',
                headers: {
                    'content-type': 'application/x-www-form-urlencoded'
                }
            };

            if (data) {
                options.body = httpRequestManager._toQueryString(data);
            }

            return window.fetch(url, options);
        }

        // creates a query string for the request
        static _toQueryString(data) {

            const dataKeys = Object.keys(data);
            let queryString = "";

            for (let i = 0; i < dataKeys.length; i++) {

                let lastElement = (i === (dataKeys.length - 1));
                let dataKey = dataKeys[i];
                let dataValue = data[dataKey];

                if (Array.isArray(dataValue)) {

                    for (let j = 0; j < dataValue.length; j++) {

                        queryString += dataKey + "=" + dataValue[j];

                        if (j !== (dataValue.length - 1)) {
                            queryString += "&";
                        } else {
                            if (!lastElement) {
                                queryString += "&";
                            }
                        }
                    }
                } else {

                    queryString += dataKey + "=" + dataValue;

                    if (!lastElement) {
                        queryString += "&";
                    }
                }
            }

            return queryString;
        }
    }

})(KnockoutTournament);

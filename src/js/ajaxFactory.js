/* wrapper for $http service */
crwApp.factory('ajaxFactory', ['$http', '$q', function ($http, $q) {
    // defaults for all communication
    $http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";
    $http.defaults.transformRequest = jQuery.param;
    var httpDefaults = {
        method: 'POST',
        url: crwBasics.ajaxUrl
    };

    var nonces = {};

    // web server error messages
    var serverError = function (response) {
        return $q.reject({
            error: 'server error',
            debug: 'status ' + response.status
        });
    };

    // look for error messages received from server
    // or return the data object
    var inspectResponse = function (response, nonceGroup) {
        var error = false;
        // look for admin-ajax.php errors
        if (typeof response.data !== 'object') {
            error = {error: 'malformed request'};
        // look for php execution errors
        } else if (response.data.error) {
            error = response.data;
        }
        if (error) {
            return $q.reject(error);
        }
        if (response.data.nonce) {
            nonces[nonceGroup] = response.data.nonce;
        }
        return response.data;
    };

    return {
        // for initial nonces transmitted with html code
        setNonce: function (nonce, nonceGroup) {
            nonces[nonceGroup] = nonce;
        },

        // data must be an object and at least contain data.action
        http: function (data, nonceGroup) {
            return $http(angular.extend({
                data: angular.extend({
                    _crwnonce: nonces[nonceGroup]
                }, data)
            }, httpDefaults)).then(function (response) {
                return inspectResponse(response, nonceGroup);
            }, serverError);
        }
    };
}]);
var BASE_URL = "https://sidthesloth92.github.io/progressive_web_app/" + "data/"

var PAGE_ROUTES = {
    ALL: "items"
};

document.querySelector('.menu_button').addEventListener('click', function(event) {
    document.querySelector('.menu').classList.toggle('active');
});
var category_items = document.querySelectorAll('.category_item');

for (var i = 0; i < category_items.length; i++) {
    category_items[i].addEventListener('click', function(event) {
        document.querySelector('.menu').classList.toggle('active');
    });
}

angular.module("myApp", []).controller('MainController', MainController);

MainController.$inject = ['$scope', '$rootScope', '$q', '$http'];


function MainController($scope, $rootScope, $q, $http) {

    $scope.items = [];
    $scope.getItems = getItems;

    function getItems(url) {
        var requestURL = BASE_URL + url + ".json";
        $http({
            method: 'GET',
            url: requestURL,
            headers: {
                'Accept': 'application/json',
                'Cache-control': 'no-cache|no-cache'
            }
        }).then(function(response) {
            console.log("The response from the backend is : ", response);
            $scope.items = response.data.items;
        }, function(error) {
            console.log("An error occurred while contacting the backend ", error);
        });
    }

    getItems('all');
}


if (navigator.serviceWorker) {
    console.log("ServiceWorkers are supported");


    navigator.serviceWorker.register('sw.js', {
            scope: './'
        })
        .then(function(reg) {
            console.log("ServiceWorker registered ◕‿◕", reg);
            registerBroadcastReceiver();
        })
        .catch(function(error) {
            console.log("Failed to register ServiceWorker ಠ_ಠ", error);
        });
}

function registerBroadcastReceiver() {
    navigator.serviceWorker.onmessage = function(event) {
        console.log("Broadcasted from SW : ", event.data);

        var data = event.data;

        if (data.command == "updateItems") {
            //updateItems(data.items);
        }
    };
}

function updateItems(items) {
    console.log("updateItems : ", items);
    setTimeout(function() {
        angular.element(document.getElementById('app')).scope().items = items;
        angular.element(document.getElementById('app')).scope().$apply();
    }, 3000);
}



function requestNotificationPermission() {
    Notification.requestPermission(function(result) {
        console.log("Notification permission : ", result);
    });
}

var menu;
window.onload = function() {

    menu = document.querySelector('.menu');
    if (navigator.onLine) {
        menu.style.background = "#E5637C";
    } else {
        menu.style.background = "rgba(238, 238, 238, 0.7)";
    }

    window.ononline = function(e) {
        menu.style.background = "#E5637C";
        console.log('online');
    };

    window.onoffline = function(e) {
        console.log('offline');
        menu.style.background = "rgba(238, 238, 238, 0.7)";
    };
};

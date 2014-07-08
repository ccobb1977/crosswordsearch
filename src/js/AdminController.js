/* wrapper controller */
crwApp.controller("AdminController", ['$scope', '$routeParams', '$location', 'qStore', 'crosswordFactory',
		function ($scope, $routeParams, $location, qStore, crosswordFactory) {
    $scope.crw = crosswordFactory.getCrw();
    $scope.immediateStore = qStore.addStore();

    $scope.$routeParams = $routeParams;
    $scope.setActive = function (tabHash) {
        $location.path(tabHash);
    };
}]);

/* controller for Options tab: assign capabilities to roles */
crwApp.controller("OptionsController", ['$scope', 'ajaxFactory',
		function ($scope, ajaxFactory) {
    var optionsContext = 'options';

    // initial load after the nonce has been processed
    $scope.prepare = function (nonce) {
        ajaxFactory.setNonce(nonce, optionsContext);
        ajaxFactory.http({
            action: 'get_crw_capabilities'
        }, optionsContext).then(function (data) {
            $scope.capabilities = data.capabilities;
        }, function (error) {
            $scope.capError = error;
        });
    };

    $scope.updateCaps = function () {
        ajaxFactory.http({
            action: 'update_crw_capabilities',
            capabilities: angular.toJson($scope.capabilities)
        }, optionsContext).then(function (data) {
            $scope.capError = null;
            $scope.capsEdit.$setPristine();
            $scope.capabilities = data.capabilities;
        }, function (error) {
            $scope.capError = error;
        });
    };
}]);

/* controller for administrative tab: adding/deleting projects, managing users */
crwApp.controller("EditorController", ['$scope', '$filter', 'ajaxFactory',
		function ($scope, $filter, ajaxFactory) {
    var adminContext = 'admin';

    // load data freshly received from the server
    var showLoaded = function (admin, selected) {
        $scope.admin = admin;
        // flag for unsaved editor entries
        angular.forEach($scope.admin.projects, function (project) {
            project.pristine = true;
        });
        if (selected) {
            $scope.selectedProject = jQuery.grep($scope.admin.projects, function (project) {
                return project.name === selected;
            })[0];
        } else {
            $scope.selectedProject = $filter('orderBy')($scope.admin.projects, 'name')[0];
        }
        $scope.newProject = null;
        $scope.addingProject = false;
        $scope.editorsSaveError = null;
    };

    // initial load after the nonce has been processed
    $scope.prepare = function (nonce) {
        ajaxFactory.setNonce(nonce, adminContext);
        ajaxFactory.http({
            action: 'get_admin_data'
        }, adminContext).then(showLoaded, function (error) {
            $scope.loadError = error;
        });
    };

    // users not enabled for the selected project (contains user objects)
    $scope.filtered_users = [];
    // users enabled for the selected project (contains user ids)
    $scope.current_users = [];

    $scope.$watch('selectedProject', function (newSel) {
        if (newSel) {
            $scope.current_users = angular.copy(newSel.editors) || [];
        } else {
            $scope.current_users = null;
        }
    });

    // get user lists and their model data up to speed
    $scope.$watchCollection('current_users', function () {
        if (!$scope.admin) {
            return;
        }
        $scope.filtered_users = jQuery.grep($scope.admin.all_users, function (user) {
            if ($scope.selectedProject) {
                return jQuery.inArray(user.user_id, $scope.current_users) < 0;
            } else {
                return true;
            }
        });
        $scope.selectedEditor = $filter('orderBy')($scope.current_users, $scope.getUserName)[0];
        $scope.selectedUser = $filter('orderBy')($scope.filtered_users, 'user_name')[0];
        $scope.loadError = null;
        $scope.projectSaveError = null;
    });

    var addUser = function (user) {
        $scope.current_users.push(user.user_id);
    };

    // fetch a user object by id
    var getUser = function (id) {
        return jQuery.grep($scope.admin.all_users, function (user) {
            return user.user_id === id;
        })[0];
    };

    // fetch a user name by id
    $scope.getUserName = function (id) {
        return getUser(id).user_name;
    };

    // extract the list of project names from the admin object
    $scope.getProjectList = function () {
        return jQuery.map($scope.admin.projects, function (project) {
            return project.name;
        });
    };

    // enable all users for the current project
    $scope.addAll = function () {
        angular.forEach($scope.filtered_users, addUser);
        $scope.selectedProject.pristine = false;
    };

    // enable a user for the current project
    $scope.addOne = function () {
        var selected = $scope.selectedUser.user_id;
        addUser($scope.selectedUser);
        $scope.selectedProject.pristine = false;
        $scope.selectedEditor = selected;
    };

    // disable all users for the current project
    $scope.removeAll = function () {
        $scope.current_users.splice(0);
        $scope.selectedProject.pristine = false;
    };

    // disable a user for the current project
    $scope.removeOne = function () {
        var index = jQuery.inArray($scope.selectedEditor, $scope.current_users),
            selected = getUser($scope.selectedEditor);
        $scope.current_users.splice(index, 1);
        $scope.selectedProject.pristine = false;
        $scope.selectedUser = selected;
    };

    // add a new project to the server
    $scope.saveProject = function () {
        ajaxFactory.http({
            action: 'add_project',
            project: $scope.newProject
        }, adminContext).then(function (data) {
            showLoaded(data, $scope.newProject);
        }, function (error) {
            $scope.projectSaveError = error;
        });
    };

    // reset project column
    $scope.abortProject = function () {
        $scope.newProject = null;
        $scope.projectSaveError = null;
        $scope.addingProject = false;
    };

    // remove a project from the server
    $scope.deleteProject = function () {
        var message = {
            which: 'remove_project',
            project: $scope.selectedProject.name
        };
        $scope.immediateStore.newPromise('actionConfirmation', message).then(function () {
            ajaxFactory.http({
                action: 'remove_project',
                project: $scope.selectedProject.name
            }, adminContext).then(showLoaded, function (error) {
                $scope.projectSaveError = error;
            });
        });
    };

    // update editors list for current project on the server
    $scope.saveEditors = function () {
        ajaxFactory.http({
            action: 'update_editors',
            project: $scope.selectedProject.name,
            editors: angular.toJson($scope.current_users)
        }, adminContext).then(function (data) {
            showLoaded(data, $scope.selectedProject.name);
        }, function (error) {
            $scope.editorsSaveError = error;
        });
    };

    // reset editors column
    $scope.abortEditors = function () {
        $scope.current_users = angular.copy($scope.selectedProject.editors);
        $scope.editorsSaveError = null;
        $scope.selectedProject.pristine = true;
    };
}]);

// catch group selection at option level, i. e. after crossword selection
crwApp.directive('crwOptionClick', function () {
    return {
        link: function (scope, element, attrs) {
            element.on('click', 'option', function () {
                scope.$apply(function () {
                    scope.activateGroup(attrs.crwOptionClick);
                });
            });
        }
    };
});

/* controller for Review tab: review, approve or delete crosswords */
crwApp.controller("ReviewController", ['$scope', '$filter', 'ajaxFactory',
		function ($scope, $filter, ajaxFactory) {
    var reviewContext = 'review';
    $scope.selectedCrossword = { confirmed: null, pending: null };
    $scope.activeGroup = 'confirmed';

    // load data freshly received from the server
    var showLoaded = function (data, selected) {
        var newSelected;
        $scope.projects = data.projects;
        if (selected) {
            newSelected = jQuery.grep($scope.projects, function (project) {
                return project.name === selected;
            })[0];
        }
        if (newSelected) {
            $scope.selectedProject = newSelected;
        } else {
            $scope.selectedProject = $filter('orderBy')($scope.projects, 'name')[0];
        }
        $scope.reviewError = null;
    };

    // initial load after the nonce has been processed
    $scope.prepare = function (nonceCrossword, nonceReview) {
        ajaxFactory.setNonce(nonceCrossword, 'crossword');
        ajaxFactory.setNonce(nonceReview, reviewContext);
        ajaxFactory.http({
            action: 'list_projects_and_riddles'
        }, reviewContext).then(showLoaded, function (error) {
            $scope.reviewError = error;
        });
    };

    // delete a crossword from its group
    $scope.deleteCrossword = function (group) {
        var message = {
            which: 'delete_crossword',
            crossword: $scope.selectedCrossword[group],
            project: $scope.selectedProject.name
        };
        $scope.immediateStore.newPromise('actionConfirmation', message).then(function () {
            ajaxFactory.http({
                action: 'delete_crossword',
                project: $scope.selectedProject.name,
                name: $scope.selectedCrossword[group]
            }, reviewContext).then(function (data) {
                showLoaded(data, $scope.selectedProject.name);
            }, function (error) {
                $scope.reviewError = error;
            });
        });
    };

    // move a crossword from pending to confirmed group
    $scope.confirm = function () {
        var name = $scope.selectedCrossword.pending;
        var message = {
            which: 'approve_crossword',
            crossword: name,
            project: $scope.selectedProject.name
        };
        $scope.immediateStore.newPromise('actionConfirmation', message).then(function () {
            ajaxFactory.http({
                action: 'approve_crossword',
                project: $scope.selectedProject.name,
                name: name
            }, reviewContext).then(function (data) {
                showLoaded(data, $scope.selectedProject.name);
                $scope.selectedCrossword.confirmed = name;
                $scope.selectedCrossword.pending = $filter('orderBy')($scope.selectedProject.pending, 'toString()')[0];
                $scope.activateGroup('confirmed');
            }, function (error) {
                $scope.reviewError = error;
            });
        });
    };

    // adjust previewCrossword on group change
    $scope.activateGroup = function (group) {
        $scope.activeGroup = group;
        $scope.previewCrossword = $scope.selectedCrossword[group];
    };

    // on project selection:
    $scope.$watch('selectedProject', function (newSel) {
        if (newSel) {
            // alert preview CrosswordController of new project
            if ($scope.preview) {
                $scope.$broadcast('previewProject', newSel.name);
            }
            // adjust crossword selection
            angular.forEach($scope.selectedCrossword, function (name, group) {
                if (!name || jQuery.inArray(name, newSel[group]) < 0) {
                    $scope.selectedCrossword[group] = $filter('orderBy')(newSel[group], 'toString()')[0];
                }
            });
        }
    });

    // init preview CrosswordController
    $scope.$watch('preview', function (newPre) {
        if (newPre && $scope.selectedProject) {
            $scope.$evalAsync(function (scope) {
                $scope.$broadcast('previewProject', $scope.selectedProject.name);
                $scope.previewCrossword = $scope.selectedCrossword[$scope.activeGroup];
                $scope.$broadcast('previewCrossword', $scope.previewCrossword);
            });
        }
    });

    // adjust previewCrossword on groupwise selection change
    $scope.$watchCollection('selectedCrossword', function (newSc) {
        $scope.previewCrossword = newSc[$scope.activeGroup];
    });

    // pass previewCrossword on to CrosswordController only
    // on real data change
    $scope.$watch('previewCrossword', function (newName) {
        if ($scope.preview) {
            $scope.$broadcast('previewCrossword', newName);
        }
    });
}]);

/* route configuration */
crwApp.config(function($routeProvider) {
    var path = '';
    $routeProvider.when('/:tab/:nonce', {
        templateUrl: function ($routeParams) {
            path = $routeParams.tab + '/' + $routeParams.nonce;
            return crwBasics.ajaxUrl + '?action=get_option_tab&tab=' +
                    $routeParams.tab + '&_crwnonce=' + $routeParams.nonce;
        }
    }).otherwise({
        // use the last valid path
        redirectTo: function () {
            return path;
        }
    });
});

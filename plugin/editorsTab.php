    <div class="crw-editors" ng-controller="EditorController" ng-init="prepare('<?php echo wp_create_nonce(NONCE_EDITORS); ?>')">
        <table class="crw-options">
            <tr>
                <th><?php _e('Projects', 'crw-text') ?></th>
                <th class="between"></th>
                <th><?php _e('Full project editors', 'crw-text') ?></th>
                <th class="between"></th>
                <th><?php _e('Other users with full editor rights', 'crw-text') ?></th>
            </tr>
            <tr>
                <td class="project">
                    <select size="10" ng-model="selectedProject" ng-options="project.name for project in admin.projects | orderBy:'name'" ng-disabled="!selectedProject.pristine"></select>
                </td>
                <td class="between"><?php _e('can be used by', 'crw-text') ?></td>
                <td class="username">
                    <select size="10" ng-model="selectedEditor" ng-options="getUserName(id) for id in current_users | orderBy:getUserName"></select>
                </td>
                <td class="between">
                    <button title="<?php _e('Add all users to the editors of the marked project', 'crw-text') ?>" ng-click="addAll()" ng-disabled="!selectedProject || addingProject || !filtered_users.length">&lt;&lt;</button><br />
                    <button title="<?php _e('Add the marked user to the editors of the marked project', 'crw-text') ?>" ng-click="addOne()" ng-disabled="!selectedProject || addingProject || !filtered_users.length">&lt;</button><br />
                    <button title="<?php _e('Remove the marked user from the editors of the marked project', 'crw-text') ?>" ng-click="removeOne()" ng-disabled="!selectedProject || addingProject || !current_users.length">&gt;</button><br />
                    <button title="<?php _e('Remove all users from the editors of the marked project', 'crw-text') ?>" ng-click="removeAll()" ng-disabled="!selectedProject || addingProject || !current_users.length">&gt;&gt;</button>
                </td>
                <td class="username">
                    <select size="10" ng-model="selectedUser" ng-options="user.user_name for user in filtered_users | orderBy:'user_name'"></select>
                </td>
            </tr>
            <tr class="actions">
                <td>
                    <form name="projectModify">
                    <button title="<?php _e('Delete the selected project', 'crw-text') ?>" ng-click="deleteProject()" ng-disabled="addingProject || !selectedProject || !selectedProject.pristine">−</button>
                    <button title="<?php _e('Add a new project', 'crw-text') ?>" ng-click="addingProject=true" ng-disabled="addingProject || (selectedProject && !selectedProject.pristine)">+</button><br />
                    <input class="project" type="text" name="name" ng-show="addingProject" ng-model="newProject" ng-minlength="4" ng-maxlength="255" required="" crw-add-parsers="sane unique" crw-unique="getProjectList()"></input>
                    <p class="error" ng-show="addingProject">
                        <span ng-show="projectModify.$error.required && !(projectModify.$error.sane || projectModify.$error.unique)"><?php _e('You must give a name!', 'crw-text') ?></span>
                        <span ng-show="projectModify.$error.minlength"><?php _e('The name is too short!', 'crw-text') ?></span>
                        <span ng-show="projectModify.$error.maxlength"><?php _e('You have exceeded the maximum length for a name!', 'crw-text') ?></span>
                        <span ng-show="projectModify.$error.unique"><?php _e('There is already another project with that name!', 'crw-text') ?></span>
                        <span ng-show="projectModify.$error.sane"><?php _e('Dont\'t try to be clever!', 'crw-text') ?></span>
                        <span ng-show="projectModify.$valid">&nbsp;</span>
                    </p>
                    <button class="text" title="<?php _e('Save the new project name', 'crw-text') ?>" ng-click="saveProject()" ng-show="addingProject" ng-disabled="!projectModify.$valid"><?php _e('Save', 'crw-text') ?></button>
                    <button class="text" title="<?php _e('Abort saving the project name', 'crw-text') ?>" ng-click="abortProject()" ng-show="addingProject"><?php _e('Abort', 'crw-text') ?></button><br />
                    <p class="error" ng-if="projectSaveError">{{projectSaveError.error}}</p>
                    <p class="error" ng-repeat="msg in projectSaveError.debug">{{msg}}</p>
                    </form>
                </td>
                <td class="between"></td>
                <td>
                    <button class="text" title="<?php _e('Save the editor list for this project', 'crw-text') ?>" ng-click="saveEditors()" ng-disabled="(selectedProject && selectedProject.pristine) || addingProject"><?php _e('Save', 'crw-text') ?></button>
                    <button class="text" title="<?php _e('Abort saving the editor list', 'crw-text') ?>" ng-click="abortEditors()" ng-disabled="(selectedProject && selectedProject.pristine) || addingProject"><?php _e('Abort', 'crw-text') ?></button>
                    <p class="error" ng-if="editorsSaveError">{{editorsSaveError.error}}</p>
                    <p class="error" ng-repeat="msg in editorsSaveError.debug">{{msg}}</p>
                </td>
            </tr>
        </table>
        <p class="error" ng-if="loadError">{{loadError.error}}</p>
        <p class="error" ng-repeat="msg in loadError.debug">{{msg}}</p>
    </div>
    <div class="crw-editors" ng-controller="OptionsController" ng-init="prepare('<?php echo wp_create_nonce(NONCE_OPTIONS); ?>')">
        <p><?php _e('Riddles saved by restricted editors need the approval of full editors before they can appear for other users.', 'crw-text') ?></p>
        <p><?php _e('Full editors can only act on the projects they are assigned to.', 'crw-text') ?></p>
        <form name="capsEdit">
        <table class="widefat">
            <thead>
            <tr>
                <th rowspan="2"><?php _e('Roles', 'crw-text') ?></th>
                <th colspan="3"><?php _e('Editing rights', 'crw-text') ?></th>
            </tr>
            <tr>
                <th class="radiocol"><?php _e('none', 'crw-text') ?></th>
                <th class="radiocol"><?php _e('restricted', 'crw-text') ?></th>
                <th class="radiocol"><?php _e('full', 'crw-text') ?></th>
            </tr>
            </thead>
            <tbody>
            <tr ng-repeat="role in capabilities">
                <td>{{role.local}}</td>
                <td class="radiocol"><input type="radio" name="{{role.name}}" ng-model="role.cap" value=""></input></td>
                <td class="radiocol"><input type="radio" name="{{role.name}}" ng-model="role.cap" value="<?php echo CRW_CAP_UNCONFIRMED ?>"></input></td>
                <td class="radiocol"><input type="radio" name="{{role.name}}" ng-model="role.cap" value="<?php echo CRW_CAP_CONFIRMED ?>"></input></td>
            </tr>
            </tbody>
        </table>
        <p><button class="text" title="<?php _e('Save the updated assignment of editing capabilities', 'crw-text') ?>" ng-click="updateCaps()" ng-disabled="(capsEdit.$pristine)"><?php _e('Save', 'crw-text') ?></button>
        <p class="error" ng-if="capError">{{capError.error}}</p>
        <p class="error" ng-repeat="msg in capError.debug">{{msg}}</p>
        </form>
    </div>
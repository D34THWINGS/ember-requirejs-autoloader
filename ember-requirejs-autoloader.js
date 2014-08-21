/**
 * Ember autoloader with RequireJS.
 *
 * @version : 1.0.0
 * @author : Benjamin Delamarre
 * @email : d34thwings@gmail.com
 *
 * Just require the ember-autoloader.js in your RequireJS configuration and
 * require it in your main javascript file. Finally call the autoloader function
 * with your custom options like so :
 *
 * require(['ember', 'ember-autoloader'], function (Ember, autoloader) {
 *      autoloader({
 *          appName: 'MyEmberApp'
 *      });
 * ));
 *
 * @licence The MIT License (MIT)
 *
 *          Copyright (c) 2014 Benjamin Delamarre
 *
 *          Permission is hereby granted, free of charge, to any person obtaining a copy
 *          of this software and associated documentation files (the "Software"), to deal
 *          in the Software without restriction, including without limitation the rights
 *          to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *          copies of the Software, and to permit persons to whom the Software is
 *          furnished to do so, subject to the following conditions:
 *
 *          The above copyright notice and this permission notice shall be included in
 *          all copies or substantial portions of the Software.
 *
 *          THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *          IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *          FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *          AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *          LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *          OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *          THE SOFTWARE.
 *
 **/

// Export module
define(['ember', 'jquery'], function (Ember, $) {
    return Ember.Object.extend({

        init: function (options) {

            /**
             * Function that builds the route tree from a routeContainer.
             *
             * @private
             * @param {Object} routeContainer =>    An object that contains routes in an Array.
             *                                      Routes can be stored as Strings or Objects.
             *                                      Object routes must contain the route name
             *                                      and may contain some route options and child routes.
             *                                      Child routes must be stored as an array.
             */
            this._getRoutes = function (routeContainer) {
                var self = this;

                if (routeContainer.routes instanceof Array) {
                    routeContainer.routes.forEach(function (route) {
                        if (typeof(route) === "string") {
                            self.route(route);
                        }
                        if (typeof(route) === "object") {
                            if (typeof(route.name) === "undefined") {
                                console.warn('Your configuration file contains a route object without a name.');
                                return;
                            }

                            var args = [route.name], type = 'route';
                            if (typeof(route.type) != "undefined")
                                type = route.type;
                            if (typeof(route.options) === "object")
                                args.push(route.options);
                            if (route.routes instanceof Array)
                                args.push(function () {
                                    this.routeMapping = self.routeMapping;
                                    self.routeMapping.call(this, route);
                                });

                            if (type == 'route')
                                self.route.apply(self, args);
                            if (type == 'resource') {
                                self.resource.apply(self, args);
                            }
                        }
                    });
                }
            };

            // Base settings
            var BaseSettings = Ember.Object.extend({
                appName: 'EmberApp',
                appFilePath: '../app.json',
                autoload: ['controllers', 'models', 'views'],
                app: {},
                router: Ember.Router.extend({}),
                beforeCreate: null,
                afterCreate: null,
                routeMapping: this._getRoutes,
                afterRouteMapping: null,
                deferred: false,
                autoCreate: true
            });

            var ExtendedSettings = BaseSettings.extend(options || {});

            /**
             * Contains the default value off all settings of the autoloader.
             *
             * @private
             * @type {BaseSettings}
             */
            this._baseSettings = new BaseSettings();

            /**
             * Contains the current settings of the autoloader.
             *
             * @type {ExtendedSettings}
             */
            this.settings = new ExtendedSettings();

            /**
             * The application components stored in the autoloader.
             */
            this.App = this.settings.app;


            /**
             * Contains the configuration file once loaded.
             **/
            this.appJSON = null;

            // Auto-load at the end of the constructor if not set as deferred.
            if (!this.settings.deferred)
                this.loadApp();
        },

        /**
         * Returns the base settings of the autoloader.
         *
         * @returns {Object}
         */
        getBaseSettings: function (property) {
            if (typeof(property) != "undefined")
                return this._baseSettings.get(property);
            return this._baseSettings;
        },

        /**
         * Run the autoloader.
         */
        loadApp: function () {
            var autoloader = this;

            // Load the JSON file
            $.getJSON(autoloader.settings.appFilePath, function (appJSON) {
                var App = autoloader.App;
                App.Router = autoloader.settings.router;
                autoloader.appJSON = appJSON;

                // Set application's name
                if (typeof(appJSON.app_name) === "string")
                    autoloader.settings.appName = appJSON.app_name;

                // Additional includes
                if (typeof(appJSON['includes']) != "undefined" && appJSON['includes'] instanceof Array) {
                    require(appJSON['includes']);
                }

                // Router auto-build
                App.Router.map(function () {
                    var self = this;

                    // Save the original router auto-build into the called function.
                    self.routeMapping = autoloader._getRoutes;

                    // Auto-build router
                    if (typeof(autoloader.settings.routeMapping) === "function")
                        autoloader.settings.routeMapping.call(this, appJSON);

                    // Auto-build callback
                    if (typeof(autoloader.settings.afterRouteMapping) === "function")
                        autoloader.settings.afterRouteMapping.call(this, appJSON);
                });

                // Controllers, models and views autoload
                var modules = { names: [], paths: [] };
                autoloader.settings.autoload.forEach(function (componentType) {
                    if (appJSON[componentType] instanceof Array) {
                        appJSON[componentType].forEach(function (component) {
                            // Controller loaded and named by filename
                            if (typeof(component) === "string") {
                                modules.names.push(component.split('/')[component.split('/').length - 1]);
                                modules.paths.push(component);
                            }
                            // Controller loaded and name by given name
                            if (component instanceof Array) {
                                modules.names.push(component[0]);
                                modules.paths.push(component[1]);
                            }
                        });
                    }
                });
                require(modules.paths, function () {
                    var args = arguments;
                    modules.names.forEach(function (name, i) {
                        App[name] = args[i];
                    });

                    // Application creation after all modules loaded
                    if (autoloader.settings.autoCreate) {
                        autoloader.create(appJSON);
                    }
                });
            });
        },

        /**
         * Creates the ember application using the currently stored app components.
         */
        create: function () {
            if (typeof(this.settings.beforeCreate) === "function")
                this.settings.beforeCreate.call(this.App, this.appJSON);
            var createdApp = window[this.settings.appName] = Ember.Application.create(this.App);
            if (typeof(this.settings.afterCreate) === "function")
                this.settings.afterCreate.call(createdApp, this.appJSON);
        }
    });
});
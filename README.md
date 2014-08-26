Ember RequireJS Autoloader
==========================
___

##Description

A library to autoload your controllers, models, views and build easily your application using RequireJS and jQuery. Also build up your router in a simple way. Easy to use and quick setup.

> Why should I use RequireJS with my Ember app ?

Because your application can come rapidly up to a big mess if you don't split into files and what's more powerfull than RequireJS in JavaScript dependancy management ? I will release soon a starter pack using my library for Ember/RequireJS application but you can already check over there : https://github.com/fernandogmar/Emberjs-RequireJS


##Instalation

With Bower :

```
bower install ember-requirejs-autoloader
```

Or just put the file wherever you want and require it your main script file, but you will need in every case jQuery and Ember. You will have also to define them in your configuration file of RequireJS as `jquery` and `ember`.

##Usage

You will have to create a JSON file named app.json where your application's configuration will be stored. By default place at the root folder of your scripts. Example :

```json
{
	"app_name":     "MyApp",
	"controllers":  ["controllers/ApplicationController"],
	"models":       ["models/User"],
	"views":        ["views/ApplicationView", "views/IndexView"],
	"routes":       [{ "name":"users", "type": "resource" }]
}
```

In your main script file, require first your configuration and apply it, then require just the autoloader and use it.

```javascript

require(["config"], function(config){
    requirejs.config(config);
    require(["autoloader"], function(Autoloader){
        Autoloader();
    });
});

```

If you require to do some additional actions with the autolader, like deferring the application creation to make some modifications :

```javascript

require(["config"], function(config){
    requirejs.config(config);
    require(["autoloader"], function(Autoloader){
        var autoloader = new Autoloader({ autoCreate: false });
        // Do some modifications
        autoloader.create();
    });
});

```

___

##The configuration file

The configuration file accept the following options:
- **app_name** *{String}* : the name that will be used for the export in the `window`. If you set it to `MyApp` then you'll be able to acces it by typing `window.MyApp`.
- **controllers**, **models**, **views**, *{Array}* : an array containing the paths to all you controllers, models and views.
- **routes** *{Array}* : an array containing all the routes of your application. The routes can be stored as `string` or `object` depending of your needs. A route as `string` will automaticaly be declared as a route as a direct child of the application route. An `object` route must have at least a `name` attribute and can also have an `options` attribute and a `routes` attribute where you can store child routes as the same as before.
- **include** *{Array}* : an array containing some additional dependencies which doesn't require to be saved in the app, like a file where you define all your Handlebars helpers.

##The autoloader's options

- **appName** *{String}* : if you need to define the application name by code, use this option and leave it empty in the configuration file.
- **appFilePath** *{String} : if your configuration file path isn't `'../app.json'`, use this option to change it.
- **autoload** *{Array}* : this option allows you to load additional categories like adapters or routes. By default this array contains only `['controllers', 'models', 'views']`. If you add `adapters` to it you'll be able to use it into your *app.json*.
- **app** *{Object}* : you can define a base object that will be used to build your app. For example, if you have an object containing all your `Route` object or maybe some `Transforms` you can store them into a single object and pass it to the autoloader. Careful : the autoloader overides everything with the same name, don't declare your `Router` inside for example. Instead, use the `router` option.
- **router** *{Ember.Router}* : use this option if you want to define a custom router. The autoloader will run even if you define it, so you can define complex routes in the object and simple routes in the *app.json*.
- **beforeCreate** *{Function (appJSON)}* : this function will be called before the application creation when `.create()` is called. Use `this` to access the post creation App object and you'll receive the configuration file as the first argument.
- **afterCreate** *{Function (appJSON)}* : same as `beforeCreate` but ater the use of `.create()` and `this` will return you the `Ember.Application` object.
- **routeMapping** *{Function (appJSON)}* : the function used to auto-build the router. It will receive the content of the *app.json*. You can call the original auto-build function by doing : `this.routeMapping(appJSON)` into your function. Use `this` to access to the router's functions.
- **afterRouteMapping** *{Function (appJSON)} : same as routeMapping but doesn't override the original auto-build.
- **deferred** *{Boolean}* : set to true if you don't want the autoloader to use `.loadApp()` in the `Autoloader` object's constructor.
- **autoCreate** *{Boolean}* : set to false if you don't wan't the autoloader to use automaticly `.create()`.

___

##Methods

- `Autoloader(options)` : creates the autoloader with given options. By default the autoloader will run the load and creation at once.
- `loadApp()` : load all dependencies contained in the configuration file and auto-build the router.
- `create()` : creates an `Ember.Application` object with the `App` object stored in the autoloader.
- `getBaseSettings([property])` : returns all the base settings used by the autoloader or a specific property from it.

##Properties

- `App` : the current built object that will be used while calling `create()`.
- `settings` : the current settings used by the autoloader.
- `appJSON` : the current configuration file content used by the autoloader.

___

Thanks for using my autoloader, i'll release soon a base project repository to quicken up the application setup.
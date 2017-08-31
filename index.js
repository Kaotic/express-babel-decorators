function createDecorator(method) {
    return function decorator(route) {
        return function (target, key) {
            target[key].__expressRoute = {
                method: method,
                route: route
            };
        };
    };
}

'DELETE GET HEAD OPTIONS PATCH POST PUT'.split(' ').forEach(function (method) {
    module.exports[method] = createDecorator(method.toLowerCase());
});

function collectDecoratedMethods(obj) {
    var proto = obj;
    var methods = [];

    do {
        Object.getOwnPropertyNames(proto).forEach(function (prop) {
            if (obj[prop].__expressRoute) {
                var bound = obj[prop].bind(obj);
                bound.__expressRoute = obj[prop].__expressRoute;
                methods.push(bound);
            }
        });

        proto = Object.getPrototypeOf(proto);
    } while (proto !== Object.prototype && proto !== null);

    return methods;
}

exports.bind = function bind(app, controller) {
    collectDecoratedMethods(controller).forEach(function (method) {
        app[method.__expressRoute.method].call(
            app,
            method.__expressRoute.route,
            method
        );
    });
}

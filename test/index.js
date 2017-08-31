const assert = require('assert');
const dec = require('../index');
const http = require('http');
const express = require('express');

'DELETE GET HEAD OPTIONS PATCH POST PUT'.split(' ').forEach(method => {
    describe('#' + method, () => {
        it('decorates a method', () => {
            const obj = {
                getFoo() {
                }
            };

            dec[method]('/foo')(obj, 'getFoo');

            assert.deepStrictEqual(
                obj.getFoo.__expressRoute,
                { method: method.toLowerCase(), route: '/foo' }
            );
        });
    });
});

describe('#bind', () => {
    let got;
    const app = {
        get(route, method) {
            got = { route, method };
        }
    }

    beforeEach(() => {
        got = null;
    });

    it('binds an own property of the object', () => {
        const obj = { getFoo() { } };

        dec.GET('/foo')(obj, 'getFoo');

        dec.bind(app, obj);

        assert.deepStrictEqual(
            got.route,
            '/foo'
        );
        assert(got.method);
    });

    it('binds an inherited property', () => {
        function Bar() {
        }

        Bar.prototype.getFoo = function () { };

        const obj = new Bar();

        dec.GET('/foo')(Bar.prototype, 'getFoo');

        dec.bind(app, obj);

        assert.deepStrictEqual(
            got.route,
            '/foo'
        );
        assert(got.method);
    });
});

describe('express-babel-decorators', () => {
    let server;

    afterEach(() => {
        server.close();
    });

    it('works with express', done => {
        const app = express();

        function MeaningOfLifeController() {

        }

        MeaningOfLifeController.prototype = {
            getMeaningOfLife(req, res) {
                res.type('plain').send('42');
            }
        };

        dec.GET('/meaning')(MeaningOfLifeController.prototype, 'getMeaningOfLife');

        dec.bind(app, new MeaningOfLifeController());

        server = http.createServer(app);
        server.listen(10111);

        http.get('http://localhost:10111/meaning', res => {
            res.setEncoding('utf8');
            res.on('data', data => assert.strictEqual(data, '42'));
            res.on('end', () => done());
        });
    });
});

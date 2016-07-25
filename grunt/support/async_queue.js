(function (module) {
    'use strict';

    module.exports = function (done) {

        var that = this,
            queue = [];

        this.push = function (asyncFn) {
            queue.push(asyncFn);
        };

        this.pushIf = function (condition, asyncFn) {
            if (condition) {
                that.push(asyncFn);
            }
        };

        this.first = this.next = function () {

            if (!queue.length) {
                done();
            } else {
                queue.shift()(that.next);
            }

        };

    };

}(module));
module.exports = fn => {
    return function catchAsyncWrapper(req, res, next) {
        fn(req, res, next).catch(function(err) {
            next(err);
        });
    };
};
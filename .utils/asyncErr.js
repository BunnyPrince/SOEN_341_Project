// Error Handling function
const asyncErr = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(e => {
            next(e)
        })
    }
}
module.exports = asyncErr

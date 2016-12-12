/**
 * Created by Matt on 12/12/2016.
 */

function CreateFunction(owner, func) {
    return function() {
        return func.apply(owner, arguments);
    }
}

module.exports = {CreateFunction};
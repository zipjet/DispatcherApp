export default class Fulfillment {

    reference = '';

    /** @var {Customer} */
    customer = null;

    /** @var {String} */
    rack = '';

    /** @var {ServiceClass} */
    serviceClass = null;

    /** @var {Meta} */
    meta = null;

    /** @var {String} */
    cleaningDueDate = null;

    /** @type {Itemization}
     */
    itemization = null;

    /** @var {Corporate} */
    corporate = null;
}
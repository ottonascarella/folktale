//----------------------------------------------------------------------
//
// This source file is part of the Folktale project.
//
// Licensed under MIT. See LICENCE for full licence information.
// See CONTRIBUTORS for the list of contributors to the project.
//
//----------------------------------------------------------------------

const assertType = require('folktale/helpers/assert-type');
const assertFunction = require('folktale/helpers/assert-function');
const { data, derivations } = require('folktale/core/adt');
const provideAliases = require('folktale/helpers/provide-fantasy-land-aliases');
const warnDeprecation = require('folktale/helpers/warn-deprecation');
const adtMethods = require('folktale/helpers/define-adt-methods');
const extend = require('folktale/helpers/extend');

const { equality, debugRepresentation, serialization } = derivations;


/*~ stability: unstable */
const Maybe = data('folktale:Data.Maybe', {
  /*~
   * type: |
   *   forall a: () => Maybe a
   */
  Nothing() {
  },

  /*~
   * type: |
   *   forall a: (a) => Maybe a
   */
  Just(value) {
    return { value };
  }
}).derive(equality, debugRepresentation, serialization);


const { Nothing, Just } = Maybe;
const assertMaybe = assertType(Maybe);


extend(Just.prototype, {
  /*~
   * isRequired: true
   * type: |
   *   forall a: get (Maybe a) => a
   */
  get value() {
    throw new TypeError('`value` can’t be accessed in an abstract instance of Maybe.Just');
  }
});


/*~~belongsTo: Maybe */
adtMethods(Maybe, {
  /*~
   * type: |
   *   forall a, b: (Maybe a).((a) => b) => Maybe b
   */
  map: {
    /*~*/
    Nothing: function map(transformation) {
      assertFunction('Maybe.Nothing#map', transformation);
      return this;
    },

    /*~*/
    Just: function map(transformation) {
      assertFunction('Maybe.Just#map', transformation);
      return Just(transformation(this.value));
    }
  },


  /*~
   * type: |
   *   forall a, b: (Maybe (a) => b).(Maybe a) => Maybe b
   */
  apply: {
    /*~*/
    Nothing: function apply(aMaybe) {
      assertMaybe('Maybe.Nothing#apply', aMaybe);
      return this;
    },

    /*~*/
    Just: function apply(aMaybe) {
      assertMaybe('Maybe.Just#apply', aMaybe);
      return aMaybe.map(this.value);
    }
  },


  /*~
   * type: |
   *   forall a, b: (Maybe a).((a) => Maybe b) => Maybe b
   */
  chain: {
    /*~*/
    Nothing: function chain(transformation) {
      assertFunction('Maybe.Nothing#chain', transformation);
      return this;
    },

    /*~*/
    Just: function chain(transformation) {
      assertFunction('Maybe.Just#chain', transformation);
      return transformation(this.value);
    }
  },


  /*~
   * type: |
   *   forall a: (Maybe a).() => a :: (throws TypeError)
   */
  unsafeGet: {
    /*~*/
    Nothing: function unsafeGet() {
      throw new TypeError(`Can't extract the value of a Nothing.

    Since Nothing holds no values, it's not possible to extract one from them.
    You might consider switching from Maybe#get to Maybe#getOrElse, or some other method
    that is not partial.
      `);
    },

    /*~*/
    Just: function unsafeGet() {
      return this.value;
    }
  },


  /*~
   * type: |
   *   forall a: (Maybe a).(a) => a
   */
  getOrElse: {
    /*~*/
    Nothing: function getOrElse(_default) {
      return _default;
    },

    /*~*/
    Just: function getOrElse(_default) {
      return this.value;
    }
  },


  /*~
   * type: |
   *   forall a: (Maybe a).((a) => Maybe a) => Maybe a
   */
  orElse: {
    /*~*/
    Nothing: function orElse(handler) {
      assertFunction('Maybe.Nothing#orElse', handler);
      return handler(this.value);
    },

    /*~*/
    Just: function orElse(handler) {
      assertFunction('Maybe.Nothing#orElse', handler);
      return this;
    }
  },


  /*~
   * deprecated:
   *   since: 2.0.0
   *   replacedBy: .matchWith(pattern)
   * 
   * type: |
   *   forall a, b:
   *     (Maybe a).({
   *       Nothing: () => b,
   *       Just: (a) => b
   *     }) => b
   */
  cata: {
    /*~*/
    Nothing: function cata(pattern) {
      warnDeprecation('`.cata(pattern)` is deprecated. Use `.matchWith(pattern)` instead.');
      return pattern.Nothing();
    },

    /*~*/
    Just: function cata(pattern) {
      warnDeprecation('`.cata(pattern)` is deprecated. Use `.matchWith(pattern)` instead.');
      return pattern.Just(this.value);
    }
  },

  /*~
   * type: |
   *   forall a, b: (Maybe a).(() => b, (a) => b) => b
   */
  fold: {
    /*~*/
    Nothing: function(transformNothing, transformJust) {
      assertFunction('Maybe.Nothing#fold', transformNothing);
      assertFunction('Maybe.Nothing#fold', transformJust);
      return transformNothing();
    },

    /*~*/
    Just: function(transformNothing, transformJust) {
      assertFunction('Maybe.Just#fold', transformNothing);
      assertFunction('Maybe.Just#fold', transformJust);
      return transformJust(this.value);
    }
  }
});


Object.assign(Maybe, {
  /*~
   * type: |
   *   forall a: (a) => Maybe a
   */
  of(value) {
    return Just(value);
  },


  /*~
   * deprecated:
   *   since: 2.0.0
   *   replacedBy: .unsafeGet()
   * type: |
   *   forall a: (Maybe a).() => a :: (throws TypeError)
   */
  'get'() {
    warnDeprecation('`.get()` is deprecated, and has been renamed to `.unsafeGet()`.');
    return this.unsafeGet();
  },


  /*~
   * type: |
   *   forall a, b: (Maybe a).(b) => Result b a
   */
  toResult(fallbackValue) {
    return require('folktale/data/conversions/maybe-to-result')(this, fallbackValue);  
  },

  /*~
   * type: |
   *   forall a, b: (Maybe a).(b) => Result b a
   */
  toValidation(fallbackValue) {
    return require('folktale/data/conversions/maybe-to-validation')(this, fallbackValue);
  }
});


provideAliases(Just.prototype);
provideAliases(Nothing.prototype);
provideAliases(Maybe);

module.exports = Maybe;

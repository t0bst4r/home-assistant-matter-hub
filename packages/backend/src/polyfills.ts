declare global {
  interface BigInt {
    toJSON(): string;
  }
}

// Copied from: toJson in @matter/main

const JSON_SPECIAL_KEY_TYPE = "__object__";
const JSON_SPECIAL_KEY_VALUE = "__value__";
BigInt.prototype.toJSON = function () {
  return `{"${JSON_SPECIAL_KEY_TYPE}":"BigInt","${JSON_SPECIAL_KEY_VALUE}":"${this.toString()}"}`;
};

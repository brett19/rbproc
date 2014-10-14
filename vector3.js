function Vector3() {
  this.x = 0;
  this.y = 0;
  this.z = 0;
}

Vector3.prototype.multiplyScalar = function(scale) {
  this.x *= scale;
  this.y *= scale;
  this.z *= scale;
  return this;
};

module.exports = Vector3;

class Node {
  constructor(left, value, right) {
		this.root = value;
		this.left = left;
    this.right = right;
    this.depth = 0;
    this.container = null;
    
    this.isNode = true;
    this.parent = null;

    if (left && left.isNode) left.parent = this;
    if (right && right.isNode) right.parent = this;
	}

	isLeafe() {
		return !this.left && !this.right;
  }
}

exports.Node = Node;

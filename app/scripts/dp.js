function() {
	// Alignment object
	function Alignment(local) {
		this.matrix = [];
		this.seqs = [];
		this.local = local;
	}

	Alignment.prototype = {
		// Pairwise alignment, recycling any previous computation
		align: function(seqs) {
			// Find the indices at which each new seq diverges from the old
			var indices = _.chain(seqs)
				.zip(this.seqs)
				.map(indexOfChange);

			var lens = _.pluck(seqs, "length");

			// Resize scoring matrix according to new lens
			resize(this.matrix, lens);
			// Resize backtracking matrix according to new lens

			// Traverse matrix area using correct scoring function
			// Keep backtracking information
		}
	};

	// Find the index at which the sequences diverge
	function indexOfChange(seqs) {
		return _.chain(seqs)
			.zip()
			.findIndex(function(chars) {
				return _.uniq(chars).length > 1;
			});
	}

	// Access an arbitrarily deep element in a matrix
	function arbitraryElem(matrix, slicing) {
		return _.reduce(slicing, function(slice, slice) {
			return matrix[slice];
		}, matrix);
	}

	// Access all elements at a certain level
	function arbitraryLevel(matrix, level) {
		return _.reduce(_.range(0, level), function(elems) {
			return _.flatten(elems, true);
		}, [matrix]);
	}

	// Resize an arbitrarily deep matrix
	// TODO: may need tuning
	// TODO: examine naming and structure
	function resize(matrix, dims) {
		_.reduce(dims, function(nextLevel, dim, index) {
			_.forEach(nextLevel, function(elem) {
				if (elem.length < dim && index !== dims.length - 1) {
					_.foreach(_.range(elem.length, dim), function(i) {
						elem[i] = [];
					});
				} else {
					elem.splice(dim, elem.length - dim);
				}
			});

			nextLevel = arbitraryLevel(nextLevel, 1);
		}, matrix);
	}

	this.dp = {
		// Public API goes here
	};
}();
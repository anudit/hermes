const Hermes = artifacts.require("Hermes");

contract("Hermes", (accounts) => {
	let contract = null;
	const tAccountOne = accounts[0];
	const tAccountTwo = accounts[1];
	const tAccountThree = accounts[3];
	const tTokenURI = "https://anudit.dev";
	const tPostIdOne = 1;
	const tPrice100 = 100;
	const tBid100 = 100;
	const tBid1 = 1;

	before(async () => {
		contract = await Hermes.deployed();
	});

	it("should deploy smart contract", () => {
		assert.notEqual(contract.address, "");
		assert.isNotNull(tAccountOne);
		assert.isNotNull(tAccountTwo);
	});

	it("should create post", async () => {
		// Arrange
		let err = null;

		// Act
		try {
			await contract.addPost(tPrice100, tTokenURI, { from: tAccountThree });
		} catch (error) {
			err = error;
		}

		// Assert
		assert.isNull(err);
	});

	it("should get post", async () => {
		// Arrange
		let err = null;
		let response = null;

		// Act
		try {
			response = await contract.getPost(tPostIdOne);
		} catch (error) {
			err = error;
		}

		// Assert
		assert.isNull(err);
		assert.equal(Number(response[1]), tPrice100);
		assert.equal(response[2], tTokenURI);
	});

	it("should not add post with price of zero", async () => {
		// Arrange
		let err = null;

		// Act
		try {
			await contract.addPost(0, tTokenURI, { from: tAccountThree });
		} catch (error) {
			err = error;
		}

		// Assert
		assert.isNotNull(err);
		assert.equal(err.reason, "Price cannot be 0");
	});

	it("account one should purchase post", async () => {
		// Arrange
		let err = null;
		let tokenOwner = null;
		let tokenURI = null;

		// Act
		try {
			await contract.purchasePost(tPostIdOne, { from: tAccountOne, value: tBid100 });

			const result = await Promise.all([
				contract.ownerOf(1),
				contract.tokenURI(1)
			]);

			tokenOwner = result[0];
			tokenURI = result[1];
		} catch (error) {
			err = error;
		}

		// Assert
		assert.isNull(err);
		assert.equal(tAccountOne, tokenOwner);
		assert.equal(tokenURI, tTokenURI);
	});

	it("should not purchase art token when bid is lower than the price", async () => {
		// Arrange
		let err = null;

		// Act
		try {
			await contract.purchasePost(tPostIdOne, { from: tAccountOne, value: tBid1 });
		} catch (error) {
			err = error;
		}

		// Assert
		assert.isNotNull(err);
		assert.equal(err.reason, "Bid lower than cost price.");
	});

	it("account two should purchase two posts", async () => {
		// Arrange
		let err = null;
		let tokenOwnerOne = null;
		let tokenURIOne = null;
		let tokenOwnerTwo = null;
		let tokenURITwo = null;

		// Act
		try {
			await Promise.all([
				contract.purchasePost(tPostIdOne, { from: tAccountTwo, value: tBid100 }),
				contract.purchasePost(tPostIdOne, { from: tAccountTwo, value: tBid100 })
			]);

			const result = await Promise.all([
				contract.ownerOf(2),
				contract.ownerOf(3),
				contract.tokenURI(2),
				contract.tokenURI(3)
			]);

			tokenOwnerOne = result[0];
			tokenOwnerTwo = result[1];
			tokenURIOne = result[2];
			tokenURITwo = result[3];
		} catch (error) {
			err = error;
		}

		// Assert
		assert.isNull(err);
		assert.equal(tAccountTwo, tokenOwnerOne);
		assert.equal(tAccountTwo, tokenOwnerTwo);
		assert.equal(tokenURIOne, tTokenURI);
		assert.equal(tokenURITwo, tTokenURI);
	});

	it("should not purchase an post that does not exist", async () => {
		// Arrange
		let err = null;

		// Act
		try {
			await contract.purchasePost(999, { from: tAccountTwo, value: tBid100 })
		} catch (error) {
			err = error;
		}

		// Assert
		assert.isNotNull(err);
		assert.equal(err.reason, "Not Found");
	});

	it("should list all tokens owned by account two", async () => {
		// Arrange
		let err = null;
		let ownedTokensCount = 0;
		const accountTokenIds = [];

		// Act
		try {
			ownedTokensCount = await contract.balanceOf(tAccountTwo);
			const tokenIds = await contract._tokenIds();

			for (let i = 1; i <= tokenIds; i++) {
				const tokenOwner = await contract.ownerOf(i);

				if (tokenOwner == tAccountTwo) {
					accountTokenIds.push(i);
				}

				if (accountTokenIds.length === ownedTokensCount) break;
			}
		} catch (error) {
			err = error;
		}

		// Assert
		assert.isNull(err);
		assert.equal(Number(ownedTokensCount), 2);
		assert.equal(accountTokenIds.length, 2);
		expect(accountTokenIds).to.include.members([2, 3]);
		expect(accountTokenIds).to.not.include.members([1]);
	});

	it("account three should be able to withdraw payments from sold posts", async () => {
		// Arrange
		let err = null;
		let tx = null;

		// Act
		try {
			tx = await contract.getPayments({ from: tAccountThree });
		} catch (error) {
			err = error;
		}

		// Assert
		assert.isNull(err);
		assert.isNotNull(tx);
	});
});

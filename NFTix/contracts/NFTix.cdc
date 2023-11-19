pub contract NFTix {

    // Declare Path constants so paths do not have to be hardcoded
    // in transactions and scripts

    pub let CollectionStoragePath: StoragePath
    pub let CollectionPublicPath: PublicPath
    pub let MinterStoragePath: StoragePath

    // Tracks the unique IDs of the NFT
    pub var idCount: UInt64

    // Declare the NFT resource type
    pub resource NFT {
        // The unique ID that differentiates each NFT
        pub let id: UInt64

        pub let image: String
        pub let seat: String
        pub let artist: Address 
        pub let royalties: UFix64 
        pub let metadata: String

        // Initialize both fields in the init function
        init(initID: UInt64, image: String, seat: String, artist: Address, royalties: UFix64, metadata: String) {
            pre {
                royalties >= 0.0: "royalties cannot be negative"
                royalties <= 0.5: "royalties must not be exorbitant"
            }
            self.id = initID
            self.image = image
            self.seat = seat 
            self.artist = artist
            self.royalties = royalties
            self.metadata = metadata
        }

        pub fun getData(): {String: String} {
            return {
                "id": self.id.toString(),
                "image": self.image,
                "seat": self.seat,
                "artist": self.artist.toString(),
                "royalties": self.royalties.toString(),
                "metadata": self.metadata
            }
        }
    }

    // We define this interface purely as a way to allow users
    // to create public, restricted references to their NFT Collection.
    // They would use this to publicly expose only the deposit, getIDs,
    // and idExists fields in their Collection
    pub resource interface NFTReceiver {

        pub fun deposit(token: @NFT)

        pub fun getIDs(): [UInt64]

        pub fun idExists(id: UInt64): Bool

        pub fun getData(id: UInt64): {String: String}

        pub fun getAllData(): [{String: String}]
    
    }

    // The definition of the Collection resource that
    // holds the NFTs that a user owns
    pub resource Collection: NFTReceiver {
        // dictionary of NFT conforming tokens
        // NFT is a resource type with an `UInt64` ID field
        pub var ownedNFTs: @{UInt64: NFT}

        // Initialize the NFTs field to an empty collection
        init () {
            self.ownedNFTs <- {}
        }

        // withdraw
        //
        // Function that removes an NFT from the collection
        // and moves it to the calling context
        pub fun withdraw(withdrawID: UInt64): @NFT {
            // If the NFT isn't found, the transaction panics and reverts
            let token <- self.ownedNFTs.remove(key: withdrawID)
                ?? panic("Cannot withdraw the specified NFT ID")

            return <-token
        }

        // deposit
        //
        // Function that takes a NFT as an argument and
        // adds it to the collections dictionary
        pub fun deposit(token: @NFT) {
            // add the new token to the dictionary with a force assignment
            // if there is already a value at that key, it will fail and revert
            self.ownedNFTs[token.id] <-! token
        }

        // idExists checks to see if a NFT
        // with the given ID exists in the collection
        pub fun idExists(id: UInt64): Bool {
            return self.ownedNFTs[id] != nil
        }

        // getIDs returns an array of the IDs that are in the collection
        pub fun getIDs(): [UInt64] {
            return self.ownedNFTs.keys
        }

        pub fun getData(id: UInt64): {String: String} {
            let nft <- self.ownedNFTs.remove(key: id) ?? panic("no nft with that id")
            let data = nft.getData()
            self.ownedNFTs[id] <-! nft
            return data
        }

        pub fun getAllData(): [{String: String}] {
            let allNfts: [{String: String}] = []
            for id in self.getIDs() {
                allNfts.append(self.getData(id: id))
            }
            return allNfts
        }

        destroy() {
            destroy self.ownedNFTs
        }
    }

    // creates a new empty Collection resource and returns it
    pub fun createEmptyCollection(): @Collection {
        return <- create Collection()
    }

    // mintNFT
    //
    // Function that mints a new NFT with a new ID
    // and returns it to the caller
    pub fun mintNFT(image: String, seat: String, royalties: UFix64, artist: Address, metadata: String): @NFT {

        // create a new NFT
        var newNFT <- create NFT(initID: self.idCount, image: image, seat: seat, artist: artist, royalties: royalties, metadata: metadata)

        // change the id so that each ID is unique
        self.idCount = self.idCount + 1

        return <-newNFT
    }

	init() {
        self.CollectionStoragePath = /storage/nftTutorialCollection
        self.CollectionPublicPath = /public/nftTutorialCollection
        self.MinterStoragePath = /storage/nftTutorialMinter

        // initialize the ID count to one
        self.idCount = 1

        // store an empty NFT Collection in account storage
        self.account.save(<-self.createEmptyCollection(), to: self.CollectionStoragePath)

        // publish a reference to the Collection in storage
        self.account.link<&{NFTReceiver}>(self.CollectionPublicPath, target: self.CollectionStoragePath)
	}
}
import "./App.css";
import react, { useState, useEffect } from "react";
import * as fcl from "@onflow/fcl";
import { setup } from "./cadence/transactions/setup.js";
import {getFlowBalances} from "./cadence/scripts/getBalance.js";
import {getMyNFT} from "./cadence/scripts/getNFTs.js";
import {mint} from "./cadence/transactions/mint.js";
import {createSale} from "./cadence/transactions/create.js";
import {purchase} from "./cadence/transactions/purchase.js";

fcl
  .config()
  .put("app.detail.title", "NFTix")
  .put("app.detail.icon", "https://i.imgur.com/9I6NRUm.png")
  .put("accessNode.api", "https://rest-testnet.onflow.org")
  .put("discovery.wallet", "https://fcl-discovery.onflow.org/testnet/authn");

function App() {
  const [user, setUser] = useState();
  const [myNFT, setMyNFT] = useState();
  const [mintRoyalties, setMintRoyalties] = useState(0);
  const [mintData, setMintData] = useState("");
  const [mintImage, setMintImage] = useState("");
  const [mintSeat, setMintSeat] = useState("");
  const [flowBalance, setFlowBalance] = useState(0);
  const [flowSendAmount, setFlowsendamount] = useState(0);
  const [flowSendAddress, setFlowsendaddress] = useState("");
  const [saleNFTid, setSaleNFTid] = useState(0);
  const [salePrice, setSalePrice] = useState(0);
  const [buyNFTid, setBuyNFTid] = useState(0);
  const [buyPrice, setBuyPrice] = useState(0);
  const [buyaddr, setBuyaddr] = useState("");
  const [salequeryaddr, setSalequeryaddr] = useState("");


  const mintNFT = async () => {
    const transactionID = await fcl
      .send([
        fcl.transaction(mint),
        fcl.args([
          fcl.arg(mintImage, fcl.t.String),
          fcl.arg(mintSeat, fcl.t.String),
          fcl.arg(mintRoyalties, fcl.t.UFix64),
          fcl.arg(mintData, fcl.t.String),
        ]),
        fcl.payer(fcl.authz),
        fcl.proposer(fcl.authz),
        fcl.authorizations([fcl.authz]),
        fcl.limit(9999),
      ])
      .then(fcl.decode);

    console.log(transactionID);
  };


  const createNFTsale = async () => {
    const transactionID = await fcl
      .send([
        fcl.transaction(createSale),
        fcl.args([
          fcl.arg(saleNFTid, fcl.t.UInt64),
          fcl.arg(salePrice, fcl.t.UFix64),
        ]),
        fcl.payer(fcl.authz),
        fcl.proposer(fcl.authz),
        fcl.authorizations([fcl.authz]),
        fcl.limit(9999),
      ])
      .then(fcl.decode);

    console.log(transactionID);
  };
  


  const logIn =  () => {
    fcl.authenticate();
    fcl.currentUser().subscribe(setUser);
  }

  const setupAccount = async () => {
    const transactionID = await fcl
      .send([
        fcl.transaction(setup),
        fcl.args(),
        fcl.payer(fcl.authz),
        fcl.proposer(fcl.authz),
        fcl.authorizations([fcl.authz]),
        fcl.limit(9999),
      ])
      .then(fcl.decode);
    console.log(transactionID);
  };

  const getFlowBalanceFunction = async () => {
    const response = await fcl.send([
      fcl.script(getFlowBalances),
      fcl.args([fcl.arg(user.addr, fcl.t.Address)]),
    ]);
    const data = await fcl.decode(response);
    setFlowBalance(data);
    console.log(data);
  };

  const GetMyNFT = async () => {
    const response = await fcl.send([
      fcl.script(getMyNFT),
      fcl.args([fcl.arg(user.addr, fcl.t.Address)]),
    ]);
    const data = await fcl.decode(response);
    setMyNFT(data);
    console.log(data);
    console.log(myNFT);
  };

  const purchaseNFT = async () => {
    const transactionID = await fcl
      .send([
        fcl.transaction(purchase),
        fcl.args([
          fcl.arg(buyaddr, fcl.t.Address),
          fcl.arg(buyNFTid, fcl.t.UInt64),
          fcl.arg(buyPrice, fcl.t.UFix64),
        ]),
        fcl.payer(fcl.authz),
        fcl.proposer(fcl.authz),
        fcl.authorizations([fcl.authz]),
        fcl.limit(9999),
      ])
      .then(fcl.decode);

    console.log(transactionID);
  };

  return (
    <div className="App">
      <h1>My Flow NFT DApp</h1>
      <h2>Current Address : {user && user.addr ? user.addr : ''}</h2>
      <button onClick={() => logIn()}>LogIn</button>
      <p> ----------------------</p>
      <button onClick={() => getFlowBalanceFunction()}>
        {" "}
        Get Flow Balance{" "}
      </button>
      <p> Flow Balance : {flowBalance} </p>
      <p> ----------------------</p>

      <p> ----------------------</p>
      <input
        type="text"
        placeholder="Enter Image for NFT"
        value={mintImage}
        onChange={(e) => setMintImage(e.target.value)}
      />
      <input
        type="text"
        placeholder="Enter Seat for NFT"
        value={mintSeat}
        onChange={(e) => setMintSeat(e.target.value)}
      />
      <input
        type="text"
        placeholder="Enter Royalty for NFT"
        value={mintRoyalties}
        onChange={(e) => setMintRoyalties(e.target.value)}
      />
      <input
        type="text"
        placeholder="Enter Data"
        value={mintData}
        onChange={(e) => setMintData(e.target.value)}
      />

      <br />
      <button onClick={() => mintNFT()}> Create NFT </button>
      <p> ----------------------</p>
      <button onClick={() => setupAccount()}> Setup Account </button>
        <p> ----------------------</p>

      
      <input
        type="text"
        placeholder="Enter NFT ID to Sell"
        value={saleNFTid}
        onChange={(e) => setSaleNFTid(e.target.value)}
      />
      <input
        type="text"
        placeholder="Enter Price to Sell"
        value={salePrice}
        onChange={(e) => setSalePrice(e.target.value)}
      />
      <button onClick={() => createNFTsale()}> Create NFT Sale </button>

      <p> ----------------------</p>

      <input
        type="text"
        placeholder="Enter Address to Buy"
        value={buyaddr}
        onChange={(e) => setBuyaddr(e.target.value)}
      />
      <input
        type="text"
        placeholder="Enter NFT ID to Buy"
        value={buyNFTid}
        onChange={(e) => setBuyNFTid(e.target.value)}
      />
      <input
        type="text"
        placeholder="Enter Price to Buy"
        value={buyPrice}
        onChange={(e) => setBuyPrice(e.target.value)}
      />
      <button onClick={() => purchaseNFT()}> Purchase NFT </button>

      <p> ----------------------</p>
      <button onClick={() => GetMyNFT()}> Get NFT </button>
      <p> ----------------------</p>

      {myNFT
        ? myNFT.map((nft, index) => (
            <div key={index}>
              <img src={nft.image} />
            </div>
          ))
        : ""}
      {myNFT ? myNFT.length : 0}
      <p> ----------------------</p>
    </div>
      
  );

}

export default App;

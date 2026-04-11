import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";
import axios from "axios";
import "./Funds.css";

const Funds = () => {
  const { user } = useAuth();
  const [addFundsAmount, setAddFundsAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);

  const handleAddFunds = async () => {
    if (addFundsAmount && parseFloat(addFundsAmount) > 0) {
      try {
        await axios.post("http://localhost:3002/addFunds", {
          userId: user._id,
          amount: addFundsAmount
        });
        alert(`₹${addFundsAmount} added to your account successfully!`);
        setAddFundsAmount("");
        setShowAddFunds(false);
      } catch (error) {
        alert("Error adding funds. Please try again.");
        console.error(error);
      }
    } else {
      alert("Please enter a valid amount");
    }
  };

  const handleWithdraw = async () => {
    if (withdrawAmount && parseFloat(withdrawAmount) > 0) {
      try {
        await axios.post("http://localhost:3002/withdrawFunds", {
          userId: user._id,
          amount: withdrawAmount
        });
        alert(`₹${withdrawAmount} withdrawn from your account successfully!`);
        setWithdrawAmount("");
        setShowWithdraw(false);
      } catch (error) {
        alert("Error withdrawing funds. Please check your balance.");
        console.error(error);
      }
    } else {
      alert("Please enter a valid amount");
    }
  };

  return (
    <>
      <div className="funds">
        <p>Instant, zero-cost fund transfers with UPI </p>
        <button className="btn btn-green" onClick={() => setShowAddFunds(true)}>
          Add funds
        </button>
        <button className="btn btn-blue" onClick={() => setShowWithdraw(true)}>
          Withdraw
        </button>
      </div>

      {showAddFunds && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Add Funds</h3>
            <input
              type="number"
              placeholder="Enter amount"
              value={addFundsAmount}
              onChange={(e) => setAddFundsAmount(e.target.value)}
            />
            <div className="modal-buttons">
              <button onClick={handleAddFunds}>Add Funds</button>
              <button onClick={() => setShowAddFunds(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showWithdraw && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Withdraw Funds</h3>
            <input
              type="number"
              placeholder="Enter amount"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
            />
            <div className="modal-buttons">
              <button onClick={handleWithdraw}>Withdraw</button>
              <button onClick={() => setShowWithdraw(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="row">
        <div className="col">
          <span>
            <p>Equity</p>
          </span>

          <div className="table">
            <div className="data">
              <p>Available margin</p>
              <p className="imp colored">4,043.10</p>
            </div>
            <div className="data">
              <p>Used margin</p>
              <p className="imp">3,757.30</p>
            </div>
            <div className="data">
              <p>Available cash</p>
              <p className="imp">4,043.10</p>
            </div>
            <hr />
            <div className="data">
              <p>Opening Balance</p>
              <p>4,043.10</p>
            </div>
            <div className="data">
              <p>Opening Balance</p>
              <p>3736.40</p>
            </div>
            <div className="data">
              <p>Payin</p>
              <p>4064.00</p>
            </div>
            <div className="data">
              <p>SPAN</p>
              <p>0.00</p>
            </div>
            <div className="data">
              <p>Delivery margin</p>
              <p>0.00</p>
            </div>
            <div className="data">
              <p>Exposure</p>
              <p>0.00</p>
            </div>
            <div className="data">
              <p>Options premium</p>
              <p>0.00</p>
            </div>
            <hr />
            <div className="data">
              <p>Collateral (Liquid funds)</p>
              <p>0.00</p>
            </div>
            <div className="data">
              <p>Collateral (Equity)</p>
              <p>0.00</p>
            </div>
            <div className="data">
              <p>Total Collateral</p>
              <p>0.00</p>
            </div>
          </div>
        </div>

        <div className="col">
          <div className="commodity">
            <p>You don't have a commodity account</p>
            <Link className="btn btn-blue">Open Account</Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Funds;
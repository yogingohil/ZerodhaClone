import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { API_URL } from "../config";
import axios from "axios";
import "./Funds.css";

const Funds = () => {
  const { user, login } = useAuth();
  const [addFundsAmount, setAddFundsAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [funds, setFunds] = useState(user?.funds || 0);

  useEffect(() => {
    if (user?.email || user?.id || user?._id) {
      axios.get(`${API_URL}/user?email=${encodeURIComponent(user.email || "")}&id=${user.id || user._id || ""}`)
        .then(res => {
          if (res.data?.user?.funds !== undefined) {
            setFunds(res.data.user.funds);
          }
        })
        .catch(err => console.error("Error fetching funds:", err));
    }
  }, [user]);

  const handleAddFunds = async () => {
    if (addFundsAmount && parseFloat(addFundsAmount) > 0) {
      try {
        const userId = user?.id || user?._id;
        const response = await axios.post(`${API_URL}/addFunds`, {
          userId,
          email: user?.email,
          amount: addFundsAmount
        });
        const updatedFunds = response.data.funds;
        alert(`₹${addFundsAmount} added to your account successfully!`);
        setFunds(updatedFunds);
        if (login && user) {
          login({ ...user, funds: updatedFunds });
        }
        setAddFundsAmount("");
        setShowAddFunds(false);
      } catch (error) {
        alert(error.response?.data?.message || "Error adding funds. Please try again.");
        console.error(error);
      }
    } else {
      alert("Please enter a valid amount");
    }
  };

  const handleWithdraw = async () => {
    if (withdrawAmount && parseFloat(withdrawAmount) > 0) {
      try {
        const userId = user?.id || user?._id;
        const response = await axios.post(`${API_URL}/withdrawFunds`, {
          userId,
          email: user?.email,
          amount: withdrawAmount
        });
        const updatedFunds = response.data.funds;
        alert(`₹${withdrawAmount} withdrawn from your account successfully!`);
        setFunds(updatedFunds);
        if (login && user) {
          login({ ...user, funds: updatedFunds });
        }
        setWithdrawAmount("");
        setShowWithdraw(false);
      } catch (error) {
        alert(error.response?.data?.message || "Error withdrawing funds. Please check your balance.");
        console.error(error);
      }
    } else {
      alert("Please enter a valid amount");
    }
  };

  const formattedFunds = (funds || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

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
              <p className="imp colored">₹{formattedFunds}</p>
            </div>
            <div className="data">
              <p>Used margin</p>
              <p className="imp">₹0.00</p>
            </div>
            <div className="data">
              <p>Available cash</p>
              <p className="imp">₹{formattedFunds}</p>
            </div>
            <hr />
            <div className="data">
              <p>Opening Balance</p>
              <p>₹{formattedFunds}</p>
            </div>
            <div className="data">
              <p>Payin</p>
              <p>₹0.00</p>
            </div>
            <div className="data">
              <p>SPAN</p>
              <p>₹0.00</p>
            </div>
            <div className="data">
              <p>Delivery margin</p>
              <p>₹0.00</p>
            </div>
            <div className="data">
              <p>Exposure</p>
              <p>₹0.00</p>
            </div>
            <div className="data">
              <p>Options premium</p>
              <p>₹0.00</p>
            </div>
            <hr />
            <div className="data">
              <p>Collateral (Liquid funds)</p>
              <p>₹0.00</p>
            </div>
            <div className="data">
              <p>Collateral (Equity)</p>
              <p>₹0.00</p>
            </div>
            <div className="data">
              <p>Total Collateral</p>
              <p>₹0.00</p>
            </div>
          </div>
        </div>

        <div className="col">
          <div className="commodity">
            <p>You don't have a commodity account</p>
            <Link className="btn btn-blue" to="#">Open Account</Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Funds;
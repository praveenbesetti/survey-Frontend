import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { OrderSuccess } from '../components/OrderSuccess';
export function Checkout() {
  const navigate = useNavigate();
  const { cart, cartCount, grandTotal } = useCart();
  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    address: '',
    pincode: '',
    deliveryTime: 'express',
    timeSlot: 'morning'
  });
  const [paymentMethod, setPaymentMethod] = useState('');
  const [upiId, setUpiId] = useState('');
  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvv: ''
  });
  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');
  useEffect(() => {
    if (cartCount === 0 && !orderPlaced) {
      navigate('/shop');
    }
  }, [cartCount, orderPlaced, navigate]);
  const handleInputChange = (e) =>

  {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    if (errors[name])
    setErrors((prev) => ({
      ...prev,
      [name]: ''
    }));
  };
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) return parts.join(' ');
    return value;
  };
  const formatExpiry = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    return v;
  };
  const validate = () => {
    const newErrors = {};
    if (formData.fullName.length < 2)
    newErrors.fullName = 'Name must be at least 2 characters';
    if (!/^[6-9]\d{9}$/.test(formData.mobile))
    newErrors.mobile = 'Enter a valid 10-digit mobile number';
    if (formData.address.length < 10)
    newErrors.address = 'Address must be at least 10 characters';
    if (!/^\d{6}$/.test(formData.pincode))
    newErrors.pincode = 'Enter a valid 6-digit pincode';
    if (!paymentMethod) {
      newErrors.payment = 'Please select a payment method';
    } else if (paymentMethod === 'upi' && !upiId.includes('@')) {
      newErrors.upi = 'Enter a valid UPI ID containing @';
    } else if (paymentMethod === 'card') {
      if (cardData.number.replace(/\s/g, '').length !== 16)
      newErrors.cardNumber = 'Enter a valid 16-digit card number';
      if (cardData.expiry.length !== 5)
      newErrors.expiry = 'Enter valid expiry (MM/YY)';
      if (cardData.cvv.length !== 3) newErrors.cvv = 'Enter 3-digit CVV';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handlePlaceOrder = () => {
    if (validate()) {
      setIsProcessing(true);
      setTimeout(() => {
        const newOrderId = 'HM' + Math.floor(100000 + Math.random() * 900000);
        setOrderId(newOrderId);
        setIsProcessing(false);
        setOrderPlaced(true);
      }, 2000);
    }
  };
  if (orderPlaced) {
    return <OrderSuccess orderId={orderId} />;
  }
  return (
    <div className="min-h-screen pt-24 pb-20 px-4 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* LEFT - DELIVERY DETAILS */}
        <div className="space-y-6">
          <h2 className="font-poppins text-2xl font-bold text-text-primary border-b border-gray-200 pb-2">
            📍 Delivery Details
          </h2>

          <div className="glass-card p-6 space-y-4 bg-white">
            <div>
              <input
                type="text"
                name="fullName"
                placeholder="Full Name"
                className="glow-input"
                value={formData.fullName}
                onChange={handleInputChange} />

              {errors.fullName &&
              <p className="error-text">{errors.fullName}</p>
              }
            </div>

            <div>
              <input
                type="tel"
                name="mobile"
                placeholder="Mobile Number (10 digits)"
                className="glow-input"
                maxLength={10}
                value={formData.mobile}
                onChange={handleInputChange} />

              {errors.mobile && <p className="error-text">{errors.mobile}</p>}
            </div>

            <div>
              <textarea
                name="address"
                placeholder="Complete Delivery Address"
                className="glow-input min-h-[100px] resize-y"
                value={formData.address}
                onChange={handleInputChange} />

              {errors.address && <p className="error-text">{errors.address}</p>}
            </div>

            <div>
              <input
                type="text"
                name="pincode"
                placeholder="Pincode (6 digits)"
                className="glow-input"
                maxLength={6}
                value={formData.pincode}
                onChange={handleInputChange} />

              {errors.pincode && <p className="error-text">{errors.pincode}</p>}
            </div>

            <div>
              <select
                name="deliveryTime"
                className="glow-input appearance-none"
                value={formData.deliveryTime}
                onChange={handleInputChange}>

                <option value="express">⚡ Express — Within 15 Minutes</option>
                <option value="schedule">
                  🕐 Schedule — Choose a time slot
                </option>
              </select>
            </div>

            {formData.deliveryTime === 'schedule' &&
            <div className="flex gap-2 pt-2">
                {['morning', 'afternoon', 'evening'].map((slot) =>
              <label
                key={slot}
                className={`flex-1 text-center py-2 px-1 rounded-lg border cursor-pointer transition-colors text-sm ${formData.timeSlot === slot ? 'bg-accent-green/10 border-accent-green text-accent-green' : 'border-gray-200 text-text-secondary hover:border-accent-green'}`}>

                    <input
                  type="radio"
                  name="timeSlot"
                  value={slot}
                  className="hidden"
                  checked={formData.timeSlot === slot}
                  onChange={handleInputChange} />

                    {slot === 'morning' ?
                '7-10 AM' :
                slot === 'afternoon' ?
                '12-3 PM' :
                '5-8 PM'}
                  </label>
              )}
              </div>
            }
          </div>
        </div>

        {/* RIGHT - PAYMENT */}
        <div className="space-y-6">
          <h2 className="font-poppins text-2xl font-bold text-text-primary border-b border-gray-200 pb-2">
            💳 Payment Method
          </h2>

          <div className="space-y-4">
            {/* UPI Card */}
            <div
              className={`glass-card p-4 cursor-pointer transition-all bg-white ${paymentMethod === 'upi' ? 'border-accent-green shadow-md' : 'hover:border-gray-300'}`}
              onClick={() => {
                setPaymentMethod('upi');
                setErrors((prev) => ({
                  ...prev,
                  payment: ''
                }));
              }}>

              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">🔷</span>
                <div>
                  <h3 className="font-bold text-text-primary font-poppins">
                    UPI
                  </h3>
                  <p className="text-xs text-text-secondary">
                    GPay • PhonePe • Paytm • Any UPI
                  </p>
                </div>
              </div>
              {paymentMethod === 'upi' &&
              <div
                className="mt-4 animate-[float_0.3s_ease-out_forwards]"
                style={{
                  animationName: 'none'
                }}>

                  <input
                  type="text"
                  placeholder="yourname@upi"
                  className="glow-input"
                  value={upiId}
                  onChange={(e) => {
                    setUpiId(e.target.value);
                    setErrors((prev) => ({
                      ...prev,
                      upi: ''
                    }));
                  }} />

                  {errors.upi && <p className="error-text">{errors.upi}</p>}
                </div>
              }
            </div>

            {/* Credit Card */}
            <div
              className={`glass-card p-4 cursor-pointer transition-all bg-white ${paymentMethod === 'card' ? 'border-accent-green shadow-md' : 'hover:border-gray-300'}`}
              onClick={() => {
                setPaymentMethod('card');
                setErrors((prev) => ({
                  ...prev,
                  payment: ''
                }));
              }}>

              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">💳</span>
                <h3 className="font-bold text-text-primary font-poppins">
                  Credit / Debit Card
                </h3>
              </div>
              {paymentMethod === 'card' &&
              <div className="mt-4 space-y-3">
                  <div>
                    <input
                    type="text"
                    placeholder="Card Number"
                    className="glow-input"
                    maxLength={19}
                    value={cardData.number}
                    onChange={(e) => {
                      setCardData((prev) => ({
                        ...prev,
                        number: formatCardNumber(e.target.value)
                      }));
                      setErrors((prev) => ({
                        ...prev,
                        cardNumber: ''
                      }));
                    }} />

                    {errors.cardNumber &&
                  <p className="error-text">{errors.cardNumber}</p>
                  }
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <input
                      type="text"
                      placeholder="MM/YY"
                      className="glow-input"
                      maxLength={5}
                      value={cardData.expiry}
                      onChange={(e) => {
                        setCardData((prev) => ({
                          ...prev,
                          expiry: formatExpiry(e.target.value)
                        }));
                        setErrors((prev) => ({
                          ...prev,
                          expiry: ''
                        }));
                      }} />

                      {errors.expiry &&
                    <p className="error-text">{errors.expiry}</p>
                    }
                    </div>
                    <div className="flex-1">
                      <input
                      type="password"
                      placeholder="CVV"
                      className="glow-input"
                      maxLength={3}
                      value={cardData.cvv}
                      onChange={(e) => {
                        setCardData((prev) => ({
                          ...prev,
                          cvv: e.target.value.replace(/\D/g, '')
                        }));
                        setErrors((prev) => ({
                          ...prev,
                          cvv: ''
                        }));
                      }} />

                      {errors.cvv && <p className="error-text">{errors.cvv}</p>}
                    </div>
                  </div>
                </div>
              }
            </div>

            {/* COD */}
            <div
              className={`glass-card p-4 cursor-pointer transition-all bg-white ${paymentMethod === 'cod' ? 'border-accent-green shadow-md' : 'hover:border-gray-300'}`}
              onClick={() => {
                setPaymentMethod('cod');
                setErrors((prev) => ({
                  ...prev,
                  payment: ''
                }));
              }}>

              <div className="flex items-center gap-3">
                <span className="text-2xl">💵</span>
                <div>
                  <h3 className="font-bold text-text-primary font-poppins">
                    Cash on Delivery
                  </h3>
                  <p className="text-xs text-text-secondary">
                    Pay when your order arrives
                  </p>
                </div>
              </div>
            </div>

            {errors.payment &&
            <p className="error-text text-center">{errors.payment}</p>
            }
          </div>

          {/* Order Mini Summary */}
          <div className="glass-card p-6 mt-8 bg-white">
            <h3 className="font-bold text-text-primary mb-4 font-poppins">
              Order Summary
            </h3>
            <div className="space-y-2 mb-4 max-h-32 overflow-y-auto pr-2">
              {cart.map((item) =>
              <div
                key={item.id}
                className="flex justify-between text-sm text-text-secondary">

                  <span>
                    {item.quantity}x {item.name}
                  </span>
                  <span>₹{item.price * item.quantity}</span>
                </div>
              )}
            </div>
            <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
              <span className="font-bold text-text-primary">Grand Total</span>
              <span className="text-2xl font-bold text-accent-green">
                ₹{grandTotal}
              </span>
            </div>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={isProcessing}
            className="glow-btn w-full text-lg py-4 mt-6 flex justify-center items-center gap-2">

            {isProcessing ?
            <span className="inline-block w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></span> :

            'Place Order 🌿'
            }
          </button>
        </div>
      </div>
    </div>);

}
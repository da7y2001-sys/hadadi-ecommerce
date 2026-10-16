import { useContext } from "react";
import { CartContext } from "../context/CartContext";
import { Link } from "react-router-dom";
function OrdersPage() {
  const { orders } = useContext(CartContext);
  if (orders.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "100px 0" }}>
        <h1>My Orders</h1>
        <p>No Orders Yet</p>
        <Link to="/" className="shop-now-btn">
          Shop Now
        </Link>
      </div>
    );
  }
  return (
    <div>
      <h1>My Orders</h1>

      {orders.map((order, index) => (
        <div key={index}>
          <h2>Order #{index + 1}</h2>

          <p>Name: {order.customer.fullName}</p>
          <p>Email: {order.customer.email}</p>
          <p>Date: {new Date(order.date).toLocaleDateString()}</p>
          {order.items.map((item) => (
            <div key={item.id}>
              <p>{item.title}</p>
              <p>
                {item.quantity} × ${item.price}
              </p>
            </div>
          ))}

          <h3>Total: ${order.total.toFixed(2)}</h3>
          <hr />
        </div>
      ))}
    </div>
  );
}

export default OrdersPage;

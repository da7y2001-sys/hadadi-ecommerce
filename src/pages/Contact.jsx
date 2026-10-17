import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaClock } from "react-icons/fa";
import "./Contact.css";

const contactDetails = [
  { icon: <FaEnvelope />, label: "Email", value: "support@ourstore.com" },
  { icon: <FaPhone />, label: "Phone", value: "+1 (555) 123-4567" },
  {
    icon: <FaMapMarkerAlt />,
    label: "Address",
    value: "123 Market Street, Tech City",
  },
  { icon: <FaClock />, label: "Hours", value: "Mon–Sat, 9:00 AM – 6:00 PM" },
];

function Contact() {
  return (
    <div className="container contact-page">
      <h1 className="contact-title">Contact Us</h1>

      <p className="contact-intro">
        Have a question about an order or a product? Reach out and we&apos;ll get
        back to you as soon as possible.
      </p>

      <div className="contact-grid">
        {contactDetails.map((item) => (
          <div className="contact-card" key={item.label}>
            <span className="contact-icon">{item.icon}</span>
            <h2>{item.label}</h2>
            <p>{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Contact;

import LoginForm from "../components/LoginForm";
import RegisterForm from "../components/RegisterForm";
import "../styles/HomePage.css";

export default function HomePage() {
  return (
    <div className="home-page">
      <div className="form-container">
        <LoginForm />
      </div>

      <div className="form-container">
        <RegisterForm />
      </div>
    </div>
  );
}

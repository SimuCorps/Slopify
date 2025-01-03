import { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

export default function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== passwordConfirm) {
      setError("Passwords do not match.");
      return;
    }

    if (!displayName.trim()) {
      setError("Display name cannot be empty.");
      return;
    }

    try {
      const { data: user, error: displayNameError } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("display_name", displayName)
        .single();

      if (user) {
        setError("Display name is already taken.");
        return;
      }

      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
          },
        },
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      const { error: profileError } = await supabase.from("profiles").insert([
        {
          id: data.user.id,
          display_name: displayName,
        },
      ]);

      if (profileError && profileError.code !== "406") {
        setError(profileError.message);
      } else {
        navigate("/chat");
      }
    } catch (err) {
      setError("An error occurred during registration.");
    }
  };

  return (
    <form onSubmit={handleRegister}>
      <h2>Register</h2>
      {error && <p className="error">{error}</p>}
      <input
        type="text"
        placeholder="Display Name"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        required
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Confirm Password"
        value={passwordConfirm}
        onChange={(e) => setPasswordConfirm(e.target.value)}
        required
      />
      <button type="submit">Register</button>
    </form>
  );
}

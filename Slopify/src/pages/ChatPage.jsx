import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import MessageList from "../components/MessageList";
import MessageForm from "../components/MessageForm";

export default function ChatPage() {
  const [displayName, setDisplayName] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: session } = await supabase.auth.getSession();

      if (!session || !session.session) {
        navigate("/");
        return;
      }

      const userId = session.session.user.id;

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", userId)
        .single();

      if (profile) {
        setDisplayName(profile.display_name);
      } else {
        setDisplayName("Unknown User");
      }

      setLoading(false);
    };

    fetchUserProfile();
  }, [navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Welcome back to Slopify, {displayName}!</h1>
      <MessageList />
      <MessageForm />
    </div>
  );
}

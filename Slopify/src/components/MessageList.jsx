import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

const PAGE_SIZE = 50;

export default function MessageList() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [scrolling, setScrolling] = useState(false);

  useEffect(() => {
    fetchMessages();
    const subscription = supabase
      .channel("realtime:messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const newMessage = payload.new;
          attachDisplayName(newMessage).then((msgWithDisplayName) => {
            setMessages((prev) => [msgWithDisplayName, ...prev]);
          });
        },
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const attachDisplayName = async (message) => {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", message.user_id)
      .single();

    if (error) {
      console.error("Error fetching display name:", error.message);
      throw new Error("Unable to load user profile");
    }

    return { ...message, display_name: profile.display_name };
  };

  const fetchMessages = async (olderThan = null) => {
    if (scrolling) return;

    setScrolling(true);
    const query = supabase
      .from("messages")
      .select("id, user_id, content, created_at")
      .order("created_at", { ascending: false })
      .limit(PAGE_SIZE);

    if (olderThan) {
      query.lt("created_at", olderThan);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching messages:", error.message);
    } else {
      try {
        const messagesWithDisplayNames = await Promise.all(
          data.map(attachDisplayName),
        );
        setMessages((prev) => [...prev, ...messagesWithDisplayNames]);
        if (data.length < PAGE_SIZE) {
          setHasMore(false);
        }
      } catch (e) {
        console.error("Failed to attach display names:", e);
      }
    }

    setLoading(false);
    setScrolling(false);
  };

  const handleScroll = (e) => {
    const { scrollTop } = e.target;
    if (scrollTop === 0 && hasMore) {
      const oldestMessage = messages[messages.length - 1];
      if (oldestMessage) {
        fetchMessages(oldestMessage.created_at);
      }
    }
  };

  return (
    <div
      style={{
        height: "400px",
        overflowY: "auto",
        border: "1px solid #ccc",
        padding: "1rem",
      }}
      onScroll={handleScroll}
    >
      {loading ? (
        <p>Loading...</p>
      ) : (
        messages.map((msg) => (
          <div key={msg.id} style={{ marginBottom: "1rem" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <strong>{msg.display_name}</strong>
              <small>{new Date(msg.created_at).toLocaleString()}</small>
            </div>
            <p style={{ margin: 0, marginTop: "0.5rem" }}>{msg.content}</p>
          </div>
        ))
      )}
      {!hasMore && <p>No more messages</p>}
    </div>
  );
}
